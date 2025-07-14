import React, { useState, useEffect, useRef, useCallback } from "react";

// PUBLIC_INTERFACE
export default function SnakeGame() {
  /** 
   * Classic Snake Game React Implementation.
   * - Minimalistic, light theme.
   * - Real-time snake movement & rendering.
   * - Responsive keyboard controls (arrows/WASD).
   * - Score tracking, restart/new game, game over notification.
   * - Instructions and simple sound (optional).
   */

  // Play area grid size
  const GRID_SIZE = 16; // 16x16 grid
  const INITIAL_SNAKE = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 }
  ];
  const INITIAL_DIRECTION = { x: 1, y: 0 }; // Moving right initially
  const MOVE_INTERVAL = 110; // ms (speed)
  const CELL_SIZE = 24; // px (for canvas rendering)

  // Colors from theme
  const COLORS = {
    bg: "#FFFFFF",
    grid: "#F8F9FA",
    snake: "#4CAF50",
    head: "#388E3C",
    food: "#F44336",
    text: "#282c34"
  };

  // React state hooks
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(generateFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [moveTick, setMoveTick] = useState(0); // triggers useEffect for movement

  const boardRef = useRef(null);
  const directionRef = useRef(direction);
  directionRef.current = direction;
  const snakeRef = useRef(snake);
  snakeRef.current = snake;
  const gameLoopTimer = useRef(null);

  // Sound refs
  const eatSound = useRef(null);
  const crashSound = useRef(null);

  // Effect: Handle keydown input
  useEffect(() => {
    function handleKeyDown(evt) {
      if (gameOver) return;
      let { key } = evt;
      let newDir;
      if (["ArrowUp", "w", "W"].includes(key)) newDir = { x: 0, y: -1 };
      else if (["ArrowDown", "s", "S"].includes(key)) newDir = { x: 0, y: 1 };
      else if (["ArrowLeft", "a", "A"].includes(key)) newDir = { x: -1, y: 0 };
      else if (["ArrowRight", "d", "D"].includes(key)) newDir = { x: 1, y: 0 };

      // Prevent 180-degree reversals
      if (
        newDir &&
        !(newDir.x === -directionRef.current.x && newDir.y === -directionRef.current.y)
      ) {
        setDirection(newDir);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [gameOver]);

  // Effect: Move snake at fixed interval
  useEffect(() => {
    if (gameOver) {
      if (crashSound.current) crashSound.current.play();
      return;
    }
    // Set up interval for game loop
    gameLoopTimer.current = setInterval(() => {
      setMoveTick(tick => tick + 1);
    }, MOVE_INTERVAL);
    return () => clearInterval(gameLoopTimer.current);
    // eslint-disable-next-line
  }, [gameOver, MOVE_INTERVAL]);

  // Effect: On moveTick, update snake
  useEffect(() => {
    if (gameOver) return;

    const newSnake = [...snakeRef.current];
    const nextHead = {
      x: newSnake[0].x + directionRef.current.x,
      y: newSnake[0].y + directionRef.current.y
    };

    // Collision detection
    if (
      nextHead.x < 0 ||
      nextHead.y < 0 ||
      nextHead.x >= GRID_SIZE ||
      nextHead.y >= GRID_SIZE ||
      newSnake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)
    ) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(nextHead);

    // If eats food
    if (nextHead.x === food.x && nextHead.y === food.y) {
      setScore(score => score + 1);
      setFood(generateFood(newSnake));
      if (eatSound.current) eatSound.current.play();
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
    // eslint-disable-next-line
  }, [moveTick]);

  // Draw grid and snake to canvas
  useEffect(() => {
    const ctx = boardRef.current.getContext("2d");
    ctx.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw light grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    // Draw food
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw snake
    snake.forEach((segment, idx) => {
      ctx.fillStyle = idx === 0 ? COLORS.head : COLORS.snake;
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });
    // eslint-disable-next-line
  }, [snake, food]);

  // Generate random food position not overlapping snake
  function generateFood(snakeArr) {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snakeArr.some(seg => seg.x === newFood.x && seg.y === newFood.y)) {
        return newFood;
      }
    }
  }

  // PUBLIC_INTERFACE
  const handleRestart = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setMoveTick(0);
  }, []);

  // Utility: Instructions
  const instructions = (
    <>
      <div style={{ marginBottom: 8 }}>Use <kbd>Arrow keys</kbd> or <kbd>WASD</kbd> to control the snake.</div>
      <div style={{ fontSize: "0.95em", color: COLORS.text, opacity: 0.85 }}>
        Eat the red square. Grow and score. Avoid walls and yourself!
      </div>
    </>
  );

  return (
    <div
      className="snake-game-root"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <h1 style={{
        margin: "32px 0 0 0",
        color: COLORS.snake,
        fontWeight: 800,
        fontSize: "2.4rem",
        letterSpacing: "-0.5px",
      }}>Snake Game</h1>
      <div
        style={{
          margin: "18px 0 8px 0",
          fontSize: "1.4rem",
          fontWeight: 600,
          color: COLORS.text,
        }}
        aria-live="polite"
      >
        Score: {score}
      </div>
      <div
        style={{
          border: `2px solid ${COLORS.grid}`,
          borderRadius: 12,
          background: COLORS.bg,
          boxShadow: "0 2px 6px #0001",
          position: "relative",
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          margin: "0 0 18px 0"
        }}
      >
        <canvas
          ref={boardRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          style={{
            background: COLORS.grid,
            borderRadius: 12,
            display: "block"
          }}
          aria-label="Game grid"
        />
        {/* Game Over Overlay */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              left: 0, top: 0,
              width: "100%", height: "100%",
              background: "#FFF8",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
              fontWeight: 700,
            }}
            aria-modal="true"
            role="alertdialog"
          >
            <div style={{
              fontSize: "2rem",
              color: COLORS.food,
              textShadow: "0 2px 8px #0002"
            }}>Game Over</div>
            <div style={{
              margin: "10px 0",
              color: COLORS.snake,
              fontWeight: 500,
              fontSize: "1.1rem"
            }}>
              Final Score: {score}
            </div>
            <button
              onClick={handleRestart}
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                background: COLORS.snake,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                marginTop: 10,
                cursor: "pointer",
                boxShadow: "0 1px 4px #0002"
              }}
              autoFocus
            >Restart</button>
          </div>
        )}
      </div>
      <div
        style={{
          margin: "0 0 14px 0",
          fontSize: "1em",
          color: COLORS.text,
          userSelect: "none"
        }}
      >
        {instructions}
      </div>
      <audio ref={eatSound} src="https://cdn.pixabay.com/audio/2022/09/27/audio_124bfa923a.mp3" preload="auto" />
      <audio ref={crashSound} src="https://cdn.pixabay.com/audio/2022/03/15/audio_116bfa73f8.mp3" preload="auto" />
      <div style={{
        marginTop: 6,
        fontSize: "0.85em",
        color: "#888"
      }}>
        <span>Minimal UI, classic Snake for React &mdash; by Kavia</span>
      </div>
    </div>
  );
}
