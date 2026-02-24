'use client';

import { useState, useEffect } from 'react';
import styles from './Game.module.css';

interface GameProps {
  onShowTutorial: () => void;
}

type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
type Tube = Color[];

const TUBE_CAPACITY = 4;
const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export default function Game({ onShowTutorial }: GameProps) {
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ from: number; to: number }>>([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create balls for each color
    const allBalls: Color[] = [];
    COLORS.forEach(color => {
      for (let i = 0; i < TUBE_CAPACITY; i++) {
        allBalls.push(color);
      }
    });

    // Shuffle balls
    for (let i = allBalls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]];
    }

    // Distribute into tubes (leave 2 empty)
    const newTubes: Tube[] = [];
    const numFilledTubes = COLORS.length;
    
    for (let i = 0; i < numFilledTubes; i++) {
      newTubes.push(allBalls.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
    }
    
    // Add 2 empty tubes
    newTubes.push([]);
    newTubes.push([]);

    setTubes(newTubes);
    setSelectedTube(null);
    setMoveHistory([]);
    setIsWon(false);
    setMoves(0);
  };

  const checkWin = (currentTubes: Tube[]) => {
    return currentTubes.every(tube => {
      if (tube.length === 0) return true;
      if (tube.length !== TUBE_CAPACITY) return false;
      return tube.every(ball => ball === tube[0]);
    });
  };

  const canPlaceBall = (fromTube: Tube, toTube: Tube): boolean => {
    if (fromTube.length === 0) return false;
    if (toTube.length >= TUBE_CAPACITY) return false;
    if (toTube.length === 0) return true;
    
    const ballToMove = fromTube[fromTube.length - 1];
    const topBall = toTube[toTube.length - 1];
    return ballToMove === topBall;
  };

  const handleTubeClick = (tubeIndex: number) => {
    if (isWon) return;

    if (selectedTube === null) {
      // Select tube if it has balls
      if (tubes[tubeIndex].length > 0) {
        setSelectedTube(tubeIndex);
      }
    } else {
      if (selectedTube === tubeIndex) {
        // Deselect if clicking the same tube
        setSelectedTube(null);
      } else {
        // Try to move ball
        const fromTube = tubes[selectedTube];
        const toTube = tubes[tubeIndex];

        if (canPlaceBall(fromTube, toTube)) {
          const newTubes = tubes.map((tube, idx) => [...tube]);
          const ball = newTubes[selectedTube].pop()!;
          newTubes[tubeIndex].push(ball);

          setTubes(newTubes);
          setMoveHistory([...moveHistory, { from: selectedTube, to: tubeIndex }]);
          setMoves(moves + 1);
          setSelectedTube(null);

          // Check win condition
          if (checkWin(newTubes)) {
            setIsWon(true);
          }
        } else {
          setSelectedTube(null);
        }
      }
    }
  };

  const handleUndo = () => {
    if (moveHistory.length === 0 || isWon) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newTubes = tubes.map(tube => [...tube]);
    const ball = newTubes[lastMove.to].pop()!;
    newTubes[lastMove.from].push(ball);

    setTubes(newTubes);
    setMoveHistory(moveHistory.slice(0, -1));
    setMoves(Math.max(0, moves - 1));
    setSelectedTube(null);
  };

  const handleReset = () => {
    initializeGame();
  };

  return (
    <div className={styles.game}>
      <div className={styles.header}>
        <h1 className={styles.title}>Color Sort</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Moves:</span>
            <span className={styles.statValue}>{moves}</span>
          </div>
        </div>
      </div>

      <div className={styles.tubesContainer}>
        {tubes.map((tube, index) => (
          <div
            key={index}
            className={`${styles.tubeWrapper} ${selectedTube === index ? styles.selected : ''}`}
            onClick={() => handleTubeClick(index)}
          >
            <div className={styles.tube}>
              {[...Array(TUBE_CAPACITY)].map((_, ballIndex) => {
                const ball = tube[TUBE_CAPACITY - 1 - ballIndex];
                return (
                  <div key={ballIndex} className={styles.ballSlot}>
                    {ball && (
                      <div 
                        className={styles.ball}
                        style={{
                          backgroundImage: `url(/balls/${ball}.png)`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.button}
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || isWon}
        >
          ↶ Undo
        </button>
        <button 
          className={styles.button}
          onClick={handleReset}
        >
          🔄 Reset
        </button>
        <button 
          className={styles.button}
          onClick={onShowTutorial}
        >
          ❓ Help
        </button>
      </div>

      {isWon && (
        <div className={styles.winModal}>
          <div className={styles.winCard}>
            <h2 className={styles.winTitle}>🎉 You Won!</h2>
            <p className={styles.winText}>
              Completed in <strong>{moves}</strong> moves
            </p>
            <button className={styles.playAgainButton} onClick={handleReset}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
