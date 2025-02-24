"use client"
import Link from "next/link";

export default function Home() {
  const games = [
    { id: "memory", name: "Memory Match" },
    { id: "quick", name: "Quick Click" },
  ];

  return (
    <div >
      <h1 className="text-4xl font-bold mb-8">Mini-Games</h1>

      <div >
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
          >
            <h2 >{game.name}</h2>
          </Link>
        ))}
      </div>

      <div >
        <Link
          href="/leaderboard"
          className="inline-block mt-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
