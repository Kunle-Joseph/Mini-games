"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Card emojis (needs even number of pairs)
const cardSymbols = ["🎮", "👾", "🕹️", "🎯", "🎲", "🏆", "👻", "🤖"];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [name, setName] = useState("");

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const doubledCards = [...cardSymbols, ...cardSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, id) => ({ id, symbol }));

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
          setGameWon(true);
        }
      }

      setTimeout(() => setFlipped([]), 1000);
    }
  };

  const submitScore = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await fetch("/.netlify/functions/submit-score", {
        method: "POST",
        body: JSON.stringify({
          game: "memory",
          name: name.trim(),
          score: moves,
        }),
      });
      initializeGame();
      setName("");
    } catch (error) {
      console.error("Score submission failed:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="mb-4 inline-block text-blue-600 hover:text-blue-700"
        >
          ← Back to Home
        </Link>

        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Memory Match</h1>
          <div className="text-lg">Moves: {moves}</div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square text-4xl flex items-center justify-center rounded-lg transition-all
                ${
                  flipped.includes(card.id) || matched.includes(card.id)
                    ? "bg-white shadow-lg"
                    : "bg-blue-100 hover:bg-blue-200"
                }
                ${matched.includes(card.id) ? "opacity-50" : ""}
              `}
              disabled={matched.includes(card.id)}
            >
              {flipped.includes(card.id) || matched.includes(card.id)
                ? card.symbol
                : "?"}
            </button>
          ))}
        </div>

        {gameWon && (
          <div className="bg-green-100 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              Congratulations! You won in {moves} moves!
            </h2>
            <form onSubmit={submitScore} className="flex gap-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 p-2 rounded border"
                maxLength={20}
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

        <button
          onClick={initializeGame}
          className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
