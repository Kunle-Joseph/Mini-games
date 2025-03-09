"use client";
//quick game
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://blditodpzucmopsgyvus.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGl0b2RwenVjbW9wc2d5dnVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ2NTY0NSwiZXhwIjoyMDU3MDQxNjQ1fQ.akkXYkZLQ4tw5xyy1Uv5XZEXo7khCMMvOguO5oEJnzc"
);

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
      await supabase
        .from("quick")
        .update({ score: bestTime })
        .eq("id", trimmedName)
        .select();
      console.log("Score updated successfully");
      startGame();
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const submitScore = async (e) => {
    let existingRecord = await supabase.from("quick").select("*");

    if (!name.trim()) return;
    console.log(bestTime);

    let trimmedName = name.trim();
    if (!trimmedName) return;
    {
      if (
        trimmedName == "vanny" ||
        trimmedName == "Vanny" ||
        trimmedName == "VANNY" ||
        trimmedName == "vanessa" ||
        trimmedName == "Vanessa" ||
        trimmedName == "VANESSA"
      ) {
        alert("hey hey vanessa :)");
      }
      if (
        trimmedName == "ter" ||
        trimmedName == "Ter" ||
        trimmedName == "TER" ||
        trimmedName == "terence" ||
        trimmedName == "Terence" ||
        trimmedName == "TERENCE"
      ) {
        alert("kys terence");
      }
    }
    if (existingRecord.data.some((record) => record.id == trimmedName)) {
      alert(
        "Name already exists, please try another name or update the score instead"
      );
      setSubmittedOnce(true);
      return;
    }

    try {
      // Create new record if name is available
      const data = {
        id: trimmedName,
        score: bestTime,
      };

      await supabase.from("quick").insert([data]).select();
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
            {!submitetdOnce && (
              <button
                type="submit"
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
                onClick={submitScore}
              >
                Save Score
              </button>
            )}
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
