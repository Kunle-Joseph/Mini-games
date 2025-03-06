"use client";
//quick game
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PocketBase from "pocketbase";
const pb = new PocketBase("http://127.0.0.1:8090");

export default function QuickClick() {
  const [gameStarted, setGameStarted] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [name, setName] = useState("");
  const [submitetdOnce, setSubmittedOnce] = useState(false);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameStarted(true);
    setTargetVisible(false);
    setReactionTime(0);
    setGameWon(false);

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

  const updateScore = async () => {
    let trimmedName = name.trim();
    const data = {
      id: trimmedName,
      score: bestTime,
    };
    try {
      await pb.collection("quick").update(trimmedName, data);
      console.log("Score updated successfully");
      startGame();
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const submitScore = async (e) => {
    if (!name.trim()) return;
    console.log(bestTime);

    let trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      // Check if ID/name already exists
      try {
        const existingRecord = await pb.collection("quick").getOne(trimmedName);
        alert("This name is already taken! Please choose a different one.");
        return;
      } catch (error) {
        if (error.status !== 404) throw error; // Only ignore "not found" errors
      }

      // Create new record if name is available
      const data = {
        id: trimmedName,
        score: bestTime,
      };

      await pb.collection("quick").create(data);
      alert(
        "Score saved successfully, try and beat your time or click back to home to reset"
      );
      startGame();
      setSubmittedOnce(true);
      console.log("Score saved successfully");
    } catch (error) {
      console.error("Error saving score:", error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-yellow-200">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="mb-4 inline-block text-yellow-700 hover:text-yellow-800"
        >
          ← Back to Home
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-yellow-900">
            Quick Click Game
          </h1>
          <p className="text-lg mb-2 text-yellow-800">
            Best Time: {bestTime ? `${bestTime}ms` : "--"}
          </p>
          <p className="text-lg mb-4 text-yellow-800">
            Current Time: {reactionTime || "--"}ms
          </p>

          {!gameStarted ? (
            <button
              onClick={startGame}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600"
            >
              Start Game
            </button>
          ) : (
            <div className="min-h-[300px] flex items-center justify-center">
              {targetVisible ? (
                <button
                  onClick={handleTargetClick}
                  className="w-32 h-32 bg-yellow-700 rounded-full hover:bg-yellow-800 transition-all text-white font-bold"
                >
                  CLICK!
                </button>
              ) : (
                <p className="text-yellow-600">
                  {gameStarted && !targetVisible
                    ? "Wait for the target..."
                    : " "}
                </p>
              )}
            </div>
          )}
        </div>

        {gameWon && (
          <div className="bg-yellow-300 p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">
              New Best Time: {bestTime}ms! 🎉
            </h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 rounded border border-yellow-600 text-gray-600"
              maxLength={15}
            />
            { !submitetdOnce && <button
              type="submit"
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
              onClick={submitScore}
            >
              Save Score
            </button>}
            {submitetdOnce && (
              <button
                type="submit"
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
                onClick={updateScore}
              >
                Update Best Score
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
