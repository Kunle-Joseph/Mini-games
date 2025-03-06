"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 text-yellow-900 p-4">
      <h1 className="text-5xl font-extrabold mb-10 text-yellow-800">
        Mini-Games
      </h1>

      <div className="grid gap-6 text-center">
        <Link
          href="/games/memory"
          className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold py-3 px-6 rounded-2xl shadow-md transition"
        >
          <h2 className="text-2xl">Memory Game</h2>
        </Link>
        <Link
          href="/games/quick"
          className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold py-3 px-6 rounded-2xl shadow-md transition"
        >
          <h2 className="text-2xl">Quick Click Game</h2>
        </Link>
        <Link
          href="/games/snake"
          className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold py-3 px-6 rounded-2xl shadow-md transition"
        >
          <h2 className="text-2xl">Snake Game</h2>
        </Link>
        <Link
          href="/games/trivia"
          className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold py-3 px-6 rounded-2xl shadow-md transition"
        >
          <h2 className="text-2xl">Trivia Game</h2>
        </Link>
      </div>

      <div className="mt-8">
        <Link
          href="/leaderboard"
          className="text-xl font-semibold text-yellow-700 hover:text-yellow-800 underline"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
