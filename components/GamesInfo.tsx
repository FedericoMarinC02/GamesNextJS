import DeleteGameButton from "@/components/DeleteGameButton";
import GameConsoleBadge from "@/components/GameConsoleBadge";
import GameFilters from "@/components/GameFilters";
import GameGenreBadge from "@/components/GameGenreBadge";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function GamesInfo({
    games,
    consoles,
    genres,
    returnTo,
}: {
    games: any[];
    consoles: string[];
    genres: string[];
    returnTo: string;
}) {

    return(
        <div className="space-y-4">
            <div className="space-y-4">
                <div>
                    <h1 className="flex flex-col gap-2 text-3xl font-bold text-white md:text-4xl">
                        <span>Games List</span>
                        <span className="text-sm font-semibold tracking-[0.22em] text-cyan-200/80 md:text-base">
                            Browse{" "}
                            <span
                                className="text-rotate align-middle text-cyan-100 [text-shadow:0_0_12px_rgba(34,211,238,0.35)]"
                                style={{ ["--duration" as string]: "11s" }}
                            >
                                <span className="justify-items-start">
                                    <span>cyber worlds</span>
                                    <span>neon releases</span>
                                    <span>boss fights</span>
                                </span>
                            </span>
                        </span>
                    </h1>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-end">
                        <div className="w-full max-w-xl">
                            <SearchBar placeholder="Buscar juegos por titulo, developer o genero" />
                        </div>
                        <GameFilters consoles={consoles} genres={genres} />
                    </div>

                    <Link
                        href="/games/new"
                        className="btn btn-primary btn-sm w-full text-white lg:w-auto"
                    >
                        + Add Game
                    </Link>
                </div>
            </div>
            <div className="h-1 w-full bg-white/70 mb-8"></div>

            {games.length ? (
                <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-200/40 shadow-lg">
                    <div className="min-w-[720px]">
                        <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white/80">
                            <span className="col-span-4">Game</span>
                            <span className="col-span-2">Console</span>
                            <span className="col-span-2 pr-2">Genre</span>
                            <span className="col-span-1 pl-2 block">Price</span>
                            <span className="col-span-1 pr-3 text-right block">Release</span>
                            <span className="col-span-2 text-center">Actions</span>
                        </div>
                        <div className="divide-y divide-base-300/60">
                            {games.map((game) => (
                                <div
                                    key={game.id}
                                    className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-base-100/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                                >
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="h-14 w-14 overflow-hidden rounded-lg bg-base-100 border border-base-300 shrink-0">
                                            <img
                                                src={
                                                    game.cover &&
                                                    game.cover.trim() !== "" &&
                                                    game.cover.trim().toLowerCase() !== "no-image.png"
                                                        ? game.cover
                                                        : "/imgs/no-cover.png"
                                                }
                                                alt={`${game.title} cover`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="font-semibold">{game.title}</div>
                                            <div className="text-xs text-white/70">{game.developer}</div>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <GameConsoleBadge consoleName={game.console.name} className="badge-sm" />
                                    </div>

                                    <div className="col-span-2 pr-2">
                                        <GameGenreBadge genre={game.genre} className="badge-sm" />
                                    </div>

                                    <div className="col-span-1 font-semibold pl-2">
                                        ${game.price.toFixed(2)}
                                    </div>

                                    <div className="col-span-1 text-right text-xs font-semibold text-white/85 pr-3 flex justify-end">
                                        {new Date(game.releaseDate).toLocaleDateString("es-CO")}
                                    </div>

                                    <div className="col-span-2 flex justify-center gap-2 text-xs font-semibold">
                                        <Link
                                            href={`/games/view/${game.id}?returnTo=${encodeURIComponent(returnTo)}`}
                                            className="btn btn-xs inline-flex items-center gap-1 border border-emerald-400/30 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25 hover:border-emerald-300/40"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                                            </svg>
                                            View
                                        </Link>
                                        <Link
                                            href={`/games/edit/${game.id}?returnTo=${encodeURIComponent(returnTo)}`}
                                            className="btn btn-xs inline-flex items-center gap-1 border border-sky-400/30 bg-sky-400/15 text-sky-100 hover:bg-sky-400/25 hover:border-sky-300/40"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L8.44 17.85l-3.61.64.64-3.61 12.392-12.392Z" />
                                            </svg>
                                            Edit
                                        </Link>
                                        <DeleteGameButton gameId={game.id} title={game.title} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-base-200/25 px-6 py-20 text-center">
                    <h2 className="text-lg font-semibold text-white">No games found</h2>
                    <p className="mt-2 text-sm text-white/60">
                        Try changing the filters or search for a different title.
                    </p>
                </div>
            )}
        </div>
    )
}
