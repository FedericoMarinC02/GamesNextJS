'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { prisma } from "@/src/lib/prisma";

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
