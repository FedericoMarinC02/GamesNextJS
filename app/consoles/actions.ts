'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { deleteReplacedImage, saveUploadedConsoleImage } from "@/src/lib/game-cover";
import {
  ConsoleFormFieldName,
  consoleFormSchema,
  getConsoleFormValues,
} from "@/src/lib/console-form-schema";

const fallbackImage = "no-image.png";

type ConsoleActionResult =
  | void
  | {
      error?: string;
      fieldErrors?: Partial<Record<ConsoleFormFieldName, string[]>>;
      redirectTo?: string;
    };

type UpdateConsoleActionArgs = {
  consoleId: number;
  currentImage: string;
  currentReleaseDate: string;
  currentName: string;
  currentManufacturer: string;
  currentDescription: string;
};

export async function createConsoleAction(formData: FormData): Promise<ConsoleActionResult> {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/handler/sign-in");
  }

  const parsed = consoleFormSchema.safeParse(getConsoleFormValues(formData));
  const coverFile = formData.get("coverFile");
  const uploadedImageUrl = formData.get("coverUrl")?.toString().trim();

  if (!parsed.success) {
    return {
      error: "Revisa los campos obligatorios antes de continuar.",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<ConsoleFormFieldName, string[]>
      >,
    };
  }

  const name = parsed.data.name.trim();
  const manufacturer = parsed.data.manufacturer.trim();
  const releaseDate = parsed.data.releaseDate;
  const description = parsed.data.description.trim();

  let image = fallbackImage;

  try {
    if (uploadedImageUrl) {
      image = uploadedImageUrl;
    } else if (coverFile instanceof File && coverFile.size > 0) {
      try {
        image = await saveUploadedConsoleImage(coverFile);
      } catch (uploadError) {
        console.error("Console image upload error:", uploadError);
      }
    }

    const created = await prisma.console.create({
      data: {
        name,
        image,
        manufacturer,
        releaseDate: new Date(releaseDate),
        description,
      },
    });

    revalidatePath("/consoles");
    return {
      redirectTo: `/consoles/view/${created.id}?created=1`,
    };
  } catch (error: any) {
    console.error("Create console error:", error);

    if (error?.code === "P2002") {
      return {
        error: "Ya existe una consola con ese nombre. Usa un nombre diferente.",
        fieldErrors: {
          name: ["Ya existe una consola con ese nombre"],
        },
      };
    }

    return {
      error: "No se pudo crear la consola. Intenta de nuevo en unos segundos.",
    };
  }
}

export async function updateConsoleAction(
  args: UpdateConsoleActionArgs,
  formData: FormData,
): Promise<ConsoleActionResult> {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/");
  }

  const parsed = consoleFormSchema.safeParse(getConsoleFormValues(formData));
  const coverFile = formData.get("coverFile");
  const uploadedImageUrl = formData.get("coverUrl")?.toString().trim();

  if (!parsed.success) {
    return {
      error: "Revisa los campos obligatorios antes de continuar.",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<ConsoleFormFieldName, string[]>
      >,
    };
  }

  const name = parsed.data.name.trim();
  const manufacturer = parsed.data.manufacturer.trim();
  const releaseDate = parsed.data.releaseDate;
  const description = parsed.data.description.trim();

  let nextImage = args.currentImage;
  const changedFields: string[] = [];

  if (uploadedImageUrl) {
    nextImage = uploadedImageUrl;
    changedFields.push("image");
  } else if (coverFile instanceof File && coverFile.size > 0) {
    try {
      nextImage = await saveUploadedConsoleImage(coverFile);
      changedFields.push("image");
    } catch (uploadError) {
      console.error("Console image upload error:", uploadError);
      return {
        error: "No se pudo subir la imagen de la consola. Intenta nuevamente.",
      };
    }
  }

  if (name !== args.currentName) changedFields.push("name");
  if (manufacturer !== args.currentManufacturer) changedFields.push("manufacturer");
  if (releaseDate !== args.currentReleaseDate) changedFields.push("release date");
  if (description !== args.currentDescription) changedFields.push("description");

  try {
    await prisma.console.update({
      where: { id: args.consoleId },
      data: {
        name,
        image: nextImage,
        manufacturer,
        releaseDate: new Date(releaseDate),
        description,
      },
    });

    if (nextImage !== args.currentImage) {
      await deleteReplacedImage(args.currentImage);
    }

    revalidatePath("/consoles");
    revalidatePath(`/consoles/view/${args.consoleId}`);
    revalidatePath(`/consoles/edit/${args.consoleId}`);

    const nextParams = new URLSearchParams({
      edited: "1",
      console: name,
    });

    if (changedFields.length) {
      nextParams.set("changes", changedFields.join("|"));
    }

    return {
      redirectTo: `/consoles/view/${args.consoleId}?${nextParams.toString()}`,
    };
  } catch (error: any) {
    console.error("Update console error:", error);

    if (error?.code === "P2002") {
      return {
        error: "Ya existe una consola con ese nombre. Usa un nombre diferente.",
        fieldErrors: {
          name: ["Ya existe una consola con ese nombre"],
        },
      };
    }

    return {
      error: "No se pudo actualizar la consola. Intenta de nuevo en unos segundos.",
    };
  }
}

export async function deleteConsoleAction(consoleId: number) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  await prisma.console.delete({
    where: { id: consoleId },
  });

  revalidatePath("/consoles");
  revalidatePath(`/consoles/edit/${consoleId}`);
}
