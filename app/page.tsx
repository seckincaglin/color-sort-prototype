'use client';

import { useState, useEffect } from 'react';
import HowToPlay from './components/HowToPlay';
import Game from './components/Game';
import styles from './page.module.css';

export default function Home() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      {showTutorial ? (
        <HowToPlay onStart={() => setShowTutorial(false)} />
      ) : (
        <Game onShowTutorial={() => setShowTutorial(true)} />
      )}
    </div>
  );
}
