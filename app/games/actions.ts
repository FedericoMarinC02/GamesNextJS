'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { deleteReplacedImage, saveUploadedGameCover } from "@/src/lib/game-cover";
import { GameFormFieldName, gameFormSchema, getGameFormValues } from "@/src/lib/game-form-schema";

const fallbackCover = "no-image.png";

type GameActionResult =
  | void
  | {
      error?: string;
      fieldErrors?: Partial<Record<GameFormFieldName, string[]>>;
      redirectTo?: string;
    };

type UpdateGameActionArgs = {
  gameId: number;
  currentCover: string;
  currentReleaseDate: string;
  currentTitle: string;
  currentDeveloper: string;
  currentPrice: number;
  currentGenre: string;
  currentDescription: string;
  currentConsoleId: number;
  returnTo: string;
};

export async function createGameAction(formData: FormData): Promise<GameActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  const parsed = gameFormSchema.safeParse(getGameFormValues(formData));
  const coverFile = formData.get("coverFile");
  const uploadedCoverUrl = formData.get("coverUrl")?.toString().trim();

  if (!parsed.success) {
    return {
      error: "Revisa los campos obligatorios antes de continuar.",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<GameFormFieldName, string[]>
      >,
    };
  }

  const title = parsed.data.title.trim();
  const developer = parsed.data.developer.trim();
  const releaseDate = parsed.data.releaseDate;
  const price = Number(parsed.data.price);
  const genre = parsed.data.genre.trim();
  const description = parsed.data.description.trim();
  const consoleId = Number(parsed.data.console_id);

  let cover = fallbackCover;

  if (uploadedCoverUrl) {
    cover = uploadedCoverUrl;
  } else if (coverFile instanceof File && coverFile.size > 0) {
    try {
      cover = await saveUploadedGameCover(coverFile);
    } catch (uploadError) {
      console.error("Game cover upload error:", uploadError);
    }
  }

  try {
    const game = await prisma.games.create({
      data: {
        title,
        cover,
        developer,
        releaseDate: new Date(releaseDate),
        price,
        genre,
        description,
        console_id: consoleId,
      },
    });

    revalidatePath("/games");
    return {
      redirectTo: `/games/view/${game.id}?created=1`,
    };
  } catch (error: any) {
    console.error("Create game error:", error);

    if (error?.code === "P2002") {
      return {
        error: "Ya existe un juego con ese titulo. Usa un titulo diferente.",
        fieldErrors: {
          title: ["Ya existe un juego con ese titulo"],
        },
      };
    }

    if (error?.code === "P2003") {
      return {
        error: "La consola seleccionada no es valida. Vuelve a elegirla e intenta de nuevo.",
        fieldErrors: {
          console_id: ["Selecciona una consola valida"],
        },
      };
    }

    return {
      error: "No se pudo crear el juego. Intenta de nuevo en unos segundos.",
    };
  }
}

export async function updateGameAction(
  args: UpdateGameActionArgs,
  formData: FormData,
): Promise<GameActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const parsed = gameFormSchema.safeParse(getGameFormValues(formData));
  const coverFile = formData.get("coverFile");
  const uploadedCoverUrl = formData.get("coverUrl")?.toString().trim();

  if (!parsed.success) {
    return {
      error: "Revisa los campos obligatorios antes de continuar.",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<GameFormFieldName, string[]>
      >,
    };
  }

  const title = parsed.data.title.trim();
  const developer = parsed.data.developer.trim();
  const releaseDate = parsed.data.releaseDate;
  const price = Number(parsed.data.price);
  const genre = parsed.data.genre.trim();
  const description = parsed.data.description.trim();
  const consoleId = Number(parsed.data.console_id);

  let nextCover = args.currentCover;
  const changedFields: string[] = [];

  if (uploadedCoverUrl) {
    nextCover = uploadedCoverUrl;
    changedFields.push("cover");
  } else if (coverFile instanceof File && coverFile.size > 0) {
    try {
      nextCover = await saveUploadedGameCover(coverFile);
      changedFields.push("cover");
    } catch (uploadError) {
      console.error("Game cover upload error:", uploadError);
      return {
        error: "No se pudo subir la portada del juego. Intenta nuevamente.",
      };
    }
  }

  if (title !== args.currentTitle) changedFields.push("title");
  if (developer !== args.currentDeveloper) changedFields.push("developer");
  if (releaseDate !== args.currentReleaseDate) changedFields.push("release date");
  if (price !== args.currentPrice) changedFields.push("price");
  if (genre !== args.currentGenre) changedFields.push("genre");
  if (description !== args.currentDescription) changedFields.push("description");
  if (consoleId !== args.currentConsoleId) changedFields.push("console");

  try {
    await prisma.games.update({
      where: { id: args.gameId },
      data: {
        title,
        cover: nextCover,
        developer,
        releaseDate: new Date(releaseDate),
        price,
        genre,
        description,
        console_id: consoleId,
      },
    });

    if (nextCover !== args.currentCover) {
      await deleteReplacedImage(args.currentCover);
    }

    revalidatePath("/games");
    revalidatePath(`/games/view/${args.gameId}`);
    revalidatePath(`/games/edit/${args.gameId}`);

    const nextParams = new URLSearchParams({
      edited: "1",
      game: title,
    });

    if (changedFields.length) {
      nextParams.set("changes", changedFields.join("|"));
    }

    nextParams.set("returnTo", args.returnTo);

    return {
      redirectTo: `/games/view/${args.gameId}?${nextParams.toString()}`,
    };
  } catch (error: any) {
    console.error("Update game error:", error);

    if (error?.code === "P2002") {
      return {
        error: "Ya existe un juego con ese titulo. Usa un titulo diferente.",
        fieldErrors: {
          title: ["Ya existe un juego con ese titulo"],
        },
      };
    }

    if (error?.code === "P2003") {
      return {
        error: "La consola seleccionada no es valida. Vuelve a elegirla e intenta de nuevo.",
        fieldErrors: {
          console_id: ["Selecciona una consola valida"],
        },
      };
    }

    return {
      error: "No se pudo actualizar el juego. Intenta de nuevo en unos segundos.",
    };
  }
}

export async function deleteGameAction(gameId: number) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  await prisma.games.delete({
    where: { id: gameId },
  });

  revalidatePath("/games");
  revalidatePath(`/games/view/${gameId}`);
  revalidatePath(`/games/edit/${gameId}`);
}
