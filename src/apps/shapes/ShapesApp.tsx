import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SHAPE_PUZZLES, SHAPE_COLORS, ShapeType } from './puzzles';

type GameState = 'idle' | 'correct' | 'wrong';

const STORAGE_KEY = (user: string) => `shapes_stars_${user}_v1`;
const UNLOCKED_KEY = (user: string) => `shapes_unlocked_${user}_v1`;

function loadStars(user: string): Record<number, number> {
  try { const s = localStorage.getItem(STORAGE_KEY(user)); if (s) return JSON.parse(s); } catch { /**/ }
  return {};
}
function saveStars(user: string, s: Record<number, number>) {
  try { localStorage.setItem(STORAGE_KEY(user), JSON.stringify(s)); } catch { /**/ }
}
function loadUnlocked(user: string): number {
  return Number(localStorage.getItem(UNLOCKED_KEY(user)) ?? 1);
}
function saveUnlocked(user: string, n: number) {
  localStorage.setItem(UNLOCKED_KEY(user), String(n));
}

function fireConfetti() {
  const end = Date.now() + 2500;
  const colors = ['#FFD93D','#FF6B6B','#4ECDC4','#6BCB77','#A29BFE','#FD79A8'];
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.55 }, colors });
}

function ShapeSVG({ type, color, size = 90 }: { type: ShapeType; color: string; size?: number }) {
  const shapes: Partial<Record<ShapeType, React.ReactNode>> = {
    circle: <circle cx="50" cy="50" r="44"/>,
    square: <rect x="6" y="6" width="88" height="88" rx="4"/>,
    triangle: <polygon points="50,6 94,94 6,94"/>,
    rectangle_h: <rect x="4" y="22" width="92" height="56" rx="4"/>,
    rectangle_v: <rect x="22" y="4" width="56" height="92" rx="4"/>,
    oval_h: <ellipse cx="50" cy="50" rx="45" ry="26"/>,
    oval_v: <ellipse cx="50" cy="50" rx="26" ry="45"/>,
    diamond: <polygon points="50,4 96,50 50,96 4,50"/>,
    star: <polygon points="50,4 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"/>,
    pentagon: <polygon points="50,4 96,38 78,94 22,94 4,38"/>,
    hexagon: <polygon points="50,4 91,27 91,73 50,96 9,73 9,27"/>,
    heart: <path d="M50,85 C20,65 5,45 5,28 A20,20 0 0,1 50,15 A20,20 0 0,1 95,28 C95,45 80,65 50,85Z"/>,
    cross: <path d="M36,4 L64,4 L64,36 L96,36 L96,64 L64,64 L64,96 L36,96 L36,64 L4,64 L4,36 L36,36 Z"/>,
    arrow: <polygon points="4,35 58,35 58,10 96,50 58,90 58,65 4,65"/>,
    moon: <path d="M70,10 A40,40 0 1,0 70,90 A30,30 0 1,1 70,10Z"/>,
    house: <path d="M50,6 L94,40 L94,94 L6,94 L6,40 Z"/>,
    tree: <><polygon points="50,5 80,45 20,45"/><polygon points="50,20 85,65 15,65"/><rect x="40" y="65" width="20" height="30"/></>,
    fish: <><path d="M10,50 Q30,25 70,50 Q30,75 10,50Z"/><path d="M68,50 L88,30 L88,70 Z"/></>,
    cat: <><circle cx="50" cy="52" r="32"/><polygon points="25,28 15,6 38,22"/><polygon points="75,28 85,6 62,22"/><circle cx="40" cy="46" r="4" fill="rgba(0,0,0,0.5)"/><circle cx="60" cy="46" r="4" fill="rgba(0,0,0,0.5)"/></>,
    flower: <><circle cx="50" cy="50" r="12"/>{[0,60,120,180,240,300].map(a=><ellipse key={a} cx={50+24*Math.cos(a*Math.PI/180)} cy={50+24*Math.sin(a*Math.PI/180)} rx="10" ry="16" transform={`rotate(${a},${50+24*Math.cos(a*Math.PI/180)},${50+24*Math.sin(a*Math.PI/180)})`}/>)}</>,
    lightning: <polygon points="58,4 30,52 52,52 42,96 70,48 48,48"/>,
    cloud: <path d="M20,65 A18,18 0 0,1 20,30 A15,15 0 0,1 45,18 A20,20 0 0,1 82,28 A16,16 0 0,1 82,62 Z"/>,
    crown: <path d="M8,80 L8,40 L30,60 L50,10 L70,60 L92,40 L92,80 Z"/>,
    shield: <path d="M50,5 L90,20 L90,55 C90,75 70,90 50,95 C30,90 10,75 10,55 L10,20 Z"/>,
    bell: <path d="M50,8 C50,8 25,20 25,55 L20,70 L80,70 L75,55 C75,20 50,8 50,8Z M40,70 A10,10 0 0,0 60,70"/>,
  };
  const el = shapes[type] || shapes.circle;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>
      <g fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">{el}</g>
    </svg>
  );
}

