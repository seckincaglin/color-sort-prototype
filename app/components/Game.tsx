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

// Vibrant, easy-to-distinguish colors with gradients for 3D effect
const COLOR_STYLES: Record<Color, { background: string; border: string; shadow: string }> = {
  red: {
    background: 'linear-gradient(145deg, #FF6B6B 0%, #EE4444 50%, #CC2222 100%)',
    border: '#AA0000',
    shadow: 'rgba(238, 68, 68, 0.6)'
  },
  blue: {
    background: 'linear-gradient(145deg, #5DADE2 0%, #3498DB 50%, #2471A3 100%)',
    border: '#1A5276',
    shadow: 'rgba(52, 152, 219, 0.6)'
  },
  green: {
    background: 'linear-gradient(145deg, #58D68D 0%, #2ECC71 50%, #229954 100%)',
    border: '#196F3D',
    shadow: 'rgba(46, 204, 113, 0.6)'
  },
  yellow: {
    background: 'linear-gradient(145deg, #F9E79F 0%, #F4D03F 50%, #D4AC0D 100%)',
    border: '#9A7D0A',
    shadow: 'rgba(244, 208, 63, 0.6)'
  },
  purple: {
    background: 'linear-gradient(145deg, #BB8FCE 0%, #9B59B6 50%, #7D3C98 100%)',
    border: '#5B2C6F',
    shadow: 'rgba(155, 89, 182, 0.6)'
  },
  orange: {
    background: 'linear-gradient(145deg, #FFAA5B 0%, #FF8C42 50%, #E67E22 100%)',
    border: '#A04000',
    shadow: 'rgba(255, 140, 66, 0.6)'
  }
};

export default function Game({ onShowTutorial }: GameProps) {
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ from: number; to: number; ballColor: Color }>>([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    // Create balls for each color
    const allBalls: Color[] = [];
    COLORS.forEach(color => {
      for (let i = 0; i < TUBE_CAPACITY; i++) {
        allBalls.push(color);
      }
    });

    // Shuffle balls using Fisher-Yates
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
          const newTubes = tubes.map((tube) => [...tube]);
          const ball = newTubes[selectedTube].pop()!;
          newTubes[tubeIndex].push(ball);

          setTubes(newTubes);
          setMoveHistory([...moveHistory, { from: selectedTube, to: tubeIndex, ballColor: ball }]);
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

  const handleNextLevel = () => {
    setLevel(level + 1);
  };

  return (
    <div className={styles.game}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎨 Color Sort</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Level</span>
            <span className={styles.statValue}>{level}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Moves</span>
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
                const actualIndex = TUBE_CAPACITY - 1 - ballIndex;
                const ball = tube[actualIndex];
                return (
                  <div key={ballIndex} className={styles.ballSlot}>
                    {ball && (
                      <div 
                        className={styles.ball}
                        style={{
                          background: COLOR_STYLES[ball].background,
                          borderColor: COLOR_STYLES[ball].border,
                          boxShadow: `
                            inset 0 -8px 16px rgba(0,0,0,0.3),
                            inset 0 8px 16px rgba(255,255,255,0.4),
                            0 4px 12px ${COLOR_STYLES[ball].shadow}
                          `
                        }}
                      >
                        <div className={styles.ballShine} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.tubeBase} />
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
            <h2 className={styles.winTitle}>🎉 Level Complete!</h2>
            <p className={styles.winText}>
              Completed in <strong>{moves}</strong> moves
            </p>
            <div className={styles.winButtons}>
              <button className={styles.playAgainButton} onClick={handleNextLevel}>
                Next Level →
              </button>
              <button className={styles.replayButton} onClick={handleReset}>
                Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
