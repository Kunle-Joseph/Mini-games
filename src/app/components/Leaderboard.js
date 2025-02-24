"use client"
import { useEffect, useState } from "react";

export default function Leaderboard({ game }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch(`/.netlify/functions/get-leaderboard?game=${game}`)
      .then((res) => res.json())
      .then((data) => setScores(data));
  }, [game]);

  return (
    <div className="leaderboard">
      <h2>Top Scores ({game})</h2>
      <ol>
        {scores.map((entry, index) => (
          <li key={index}>
            {entry.name} - {entry.score}
          </li>
        ))}
      </ol>
    </div>
  );
}