const LEVEL_TITLES = ['きほんのかたち','もっとかたち','とくしゅなかたち','どうぶつシルエット','ものシルエット',
  'にているかたち','もっとにているかたち','シルエットクイズ','むずかしいくべつ','マスター'];

export default function ShapesApp({ onHome, currentUser }: { onHome: () => void; currentUser: string }) {
  const [stars, setStars] = useState<Record<number, number>>(() => loadStars(currentUser));
  const [unlockedCount, setUnlockedCount] = useState(() => Math.max(loadUnlocked(currentUser), 1));
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const puzzle = SHAPE_PUZZLES[puzzleIndex] ?? SHAPE_PUZZLES[0];
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  const handleAnswer = useCallback((choiceIndex: number) => {
    if (gameState !== 'idle') return;
    setSelectedIndex(choiceIndex);
    if (choiceIndex === puzzle.correctIndex) {
      const starCount = wrongAttempts === 0 ? 3 : wrongAttempts === 1 ? 2 : 1;
      const newStars = { ...stars, [puzzleIndex]: Math.max(stars[puzzleIndex] ?? 0, starCount) };
      setStars(newStars);
      saveStars(currentUser, newStars);
      const newUnlocked = Math.max(unlockedCount, puzzleIndex + 2);
      setUnlockedCount(newUnlocked);
      saveUnlocked(currentUser, newUnlocked);
      setGameState('correct');
      fireConfetti();
    } else {
      setWrongAttempts(w => w + 1);
      setGameState('wrong');
      setTimeout(() => { setGameState('idle'); setSelectedIndex(null); }, 800);
    }
  }, [gameState, puzzle, wrongAttempts, stars, puzzleIndex, currentUser, unlockedCount]);

  const handleNext = () => {
    if (puzzleIndex < SHAPE_PUZZLES.length - 1) {
      setPuzzleIndex(p => p + 1);
      setGameState('idle');
      setSelectedIndex(null);
      setWrongAttempts(0);
    }
  };

  const handleRetry = () => {
    setGameState('idle');
    setSelectedIndex(null);
    setWrongAttempts(0);
  };

  const selectPuzzle = (i: number) => {
    setPuzzleIndex(i);
    setGameState('idle');
    setSelectedIndex(null);
    setWrongAttempts(0);
    setShowLevelSelect(false);
  };

  return (
    <div style={{
      minHeight:'100dvh',
      background:'linear-gradient(180deg,#0f3460 0%,#16213e 50%,#1a1a2e 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      fontFamily:"'M PLUS Rounded 1c', sans-serif", color:'#fff', paddingBottom:12,
    }}>
      {['🔷','⭐','🔺','💎','🌟'].map((e,i)=>(
        <motion.div key={i} animate={{y:[-8,8,-8],opacity:[0.3,0.7,0.3],rotate:[0,180,360]}}
          transition={{repeat:Infinity,duration:4+i,delay:i*0.6}}
          style={{position:'fixed',top:`${8+i*18}%`,right:`${3+i*4}%`,fontSize:16,pointerEvents:'none',zIndex:1}}>{e}</motion.div>
      ))}

      {/* Header */}
      <div style={{width:'100%',maxWidth:480,padding:'8px 12px 4px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <motion.button whileTap={{scale:0.9}} onClick={onHome}
          style={{background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',borderRadius:10,padding:'6px 10px',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          🏠 ホーム
        </motion.button>
        <div style={{textAlign:'center'}}>
          <div style={{color:'#FFD93D',fontSize:15,fontWeight:800}}>🔷 かたちパズル</div>
          <div style={{fontSize:10,opacity:0.6}}>Lv.{puzzle.levelNum} Q{puzzle.questionNum} / 50　⭐{totalStars}</div>
        </div>
        <motion.button whileTap={{scale:0.9}} onClick={()=>setShowLevelSelect(true)}
          style={{background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',borderRadius:10,padding:'6px 10px',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          🗺️ レベル
        </motion.button>
      </div>

      {/* Puzzle info */}
      <motion.div key={puzzleIndex} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{background:'rgba(255,255,255,0.07)',borderRadius:14,padding:'8px 16px',margin:'4px 0',textAlign:'center',width:'90%',maxWidth:380}}>
        <div style={{fontSize:14,fontWeight:800,color:'#FFD93D'}}>🔷 {puzzle.title}</div>
        <div style={{fontSize:11,opacity:0.75,marginTop:2}}>💡 {puzzle.hint}</div>
        <div style={{fontSize:11,color:'#FFD93D',marginTop:2}}>{'⭐'.repeat(stars[puzzleIndex]??0)}{'☆'.repeat(3-(stars[puzzleIndex]??0))}</div>
      </motion.div>

      {/* Target shape */}
      <div style={{background:'rgba(255,255,255,0.06)',borderRadius:20,padding:16,margin:'6px 0',textAlign:'center'}}>
        <div style={{fontSize:10,opacity:0.5,marginBottom:8}}>🎯 このかたちはどれ？</div>
        <motion.div animate={{scale:[1,1.04,1]}} transition={{repeat:Infinity,duration:2,ease:'easeInOut'}}>
          <ShapeSVG type={puzzle.target} color={SHAPE_COLORS[puzzle.target]} size={120}/>
        </motion.div>
      </div>

      {/* Choices */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,width:'90%',maxWidth:380,margin:'6px 0'}}>
        {puzzle.choices.map((shape, i) => {
          const isCorrect = i === puzzle.correctIndex;
          const isSelected = selectedIndex === i;
          let bg = 'rgba(255,255,255,0.07)';
          let border = '2px solid rgba(255,255,255,0.15)';
          if (isSelected && gameState === 'correct') { bg='rgba(0,255,136,0.2)'; border='2px solid #00ff88'; }
          else if (isSelected && gameState === 'wrong') { bg='rgba(255,71,87,0.2)'; border='2px solid #ff4757'; }
          else if (gameState === 'correct' && isCorrect) { bg='rgba(0,255,136,0.15)'; border='2px solid #00ff88'; }
          return (
            <motion.button key={i} whileTap={gameState==='idle'?{scale:0.93}:{}}
              animate={isSelected && gameState === 'wrong' ? {x:[-6,6,-6,6,0]} : {}}
              onClick={() => handleAnswer(i)}
              style={{background:bg,border,borderRadius:16,padding:'12px 8px',cursor:gameState==='idle'?'pointer':'default',display:'flex',flexDirection:'column',alignItems:'center',gap:6,fontFamily:'inherit'}}>
              <ShapeSVG type={shape} color={SHAPE_COLORS[shape]} size={70}/>
              <div style={{fontSize:9,opacity:0.5}}>{i===0?'①':i===1?'②':i===2?'③':'④'}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Wrong counter hint */}
      {wrongAttempts > 0 && gameState === 'idle' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{fontSize:11,color:'#ff9f43',padding:'6px 16px',background:'rgba(255,159,67,0.1)',borderRadius:10,textAlign:'center'}}>
          ❗ もう一回！よく見てみよう！（あと{3-wrongAttempts}回）
        </motion.div>
      )}

      {/* Success / Failure overlay */}
      <AnimatePresence>
        {gameState === 'correct' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
            <motion.div initial={{scale:0.5,y:40}} animate={{scale:1,y:0}} transition={{type:'spring',bounce:0.5}}
              style={{background:'linear-gradient(135deg,#FFD93D,#ff9f43)',borderRadius:24,padding:'28px 36px',textAlign:'center',maxWidth:320}}>
              <div style={{fontSize:52}}>🎉</div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>せいかい！</div>
              <div style={{fontSize:36,marginBottom:12}}>{'⭐'.repeat(stars[puzzleIndex]??1)}</div>
              {puzzleIndex < SHAPE_PUZZLES.length-1 && (
                <motion.button whileTap={{scale:0.93}} onClick={handleNext}
                  style={{background:'#fff',color:'#ff9f43',border:'none',borderRadius:14,padding:'11px 22px',fontFamily:'inherit',fontWeight:800,fontSize:14,cursor:'pointer',marginRight:8}}>
                  つぎへ →
                </motion.button>
              )}
              <motion.button whileTap={{scale:0.93}} onClick={handleRetry}
                style={{background:'rgba(255,255,255,0.25)',color:'#fff',border:'none',borderRadius:14,padding:'11px 18px',fontFamily:'inherit',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                もう一度
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Select */}
      <AnimatePresence>
        {showLevelSelect && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}
            onClick={()=>setShowLevelSelect(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} onClick={e=>e.stopPropagation()}
              style={{background:'#16213e',borderRadius:20,padding:'16px',maxWidth:400,width:'92%',maxHeight:'85vh',overflowY:'auto'}}>
              <div style={{fontWeight:800,fontSize:15,marginBottom:10,textAlign:'center'}}>🗺️ レベルせんたく</div>
              {Array.from({length:10},(_,l)=>{
                const levelPuzzles = SHAPE_PUZZLES.filter(p=>p.levelNum===l+1);
                const firstIdx = SHAPE_PUZZLES.findIndex(p=>p.levelNum===l+1);
                const unlocked = firstIdx < unlockedCount;
                return (
                  <div key={l} style={{marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:800,color:'#FFD93D',marginBottom:4}}>
                      レベル{l+1}: {LEVEL_TITLES[l]}
                    </div>
                    <div style={{display:'flex',gap:4}}>
                      {levelPuzzles.map((p,qi)=>{
                        const pi = firstIdx+qi;
                        const u = pi < unlockedCount;
                        const s = stars[pi]??0;
                        return (
                          <motion.button key={p.id} whileTap={u?{scale:0.9}:{}} disabled={!u}
                            onClick={()=>u&&selectPuzzle(pi)}
                            style={{background:pi===puzzleIndex?'linear-gradient(135deg,#FFD93D,#ff9f43)':u?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'6px 8px',cursor:u?'pointer':'default',fontFamily:'inherit',color:u?'#fff':'#666',minWidth:44}}>
                            <div style={{fontSize:12,fontWeight:800}}>Q{p.questionNum}</div>
                            <div style={{fontSize:8}}>{s>0?'⭐'.repeat(s):u?'☆☆☆':'🔒'}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                    {!unlocked&&<div style={{fontSize:10,opacity:0.4}}>🔒 まえのレベルをクリアしよう</div>}
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
