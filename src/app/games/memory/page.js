"use client";
//memory game
import { useState, useEffect } from "react";
import Link from "next/link";
import sql from "../../../../db";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const cardSymbols = ["🎮", "👾", "🕹️", "🎯", "🎲", "🏆", "👻", "🤖"];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0); // score
  const [gameWon, setGameWon] = useState(false);
  const [name, setName] = useState("");
  const [gameWonOnce, setGameWonOnce] = useState(false);
  const [bestMoves, setBestMoves] = useState(0); //best score
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const doubledCards = [...cardSymbols, ...cardSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, id) => ({ id, symbol }));

    setName("");
    setCards(doubledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (id) => {
    if (
      flipped.length === 2 ||
      flipped.includes(id) ||
      matched.includes(id) ||
      gameWon
    )
      return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const match = cards[firstId].symbol === cards[secondId].symbol;

      setMoves((m) => m + 1);

      if (match) {
        setMatched([...matched, firstId, secondId]);
        if (matched.length + 2 === cards.length) {
          if (gameWonOnce == false) {
            setBestMoves(moves);
          }
          setGameWon(true);
          setGameWonOnce(true);
          if (gameWonOnce == true && moves < bestMoves) {
            setBestMoves(moves);
          }
        }
      }

      setTimeout(() => setFlipped([]), 1000);
    }
  };

  const updateScore = async () => {
    let existingRecord = await supabase.from("memory").select("*");
    let trimmedName = name.trim();
    const data = {
      id: trimmedName,
      score: moves,
    };
    try {
      await supabase
        .from("memory")
        .update({ score: moves })
        .eq("id", trimmedName)
        .select();
      setDuplicate(false);
      initializeGame();
      console.log("Score updated successfully");
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const submitScore = async (e) => {
    let existingRecord = await supabase.from("memory").select("*");
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

    //check if name already exists
    if (existingRecord.data.some((record) => record.id == trimmedName)) {
      alert(
        "Name already exists, please try another name or update the score instead"
      );
      setDuplicate(true);
      return;
    }

    try {
      const data = {
        id: trimmedName,
        score: moves,
      };

      //await pb.collection("memory").create(data);
      await supabase.from("memory").insert([data]).select();
      console.log("Score saved successfully");
      initializeGame();
    } catch (error) {
      console.error("Error saving score:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-yellow-100 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto p-8 bg-white rounded-xl shadow-xl">
        <Link
          href="/"
          className="mb-6 inline-block text-yellow-800 hover:text-yellow-900 text-lg font-semibold"
        >
          ← Back to Home
        </Link>

        {gameWonOnce && gameWon == false && (
          <div className="bg-yellow-200 p-6 rounded-xl mb-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">
              Best Score: {bestMoves} moves!
            </h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              maxLength={15}
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
              onClick={submitScore}
            >
              Save Best Score
            </button>
            {duplicate && (
              <button
                type="submit"
                className="ml-2 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
                onClick={updateScore}
              >
                Update Best Score
              </button>
            )}
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-yellow-900">
            Memory Match
          </h1>
          <p className="text-sm font-extrabold text-yellow-700">
            {" "}
            recommend to flip screen on mobile
          </p>
          <div className="text-lg text-yellow-800 font-medium">
            Moves: {moves}
          </div>
        </div>

        {gameWon && (
          <div className="bg-yellow-200 p-6 rounded-xl mb-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">
              Congratulations! You won in {moves} moves!
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 p-3 rounded-lg border border-yellow-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                maxLength={15}
              />
              <button
                type="submit"
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
                onClick={submitScore}
              >
                Save Score
              </button>
              {duplicate && (
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
                  onClick={updateScore}
                >
                  Update Best Score
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`w-32 h-28 text-3xl flex items-center justify-center rounded-lg transition-all duration-300 
              ${
                flipped.includes(card.id) || matched.includes(card.id)
                  ? "bg-white shadow-md border border-yellow-400"
                  : "bg-yellow-300 hover:bg-yellow-400"
              } 
              ${
                matched.includes(card.id)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg"
              }`}
              disabled={matched.includes(card.id)}
            >
              {flipped.includes(card.id) || matched.includes(card.id)
                ? card.symbol
                : "?"}
            </button>
          ))}
        </div>

        <button
          onClick={initializeGame}
          className="mt-6 bg-yellow-500 px-6 py-3 rounded-lg hover:bg-yellow-600 font-semibold shadow-lg transition"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
