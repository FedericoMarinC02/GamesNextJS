'use server';

import { PrismaNeon } from "@prisma/adapter-neon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { stackServerApp } from "@/stack/server";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

export async function deleteConsoleAction(consoleId: number) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/");
  }

  await prisma.console.delete({
    where: { id: consoleId },
  });

  revalidatePath("/consoles");
  revalidatePath(`/consoles/edit/${consoleId}`);
}
