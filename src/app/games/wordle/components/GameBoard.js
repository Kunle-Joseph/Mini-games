"use client"
import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
  useCallback,
} from "react";
import { motion } from "motion/react";
import { createPortal } from "react-dom";

// Animation configurations for different elements and states
const ANIMATIONS = {
  // Initial fade-in animation for the entire game board
  BOARD: {
    initial: { opacity: 0 }, // Start invisible
    animate: { opacity: 1 }, // Fade in to fully visible
    transition: { duration: 0.5 },
  },
  // Row entrance animations that stagger each row's appearance
  ROW: {
    initial: { opacity: 0, y: -10 }, // Start invisible and slightly above position
    animate: { opacity: 1, y: 0 }, // Fade in and move to correct position
    transition: (delay) => ({ delay, duration: 0.3 }),
  },
  // Different animation states for individual tiles
  TILE: {
    // Animation when user types a new letter
    TYPING: {
      scale: [1, 3, 1], // Pop effect: normal → 3x size → normal
      transition: { duration: 0.2, ease: "easeOut" },
    },
    // Animation when revealing correctness of a letter
    REVEALING: {
      scale: [1, 0.8, 5, 1], // Dramatic pop: normal → shrink → expand → normal
      rotateX: [0, 10, -10, 0], // Shake effect
      opacity: [1, 0.5, 1], // Subtle fade in/out
      transition: (wordLength, tileIndex) => ({
        scale: {
          duration: Math.max(
            0.08,
            0.25 - (wordLength - 5) * 0.01 - tileIndex * 0.02
          ),
          ease: "easeInOut",
        },
        opacity: {
          duration: Math.max(
            0.08,
            0.25 - (wordLength - 5) * 0.01 - tileIndex * 0.02
          ),
          ease: "easeInOut",
        },
        backgroundColor: {
          duration: Math.max(
            0.05,
            0.12 - (wordLength - 5) * 0.005 - tileIndex * 0.01
          ),
        },
        color: {
          duration: Math.max(
            0.05,
            0.12 - (wordLength - 5) * 0.005 - tileIndex * 0.01
          ),
        },
      }),
    },
    // Default state for idle tiles
    DEFAULT: {
      scale: 1, // Normal size
      transition: {
        duration: 0.1, // Quick transitions
        type: "spring", // Springy physics-based animation
        stiffness: 500, // Spring is fairly stiff
        damping: 30, // Moderate dampening (less bouncy)
      },
    },
  },
};

