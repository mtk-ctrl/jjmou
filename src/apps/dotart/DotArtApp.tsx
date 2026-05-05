import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DOT_LEVELS, COLOR_HEX, COLOR_LABEL, Color, DotLevel } from './levels';

type Dir = 'up' | 'down' | 'left' | 'right';
type DotCmd =
  | { id: string; type: 'move'; dir: Dir }
  | { id: string; type: 'color'; color: Color }
  | { id: string; type: 'loop'; count: number; children: DotCmd[] };

type GameState = 'idle' | 'running' | 'success' | 'failure';

function genId() { return Math.random().toString(36).slice(2, 9); }

const DIR_LABEL: Record<Dir, string> = { up:'↑うえ', down:'↓した', left:'←ひだり', right:'→みぎ' };
const DIR_DELTA: Record<Dir, [number,number]> = { up:[-1,0], down:[1,0], left:[0,-1], right:[0,1] };

const DOT_STORAGE = 'dotart_stars_v1';
function loadStars(): Record<number, number> {
  try { const s = localStorage.getItem(DOT_STORAGE); if (s) return JSON.parse(s); } catch { /* */ }
  return {};
}
function saveStars(s: Record<number, number>) {
  try { localStorage.setItem(DOT_STORAGE, JSON.stringify(s)); } catch { /* */ }
}

interface SimStep {
  grid: (Color | null)[][];
  row: number;
  col: number;
  color: Color;
}

function simulate(cmds: DotCmd[], level: DotLevel): SimStep[] {
  const steps: SimStep[] = [];
  let grid: (Color | null)[][] = Array.from({ length: level.gridSize }, () => Array(level.gridSize).fill(null));
  let row = level.startRow, col = level.startCol;
  let color: Color = level.availableColors[0] ?? 'red';

  grid[row][col] = color;
  steps.push({ grid: grid.map(r => [...r]), row, col, color });

  function runCmds(cs: DotCmd[]) {
    for (const c of cs) {
      if (c.type === 'color') {
        color = c.color;
      } else if (c.type === 'move') {
        const [dr, dc] = DIR_DELTA[c.dir];
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < level.gridSize && nc >= 0 && nc < level.gridSize) {
          row = nr; col = nc;
          grid[row][col] = color;
          steps.push({ grid: grid.map(r => [...r]), row, col, color });
        }
      } else {
        for (let i = 0; i < c.count; i++) runCmds(c.children);
      }
    }
  }

  runCmds(cmds);
  return steps;
}

function countCmds(cmds: DotCmd[]): number {
  let n = 0;
  for (const c of cmds) {
    n++;
    if (c.type === 'loop') n += countCmds(c.children);
  }
  return n;
}

function gridsMatch(a: (Color | null)[][], b: (Color | null)[][]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, r) => row.every((cell, c) => cell === b[r]?.[c]));
}

