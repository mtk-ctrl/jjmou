import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, CommandType, Position, Theme, GameState } from './types';
import { LEVELS } from './data/levels';
import { simulateCommands, calculateStars, countExpandedCommands } from './utils/gameEngine';
import GameGrid from './components/GameGrid';
import CommandButton from './components/CommandButton';
import CommandQueue from './components/CommandQueue';
import WinScreen from './components/WinScreen';
import FailScreen from './components/FailScreen';
import LoopModal from './components/LoopModal';
import LevelSelect from './components/LevelSelect';

const THEME_BG: Record<Theme, string> = {
  park:  'linear-gradient(180deg, #87CEEB 0%, #a8d5a2 60%, #7bc67e 100%)',
  space: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a5e 50%, #2d1b69 100%)',
  magic: 'linear-gradient(180deg, #1a0533 0%, #4a0e8f 50%, #7b2d8b 100%)',
  robot: 'linear-gradient(180deg, #1a1a1a 0%, #2d3a4a 50%, #1e3a5a 100%)',
};

const THEME_STARS: Record<Theme, string[]> = {
  park:  ['🌟','💫','✨'],
  space: ['⭐','🌙','💫'],
  magic: ['✨','🌟','💜'],
  robot: ['⚡','🔩','💡'],
};

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

const STORAGE_KEY = 'codenyanko_progress_v1';

function loadProgress() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s) as { currentLevelIndex: number; stars: Record<number, number>; unlockedCount: number };
  } catch { /* ignore */ }
  return { currentLevelIndex: 0, stars: {} as Record<number, number>, unlockedCount: 1 };
}

