import { motion, AnimatePresence } from 'framer-motion';
import { Level, Position, Theme } from '../types';

interface GameGridProps {
  level: Level;
  catPos: Position;
  theme: Theme;
  highlightedEnemies: string[];
  visitedHole: Position | null;
}

const THEME_COLORS: Record<Theme, {
  empty: string;
  wall: string;
  hole: string;
  water: string;
  goal: string;
  enemy: string;
  bridge: string;
  grid: string;
}> = {
  park: {
    empty: '#a8d5a2',
    wall: '#5c3d2e',
    hole: '#2d2d2d',
    water: '#4fc3f7',
    goal: '#ffd700',
    enemy: '#e53935',
    bridge: '#bcaaa4',
    grid: '#7bc67e',
  },
  space: {
    empty: '#1a1a4e',
    wall: '#455a64',
    hole: '#000000',
    water: '#0d47a1',
    goal: '#ffd700',
    enemy: '#e53935',
    bridge: '#607d8b',
    grid: '#12124a',
  },
  magic: {
    empty: '#3a1259',
    wall: '#6a1b9a',
    hole: '#1a0533',
    water: '#7c4dff',
    goal: '#ffd700',
    enemy: '#f06292',
    bridge: '#ce93d8',
    grid: '#2e1048',
  },
  robot: {
    empty: '#263238',
    wall: '#1c1c1c',
    hole: '#0a0a0a',
    water: '#01579b',
    goal: '#ffd700',
    enemy: '#d32f2f',
    bridge: '#546e7a',
    grid: '#1e2a30',
  },
};

const THEME_EMOJI: Record<Theme, { empty: string; wall: string; hole: string; water: string; goal: string; enemy: string }> = {
  park: { empty: '', wall: '🌳', hole: '🕳️', water: '💧', goal: '🎯', enemy: '👾' },
  space: { empty: '', wall: '🪨', hole: '⚫', water: '🌊', goal: '⭐', enemy: '👽' },
  magic: { empty: '', wall: '🔮', hole: '🌀', water: '💜', goal: '✨', enemy: '🧟' },
  robot: { empty: '', wall: '🔩', hole: '⚡', water: '🔵', goal: '🏆', enemy: '🤖' },
};

export default function GameGrid({ level, catPos, theme, highlightedEnemies, visitedHole }: GameGridProps) {
  const colors = THEME_COLORS[theme];
  const emoji = THEME_EMOJI[theme];
  const size = level.gridSize;
  const cellSize = Math.min(Math.floor((Math.min(window.innerWidth * 0.95, 480)) / size), 60);

  const isGoal = (r: number, c: number) =>
    r === level.goal.row && c === level.goal.col;

  return (
    <div style={{
      display: 'inline-block',
      border: '3px solid rgba(255,255,255,0.3)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {Array.from({ length: size }).map((_, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {Array.from({ length: size }).map((_, c) => {
            const cellType = level.grid[r]?.[c] ?? 'empty';
            const isCat = catPos.row === r && catPos.col === c;
            const isGoalCell = isGoal(r, c);
            const isEnemy = cellType === 'enemy';
            const isHighlightedEnemy = highlightedEnemies.includes(`${r},${c}`);
            const isHoleVisited = visitedHole?.row === r && visitedHole?.col === c;

            let bg = colors[cellType] || colors.empty;
            if (isGoalCell && cellType === 'empty') bg = colors.goal;

            return (
              <div
                key={c}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: bg,
                  border: `1px solid ${colors.grid}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontSize: cellSize * 0.42,
                  flexShrink: 0,
                }}
              >
                {/* Cell content */}
                {cellType === 'wall' && (
                  <span style={{ userSelect: 'none', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}>
                    {emoji.wall}
                  </span>
                )}
                {cellType === 'hole' && (
                  <span style={{ userSelect: 'none' }}>{emoji.hole}</span>
                )}
                {cellType === 'water' && !isCat && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ userSelect: 'none' }}
                  >
                    {emoji.water}
                  </motion.span>
                )}
                {isEnemy && !isHighlightedEnemy && (
                  <motion.span
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ userSelect: 'none', filter: 'drop-shadow(0 0 6px red)' }}
                  >
                    {emoji.enemy}
                  </motion.span>
                )}
                {isHighlightedEnemy && (
                  <motion.span
                    initial={{ scale: 1.5, opacity: 1 }}
                    animate={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ userSelect: 'none', position: 'absolute' }}
                  >
                    💥
                  </motion.span>
                )}
                {isGoalCell && !isCat && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ position: 'absolute', fontSize: cellSize * 0.5 }}
                  >
                    {emoji.goal}
                  </motion.div>
                )}

                {/* Cat */}
                <AnimatePresence>
                  {isCat && (
                    <motion.div
                      key={`cat-${r}-${c}`}
                      initial={{ scale: 0.5, opacity: 0.5 }}
                      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
                      style={{
                        position: 'absolute',
                        fontSize: cellSize * 0.6,
                        zIndex: 10,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                        lineHeight: 1,
                      }}
                    >
                      🐱
                    </motion.div>
                  )}
                </AnimatePresence>

                {isHoleVisited && (
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 0, opacity: 0 }}
                    style={{
                      position: 'absolute',
                      fontSize: cellSize * 0.55,
                      zIndex: 10,
                    }}
                  >
                    😱
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
