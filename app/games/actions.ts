'use server';

import { PrismaNeon } from "@prisma/adapter-neon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/src/generated/prisma";
import { stackServerApp } from "@/stack/server";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

export async function deleteGameAction(gameId: number) {
  const user = await stackServerApp.getUser();

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
