import React from "react";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { stackServerApp } from "@/stack/server";
import SideBar from "@/components/sidebar";
import ConsoleStatusAlert from "@/components/ConsoleStatusAlert";
import Pagination from "@/components/Pagination";
import ConsolesInfo from "@/components/ConsolesInfo";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const CONSOLES_PER_PAGE = 8;

export default async function ConsolesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    query?: string;
  }>;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const requestedPage = Number(resolvedSearchParams?.page);
  const searchQuery = resolvedSearchParams?.query?.trim() ?? "";

  const where = searchQuery
    ? {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" as const } },
          { manufacturer: { contains: searchQuery, mode: "insensitive" as const } },
          { description: { contains: searchQuery, mode: "insensitive" as const } },
        ],
      }
    : {};

  const totalConsoles = await prisma.console.count({ where });
  const totalPages = Math.ceil(totalConsoles / CONSOLES_PER_PAGE);
  const currentPage = Math.min(
    Math.max(Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1, 1),
    Math.max(totalPages, 1)
  );

  const consoles = await prisma.console.findMany({
    take: CONSOLES_PER_PAGE,
    skip: (currentPage - 1) * CONSOLES_PER_PAGE,
    where,
    include: {
      _count: {
        select: {
          games: true,
        },
      },
    },
    orderBy: {
      releaseDate: "desc",
    },
  });

  return (
    <SideBar currentPath="/consoles">
      <div className="space-y-10 pb-6">
        <ConsoleStatusAlert />
        <ConsolesInfo consoles={consoles} />
        <footer className="flex justify-center border-t border-white/10 pt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </footer>
      </div>
    </SideBar>
  );
}
