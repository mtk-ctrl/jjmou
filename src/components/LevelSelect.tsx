import { motion } from 'framer-motion';
import { Theme } from '../types';

interface LevelSelectProps {
  currentLevelIndex: number;
  stars: Record<number, number>;
  unlockedCount: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

const THEME_INFO: Record<number, { theme: Theme; emoji: string; name: string }> = {
  1: { theme: 'park',  emoji: '🌳', name: 'こうえん' },
  2: { theme: 'park',  emoji: '🌿', name: 'もり' },
  3: { theme: 'park',  emoji: '🌻', name: 'はな畑' },
  4: { theme: 'space', emoji: '🚀', name: 'うちゅう' },
  5: { theme: 'space', emoji: '🌙', name: 'つき' },
  6: { theme: 'magic', emoji: '🔮', name: 'まほう世界' },
  7: { theme: 'magic', emoji: '🧙', name: 'まほう森' },
  8: { theme: 'robot', emoji: '🤖', name: 'ロボ世界' },
  9: { theme: 'robot', emoji: '⚙️', name: 'ロボ工場' },
  10: { theme: 'robot', emoji: '🏆', name: 'さいしゅう決戦' },
};

const Q_PER_LEVEL = 5;

export default function LevelSelect({ currentLevelIndex, stars, unlockedCount, onSelect, onClose }: LevelSelectProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 150,
        overflowY: 'auto',
        padding: '20px 16px',
      }}
    >
      <div style={{ color: '#ffd700', fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
        🗺️ レベルえらび
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        width: '100%',
        maxWidth: 400,
      }}>
        {Array.from({ length: 10 }, (_, lv) => {
          const lvNum = lv + 1;
          const startIndex = lv * Q_PER_LEVEL;
          const info = THEME_INFO[lvNum];
          const lvStars = Array.from({ length: Q_PER_LEVEL }, (_, q) => stars[startIndex + q] ?? 0);
          const totalStars = lvStars.reduce((a, b) => a + b, 0);
          const completed = lvStars.filter(s => s > 0).length;
          const isLocked = startIndex >= unlockedCount;
          const isActive = currentLevelIndex >= startIndex && currentLevelIndex < startIndex + Q_PER_LEVEL;

          return (
            <motion.button
              key={lvNum}
              whileTap={{ scale: isLocked ? 1 : 0.94 }}
              onClick={() => !isLocked && (onSelect(startIndex), onClose())}
              style={{
                background: isLocked
                  ? 'rgba(100,100,100,0.3)'
                  : isActive
                  ? 'linear-gradient(135deg, #ffd700, #ff8c00)'
                  : 'rgba(255,255,255,0.1)',
                border: isActive
                  ? '3px solid #ffd700'
                  : isLocked
                  ? '2px solid rgba(255,255,255,0.1)'
                  : '2px solid rgba(255,255,255,0.25)',
                borderRadius: 14,
                padding: '12px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                color: isLocked ? 'rgba(255,255,255,0.3)' : '#fff',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 28 }}>{isLocked ? '🔒' : info.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>レベル {lvNum}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>{isLocked ? 'ロック中' : info.name}</span>
              {!isLocked && (
                <div style={{ fontSize: 10, color: '#ffd700' }}>
                  ⭐{totalStars}/{Q_PER_LEVEL * 3}　{completed}/{Q_PER_LEVEL}もん
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClose}
        style={{
          marginTop: 20,
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: 15,
          fontFamily: 'inherit',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ✕ とじる
      </motion.button>
    </motion.div>
  );
}
