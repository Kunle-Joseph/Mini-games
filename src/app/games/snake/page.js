"use client";
//trivia game
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const GRID_SIZE = 22;
const CELL_SIZE = 22;

export default function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");
  const [update, setUpdate] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Check if food spawns on snake
    if (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    ) {
      generateFood();
    } else {
      setFood(newFood);
    }
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    generateFood();
  };

  const checkCollision = (head) => {
    // Wall collision
    if (head.x >= GRID_SIZE || head.x < 0 || head.y >= GRID_SIZE || head.y < 0)
      return true;
    // Self collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case "RIGHT":
        head.x += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      if (score > bestScore) {
        setBestScore(score);
      }
      return;
    }

    newSnake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
      setScore(score + 1);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, score]);

  const handleKeyPress = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
      }
    },
    [direction]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  const submitScore = async () => {
    let existingRecord = await supabase.from("snake").select("*");
    if (!name.trim()) return;

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
    // Check if ID/name already exists
    if (existingRecord.data.some((record) => record.id == trimmedName)) {
      alert(
        "Name already exists, please try another name or update the score instead"
      );
      setUpdate(true);
      return;
    }
    try {
      // Create new record if name is available
      const data = {
        id: trimmedName,
        score: score,
      };
      await supabase.from("snake").insert([data]).select();
      alert("Score saved successfully");
      resetGame();
      console.log("Score saved successfully");
    } catch (error) {
      console.error("Error saving score:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const updateScore = async () => {
    let trimmedName = name.trim();
    const data = {
      id: trimmedName,
      score: score,
    };
    try {
      await supabase
        .from("snake")
        .update({ score: score })
        .eq("id", trimmedName)
        .select();
      console.log("Score updated successfully");
      setUpdate(false);
      resetGame();
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-200">
      <Link
        href="/"
        className="inline-block mb-6 text-lg font-semibold text-yellow-800 hover:text-yellow-900"
      >
        ← Back to Home
      </Link>
      <div className="mb-4 border-b-2 border-yellow-700 text-2xl font-bold text-yellow-900">
        Score: {score}
      </div>
      <div className="mb-4 border-b-2 border-yellow-700 text-2xl font-bold text-yellow-900">
        Best Score: {bestScore}
      </div>
      <div
        className="relative bg-yellow-100 border-2 border-yellow-600"
        style={{
          width: `${GRID_SIZE * CELL_SIZE}px`,
          height: `${GRID_SIZE * CELL_SIZE}px`,
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-yellow-500 border border-yellow-700"
            style={{
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              left: `${segment.x * CELL_SIZE}px`,
              top: `${segment.y * CELL_SIZE}px`,
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute bg-yellow-800 border border-yellow-900"
          style={{
            width: `${CELL_SIZE}px`,
            height: `${CELL_SIZE}px`,
            left: `${food.x * CELL_SIZE}px`,
            top: `${food.y * CELL_SIZE}px`,
          }}
        />

        {/* Game Over Overlay and Submit */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-yellow-900 bg-opacity-50">
            <div className="rounded-lg border border-yellow-500 bg-yellow-800 p-4 text-2xl font-bold text-yellow-100">
              Game Over! Score: {score}
              <div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-lg border border-yellow-500 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  maxLength={15}
                />
                <button
                  type="submit"
                  className="mt-2 mb-4 rounded-lg bg-yellow-500 px-6 py-2 text-white hover:bg-yellow-600 transition"
                  onClick={submitScore}
                >
                  Save Score
                </button>
                {update && (
                  <button
                    type="submit"
                    className="mt-2 mb-4 rounded-lg bg-yellow-500 px-6 py-2 text-white hover:bg-yellow-600 transition"
                    onClick={updateScore}
                  >
                    Update Score
                  </button>
                )}
              </div>
              <button
                onClick={resetGame}
                className="block mt-4 rounded border border-yellow-900 px-4 py-2 bg-yellow-600 hover:bg-yellow-700"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 border-t-2 border-yellow-600 pt-2 font-medium text-yellow-800">
        Use arrow keys to control the snake
      </div>
      {/* Added mobile controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-200 p-4">
        <div className="grid grid-cols-3 gap-2 justify-items-center max-w-xs mx-auto">
          <button
            onClick={() => direction !== "DOWN" && setDirection("UP")}
            className="col-start-2 bg-yellow-500 text-yellow-900 p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
          >
            ↑
          </button>
          <button
            onClick={() => direction !== "RIGHT" && setDirection("LEFT")}
            className="col-start-1 row-start-2 bg-yellow-500 text-yellow-900 p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => direction !== "LEFT" && setDirection("RIGHT")}
            className="col-start-3 row-start-2 bg-yellow-500 text-yellow-900 p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
          >
            →
          </button>
          <button
            onClick={() => direction !== "UP" && setDirection("DOWN")}
            className="col-start-2 row-start-3 bg-yellow-500 text-yellow-900 p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}
