import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { HIRAGANA_CHARS, HiraganaChar } from './characters';

type GameState = 'idle' | 'drawing' | 'checking' | 'success' | 'failure';

const STORAGE_KEY = (user: string) => `hiragana_stars_${user}_v1`;
const UNLOCKED_KEY = (user: string) => `hiragana_unlocked_${user}_v1`;

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
  const colors = ['#ff0','#f0f','#0ff','#ff4400','#00ff88','#FFD93D'];
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors });
}

export default function HiraganaApp({ onHome, currentUser }: { onHome: () => void; currentUser: string }) {
  const [stars, setStars] = useState<Record<number, number>>(() => loadStars(currentUser));
  const [unlockedCount, setUnlockedCount] = useState(() => Math.max(loadUnlocked(currentUser), 1));
  const [charIndex, setCharIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const char: HiraganaChar = HIRAGANA_CHARS[charIndex] ?? HIRAGANA_CHARS[0];
  const CANVAS_SIZE = Math.min(window.innerWidth * 0.85, 300);

  // Draw guide character on canvas
  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid background
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const p = (CANVAS_SIZE / 4) * i;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(CANVAS_SIZE, p); ctx.stroke();
    }
    // Diagonal guides
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(CANVAS_SIZE,CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CANVAS_SIZE,0); ctx.lineTo(0,CANVAS_SIZE); ctx.stroke();

    // Guide character
    ctx.font = `bold ${CANVAS_SIZE * 0.72}px "M PLUS Rounded 1c", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText(char.char, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + CANVAS_SIZE * 0.04);
  }, [char, CANVAS_SIZE]);

  useEffect(() => { drawGuide(); }, [drawGuide]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setGameState('drawing');
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = CANVAS_SIZE * 0.045;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    resetDebounce();
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y); ctx.stroke();
    resetDebounce();
  };

  const stopDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawing.current = false;
    resetDebounce();
  };

  const resetDebounce = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(checkDrawing, 1800);
  };

  const checkDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setGameState('checking');

    // Create off-screen canvas to measure guide character pixels
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_SIZE; offscreen.height = CANVAS_SIZE;
    const octx = offscreen.getContext('2d')!;
    octx.font = `bold ${CANVAS_SIZE * 0.72}px "M PLUS Rounded 1c", sans-serif`;
    octx.textAlign = 'center'; octx.textBaseline = 'middle';
    octx.fillStyle = '#000';
    octx.fillText(char.char, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + CANVAS_SIZE * 0.04);

    const refData = octx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
    const userDataFull = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

    // Count reference pixels (dark areas of guide) and user-drawn pixels overlapping
    let refPixels = 0, covered = 0;
    const sample = 2; // Check every 2nd pixel for speed
    for (let i = 0; i < refData.length; i += 4 * sample) {
      const alpha = refData[i + 3];
      if (alpha > 50) {
        refPixels++;
        // Check nearby user pixels (5px radius)
        const px = (i / 4) % CANVAS_SIZE;
        const py = Math.floor((i / 4) / CANVAS_SIZE);
        let found = false;
        for (let dx = -5; dx <= 5 && !found; dx += 2) {
          for (let dy = -5; dy <= 5 && !found; dy += 2) {
            const nx = px + dx, ny = py + dy;
            if (nx >= 0 && nx < CANVAS_SIZE && ny >= 0 && ny < CANVAS_SIZE) {
              const ni = (ny * CANVAS_SIZE + nx) * 4;
              if (userDataFull[ni + 3] > 30) found = true;
            }
          }
        }
        if (found) covered++;
      }
    }

    const coverage = refPixels > 0 ? (covered / refPixels) * 100 : 0;
    const starCount = coverage >= 75 ? 3 : coverage >= 45 ? 2 : coverage >= 20 ? 1 : 0;
    setScore(Math.round(coverage));

    setTimeout(() => {
      if (starCount >= 1) {
        const newStars = { ...stars, [charIndex]: Math.max(stars[charIndex] ?? 0, starCount) };
        setStars(newStars);
        saveStars(currentUser, newStars);
        const newUnlocked = Math.max(unlockedCount, charIndex + 2);
        setUnlockedCount(newUnlocked);
        saveUnlocked(currentUser, newUnlocked);
        setGameState('success');
        if (starCount >= 2) fireConfetti();
      } else {
        setWrongCount(prev => prev + 1);
        setGameState('failure');
      }
    }, 500);
  }, [char, CANVAS_SIZE, stars, charIndex, currentUser, unlockedCount]);

  const handleClear = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setGameState('idle');
    drawGuide();
  };

  const handleNext = () => {
    if (charIndex < HIRAGANA_CHARS.length - 1) {
      setCharIndex(c => c + 1);
      setGameState('idle');
      setWrongCount(0);
      setTimeout(drawGuide, 50);
    }
  };

  const handleRetry = () => {
    setGameState('idle');
    handleClear();
  };

  const selectChar = (i: number) => {
    setCharIndex(i);
    setGameState('idle');
    setWrongCount(0);
    setShowLevelSelect(false);
    setTimeout(drawGuide, 50);
  };

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const levelGroups = Array.from({ length: 10 }, (_, l) => ({
    levelNum: l + 1,
    chars: HIRAGANA_CHARS.filter(c => c.levelNum === l + 1),
  }));

  const LEVEL_TITLES = ['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの',
    'はひふへほ','まみむめも','やゆよらり','るれろわを','ん・だく音'];

  return (
    <div style={{
      minHeight:'100dvh',
      background:'linear-gradient(180deg,#1a0533 0%,#4a0e8f 50%,#6c2bbd 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      fontFamily:"'M PLUS Rounded 1c', sans-serif", color:'#fff', paddingBottom:12,
    }}>
      {['✏️','📝','🌟','✨','🎯'].map((e,i)=>(
        <motion.div key={i} animate={{y:[-8,8,-8],opacity:[0.3,0.7,0.3]}}
          transition={{repeat:Infinity,duration:3+i,delay:i*0.5}}
          style={{position:'fixed',top:`${8+i*18}%`,right:`${3+i*4}%`,fontSize:16,pointerEvents:'none',zIndex:1}}>{e}</motion.div>
      ))}

      {/* Header */}
      <div style={{width:'100%',maxWidth:480,padding:'8px 12px 4px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <motion.button whileTap={{scale:0.9}} onClick={onHome}
          style={{background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',borderRadius:10,padding:'6px 10px',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          🏠 ホーム
        </motion.button>
        <div style={{textAlign:'center'}}>
          <div style={{color:'#ffd700',fontSize:15,fontWeight:800}}>✏️ ひらがなかきかた</div>
          <div style={{fontSize:10,opacity:0.6}}>{char.levelNum}だん / {HIRAGANA_CHARS.length}もじ　⭐{totalStars}</div>
        </div>
        <motion.button whileTap={{scale:0.9}} onClick={()=>setShowLevelSelect(true)}
          style={{background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',borderRadius:10,padding:'6px 10px',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          🗺️ もじ
        </motion.button>
      </div>

      {/* Char info */}
      <motion.div key={charIndex} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{background:'rgba(255,255,255,0.07)',borderRadius:14,padding:'8px 16px',margin:'4px 0',textAlign:'center',width:'90%',maxWidth:380}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
          <div style={{fontSize:36,fontWeight:800,lineHeight:1}}>{char.char}</div>
          <div>
            <div style={{fontSize:13,color:'#ffd700',fontWeight:800}}>{char.romaji.toUpperCase()} ({char.romaji})</div>
            <div style={{fontSize:11,opacity:0.75}}>💡 {char.hint}</div>
            <div style={{fontSize:11,color:'#ffd700'}}>{'⭐'.repeat(stars[charIndex]??0)}{'☆'.repeat(3-(stars[charIndex]??0))}</div>
          </div>
        </div>
      </motion.div>

      {/* Canvas */}
      <div style={{position:'relative',margin:'6px 0'}}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE} height={CANVAS_SIZE}
          style={{
            width:CANVAS_SIZE, height:CANVAS_SIZE,
            background:'rgba(255,255,255,0.05)',
            borderRadius:20,
            border:'2px solid rgba(255,255,255,0.15)',
            touchAction:'none',
            cursor:'crosshair',
          }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
        {gameState === 'checking' && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)',borderRadius:20}}>
            <div style={{fontSize:24,fontWeight:800}}>⏳ かくにん中...</div>
          </div>
        )}
      </div>

      {/* Score bar */}
      {gameState !== 'idle' && gameState !== 'drawing' && gameState !== 'checking' && (
        <div style={{width:'90%',maxWidth:300,margin:'4px 0',background:'rgba(255,255,255,0.1)',borderRadius:20,overflow:'hidden',height:12}}>
          <motion.div initial={{width:0}} animate={{width:`${score}%`}} transition={{duration:0.8}}
            style={{height:'100%',background:`linear-gradient(90deg,${score>=75?'#00ff88':score>=45?'#ffd700':'#ff6b6b'},${score>=75?'#00cec9':score>=45?'#ff9f43':'#ff4757'})`,borderRadius:20}} />
        </div>
      )}

      {/* Buttons */}
      <div style={{display:'flex',gap:8,margin:'6px 0',width:'90%',maxWidth:300}}>
        <motion.button whileTap={{scale:0.93}} onClick={handleClear}
          style={{flex:1,background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.2)',borderRadius:14,padding:'12px 0',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:13,cursor:'pointer'}}>
          🗑 けす
        </motion.button>
        {gameState === 'idle' || gameState === 'drawing' ? (
          <motion.button whileTap={{scale:0.93}} onClick={() => { if (debounceTimer.current) clearTimeout(debounceTimer.current); checkDrawing(); }}
            style={{flex:2,background:'linear-gradient(135deg,#a29bfe,#6c5ce7)',border:'none',borderRadius:14,padding:'12px 0',color:'#fff',fontFamily:'inherit',fontWeight:800,fontSize:14,cursor:'pointer'}}>
            ✅ できた！
          </motion.button>
        ) : null}
      </div>

      {/* Hint: wrong counter */}
      {wrongCount >= 2 && (
        <div style={{fontSize:11,opacity:0.7,textAlign:'center',padding:'4px 16px',background:'rgba(255,255,255,0.05)',borderRadius:10,maxWidth:320}}>
          💡 ガイドの文字をなぞるように大きく書いてみよう！
        </div>
      )}

      {/* Success overlay */}
      <AnimatePresence>
        {gameState === 'success' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
            <motion.div initial={{scale:0.5,y:40}} animate={{scale:1,y:0}} transition={{type:'spring',bounce:0.5}}
              style={{background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',borderRadius:24,padding:'28px 36px',textAlign:'center',maxWidth:320}}>
              <div style={{fontSize:52}}>{score>=75?'🌟':'⭐'}</div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>じょうず！</div>
              <div style={{fontSize:40,marginBottom:4}}>{'⭐'.repeat(stars[charIndex]??1)}</div>
              <div style={{fontSize:14,marginBottom:16,opacity:0.85}}>{score}%できたよ！</div>
              {charIndex < HIRAGANA_CHARS.length-1 && (
                <motion.button whileTap={{scale:0.93}} onClick={handleNext}
                  style={{background:'#fff',color:'#6c5ce7',border:'none',borderRadius:14,padding:'11px 22px',fontFamily:'inherit',fontWeight:800,fontSize:14,cursor:'pointer',marginRight:8}}>
                  つぎへ →
                </motion.button>
              )}
              <motion.button whileTap={{scale:0.93}} onClick={handleRetry}
                style={{background:'rgba(255,255,255,0.2)',color:'#fff',border:'none',borderRadius:14,padding:'11px 18px',fontFamily:'inherit',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                もう一度
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {gameState === 'failure' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
            <motion.div initial={{scale:0.5}} animate={{scale:1}} transition={{type:'spring',bounce:0.4}}
              style={{background:'linear-gradient(135deg,#d63031,#e17055)',borderRadius:24,padding:'28px 36px',textAlign:'center',maxWidth:320}}>
              <div style={{fontSize:48}}>✏️😿</div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>もうちょっと！</div>
              <div style={{fontSize:13,opacity:0.85,marginBottom:4}}>{score}%…もっと大きくかいてみよう！</div>
              <div style={{fontSize:11,opacity:0.7,marginBottom:16}}>うすいもじをなぞるようにかいてね</div>
              <motion.button whileTap={{scale:0.93}} onClick={handleRetry}
                style={{background:'#fff',color:'#d63031',border:'none',borderRadius:14,padding:'11px 22px',fontFamily:'inherit',fontWeight:800,fontSize:14,cursor:'pointer'}}>
                もう一度！
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Select */}
      <AnimatePresence>
        {showLevelSelect && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,overflowY:'auto'}}
            onClick={()=>setShowLevelSelect(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} onClick={e=>e.stopPropagation()}
              style={{background:'#2d1b69',borderRadius:20,padding:'16px',maxWidth:400,width:'92%',maxHeight:'85vh',overflowY:'auto'}}>
              <div style={{fontWeight:800,fontSize:15,marginBottom:10,textAlign:'center'}}>🗺️ だんすんたく</div>
              {levelGroups.map((group) => {
                const firstIdx = HIRAGANA_CHARS.findIndex(c => c.levelNum === group.levelNum);
                const unlocked = firstIdx < unlockedCount;
                return (
                  <div key={group.levelNum} style={{marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:800,color:'#a29bfe',marginBottom:4}}>
                      だん{group.levelNum}: {LEVEL_TITLES[group.levelNum-1]}
                    </div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {group.chars.map((c,qi) => {
                        const ci = firstIdx + qi;
                        const unlocked2 = ci < unlockedCount;
                        const s = stars[ci]??0;
                        return (
                          <motion.button key={c.id} whileTap={unlocked2?{scale:0.9}:{}} disabled={!unlocked2}
                            onClick={()=>unlocked2&&selectChar(ci)}
                            style={{background:ci===charIndex?'linear-gradient(135deg,#ffd700,#ff9f43)':unlocked2?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'6px 10px',cursor:unlocked2?'pointer':'default',fontFamily:'inherit',color:unlocked2?'#fff':'#666',minWidth:48}}>
                            <div style={{fontSize:16,fontWeight:800}}>{c.char}</div>
                            <div style={{fontSize:8}}>{s>0?'⭐'.repeat(s):unlocked2?'☆☆☆':'🔒'}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                    {!unlocked && <div style={{fontSize:10,opacity:0.4}}>🔒 まえのだんをクリアしよう</div>}
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
