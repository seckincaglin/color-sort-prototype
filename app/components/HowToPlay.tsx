import styles from './HowToPlay.module.css';

interface HowToPlayProps {
  onStart: () => void;
}

export default function HowToPlay({ onStart }: HowToPlayProps) {
  return (
    <div className={styles.tutorial}>
      <div className={styles.card}>
        <h1 className={styles.title}>🎮 Color Sort</h1>
        <h2 className={styles.subtitle}>How to Play</h2>
        
        <div className={styles.instructions}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Tap a tube to select it</h3>
              <p>Click on any tube to pick up the top ball</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Tap another tube to move</h3>
              <p>Click on a destination tube to place the ball</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Match colors together</h3>
              <p>You can only place a ball on top of the same color or in an empty tube</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Complete the tubes</h3>
              <p>Fill each tube with 4 balls of the same color to win!</p>
            </div>
          </div>
        </div>

        <div className={styles.tips}>
          <h3>💡 Tips</h3>
          <ul>
            <li>Use empty tubes strategically</li>
            <li>Plan your moves ahead</li>
            <li>You can undo moves if you get stuck</li>
          </ul>
        </div>

        <button className={styles.startButton} onClick={onStart}>
          Start Playing
        </button>
      </div>
    </div>
  );
}
