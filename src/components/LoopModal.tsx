import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoopModalProps {
  onConfirm: (count: number) => void;
  onCancel: () => void;
}

export default function LoopModal({ onConfirm, onCancel }: LoopModalProps) {
  const [count, setCount] = useState(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #ff5722, #ff8f00)',
          borderRadius: 20,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 260,
        }}
      >
        <div style={{ fontSize: 40 }}>🔁</div>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>
          ループのかいすう
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center' }}>
          なんかいくりかえす？<br />（コマンドをあとでタップして追加）
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setCount(Math.max(2, count - 1))}
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: 24,
              fontWeight: 800,
              border: '2px solid rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            −
          </motion.button>
          <div style={{ color: '#fff', fontSize: 40, fontWeight: 800, minWidth: 48, textAlign: 'center' }}>
            {count}
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setCount(Math.min(9, count + 1))}
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: 24,
              fontWeight: 800,
              border: '2px solid rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ＋
          </motion.button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            キャンセル
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onConfirm(count)}
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: '#ff5722',
              border: 'none',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            OK！
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
