"use client";
import Link from "next/link";

export default function Home() {
  const games = [
    { id: "memory", name: "Memory Match" },
    { id: "quick", name: "Quick Click" },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Mini-Games</h1>

      <div>
        {/*
          games.map((game) => (
          <Link
            key={game.id}
            href={`/games/memory`}
          >
            <h2 >{game.name}</h2>
          </Link>
        ))*/}
        <Link href={`/games/memory`}>
          <h2>Memory Game</h2>
        </Link>
        <Link href={`/games/quick`}>
          <h2>Quick Click Game</h2>
        </Link>
      </div>

      <div>
        <Link
          href="/leaderboard"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