export default function DotArtApp({ onHome }: { onHome: () => void }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [stars, setStars] = useState<Record<number, number>>(loadStars);
  const [unlockedCount, setUnlockedCount] = useState(() => Math.max(1, ...Object.keys(loadStars()).map(Number).map(k => k + 1), 1));
  const [commands, setCommands] = useState<DotCmd[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [displayGrid, setDisplayGrid] = useState<(Color | null)[][]>(() => {
    const lv = DOT_LEVELS[0];
    const g: (Color | null)[][] = Array.from({ length: lv.gridSize }, () => Array(lv.gridSize).fill(null));
    g[lv.startRow][lv.startCol] = lv.availableColors[0] ?? 'red';
    return g;
  });
  const [cursorPos, setCursorPos] = useState<[number,number]>([DOT_LEVELS[0].startRow, DOT_LEVELS[0].startCol]);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [loopCount, setLoopCount] = useState(2);
  const [addingToLoop, setAddingToLoop] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const level: DotLevel = DOT_LEVELS[levelIndex] ?? DOT_LEVELS[0];
  const cmdCount = countCmds(commands);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const resetGrid = useCallback((lv: DotLevel) => {
    const g: (Color | null)[][] = Array.from({ length: lv.gridSize }, () => Array(lv.gridSize).fill(null));
    g[lv.startRow][lv.startCol] = lv.availableColors[0] ?? 'red';
    setDisplayGrid(g);
    setCursorPos([lv.startRow, lv.startCol]);
  }, []);

  const handleRun = useCallback(() => {
    if (gameState === 'running' || commands.length === 0) return;
    setGameState('running');
    const steps = simulate(commands, level);
    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setDisplayGrid(step.grid.map(r => [...r]));
        setCursorPos([step.row, step.col]);
        if (i === steps.length - 1) {
          const t2 = setTimeout(() => {
            const match = gridsMatch(step.grid, level.target);
            if (match) {
              const starCount = cmdCount <= level.optimalCommands ? 3 : cmdCount <= level.optimalCommands + 3 ? 2 : 1;
              setStars(prev => {
                const next = { ...prev, [levelIndex]: Math.max(prev[levelIndex] ?? 0, starCount) };
                saveStars(next); return next;
              });
              setUnlockedCount(prev => Math.max(prev, levelIndex + 2));
              setGameState('success');
            } else {
              setGameState('failure');
            }
          }, 400);
          timers.current.push(t2);
        }
      }, i * 220);
      timers.current.push(t);
    });
  }, [commands, gameState, level, levelIndex, cmdCount]);

  const addCmd = (cmd: DotCmd) => {
    if (gameState === 'running') return;
    if (addingToLoop) {
      setCommands(prev => prev.map(c =>
        c.id === addingToLoop && c.type === 'loop'
          ? { ...c, children: [...c.children, cmd] }
          : c
      ));
    } else {
      setCommands(prev => [...prev, cmd]);
    }
  };

  const handleRemove = (id: string) => {
    if (gameState === 'running') return;
    const remove = (cs: DotCmd[]): DotCmd[] => cs.filter(c => c.id !== id).map(c =>
      c.type === 'loop' ? { ...c, children: remove(c.children) } : c
    );
    setCommands(remove);
    if (addingToLoop === id) setAddingToLoop(null);
  };

  const handleReset = () => {
    clearTimers();
    setGameState('idle');
    resetGrid(level);
  };

  const handleRetry = () => {
    clearTimers();
    setCommands([]);
    setGameState('idle');
    resetGrid(level);
    setAddingToLoop(null);
  };

  const handleNext = () => {
    if (levelIndex < DOT_LEVELS.length - 1) {
      const next = levelIndex + 1;
      setLevelIndex(next);
      setCommands([]);
      setGameState('idle');
      setAddingToLoop(null);
      resetGrid(DOT_LEVELS[next]);
    }
  };

  const selectLevel = (i: number) => {
    setLevelIndex(i);
    setCommands([]);
    setGameState('idle');
    setAddingToLoop(null);
    resetGrid(DOT_LEVELS[i]);
    setShowLevelSelect(false);
  };

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 390;
  const maxGridW = Math.min(screenW * 0.9, 440) / 2 - 12;
  const cellSize = Math.max(Math.floor(maxGridW / level.gridSize), 18);

  const renderCmd = (cmd: DotCmd, depth = 0): React.ReactNode => {
    if (cmd.type === 'move') return (
      <motion.div key={cmd.id} initial={{ scale:0 }} animate={{ scale:1 }} whileTap={{ scale:0.85 }}
        onClick={() => handleRemove(cmd.id)}
        style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700, cursor:'pointer', color:'#fff', whiteSpace:'nowrap' }}>
        {DIR_LABEL[cmd.dir]}
      </motion.div>
    );
    if (cmd.type === 'color') return (
      <motion.div key={cmd.id} initial={{ scale:0 }} animate={{ scale:1 }} whileTap={{ scale:0.85 }}
        onClick={() => handleRemove(cmd.id)}
        style={{ background: COLOR_HEX[cmd.color], border:'none', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700, cursor:'pointer', color:'#fff' }}>
        🎨{COLOR_LABEL[cmd.color]}
      </motion.div>
    );
    if (cmd.type === 'loop') return (
      <div key={cmd.id} style={{ border: addingToLoop===cmd.id ? '2px solid #ffd700' : '2px solid #a29bfe', borderRadius:10, padding:'4px 8px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:4 }}>
        <motion.span whileTap={{ scale:0.85 }} onClick={() => setAddingToLoop(addingToLoop===cmd.id ? null : cmd.id)}
          style={{ fontSize:11, color: addingToLoop===cmd.id ? '#ffd700' : '#a29bfe', fontWeight:800, cursor:'pointer' }}>
          🔄×{cmd.count}{addingToLoop===cmd.id ? ' ✏️' : ''}
        </motion.span>
        {cmd.children.map(child => renderCmd(child, depth+1))}
        <motion.button whileTap={{ scale:0.85 }} onClick={() => handleRemove(cmd.id)}
          style={{ background:'rgba(255,100,100,0.2)', border:'none', borderRadius:6, padding:'2px 6px', color:'#ff6b6b', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>✕</motion.button>
      </div>
    );
  };

  return (
    <div style={{
      minHeight:'100dvh',
      background:'linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      fontFamily:"'M PLUS Rounded 1c', sans-serif", color:'#fff', paddingBottom:12,
    }}>
      {['🎨','✏️','🖌️','🎭','⭐'].map((e,i) => (
        <motion.div key={i} animate={{ y:[-8,8,-8], opacity:[0.3,0.7,0.3] }}
          transition={{ repeat:Infinity, duration:3+i, delay:i*0.5 }}
          style={{ position:'fixed', top:`${10+i*18}%`, right:`${3+i*4}%`, fontSize:16, pointerEvents:'none', zIndex:1 }}>{e}</motion.div>
      ))}

      {/* Header */}
      <div style={{ width:'100%', maxWidth:480, padding:'8px 12px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <motion.button whileTap={{ scale:0.9 }} onClick={onHome}
          style={{ background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'6px 10px', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          🏠 ホーム
        </motion.button>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'#ffd700', fontSize:15, fontWeight:800 }}>🎨 ドット絵プログラミング</div>
          <div style={{ fontSize:10, opacity:0.6 }}>Lv.{level.id} / {DOT_LEVELS.length}　⭐ {totalStars}</div>
        </div>
        <motion.button whileTap={{ scale:0.9 }} onClick={() => setShowLevelSelect(true)}
          style={{ background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'6px 10px', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          🗺️ レベル
        </motion.button>
      </div>

      {/* Level info */}
      <motion.div key={levelIndex} initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'8px 16px', margin:'4px 0', textAlign:'center', width:'90%', maxWidth:440 }}>
        <div style={{ fontSize:14, fontWeight:800, color:'#ffd700' }}>🎨 {level.title}</div>
        <div style={{ fontSize:11, opacity:0.75, marginTop:2 }}>💡 {level.hint}</div>
        <div style={{ fontSize:11, color:'#ffd700', marginTop:2 }}>{'⭐'.repeat(stars[levelIndex]??0)}{'☆'.repeat(3-(stars[levelIndex]??0))}</div>
      </motion.div>

      {/* Grids side by side */}
      <div style={{ display:'flex', gap:16, margin:'4px 0', alignItems:'flex-start' }}>
        {/* Target */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, opacity:0.6, marginBottom:4 }}>🎯 目標</div>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${level.gridSize}, ${cellSize}px)`, gap:1 }}>
            {level.target.map((row, r) => row.map((cell, c) => (
              <div key={`${r}-${c}`} style={{ width:cellSize, height:cellSize, background: cell ? COLOR_HEX[cell] : 'rgba(255,255,255,0.06)', borderRadius:2, border:'0.5px solid rgba(255,255,255,0.05)' }} />
            )))}
          </div>
        </div>

        {/* Current */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, opacity:0.6, marginBottom:4 }}>🖊 いまのえ</div>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${level.gridSize}, ${cellSize}px)`, gap:1 }}>
            {displayGrid.map((row, r) => row.map((cell, c) => {
              const isCursor = cursorPos[0]===r && cursorPos[1]===c;
              return (
                <motion.div key={`${r}-${c}`}
                  animate={isCursor && gameState==='running' ? { scale:[1,1.2,1] } : {}}
                  style={{ width:cellSize, height:cellSize, background: cell ? COLOR_HEX[cell] : 'rgba(255,255,255,0.06)', borderRadius:2, border: isCursor ? '2px solid #ffd700' : '0.5px solid rgba(255,255,255,0.05)', boxSizing:'border-box' }} />
              );
            }))}
          </div>
        </div>
      </div>

      {/* Command queue */}
      <div style={{ width:'90%', maxWidth:440, margin:'4px 0', minHeight:52, background:'rgba(255,255,255,0.05)', borderRadius:12, padding:8 }}>
        <div style={{ fontSize:10, opacity:0.5, marginBottom:4 }}>📝 コード ({cmdCount}コマンド){addingToLoop ? ' ─ ループに追加中 ✏️' : ''}</div>
        {commands.length===0 && <div style={{ fontSize:11, opacity:0.35, textAlign:'center', paddingTop:6 }}>下のボタンでコマンドを追加しよう！</div>}
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {commands.map(cmd => renderCmd(cmd))}
        </div>
      </div>

      {/* Move buttons */}
      <div style={{ width:'90%', maxWidth:440, margin:'4px 0' }}>
        <div style={{ fontSize:10, opacity:0.5, marginBottom:4 }}>🕹️ うごき</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5 }}>
          {(['up','left','right','down'] as Dir[]).map(d => (
            <motion.button key={d} whileTap={{ scale:0.88 }} onClick={() => addCmd({ id:genId(), type:'move', dir:d })}
              style={{ background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'8px 4px', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              {DIR_LABEL[d]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color buttons */}
      <div style={{ width:'90%', maxWidth:440, margin:'4px 0' }}>
        <div style={{ fontSize:10, opacity:0.5, marginBottom:4 }}>🎨 いろ</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {level.availableColors.map(color => (
            <motion.button key={color} whileTap={{ scale:0.88 }} onClick={() => addCmd({ id:genId(), type:'color', color })}
              style={{ background: COLOR_HEX[color], border:'none', borderRadius:9, padding:'6px 12px', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer', boxShadow:`0 2px 8px ${COLOR_HEX[color]}88` }}>
              🎨{COLOR_LABEL[color]}
            </motion.button>
          ))}
          <motion.button whileTap={{ scale:0.88 }} onClick={() => setShowLoopModal(true)}
            style={{ background:'rgba(162,155,254,0.2)', border:'2px solid #a29bfe', borderRadius:9, padding:'6px 10px', color:'#a29bfe', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
            🔄 ループ
          </motion.button>
        </div>
      </div>

      {/* Run / Reset / Clear */}
      <div style={{ display:'flex', gap:8, margin:'6px 0', width:'90%', maxWidth:440 }}>
        <motion.button whileTap={{ scale:0.93 }} onClick={handleRun} disabled={gameState==='running'||commands.length===0}
          style={{ flex:2, background: gameState==='running'?'#555':'linear-gradient(135deg,#ffd700,#ff6b35)', border:'none', borderRadius:14, padding:'12px 0', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,107,53,0.4)' }}>
          {gameState==='running' ? '▶ えがき中...' : '▶ えがく！'}
        </motion.button>
        <motion.button whileTap={{ scale:0.93 }} onClick={handleReset}
          style={{ flex:1, background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'12px 0', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          ↺ もどす
        </motion.button>
        <motion.button whileTap={{ scale:0.93 }} onClick={() => { if(gameState!=='running'){ setCommands([]); setAddingToLoop(null); resetGrid(level); } }}
          style={{ flex:1, background:'rgba(255,100,100,0.1)', border:'1.5px solid rgba(255,100,100,0.3)', borderRadius:14, padding:'12px 0', color:'#ff6b6b', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          🗑 けす
        </motion.button>
      </div>

      {/* Success / Failure overlay */}
      <AnimatePresence>
        {gameState==='success' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <motion.div initial={{ scale:0.5, y:40 }} animate={{ scale:1, y:0 }} transition={{ type:'spring', bounce:0.5 }}
              style={{ background:'linear-gradient(135deg,#ffd700,#ff6b35)', borderRadius:24, padding:'32px 40px', textAlign:'center', maxWidth:320 }}>
              <div style={{ fontSize:56 }}>🎨🎉</div>
              <div style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>かんせい！</div>
              <div style={{ fontSize:32, marginBottom:16 }}>{'⭐'.repeat(stars[levelIndex]??1)}</div>
              {levelIndex < DOT_LEVELS.length-1 && (
                <motion.button whileTap={{ scale:0.93 }} onClick={handleNext}
                  style={{ background:'#fff', color:'#ff6b35', border:'none', borderRadius:14, padding:'12px 24px', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer', marginRight:8 }}>
                  つぎへ →
                </motion.button>
              )}
              <motion.button whileTap={{ scale:0.93 }} onClick={handleRetry}
                style={{ background:'rgba(255,255,255,0.25)', color:'#fff', border:'none', borderRadius:14, padding:'12px 20px', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                もう一度
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {gameState==='failure' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <motion.div initial={{ scale:0.5 }} animate={{ scale:1 }} transition={{ type:'spring', bounce:0.4 }}
              style={{ background:'linear-gradient(135deg,#d63031,#e17055)', borderRadius:24, padding:'32px 40px', textAlign:'center', maxWidth:320 }}>
              <div style={{ fontSize:48 }}>🎨😿</div>
              <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>もうちょっと！</div>
              <div style={{ fontSize:12, opacity:0.85, marginBottom:16 }}>目標の絵をよく見てもう一度！</div>
              <motion.button whileTap={{ scale:0.93 }} onClick={handleRetry}
                style={{ background:'#fff', color:'#d63031', border:'none', borderRadius:14, padding:'12px 24px', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer' }}>
                もう一度！
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loop count modal */}
      <AnimatePresence>
        {showLoopModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60 }}
            onClick={() => setShowLoopModal(false)}>
            <motion.div initial={{ scale:0.8 }} animate={{ scale:1 }} onClick={e => e.stopPropagation()}
              style={{ background:'#16213e', borderRadius:20, padding:'24px 32px', textAlign:'center', minWidth:240 }}>
              <div style={{ fontSize:16, fontWeight:800, marginBottom:12 }}>🔄 何回くりかえす？</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:16 }}>
                <motion.button whileTap={{ scale:0.9 }} onClick={() => setLoopCount(n => Math.max(2,n-1))}
                  style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, width:36, height:36, color:'#fff', fontSize:18, cursor:'pointer', fontFamily:'inherit' }}>－</motion.button>
                <span style={{ fontSize:28, fontWeight:800 }}>{loopCount}</span>
                <motion.button whileTap={{ scale:0.9 }} onClick={() => setLoopCount(n => Math.min(8,n+1))}
                  style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, width:36, height:36, color:'#fff', fontSize:18, cursor:'pointer', fontFamily:'inherit' }}>＋</motion.button>
              </div>
              <motion.button whileTap={{ scale:0.93 }} onClick={() => {
                addCmd({ id:genId(), type:'loop', count:loopCount, children:[] });
                setShowLoopModal(false);
              }}
                style={{ background:'linear-gradient(135deg,#a29bfe,#6c5ce7)', border:'none', borderRadius:12, padding:'10px 28px', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:14, cursor:'pointer' }}>
                OK！
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Select */}
      <AnimatePresence>
        {showLevelSelect && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}
            onClick={() => setShowLevelSelect(false)}>
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} onClick={e => e.stopPropagation()}
              style={{ background:'#16213e', borderRadius:20, padding:'20px', maxWidth:380, width:'90%' }}>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:12, textAlign:'center' }}>🗺️ レベルせんたく</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                {DOT_LEVELS.map((lv, i) => {
                  const unlocked = i < unlockedCount;
                  const s = stars[i] ?? 0;
                  return (
                    <motion.button key={lv.id} whileTap={unlocked ? { scale:0.9 } : {}} disabled={!unlocked}
                      onClick={() => unlocked && selectLevel(i)}
                      style={{ background: i===levelIndex ? 'linear-gradient(135deg,#ffd700,#ff6b35)' : unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 4px', cursor: unlocked?'pointer':'default', fontFamily:'inherit', color: unlocked?'#fff':'#666' }}>
                      <div style={{ fontSize:13, fontWeight:800 }}>{lv.id}</div>
                      <div style={{ fontSize:9 }}>{s>0?'⭐'.repeat(s):unlocked?'☆☆☆':'🔒'}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
