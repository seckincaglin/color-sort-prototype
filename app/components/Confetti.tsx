'use client';

import { useEffect, useState } from 'react';
import styles from './Confetti.module.css';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

const COLORS = ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#FB8C00', '#EC407A', '#00ACC1'];

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 8
      });
    }
    setPieces(newPieces);
  }, []);

  return (
    <div className={styles.confettiContainer}>
      {pieces.map(piece => (
        <div
          key={piece.id}
          className={styles.confetti}
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
          }}
        />
      ))}
    </div>
  );
}
