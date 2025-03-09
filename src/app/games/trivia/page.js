"use client";
//trivia
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

//const TRIVIA_API_URL = "https://opentdb.com/api.php?amount=2&type=multiple";
const retries = 3;
let addOn = 0;

export default function TriviaGame() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [update, setUpdate] = useState(false);
  let URL = `https://opentdb.com/api.php?amount=${10 + addOn}&type=multiple`;

  useEffect(() => {
    fetchQuestionsWithRetries();
  }, []);

  const fetchQuestionsWithRetries = async () => {
    setLoading(true);
    setError(null);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(
          `https://opentdb.com/api.php?amount=${10 + addOn}&type=multiple`
        );
        const data = await response.json();
        if (data.response_code === 0) {
          setQuestions(
            data.results.map((q) => ({
              ...q,
              answers: shuffle([...q.incorrect_answers, q.correct_answer]),
            }))
          );
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Fetch attempt failed", err);
      }
    }
    setError("Failed to load questions after multiple attempts");
    setLoading(false);
  };

  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer !== null || !questions[currentQuestion]) return;

    setSelectedAnswer(answer);
    setShowAnswer(true);

    if (answer === questions[currentQuestion].correct_answer) {
      setScore((s) => s + 100);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((c) => c + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setGameOver(false);
    setName("");
    fetchQuestionsWithRetries();
  };
  const addDifficulty = () => {
    addOn += 5;
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setGameOver(false);
    setName("");
    fetchQuestionsWithRetries();
  };

  const submitScore = async (e) => {
    //e.preventDefault();
    let existingRecord = await supabase.from("trivia").select("*");
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

      await supabase.from("trivia").insert([data]).select();
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
      resetGame();
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-center bg-indigo-100">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 rounded-full"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-indigo-200">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="mb-4 inline-block text-indigo-700 hover:text-indigo-800"
        >
          ← Back to Home
        </Link>

        {!gameOver ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-indigo-900">
                Trivia Challenge
              </h1>
              <div className="text-lg text-indigo-800">Score: {score}</div>
            </div>

            {questions.length > 0 && questions[currentQuestion] && (
              <div>
                <div className="mb-4 text-indigo-700">
                  Question {currentQuestion + 1} of {questions.length}
                </div>

                <h2 className="text-xl mb-6 font-semibold text-indigo-900">
                  {decodeHTML(questions[currentQuestion].question)}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions[currentQuestion].answers.map((answer, index) => {
                    const isCorrect =
                      answer === questions[currentQuestion].correct_answer;
                    const isSelected = answer === selectedAnswer;

                    let buttonClass =
                      "bg-gray-100 hover:bg-gray-200 text-indigo-900";

                    if (showAnswer) {
                      if (isCorrect) {
                        buttonClass =
                          "bg-green-100 border-green-500 text-green-900";
                      } else if (isSelected) {
                        buttonClass = "bg-red-100 border-red-500 text-red-900";
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(answer)}
                        className={`p-4 text-left rounded-lg border-2 ${buttonClass} transition-colors`}
                        disabled={showAnswer}
                      >
                        {decodeHTML(answer)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-indigo-300 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">
              Game Over! Final Score: {score}
            </h2>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 rounded border border-indigo-600 text-gray-600 mb-4"
              maxLength={20}
              required
            />

            <div className="space-y-4">
              <button
                type="submit"
                className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 w-full"
                onClick={submitScore}
              >
                Save Score
              </button>

              {update && (
                <button
                  type="submit"
                  className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 w-full"
                  onClick={updateScore}
                >
                  Update Score
                </button>
              )}

              <button
                type="submit"
                className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 w-full"
                onClick={resetGame}
              >
                Reset Game
              </button>

              <button
                onClick={addDifficulty}
                className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 w-full"
              >
                Make it difficult this time (add 5 more questions)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen p-8 text-center bg-red-100">
        <h2 className="text-red-500 text-xl">{error}</h2>
        <button
          onClick={fetchQuestionsWithRetries}
          className="mt-4 text-red-600 hover:text-indigo-800"
        >
          Retry <small>try this at least once</small>
        </button>
        <div>
          <Link
            href="/"
            className="mb-4 inline-block text-indigo-700 hover:text-indigo-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }
}

const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};
