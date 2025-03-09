"use client";
//leaderboard
//TODO: find out how to launch website
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState({
    memory: [],
    quick: [],
    trivia: [],
    snake: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async (gameId) => {
    try {
      let record = await supabase.from(gameId).select("*");
      let data = record.data;
      if (gameId == "memory" || gameId == "quick")
        data.sort((a, b) => a.score - b.score);
      else data.sort((a, b) => b.score - a.score);
      console.log(data);
      return data.map((record) => ({
        id: record.id,
        score: record.score,
      }));
    } catch (error) {
      throw new Error(
        `Error fetching leaderboard for ${gameId}: ${error.message}`
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [memory, quick, trivia, snake] = await Promise.all([
          fetchLeaderboard("memory"),
          fetchLeaderboard("quick"),
          fetchLeaderboard("trivia"),
          fetchLeaderboard("snake"),
        ]);
        setLeaderboards({
          memory: memory.slice(0, 10),
          quick: quick.slice(0, 10),
          trivia: trivia.slice(0, 10),
          snake: snake.slice(0, 10),
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 text-yellow-900 p-8 text-center">
        <h2 className="text-2xl font-semibold">Loading leaderboards...</h2>
        <div className="mt-4 animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-100 text-yellow-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold text-yellow-800">
            Global Leaderboards
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-yellow-300 text-yellow-900 font-semibold rounded-xl hover:bg-yellow-400 transition"
          >
            ← Back to Games
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(leaderboards).map(([gameId, scores]) => (
            <div
              key={gameId}
              className="bg-yellow-200 p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-semibold text-yellow-800 mb-4">
                {gameId.charAt(0).toUpperCase() + gameId.slice(1)}
              </h2>
              <h4 className="text-sm text-yellow-700 mb-4">
                {(gameId == "memory" || gameId == "quick") && (
                  <div>For these games, the lower score is the better ones</div>
                )}
              </h4>
              <div className="space-y-2">
                {scores.length > 0 ? (
                  scores.map((entry, index) => (
                    <div
                      key={`${gameId}-${entry.id}-${entry.score}`}
                      className="flex justify-between items-center p-3 bg-yellow-300 rounded-xl"
                    >
                      <span className="font-medium text-yellow-900">
                        {index + 1}. {entry.id}
                      </span>
                      <span className="text-yellow-800 font-bold">
                        {entry.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-yellow-700 text-center py-4">
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 text-yellow-900 p-8 text-center">
        <h2 className="text-red-600 text-2xl font-bold mb-4">Error: {error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }
}
