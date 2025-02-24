"use client"; // Required for client-side components
import { useState, useEffect } from "react";
import Link from "next/link";



export default function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState({
    memory: [],
    quick: [],
    trivia: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async (gameId) => {
    try {
      const response = await fetch(
        `/.netlify/functions/get-leaderboard?game=${gameId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${gameId} leaderboard`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${gameId} leaderboard:`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [memory, quick, trivia] = await Promise.all([
          fetchLeaderboard("memory"),
          fetchLeaderboard("quick"),
          fetchLeaderboard("trivia"),
        ]);

        setLeaderboards({
          memory: memory.slice(0, 10), // Get top 10 scores
          quick: quick.slice(0, 10),
          trivia: trivia.slice(0, 10),
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h2 className="text-red-500 text-xl mb-4">Error: {error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h2 className="text-xl">Loading leaderboards...</h2>
        <div className="mt-4 animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Global Leaderboards</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back to Games
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(leaderboards).map(([gameId, scores]) => (
            <div key={gameId} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">
                {gameId.charAt(0).toUpperCase() + gameId.slice(1)}
              </h2>

              <div className="space-y-2">
                {scores.length > 0 ? (
                  scores.map((entry, index) => (
                    <div
                      key={`${gameId}-${entry.name}-${entry.score}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <span className="font-medium">
                        {index + 1}. {entry.name}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {entry.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No scores yet!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
