import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinScreenProps {
  stars: number;
  onNext: () => void;
  onRetry: () => void;
  isLastLevel: boolean;
  levelNum: number;
  questionNum: number;
}

export default function WinScreen({ stars, onNext, onRetry, isLastLevel, levelNum, questionNum }: WinScreenProps) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#ff0', '#f0f', '#0ff', '#ff4400', '#00ff88'];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  }, []);

  const messages = [
    'やったー！！🎉',
    'すごい！！⭐',
    'かんぺき！！✨',
    'さいこう！！🏆',
    'ブラボー！！🎊',
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        flexDirection: 'column',
        gap: 16,
        padding: 24,
      }}
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.6 }}
        style={{ fontSize: 72, lineHeight: 1 }}
      >
        🐱
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#ffd700',
          textShadow: '0 0 20px #ffd700, 0 2px 4px rgba(0,0,0,0.8)',
          textAlign: 'center',
        }}
      >
        {msg}
      </motion.div>

      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 700 }}>
        Lv.{levelNum} — {questionNum}もんめ クリア！
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3].map((s) => (
          <motion.span
            key={s}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: s * 0.15, type: 'spring', stiffness: 300 }}
            style={{
              fontSize: 48,
              filter: s <= stars ? 'drop-shadow(0 0 8px #ffd700)' : 'grayscale(1) opacity(0.3)',
            }}
          >
            ⭐
          </motion.span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onRetry}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: 14,
            padding: '12px 24px',
            fontSize: 16,
            fontFamily: 'inherit',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🔄 もういちど
        </motion.button>

        {!isLastLevel && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onNext}
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
              color: '#333',
              border: 'none',
              borderRadius: 14,
              padding: '12px 24px',
              fontSize: 16,
              fontFamily: 'inherit',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,215,0,0.5)',
            }}
          >
            つぎへ ➡️
          </motion.button>
        )}

        {isLastLevel && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ff4400)',
              color: '#fff',
              borderRadius: 14,
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 800,
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(255,100,0,0.6)',
            }}
          >
            🏆 ぜんもんクリア！きみはコードにんじゃだ！
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