function saveProgress(data: { currentLevelIndex: number; stars: Record<number, number>; unlockedCount: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function App() {
  const [levelIndex, setLevelIndex] = useState(() => loadProgress().currentLevelIndex);
  const [stars, setStars] = useState<Record<number, number>>(() => loadProgress().stars);
  const [unlockedCount, setUnlockedCount] = useState(() => Math.max(loadProgress().unlockedCount, 1));

  const [commands, setCommands] = useState<Command[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [catPos, setCatPos] = useState<Position>(() => LEVELS[0].start);
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(null);
  const [failReason, setFailReason] = useState('');
  const [highlightedEnemies, setHighlightedEnemies] = useState<string[]>([]);
  const [visitedHole, setVisitedHole] = useState<Position | null>(null);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [editingLoopId, setEditingLoopId] = useState<string | null>(null);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const level = LEVELS[levelIndex] ?? LEVELS[0];
  const theme: Theme = level.theme;

  useEffect(() => {
    setCatPos({ ...level.start });
    setCommands([]);
    setGameState('idle');
    setActiveCommandIndex(null);
    setHighlightedEnemies([]);
    setVisitedHole(null);
    setEditingLoopId(null);
    setShowHint(false);
  }, [levelIndex, level.start]);

  useEffect(() => {
    saveProgress({ currentLevelIndex: levelIndex, stars, unlockedCount });
  }, [levelIndex, stars, unlockedCount]);

  const clearTimers = () => {
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
  };

  const handleAddCommand = useCallback((type: CommandType) => {
    if (gameState === 'running') return;

    if (type === 'loop') {
      setShowLoopModal(true);
      return;
    }

    if (editingLoopId) {
      setCommands(prev => prev.map(cmd => {
        if (cmd.type === 'loop' && cmd.id === editingLoopId) {
          if (cmd.commands.length >= 6) return cmd;
          return {
            ...cmd,
            commands: [...cmd.commands, { id: genId(), type }],
          };
        }
        return cmd;
      }));
      return;
    }

    const countExpanded = countExpandedCommands(commands);
    if (countExpanded >= level.maxCommands) return;

    setCommands(prev => [...prev, { id: genId(), type }]);
  }, [gameState, editingLoopId, commands, level.maxCommands]);

  const handleLoopConfirm = (count: number) => {
    setShowLoopModal(false);
    const loopId = genId();
    const newLoop: Command = {
      id: loopId,
      type: 'loop',
      count,
      commands: [],
    };
    setCommands(prev => [...prev, newLoop]);
    setEditingLoopId(loopId);
  };

  const handleRemoveCommand = useCallback((id: string) => {
    if (gameState === 'running') return;
    if (editingLoopId === id) setEditingLoopId(null);
    setCommands(prev => prev.filter(cmd => cmd.id !== id));
  }, [gameState, editingLoopId]);

  const handleRemoveLoopCommand = useCallback((loopId: string, cmdId: string) => {
    if (gameState === 'running') return;
    setCommands(prev => prev.map(cmd => {
      if (cmd.type === 'loop' && cmd.id === loopId) {
        return { ...cmd, commands: cmd.commands.filter(c => c.id !== cmdId) };
      }
      return cmd;
    }));
  }, [gameState]);

  const handleRun = useCallback(() => {
    if (gameState === 'running' || commands.length === 0) return;
    clearTimers();
    setEditingLoopId(null);
    setGameState('running');
    setActiveCommandIndex(null);
    setHighlightedEnemies([]);
    setVisitedHole(null);
    setCatPos({ ...level.start });

    const steps = simulateCommands(commands, level);
    const STEP_MS = 350;

    steps.forEach((step, i) => {
      const t1 = setTimeout(() => {
        const flatIndex = i;
        setActiveCommandIndex(flatIndex);
        setCatPos({ ...step.position });

        if (step.attackedEnemy) {
          const key = `${step.attackedEnemy.row},${step.attackedEnemy.col}`;
          setHighlightedEnemies(prev => [...prev, key]);
        }

        if (step.failReason === 'hole' || step.failReason === 'water') {
          setVisitedHole({ ...step.position });
        }

        const isLast = i === steps.length - 1;
        if (isLast) {
          const t2 = setTimeout(() => {
            setActiveCommandIndex(null);
            if (step.action === 'fail') {
              setFailReason(step.failReason ?? 'default');
              setGameState('failure');
            } else {
              const finalPos = step.position;
              const isGoal = finalPos.row === level.goal.row && finalPos.col === level.goal.col;
              if (isGoal) {
                const expanded = countExpandedCommands(commands);
                const s = calculateStars(expanded, level.optimalCommands);
                setStars(prev => ({ ...prev, [levelIndex]: Math.max(prev[levelIndex] ?? 0, s) }));
                setUnlockedCount(prev => Math.max(prev, levelIndex + 2));
                setGameState('success');
              } else {
                setFailReason('default');
                setGameState('failure');
              }
            }
          }, STEP_MS);
          animTimers.current.push(t2);
        }
      }, i * STEP_MS);
      animTimers.current.push(t1);
    });

    if (steps.length === 0) {
      setGameState('failure');
      setFailReason('default');
    }
  }, [commands, gameState, level, levelIndex]);

  const handleReset = useCallback(() => {
    clearTimers();
    setGameState('idle');
    setCatPos({ ...level.start });
    setActiveCommandIndex(null);
    setHighlightedEnemies([]);
    setVisitedHole(null);
  }, [level.start]);

  const handleClearCommands = useCallback(() => {
    if (gameState === 'running') return;
    setCommands([]);
    setEditingLoopId(null);
    handleReset();
  }, [gameState, handleReset]);

  const handleRetry = useCallback(() => {
    clearTimers();
    setGameState('idle');
    setCatPos({ ...level.start });
    setActiveCommandIndex(null);
    setHighlightedEnemies([]);
    setVisitedHole(null);
  }, [level.start]);

  const handleNext = useCallback(() => {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1);
    }
  }, [levelIndex]);

  const expandedCount = countExpandedCommands(commands);
  const isAtMax = expandedCount >= level.maxCommands;
  const themeStars = THEME_STARS[theme];

  return (
    <div style={{
      minHeight: '100dvh',
      background: THEME_BG[theme],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      transition: 'background 0.8s ease',
      paddingBottom: 8,
    }}>
      {/* Decorative floating elements */}
      {themeStars.map((s, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i,
            delay: i * 0.7,
          }}
          style={{
            position: 'fixed',
            top: `${10 + i * 25}%`,
            right: `${3 + i * 4}%`,
            fontSize: 18,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {s}
        </motion.div>
      ))}

      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        padding: '8px 12px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLevelSelect(true)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 10,
            padding: '6px 10px',
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🗺️ レベル
        </motion.button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            color: '#ffd700',
            fontSize: 16,
            fontWeight: 800,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            lineHeight: 1.2,
          }}>
            🐱 コードにゃんこ
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700 }}>
            Lv.{level.levelNum} — {level.questionNum}もんめ
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              fontSize: 16,
              filter: (stars[levelIndex] ?? 0) > i ? 'drop-shadow(0 0 4px #ffd700)' : 'grayscale(1) opacity(0.3)',
            }}>⭐</span>
          ))}
        </div>
      </div>

      {/* Grid area */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '4px 8px',
        width: '100%',
      }}>
        <GameGrid
          level={level}
          catPos={catPos}
          theme={theme}
          highlightedEnemies={highlightedEnemies}
          visitedHole={visitedHole}
        />
      </div>

      {/* Hint */}
      <div style={{ width: '100%', maxWidth: 520, padding: '0 8px 4px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHint(h => !h)}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 8,
            padding: '4px 12px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            fontFamily: 'inherit',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          💡 ヒント {showHint ? '▲' : '▼'}
        </motion.button>
        <AnimatePresence>
          {showHint && level.hint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '6px 12px',
                marginTop: 4,
                overflow: 'hidden',
              }}
            >
              {level.hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command Queue */}
      <div style={{ width: '100%', maxWidth: 520, padding: '0 8px 4px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>
            📋 コマンドリスト ({expandedCount}/{level.maxCommands})
          </span>
          {editingLoopId && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ color: '#ff8c00', fontSize: 11, fontWeight: 800 }}
            >
              🔁 ループにコマンドをいれよう！
            </motion.span>
          )}
          {editingLoopId && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditingLoopId(null)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                padding: '3px 8px',
                color: '#fff',
                fontSize: 11,
                fontFamily: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✅ かんりょう
            </motion.button>
          )}
        </div>

        <CommandQueue
          commands={commands}
          activeIndex={activeCommandIndex}
          onRemove={handleRemoveCommand}
          onRemoveLoopCommand={handleRemoveLoopCommand}
          running={gameState === 'running'}
          editingLoopId={editingLoopId}
        />
      </div>

      {/* Command Buttons */}
      <div style={{ width: '100%', maxWidth: 520, padding: '4px 8px' }}>
        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 11,
          fontWeight: 700,
          marginBottom: 6,
        }}>
          ⬇️ タップしてコマンドを追加
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
        }}>
          {level.availableCommands.map(type => (
            <CommandButton
              key={type}
              type={type}
              onClick={() => handleAddCommand(type)}
              disabled={gameState === 'running' || (isAtMax && type !== 'loop')}
            />
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        padding: '6px 8px 4px',
        display: 'flex',
        gap: 8,
      }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClearCommands}
          disabled={gameState === 'running'}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.25)',
            borderRadius: 12,
            padding: '10px',
            color: 'rgba(255,255,255,0.8)',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 14,
            cursor: gameState === 'running' ? 'not-allowed' : 'pointer',
            opacity: gameState === 'running' ? 0.5 : 1,
          }}
        >
          🗑️ クリア
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={gameState === 'running' ? handleReset : handleRun}
          disabled={commands.length === 0 && gameState !== 'running'}
          style={{
            flex: 2,
            background: gameState === 'running'
              ? 'linear-gradient(135deg, #f44336, #c62828)'
              : commands.length === 0
              ? 'rgba(150,150,150,0.3)'
              : 'linear-gradient(135deg, #4caf50, #2e7d32)',
            border: 'none',
            borderRadius: 12,
            padding: '10px',
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: 800,
            fontSize: 16,
            cursor: commands.length === 0 && gameState !== 'running' ? 'not-allowed' : 'pointer',
            boxShadow: commands.length > 0
              ? '0 4px 12px rgba(0,0,0,0.4)'
              : 'none',
            opacity: commands.length === 0 && gameState !== 'running' ? 0.5 : 1,
          }}
        >
          {gameState === 'running' ? '⏹️ ストップ' : '▶️ じっこう！'}
        </motion.button>
      </div>

      {/* Overlay screens */}
      <AnimatePresence>
        {gameState === 'success' && (
          <WinScreen
            key="win"
            stars={stars[levelIndex] ?? 1}
            onNext={handleNext}
            onRetry={handleRetry}
            isLastLevel={levelIndex >= LEVELS.length - 1}
            levelNum={level.levelNum}
            questionNum={level.questionNum}
          />
        )}
        {gameState === 'failure' && (
          <FailScreen key="fail" reason={failReason} onRetry={handleRetry} />
        )}
      </AnimatePresence>

      {showLoopModal && (
        <LoopModal
          onConfirm={handleLoopConfirm}
          onCancel={() => setShowLoopModal(false)}
        />
      )}

      {showLevelSelect && (
        <LevelSelect
          currentLevelIndex={levelIndex}
          stars={stars}
          unlockedCount={unlockedCount}
          onSelect={setLevelIndex}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
    </div>
  );
}
