"use client";
import Link from "next/link";
require("dotenv").config();

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
        <Link
          href="/games/wordle"
          className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold py-3 px-6 rounded-2xl shadow-md transition"
        >
          <h2 className="text-2xl">Brain rot Wordle</h2>
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
      <footer className="mt-8 text-center text-yellow-800">
        <p className="text-sm">
          Made by KJ (
          <a
            href="https://www.linkedin.com/in/olakunle-joseph-3b9782223/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-indigo-900"
          >
            Olakunle Joseph
          </a>
          ), more games to come. if im not feeling lazy
        </p>
        <p className="text-sm mt-2">
          Also i recommend this on a laptop ideally"
        </p>
      </footer>
    </div>
  );
}