const GameBoard = forwardRef((props, ref) => {
  const {
    guesses,
    currentGuess,
    currentRow,
    targetWord,
    onRevealComplete,
    isMobile,
    screenWidth,
  } = props;
  const wordLength = targetWord.length;
  // Track which row is currently having its letters revealed
  const [revealingRow, setRevealingRow] = useState(null);
  const [shakingRow, setShakingRow] = useState(null);
  const isShakingRef = useRef(false);
  // Store tile states (correct, present, absent) for each position
  const [tileStates, setTileStates] = useState({});
  // Track which specific tile (column) is being revealed within the revealing row
  const [revealingTile, setRevealingTile] = useState(null);
  // Track the most recently typed letter for typing animation
  const [lastTypedIndex, setLastTypedIndex] = useState(null);
  // Track which tiles have had their animations completed
  const [revealedTiles, setRevealedTiles] = useState(new Set());
  // State to track overall game status for screen readers
  const [gameStatus, setGameStatus] = useState("");
  // Reference to the game board wrapper for scrolling
  const gameBoardRef = useRef(null);
  // References to each row
  const rowRefs = useRef([]);
  // State to track if there's content out of view
  const [hasMoreRight, setHasMoreRight] = useState(false);
  const [hasMoreLeft, setHasMoreLeft] = useState(false);
  // State to track if game board is scrollable
  const [isScrollable, setIsScrollable] = useState(false);

  // Expose the revealRow and shakeRow methods to parent component
  useImperativeHandle(ref, () => ({
    revealRow: (row) => {
      // If row is -1, reset all states
      if (row === -1) {
        setRevealingRow(null);
        setRevealingTile(null);
        setTileStates({});
        setRevealedTiles(new Set());
        setLastTypedIndex(null);
        return;
      }
      // Reset revealed tiles when starting a new row reveal
      setRevealedTiles(new Set());
      setRevealingRow(row);
      setRevealingTile(0);
    },
    shakeRow: (rowIndex) => {
      if (isShakingRef.current) return;
      isShakingRef.current = true;
      setShakingRow(rowIndex);
      setTimeout(() => {
        setShakingRow(null);
        isShakingRef.current = false;
      }, 500);
    },
  }));

  // Scroll to the current row when it changes
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (rowRefs.current[currentRow]) {
        const tiles = rowRefs.current[currentRow]?.querySelectorAll(".tile");
        if (tiles) {
          let activeIndex = Math.max(0, currentGuess.length - 1);
          if (activeIndex <= 0 || targetWord[activeIndex] === " ") {
            for (let i = 0; i < targetWord.length; i++) {
              if (targetWord[i] !== " ") {
                activeIndex = i;
                break;
              }
            }
          }
          const activeTile = tiles[activeIndex];
          if (activeTile && targetWord[activeIndex] !== " ") {
            scrollTileIntoView(activeTile);
          }
        }
      }
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [currentRow, currentGuess.length, targetWord]);

  // Function to find next non-space index
  const findNextNonSpaceIndex = (startIndex, direction = "forward") => {
    if (direction === "forward") {
      for (let i = startIndex; i < targetWord.length; i++) {
        if (targetWord[i] !== " ") return i;
      }
    } else {
      for (let i = startIndex; i >= 0; i--) {
        if (targetWord[i] !== " ") return i;
      }
    }
    return startIndex;
  };

  // Function to determine the actual active typing index (never a space)
  const getActiveTypingIndex = useCallback(() => {
    const lastIndex = currentGuess.length - 1;
    if (lastIndex >= 0 && targetWord[lastIndex] === " ") {
      return findNextNonSpaceIndex(lastIndex, "backward");
    }
    return lastIndex;
  }, [currentGuess.length, targetWord]);

  // Handle typing animation when the current guess changes
  useEffect(() => {
    const newLastTypedIndex = getActiveTypingIndex();
    setLastTypedIndex(newLastTypedIndex);
    let scrollTimer = null;
    if (newLastTypedIndex >= 0 && rowRefs.current[currentRow]) {
      scrollTimer = setTimeout(() => {
        const activeTile =
          rowRefs.current[currentRow]?.querySelectorAll(".tile")[
            newLastTypedIndex
          ];
        if (activeTile) {
          scrollTileIntoView(activeTile);
        }
      }, 50);
    }
    const typingTimer = setTimeout(() => setLastTypedIndex(null), 250);
    return () => {
      clearTimeout(typingTimer);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [currentGuess, currentRow, getActiveTypingIndex]);

  // Function to check if there are tiles out of view
  const checkOverflow = useCallback(() => {
    if (!gameBoardRef.current) return;
    requestAnimationFrame(() => {
      const container = gameBoardRef.current;
      if (!container) return;
      const shouldBeScrollable = wordLength > 6;
      if (shouldBeScrollable) {
        const scrollableWidth = container.scrollWidth;
        const containerWidth = container.clientWidth;
        const currentScrollPosition = container.scrollLeft;
        const isOverflowing = scrollableWidth > containerWidth + 5;
        setIsScrollable(isOverflowing);
        if (isOverflowing) {
          container.classList.add("is-scrollable");
          const hasRight =
            currentScrollPosition + containerWidth < scrollableWidth - 2;
          const hasLeft = currentScrollPosition > 2;
          if (hasMoreRight !== hasRight) {
            setHasMoreRight(hasRight);
          }
          if (hasMoreLeft !== hasLeft) {
            setHasMoreLeft(hasLeft);
          }
        } else {
          container.classList.remove("is-scrollable");
          if (hasMoreLeft || hasMoreRight) {
            setHasMoreRight(false);
            setHasMoreLeft(false);
          }
        }
      } else {
        container.classList.remove("is-scrollable");
        setIsScrollable(false);
        setHasMoreLeft(false);
        setHasMoreRight(false);
        container.scrollLeft = 0;
      }
    });
  }, [hasMoreLeft, hasMoreRight, wordLength]);

  // Monitor scroll events to update indicators
  useEffect(() => {
    if (!gameBoardRef.current) return;
    const container = gameBoardRef.current;
    checkOverflow();
    const handleScroll = () => {
      checkOverflow();
    };
    const handleResize = () => {
      checkOverflow();
    };
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [checkOverflow, targetWord, currentRow]);

  // Function to scroll a tile into view
  const scrollTileIntoView = (tileElement) => {
    if (!gameBoardRef.current || !tileElement) return;
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    const tileRect = tileElement.getBoundingClientRect();
    const isPartiallyOutsideLeft = tileRect.left < boardRect.left;
    const isPartiallyOutsideRight = tileRect.right > boardRect.right;
    if (isPartiallyOutsideLeft || isPartiallyOutsideRight) {
      const scrollLeft =
        tileElement.offsetLeft - boardRect.width / 2 + tileRect.width / 2;
      gameBoardRef.current.scrollTo({
        left: scrollLeft,
        behavior: isMobile ? "auto" : "smooth",
      });
      setTimeout(checkOverflow, 100);
    }
  };

  // Handle the sequential reveal animation for each tile in a row
  useEffect(() => {
    if (revealingRow !== null && revealingTile !== null) {
      if (revealingTile < wordLength) {
        const tileKey = `${revealingRow}-${revealingTile}`;
        const letter = guesses[revealingRow][revealingTile];
        if (rowRefs.current[revealingRow]) {
          if (targetWord[revealingTile] !== " ") {
            const revealingTileElement =
              rowRefs.current[revealingRow]?.querySelectorAll(".tile")[
                revealingTile
              ];
            if (revealingTileElement) {
              scrollTileIntoView(revealingTileElement);
            }
          } else {
            const nextNonSpaceIndex = findNextNonSpaceIndex(revealingTile + 1);
            if (nextNonSpaceIndex < wordLength) {
              const nextTileElement =
                rowRefs.current[revealingRow]?.querySelectorAll(".tile")[
                  nextNonSpaceIndex
                ];
              if (nextTileElement) {
                scrollTileIntoView(nextTileElement);
              }
            }
          }
        }
        if (targetWord[revealingTile] === " ") {
          setTileStates((prev) => ({
            ...prev,
            [tileKey]: "space",
          }));
          setRevealedTiles((prev) => {
            const newSet = new Set(prev);
            newSet.add(tileKey);
            return newSet;
          });
          setRevealingTile((prevTile) =>
            prevTile !== null ? prevTile + 1 : null
          );
          return;
        }
        const newState =
          letter === targetWord[revealingTile]
            ? "correct"
            : targetWord.includes(letter)
            ? "present"
            : "absent";
        setTileStates((prev) => ({
          ...prev,
          [tileKey]: newState,
        }));
        const baseDelay = Math.max(80, 200 - (wordLength - 5) * 10);
        const progressiveDelay = baseDelay - revealingTile * 15;
        const dynamicDelay = Math.max(40, progressiveDelay);
        const addToRevealedTimer = setTimeout(() => {
          setRevealedTiles((prev) => {
            const newSet = new Set(prev);
            newSet.add(tileKey);
            return newSet;
          });
          setRevealingTile((prevTile) =>
            prevTile !== null ? prevTile + 1 : null
          );
        }, dynamicDelay);
        return () => {
          clearTimeout(addToRevealedTimer);
        };
      } else {
        const finalBaseDelay = Math.max(80, 200 - (wordLength - 5) * 10);
        const finalProgressiveDelay = finalBaseDelay - wordLength * 15;
        const finalDelay = Math.max(40, finalProgressiveDelay);
        setTimeout(() => {
          setRevealingRow(null);
          setRevealingTile(null);
          onRevealComplete();
        }, finalDelay);
      }
    }
  }, [
    revealingRow,
    revealingTile,
    guesses,
    targetWord,
    wordLength,
    onRevealComplete,
  ]);

  // Update the game status for screen readers when revealing is complete
  useEffect(() => {
    if (revealingRow === null && revealingTile === null) {
      if (gameStatus !== "") {
        setTimeout(() => setGameStatus(""), 1000);
      }
    }
  }, [revealingRow, revealingTile, gameStatus]);

  // Determine the visual state class for each tile
  const getTileClass = (rowIndex, colIndex) => {
    const tileKey = `${rowIndex}-${colIndex}`;
    if (tileStates[tileKey] && revealedTiles.has(tileKey)) {
      return tileStates[tileKey];
    }
    if (rowIndex < currentRow && rowIndex !== revealingRow) {
      const letter = guesses[rowIndex][colIndex];
      if (targetWord[colIndex] === " ") return "space";
      if (letter === targetWord[colIndex]) return "correct";
      if (targetWord.includes(letter)) return "present";
      return "absent";
    }
    return "";
  };

  // Check if a specific tile is currently being revealed
  const isRevealing = (rowIndex, colIndex) => {
    if (targetWord[colIndex] === " ") return false;
    return rowIndex === revealingRow && colIndex === revealingTile;
  };

  // Check if the target position should be a space
  const isTargetSpace = (colIndex) => targetWord[colIndex] === " ";

  // Determine the appropriate background color for a tile
  const getTileBackgroundColor = (
    _rowIndex,
    _colIndex,
    isSpaceTile,
    tileClass,
    revealing
  ) => {
    if (isSpaceTile) return "var(--background-color)";
    if (revealing) return "var(--tile-bg)";
    switch (tileClass) {
      case "correct":
        return "var(--correct-color)";
      case "present":
        return "var(--present-color)";
      case "absent":
        return "var(--absent-color)";
      default:
        return "var(--tile-bg)";
    }
  };

  // Update the method for determining tile status text
  const getTileStatusText = (tileClass) => {
    if (tileClass === "correct") {
      return "Correct";
    } else if (tileClass === "present") {
      return "Present in word but wrong position";
    } else if (tileClass === "absent") {
      return "Not in the word";
    }
    return "";
  };

  // Function to handle scroll by indicator click
  const handleScrollIndicatorClick = useCallback(
    (direction) => {
      if (!gameBoardRef.current) return;
      const scrollAmount = direction === "left" ? -150 : 150;
      gameBoardRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkOverflow, 100);
    },
    [checkOverflow]
  );

  // ScrollIndicators component rendered in a portal
  const ScrollIndicators = ({
    hasMoreLeft,
    hasMoreRight,
    isMobile,
    screenWidth,
    isScrollable = false,
  }) => {
    if (!isScrollable) return null;
    return createPortal(
      <>
        {hasMoreLeft && (
          <div
            className={`scroll-indicator left ${
              isMobile ? "mobile" : "desktop"
            } ${screenWidth && screenWidth < 400 ? "prominent" : ""}`}
            aria-hidden="true"
            onClick={() => handleScrollIndicatorClick("left")}
            role="button"
            tabIndex={0}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            aria-label="Scroll left"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollIndicatorClick("left");
              }
            }}
          >
            <span>‹</span>
          </div>
        )}
        {hasMoreRight && (
          <div
            className={`scroll-indicator right ${
              isMobile ? "mobile" : "desktop"
            } ${screenWidth && screenWidth < 400 ? "prominent" : ""}`}
            aria-hidden="true"
            onClick={() => handleScrollIndicatorClick("right")}
            role="button"
            tabIndex={0}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            aria-label="Scroll right"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollIndicatorClick("right");
              }
            }}
          >
            <span>›</span>
          </div>
        )}
      </>,
      document.body
    );
  };

  // Add keyboard shortcuts for scrolling horizontally
  useEffect(() => {
    if (!isScrollable || !gameBoardRef.current) return;
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.altKey && gameBoardRef.current) {
        const scrollAmount = 100;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          gameBoardRef.current.scrollBy({
            left: -scrollAmount,
            behavior: "smooth",
          });
          setTimeout(checkOverflow, 100);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          gameBoardRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
          setTimeout(checkOverflow, 100);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isScrollable, checkOverflow]);

  // Initial check for overflow when component mounts or word changes
  useEffect(() => {
    const timer = setTimeout(() => {
      checkOverflow();
    }, 100);
    return () => clearTimeout(timer);
  }, [targetWord, checkOverflow]);

  return (
    <>
      <ScrollIndicators
        hasMoreLeft={hasMoreLeft}
        hasMoreRight={hasMoreRight}
        isMobile={isMobile}
        screenWidth={screenWidth}
        isScrollable={isScrollable}
      />
      <motion.section
        className={`game-board-wrapper ${isMobile ? "mobile" : ""} ${
          screenWidth && screenWidth < 400 ? "very-small" : ""
        }`}
        ref={gameBoardRef}
        style={{ WebkitOverflowScrolling: "touch" }}
        {...ANIMATIONS.BOARD}
        aria-label="Game board"
        role="grid"
        onLoad={checkOverflow}
      >
        <div className={`game-board ${wordLength <= 6 ? "short-word" : ""}`}>
          {/* Status announcer for screen readers */}
          <div className="sr-only" aria-live="assertive" role="status">
            {gameStatus}
          </div>
          {Array(6)
            .fill(null)
            .map((_, rowIndex) => (
              <motion.div
                key={rowIndex}
                className={`row ${rowIndex === shakingRow ? "shake" : ""}`}
                role="row"
                ref={(el) => {
                  rowRefs.current[rowIndex] = el;
                }}
                aria-rowindex={rowIndex + 1}
                {...ANIMATIONS.ROW}
                transition={ANIMATIONS.ROW.transition(rowIndex * 0.05)}
              >
                {Array(wordLength)
                  .fill(null)
                  .map((_, colIndex) => {
                    const isCurrentRowTile = rowIndex === currentRow;
                    const isTypedLetter = colIndex < currentGuess.length;
                    const isLastTyped =
                      isCurrentRowTile && colIndex === lastTypedIndex;
                    const activeTypingIndex = getActiveTypingIndex();
                    const isActiveTypingTile =
                      isCurrentRowTile && colIndex === activeTypingIndex;
                    const tileClass = getTileClass(rowIndex, colIndex);
                    const letter =
                      isCurrentRowTile && isTypedLetter
                        ? currentGuess[colIndex]
                        : (guesses[rowIndex] && guesses[rowIndex][colIndex]) ||
                          "";
                    const revealing = isRevealing(rowIndex, colIndex);
                    const isSpaceTile = isTargetSpace(colIndex);
                    let tileAnimation;
                    if (isLastTyped) {
                      tileAnimation = ANIMATIONS.TILE.TYPING;
                    } else if (revealing && !isSpaceTile) {
                      tileAnimation = {
                        ...ANIMATIONS.TILE.REVEALING,
                        transition: ANIMATIONS.TILE.REVEALING.transition(
                          wordLength,
                          colIndex
                        ),
                      };
                    } else {
                      tileAnimation = ANIMATIONS.TILE.DEFAULT;
                    }
                    const bgColor = getTileBackgroundColor(
                      rowIndex,
                      colIndex,
                      isSpaceTile,
                      tileClass,
                      revealing
                    );
                    const statusText = getTileStatusText(tileClass);
                    return (
                      <motion.div
                        key={colIndex}
                        className={`tile ${tileClass} ${
                          isSpaceTile ? "space-tile" : ""
                        }${
                          isActiveTypingTile && !isSpaceTile
                            ? " active-tile"
                            : ""
                        }`}
                        role="gridcell"
                        aria-colindex={colIndex + 1}
                        aria-label={`Row ${rowIndex + 1}, Column ${
                          colIndex + 1
                        }${letter ? `: Letter ${letter}` : ""}${
                          statusText ? `, ${statusText}` : ""
                        }`}
                        aria-live={isCurrentRowTile ? "polite" : "off"}
                        layout
                        animate={{
                          ...tileAnimation,
                          backgroundColor: revealing ? bgColor : bgColor,
                        }}
                      >
                        {targetWord[colIndex] !== " " && (
                          <motion.span animate={{ scale: 1 }}>
                            {letter}
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
              </motion.div>
            ))}
        </div>
      </motion.section>
      <div className="scroll-instruction">Use Alt + ←→ keys to scroll</div>
    </>
  );
});

export default GameBoard;
