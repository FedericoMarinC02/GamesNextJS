'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

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
