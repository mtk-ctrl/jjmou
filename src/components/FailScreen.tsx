import { motion } from 'framer-motion';

interface FailScreenProps {
  reason: string;
  onRetry: () => void;
}

const FAIL_MESSAGES: Record<string, { emoji: string; msg: string }> = {
  wall: { emoji: '💥', msg: 'かべにぶつかった！' },
  hole: { emoji: '😱', msg: 'あなにおちた！' },
  water: { emoji: '💦', msg: 'かわにおちた！' },
  boundary: { emoji: '🚧', msg: 'マップのそとにでた！' },
  enemy: { emoji: '👊', msg: 'てきにやられた！' },
  default: { emoji: '😿', msg: 'しっぱい！もういちどためそう！' },
};

export default function FailScreen({ reason, onRetry }: FailScreenProps) {
  const info = FAIL_MESSAGES[reason] ?? FAIL_MESSAGES.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
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
      }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 2 }}
        style={{ fontSize: 80 }}
      >
        {info.emoji}
      </motion.div>

      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: '#ff6b6b',
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        textAlign: 'center',
        padding: '0 24px',
      }}>
        {info.msg}
      </div>

      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
        コマンドをみなおしてみよう！
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onRetry}
        style={{
          marginTop: 8,
          background: 'linear-gradient(135deg, #ff6b6b, #ee0979)',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '14px 32px',
          fontSize: 18,
          fontFamily: 'inherit',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(238,9,121,0.5)',
        }}
      >
        🔄 もういちどやる！
      </motion.button>
    </motion.div>
  );
}
