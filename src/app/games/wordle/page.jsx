"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import "./variables.css";
import "./App.css";
import "./Wordle.css";
import { getRandomWord, getWordDefinition } from "./wordList";
import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import Title from "./components/Title";
import Modal from "./components/Modal";
import Toast from "./components/Toast";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { soundManager } from "./utils/sound";

function App() {
  const [targetWord, setTargetWord] = useState("");
  const [wordDefinition, setWordDefinition] = useState("");
  const [guesses, setGuesses] = useState(Array(6).fill(""));
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedPreference = localStorage.getItem("darkMode");
    if (savedPreference !== null) {
      return savedPreference === "true";
    }
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const gameBoardRef = useRef(null);

  // Track the space positions in the target word
  const [spacePositions, setSpacePositions] = useState([]);

  // Add state to track if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  // Track screen width for responsive elements
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const startNewGame = useCallback(() => {
    const newWord = getRandomWord();
    setTargetWord(newWord);
    setWordDefinition(getWordDefinition(newWord) || "");
    setGuesses(Array(6).fill(""));
    setCurrentGuess("");
    setCurrentRow(0);
    setGameOver(false);
    setGameWon(false);
    setShowModal(false);

    // Reset space positions
    const newSpacePositions = [];
    for (let i = 0; i < newWord.length; i++) {
      if (newWord[i] === " ") {
        newSpacePositions.push(i);
      }
    }
    setSpacePositions(newSpacePositions);

    // Reset the game board state by triggering a re-render
    if (gameBoardRef.current) {
      gameBoardRef.current.revealRow(-1); // Reset any ongoing animations
    }
  }, []);

  // Initialize the game with a random word
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Check if we need to insert automatic spaces based on the current guess length
  useEffect(() => {
    for (const position of spacePositions) {
      if (currentGuess.length === position) {
        // Insert automatic space
        setCurrentGuess((prev) => prev + " ");
      }
    }
  }, [currentGuess, spacePositions]);

  // Function to get the actual guess length without automatic spaces
  const getEffectiveGuessLength = useCallback(
    (guess) => {
      let effectiveLength = 0;
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] !== " " || !spacePositions.includes(i)) {
          effectiveLength++;
        }
      }
      return effectiveLength;
    },
    [spacePositions]
  );

  // Calculate the effective target word length (excluding automatic spaces)
  const effectiveTargetLength = targetWord.length - spacePositions.length;

  // Submit the current guess
  const submitGuess = useCallback(() => {
    const effectiveGuessLength = getEffectiveGuessLength(currentGuess);

    if (effectiveGuessLength !== effectiveTargetLength) {
      setShowToast(true);
      gameBoardRef.current?.shakeRow(currentRow);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    gameBoardRef.current?.revealRow(currentRow);

    if (currentGuess.toUpperCase() === targetWord.toUpperCase()) {
      setGameOver(true);
      setGameWon(true);
    } else {
      if (currentRow < 5) {
        setCurrentRow(currentRow + 1);
        setCurrentGuess("");
      } else {
        setGameOver(true);
      }
    }
  }, [
    currentGuess,
    targetWord,
    guesses,
    currentRow,
    effectiveTargetLength,
    getEffectiveGuessLength,
  ]);

  // Get the next position to type at (skipping space positions)
  const getNextTypePosition = useCallback(
    (currentLength) => {
      if (spacePositions.includes(currentLength)) {
        return getNextTypePosition(currentLength + 1);
      }
      return currentLength;
    },
    [spacePositions]
  );

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (event) => {
      if (gameOver) return;
      if (event.altKey) return;

      const key = event.key.toUpperCase();

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        if (spacePositions.includes(currentGuess.length - 1)) {
          setCurrentGuess((prev) => prev.slice(0, -2));
        } else {
          setCurrentGuess((prev) => prev.slice(0, -1));
        }
      } else if (
        /^[A-Z]$/.test(key) &&
        currentGuess.length < targetWord.length
      ) {
        const nextPos = getNextTypePosition(currentGuess.length);

        if (nextPos > currentGuess.length) {
          let newGuess = currentGuess;
          while (newGuess.length < nextPos) {
            newGuess += " ";
          }
          newGuess += key;
          setCurrentGuess(newGuess);
        } else {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [
      currentGuess,
      gameOver,
      submitGuess,
      targetWord,
      spacePositions,
      getNextTypePosition,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle on-screen keyboard clicks
  const handleKeyClick = useCallback(
    (key) => {
      if (gameOver) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        if (spacePositions.includes(currentGuess.length - 1)) {
          setCurrentGuess((prev) => prev.slice(0, -2));
        } else {
          setCurrentGuess((prev) => prev.slice(0, -1));
        }
      } else if (currentGuess.length < targetWord.length) {
        const nextPos = getNextTypePosition(currentGuess.length);

        if (nextPos > currentGuess.length) {
          let newGuess = currentGuess;
          while (newGuess.length < nextPos) {
            newGuess += " ";
          }
          newGuess += key;
          setCurrentGuess(newGuess);
        } else {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [
      currentGuess,
      gameOver,
      submitGuess,
      targetWord,
      spacePositions,
      getNextTypePosition,
    ]
  );

  // Apply dark mode class to html element and save preference
  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  // Update sound manager when sound setting changes
  useEffect(() => {
    soundManager.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  // Play sound when modal shows
  useEffect(() => {
    if (showModal) {
      soundManager.play(gameWon ? "win" : "fail");
    }
  }, [showModal, gameWon]);

  // Detect if device is mobile and track screen width
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = width < 600;

      setScreenWidth(width);
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent zoom on double tap for mobile devices
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Prevent bounce scrolling on iOS
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="app" style={{ padding: 0 }}>
      <header>
        <Nav
          isDarkMode={isDarkMode}
          isSoundEnabled={isSoundEnabled}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
        />
      </header>
      <Modal
        isOpen={showModal}
        onClose={startNewGame}
        title={gameWon ? "🎉 Congratulations!" : "😔 Game Over"}
        word={targetWord}
        definition={wordDefinition}
        isWin={gameWon}
      />
      <main className={`wordle-container ${isMobile ? "mobile" : ""}`}>
        <Title />
        <Toast
          isVisible={showToast}
          message={`Word must be ${effectiveTargetLength} letters!`}
        />
        <motion.section
          className="definition"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          aria-live="polite"
          aria-atomic="true"
        >
          <p>Definition: {wordDefinition}</p>
        </motion.section>
        <GameBoard
          ref={gameBoardRef}
          guesses={guesses}
          currentGuess={currentGuess}
          currentRow={currentRow}
          targetWord={targetWord}
          onRevealComplete={() => {
            if (gameOver) {
              setShowModal(true);
            }
          }}
          isMobile={isMobile}
          screenWidth={screenWidth}
        />
        <Keyboard
          guesses={guesses}
          currentRow={currentRow}
          targetWord={targetWord}
          gameOver={gameOver}
          onKeyClick={handleKeyClick}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
