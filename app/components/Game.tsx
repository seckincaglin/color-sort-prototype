'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Game.module.css';
import Confetti from './Confetti';

interface GameProps {
  onShowTutorial: () => void;
}

type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'cyan';
type Tube = Color[];

const TUBE_CAPACITY = 4;
const ALL_COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

// Clean, flat colors - easy on the eyes
const COLOR_STYLES: Record<Color, string> = {
  red: '#E53935',
  blue: '#1E88E5',
  green: '#43A047',
  yellow: '#FDD835',
  purple: '#8E24AA',
  orange: '#FB8C00',
  pink: '#EC407A',
  cyan: '#00ACC1'
};

// Level configuration: how many colors per level range
const getLevelConfig = (level: number) => {
  if (level <= 3) return { colors: 3, emptyTubes: 2 };
  if (level <= 6) return { colors: 4, emptyTubes: 2 };
  if (level <= 10) return { colors: 5, emptyTubes: 2 };
  if (level <= 15) return { colors: 6, emptyTubes: 2 };
  return { colors: Math.min(7 + Math.floor((level - 15) / 5), 8), emptyTubes: 2 };
};

// Target moves based on level (optimal + buffer)
const getTargetMoves = (level: number, numColors: number) => {
  const base = numColors * 4; // rough optimal
  return Math.floor(base + level * 0.5);
};

// Performance rating based on moves vs target
const getPerformance = (moves: number, target: number) => {
  const ratio = moves / target;
  if (ratio <= 1) return { rating: '🏆 PERFECT!', tier: 'perfect', percentile: Math.floor(95 + Math.random() * 5) };
  if (ratio <= 1.2) return { rating: '🌟 Amazing!', tier: 'amazing', percentile: Math.floor(85 + Math.random() * 10) };
  if (ratio <= 1.5) return { rating: '✨ Great!', tier: 'great', percentile: Math.floor(70 + Math.random() * 15) };
  if (ratio <= 2) return { rating: '👍 Good', tier: 'good', percentile: Math.floor(50 + Math.random() * 20) };
  if (ratio <= 2.5) return { rating: '😅 Okay', tier: 'okay', percentile: Math.floor(30 + Math.random() * 20) };
  return { rating: '💪 Keep practicing!', tier: 'practice', percentile: Math.floor(10 + Math.random() * 20) };
};

export default function Game({ onShowTutorial }: GameProps) {
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ from: number; to: number; ballColor: Color }>>([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [performance, setPerformance] = useState<{ rating: string; tier: string; percentile: number } | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play sound effect
  const playSound = useCallback((type: 'move' | 'win' | 'error') => {
    try {
      const ctx = initAudio();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'move') {
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else if (type === 'win') {
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.3);
        });
      } else if (type === 'error') {
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Audio not supported, silent fail
    }
  }, [initAudio]);

  const initializeGame = useCallback(() => {
    const config = getLevelConfig(level);
    const colors = ALL_COLORS.slice(0, config.colors);
    
    // Create balls for each color
    const allBalls: Color[] = [];
    colors.forEach(color => {
      for (let i = 0; i < TUBE_CAPACITY; i++) {
        allBalls.push(color);
      }
    });

    // Shuffle balls using Fisher-Yates
    for (let i = allBalls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]];
    }

    // Distribute into tubes
    const newTubes: Tube[] = [];
    for (let i = 0; i < colors.length; i++) {
      newTubes.push(allBalls.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
    }
    
    // Add empty tubes
    for (let i = 0; i < config.emptyTubes; i++) {
      newTubes.push([]);
    }

    setTubes(newTubes);
    setSelectedTube(null);
    setMoveHistory([]);
    setIsWon(false);
    setMoves(0);
    setShowConfetti(false);
    setPerformance(null);
  }, [level]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

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

    // Initialize audio on first click
    initAudio();

    if (selectedTube === null) {
      if (tubes[tubeIndex].length > 0) {
        setSelectedTube(tubeIndex);
      }
    } else {
      if (selectedTube === tubeIndex) {
        setSelectedTube(null);
      } else {
        const fromTube = tubes[selectedTube];
        const toTube = tubes[tubeIndex];

        if (canPlaceBall(fromTube, toTube)) {
          const newTubes = tubes.map((tube) => [...tube]);
          const ball = newTubes[selectedTube].pop()!;
          newTubes[tubeIndex].push(ball);

          playSound('move');
          
          setTubes(newTubes);
          setMoveHistory([...moveHistory, { from: selectedTube, to: tubeIndex, ballColor: ball }]);
          setMoves(moves + 1);
          setSelectedTube(null);

          if (checkWin(newTubes)) {
            const config = getLevelConfig(level);
            const target = getTargetMoves(level, config.colors);
            const perf = getPerformance(moves + 1, target);
            
            setIsWon(true);
            setShowConfetti(true);
            setPerformance(perf);
            playSound('win');
          }
        } else {
          playSound('error');
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

    playSound('move');
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

  const config = getLevelConfig(level);
  const targetMoves = getTargetMoves(level, config.colors);

  return (
    <div className={styles.game}>
      {showConfetti && <Confetti />}
      
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
            <span className={styles.statTarget}>Target: {targetMoves}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Colors</span>
            <span className={styles.statValue}>{config.colors}</span>
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
                        style={{ backgroundColor: COLOR_STYLES[ball] }}
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

      {isWon && performance && (
        <div className={styles.winModal}>
          <div className={styles.winCard}>
            <div className={styles.winEmoji}>🎉</div>
            <h2 className={styles.winTitle}>Level {level} Complete!</h2>
            <div className={styles.winRating}>{performance.rating}</div>
            <div className={styles.winStats}>
              <div className={styles.winStatRow}>
                <span>Your moves:</span>
                <strong>{moves}</strong>
              </div>
              <div className={styles.winStatRow}>
                <span>Target:</span>
                <strong>{targetMoves}</strong>
              </div>
            </div>
            <div className={styles.percentile}>
              Better than <span className={styles.percentileNum}>{performance.percentile}%</span> of players!
            </div>
            <div className={styles.winButtons}>
              <button className={styles.nextLevelButton} onClick={handleNextLevel}>
                Next Level →
              </button>
              <button className={styles.replayButton} onClick={handleReset}>
                Replay Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
