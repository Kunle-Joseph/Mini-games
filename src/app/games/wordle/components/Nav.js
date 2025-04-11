"use client";
import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { soundManager } from "../utils/sound";
import Link from "next/link";
import Image from "next/image"; 
import logo from "../assets/wordleLogo.png";

const Nav = ({ isDarkMode, isSoundEnabled, onThemeToggle, onSoundToggle }) => {
  const [toggleCount, setToggleCount] = useState(0);
  const [flashbangActive, setFlashbangActive] = useState(false);
  const lastToggleTime = useRef(0);
  const flashbangTimeoutRef = useRef(null);

  const handleThemeToggle = () => {
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime.current;

    if (timeSinceLastToggle > 1500) {
      setToggleCount(1);
    } else {
      setToggleCount((prevCount) => prevCount + 1);
    }

    lastToggleTime.current = now;

    if (toggleCount >= 10) {
      setFlashbangActive(true);

      if (isSoundEnabled) {
        soundManager.play("flashbang");
      }

      setToggleCount(0);

      if (flashbangTimeoutRef.current) {
        clearTimeout(flashbangTimeoutRef.current);
      }

      flashbangTimeoutRef.current = setTimeout(() => {
        setFlashbangActive(false);
      }, 5000);
    }

    onThemeToggle();
  };

  return (
    <>
      {flashbangActive && (
        <div
          className="flashbang-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            zIndex: 9999,
            pointerEvents: "none",
            opacity: 1,
            animation: "fadeOut 5s ease-out forwards",
          }}
        />
      )}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="nav-left">
          <Image
            src={logo}
            alt="Word Tuah Logo"
            className="nav-logo"
            width={40}
            height={40}
            priority // Optional for above-the-fold images
          />
          <Link
            href="/"
            className="mb-4 inline-block text-indigo-700 hover:text-indigo-800"
          >
            ← Back to Home
          </Link>
          <h1 className="nav-title">Word Tuah</h1>
        </div>
        <div className="nav-right">
          <motion.button
            className="nav-button"
            onClick={onSoundToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
            aria-pressed={isSoundEnabled}
            type="button"
          >
            {isSoundEnabled ? "🔊" : "🔇"}
          </motion.button>
          <motion.button
            className="nav-button"
            onClick={handleThemeToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-pressed={isDarkMode}
            type="button"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </motion.button>
        </div>
      </nav>
    </>
  );
};

export default Nav;
