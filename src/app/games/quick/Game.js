"use client"
import { useState } from "react";
import Leaderboard from "../../components/Leaderboard";

export default function QuickClick() {
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/.netlify/functions/submit-score", {
      method: "POST",
      body: JSON.stringify({ game: "QuickClick", name, score }),
    });
    setName("");
  };

  return (
    <div>
      {/* Game logic UI here */}
      <button onClick={() => setScore(score + 10)}>PlaceHolder</button>

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <button type="submit">Save Score</button>
      </form>

      <Leaderboard game="QuickClick" />
    </div>
  );
}
