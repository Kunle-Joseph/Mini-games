"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function QuickClick() {
  const [gameStarted, setGameStarted] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [name, setName] = useState("");
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameStarted(true);
    setTargetVisible(false);
    setReactionTime(0);
    setGameWon(false);

    // Random delay between 1-5 seconds
    const delay = 1000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      setTargetVisible(true);
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleTargetClick = () => {
    if (!targetVisible) return;

    const reaction = Date.now() - startTimeRef.current;
    setReactionTime(reaction);
    setTargetVisible(false);

    if (!bestTime || reaction < bestTime) {
      setBestTime(reaction);
      setGameWon(true);
    }
  };

  const submitScore = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    console.log(bestTime);

    try {
      await fetch("/.netlify/functions/submit-score", {
        method: "POST",
        body: JSON.stringify({
          game: "quick",
          name: name.trim(),
          score: bestTime,
        }),
      });
      setName("");
      startGame();
    } catch (error) {
      console.error("Score submission failed:", error);
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="mb-4 inline-block text-blue-600 hover:text-blue-700"
        >
          ← Back to Home
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Quick Click Game</h1>
          <p className="text-lg mb-2">
            Best Time: {bestTime ? `${bestTime}ms` : "--"}
          </p>
          <p className="text-lg mb-4">Current Time: {reactionTime || "--"}ms</p>

          {!gameStarted ? (
            <button
              onClick={startGame}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Start Game
            </button>
          ) : (
            <div className="min-h-[300px] flex items-center justify-center">
              {targetVisible ? (
                <button
                  onClick={handleTargetClick}
                  className="w-32 h-32 bg-green-500 rounded-full hover:bg-green-600 transition-all"
                >
                  CLICK!
                </button>
              ) : (
                <p className="text-gray-500">
                  {gameStarted && !targetVisible
                    ? "Wait for the target..."
                    : " "}
                </p>
              )}
            </div>
          )}
        </div>

        {gameWon && (
          <div className="bg-green-100 p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4">
              New Best Time: {bestTime}ms! 🎉
            </h2>
            <form
              onSubmit={submitScore}
              className="flex flex-col gap-4 max-w-xs mx-auto"
            >
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 rounded border"
                maxLength={20}
                required
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Save Score
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
