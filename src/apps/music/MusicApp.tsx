import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MUSIC_LEVELS, NOTE_FREQ, NOTE_COLOR, Note, MusicLevel } from './levels';

type MusicCmd = { id: string; type: 'note'; note: Note } | { id: string; type: 'loop'; count: number; children: MusicCmd[] };
type GameState = 'idle' | 'running' | 'success' | 'failure';

function genId() { return Math.random().toString(36).slice(2, 9); }

const MUSIC_STORAGE = 'musicprog_stars_v1';
function loadStars(): Record<number, number> {
  try { const s = localStorage.getItem(MUSIC_STORAGE); if (s) return JSON.parse(s); } catch { /* */ }
  return {};
}
function saveStars(s: Record<number, number>) {
  try { localStorage.setItem(MUSIC_STORAGE, JSON.stringify(s)); } catch { /* */ }
}

function expandCommands(cmds: MusicCmd[]): Note[] {
  const out: Note[] = [];
  for (const c of cmds) {
    if (c.type === 'note') out.push(c.note);
    else { for (let i = 0; i < c.count; i++) out.push(...expandCommands(c.children)); }
  }
  return out;
}

function countExpanded(cmds: MusicCmd[]): number {
  let n = 0;
  for (const c of cmds) {
    if (c.type === 'note') n++;
    else { n += 1 + countExpanded(c.children); }
  }
  return n;
}

function playNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.5, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.9);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export default function MusicApp({ onHome }: { onHome: () => void }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [stars, setStars] = useState<Record<number, number>>(loadStars);
  const [unlockedCount, setUnlockedCount] = useState(() => Math.max(1, ...Object.keys(loadStars()).map(Number).map(k => k + 1), 1));
  const [commands, setCommands] = useState<MusicCmd[]>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [loopCount, setLoopCount] = useState(2);
  const [playingNote, setPlayingNote] = useState<Note | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const level: MusicLevel = MUSIC_LEVELS[levelIndex] ?? MUSIC_LEVELS[0];
  const expanded = expandCommands(commands);
  const cmdCount = countExpanded(commands);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const handleRun = useCallback(() => {
    if (gameState === 'running') return;
    if (commands.length === 0) return;
    const notes = expandCommands(commands);
    if (notes.length === 0) return;
    setGameState('running');
    setActiveIndex(null);
    const ctx = getAudioCtx();
    const secPerBeat = 60 / level.bpm;
    const now = ctx.currentTime;
    notes.forEach((note, i) => {
      playNote(ctx, NOTE_FREQ[note], now + i * secPerBeat, secPerBeat * 0.85);
      const t = setTimeout(() => {
        setActiveIndex(i);
        setPlayingNote(note);
        if (i === notes.length - 1) {
          const t2 = setTimeout(() => {
            setActiveIndex(null);
            setPlayingNote(null);
            const match = notes.length === level.target.length && notes.every((n, j) => n === level.target[j]);
            if (match) {
              const starCount = cmdCount <= level.optimalCommands ? 3 : cmdCount <= level.optimalCommands + 2 ? 2 : 1;
              setStars(prev => {
                const next = { ...prev, [levelIndex]: Math.max(prev[levelIndex] ?? 0, starCount) };
                saveStars(next);
                return next;
              });
              setUnlockedCount(prev => Math.max(prev, levelIndex + 2));
              setGameState('success');
            } else {
              setGameState('failure');
            }
          }, 500);
          timers.current.push(t2);
        }
      }, i * secPerBeat * 1000);
      timers.current.push(t);
    });
  }, [commands, gameState, level, levelIndex, cmdCount]);

  const handleAddNote = (note: Note) => {
    if (gameState === 'running') return;
    setCommands(prev => [...prev, { id: genId(), type: 'note', note }]);
  };

  const handleAddLoop = () => {
    if (gameState === 'running') return;
    setShowLoopModal(true);
  };

  const handleConfirmLoop = () => {
    setCommands(prev => [...prev, { id: genId(), type: 'loop', count: loopCount, children: [] }]);
    setShowLoopModal(false);
  };

  const handleAddNoteToLoop = (note: Note, loopId: string) => {
    if (gameState === 'running') return;
    setCommands(prev => prev.map(c =>
      c.id === loopId && c.type === 'loop'
        ? { ...c, children: [...c.children, { id: genId(), type: 'note', note }] }
        : c
    ));
  };

  const handleRemove = (id: string) => {
    if (gameState === 'running') return;
    const remove = (cmds: MusicCmd[]): MusicCmd[] => cmds.filter(c => c.id !== id).map(c =>
      c.type === 'loop' ? { ...c, children: remove(c.children) } : c
    );
    setCommands(prev => remove(prev));
  };

  const handleReset = () => {
    clearTimers();
    setGameState('idle');
    setActiveIndex(null);
    setPlayingNote(null);
  };

  const handleNext = () => {
    if (levelIndex < MUSIC_LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1);
      setCommands([]);
      setGameState('idle');
      setActiveIndex(null);
    }
  };

  const handleRetry = () => {
    clearTimers();
    setCommands([]);
    setGameState('idle');
    setActiveIndex(null);
  };

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'M PLUS Rounded 1c', sans-serif",
      color: '#fff',
      paddingBottom: 12,
    }}>
      {/* Floating notes */}
      {['🎵','🎶','🎸','🎹','🎺'].map((e, i) => (
        <motion.div key={i}
          animate={{ y: [-8,8,-8], opacity: [0.3,0.7,0.3] }}
          transition={{ repeat: Infinity, duration: 3+i, delay: i*0.6 }}
          style={{ position:'fixed', top:`${10+i*18}%`, right:`${3+i*4}%`, fontSize:16, pointerEvents:'none', zIndex:1 }}
        >{e}</motion.div>
      ))}

      {/* Header */}
      <div style={{ width:'100%', maxWidth:480, padding:'8px 12px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <motion.button whileTap={{ scale:0.9 }} onClick={onHome}
          style={{ background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'6px 10px', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          🏠 ホーム
        </motion.button>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'#a29bfe', fontSize:15, fontWeight:800 }}>🎵 おんがくプログラミング</div>
          <div style={{ fontSize:10, opacity:0.6 }}>Lv.{level.id} / {MUSIC_LEVELS.length}　⭐ {totalStars}</div>
        </div>
        <motion.button whileTap={{ scale:0.9 }} onClick={() => setShowLevelSelect(true)}
          style={{ background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'6px 10px', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          🗺️ レベル
        </motion.button>
      </div>

      {/* Level info */}
      <motion.div key={levelIndex} initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'8px 16px', margin:'4px 0', textAlign:'center', width:'90%', maxWidth:440 }}>
        <div style={{ fontSize:14, fontWeight:800, color:'#ffd700' }}>🎵 {level.title}</div>
        <div style={{ fontSize:11, opacity:0.75, marginTop:2 }}>💡 {level.hint}</div>
        <div style={{ fontSize:11, color:'#a29bfe', marginTop:2 }}>
          {'⭐'.repeat(stars[levelIndex] ?? 0)}{'☆'.repeat(3-(stars[levelIndex] ?? 0))}
        </div>
      </motion.div>

      {/* Target melody display */}
      <div style={{ width:'90%', maxWidth:440, margin:'4px 0' }}>
        <div style={{ fontSize:11, opacity:0.6, marginBottom:4 }}>🎯 目標のメロディー</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {level.target.map((note, i) => (
            <motion.div key={i}
              animate={activeIndex === i && gameState === 'running' ? { scale:[1,1.3,1], boxShadow:['0 0 0px transparent','0 0 16px ' + NOTE_COLOR[note],'0 0 0px transparent'] } : {}}
              transition={{ duration:0.3 }}
              style={{
                background: activeIndex === i && gameState === 'running' ? NOTE_COLOR[note] : 'rgba(255,255,255,0.12)',
                border: `2px solid ${NOTE_COLOR[note]}`,
                borderRadius:8, padding:'4px 8px', fontSize:12, fontWeight:700,
                color: activeIndex === i && gameState === 'running' ? '#fff' : NOTE_COLOR[note],
                transition:'all 0.2s',
              }}>
              {note}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Command Queue */}
      <div style={{ width:'90%', maxWidth:440, margin:'4px 0', minHeight:60, background:'rgba(255,255,255,0.05)', borderRadius:12, padding:8 }}>
        <div style={{ fontSize:10, opacity:0.5, marginBottom:4 }}>🎼 あなたのコード ({cmdCount}コマンド)</div>
        {commands.length === 0 && <div style={{ fontSize:11, opacity:0.35, textAlign:'center', paddingTop:8 }}>下のボタンで音符を追加しよう！</div>}
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {commands.map((cmd) => {
            if (cmd.type === 'note') {
              return (
                <motion.div key={cmd.id} initial={{ scale:0 }} animate={{ scale:1 }}
                  whileTap={{ scale:0.85 }} onClick={() => handleRemove(cmd.id)}
                  style={{ background: NOTE_COLOR[cmd.note], borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }}>
                  {cmd.note}
                </motion.div>
              );
            } else {
              return (
                <div key={cmd.id} style={{ border:'2px solid #a29bfe', borderRadius:10, padding:'4px 8px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:11, color:'#a29bfe', fontWeight:800 }}>🔄×{cmd.count}</span>
                  {cmd.children.map(child => child.type === 'note' && (
                    <motion.div key={child.id} whileTap={{ scale:0.85 }} onClick={() => handleRemove(child.id)}
                      style={{ background: NOTE_COLOR[child.note], borderRadius:6, padding:'3px 7px', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer' }}>
                      {child.note}
                    </motion.div>
                  ))}
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => {
                    const notes = level.availableNotes;
                    if (notes.length > 0) handleAddNoteToLoop(notes[0], cmd.id);
                  }}
                    style={{ background:'rgba(162,155,254,0.2)', border:'1px dashed #a29bfe', borderRadius:6, padding:'2px 6px', color:'#a29bfe', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
                    ＋音符
                  </motion.button>
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => handleRemove(cmd.id)}
                    style={{ background:'rgba(255,100,100,0.2)', border:'none', borderRadius:6, padding:'2px 6px', color:'#ff6b6b', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
                    ✕
                  </motion.button>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Note buttons */}
      <div style={{ width:'90%', maxWidth:440, margin:'4px 0' }}>
        <div style={{ fontSize:10, opacity:0.5, marginBottom:4 }}>🎵 使える音符</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {level.availableNotes.map(note => (
            <motion.button key={note} whileTap={{ scale:0.88 }}
              onClick={() => handleAddNote(note)}
              animate={playingNote === note ? { scale:[1,1.15,1] } : {}}
              style={{
                background: NOTE_COLOR[note], border:'none', borderRadius:10,
                padding:'8px 14px', color:'#fff', fontFamily:'inherit', fontWeight:800,
                fontSize:14, cursor:'pointer', boxShadow:`0 3px 10px ${NOTE_COLOR[note]}66`,
              }}>
              {note}
            </motion.button>
          ))}
          <motion.button whileTap={{ scale:0.88 }} onClick={handleAddLoop}
            style={{ background:'rgba(162,155,254,0.25)', border:'2px solid #a29bfe', borderRadius:10, padding:'8px 12px', color:'#a29bfe', fontFamily:'inherit', fontWeight:800, fontSize:13, cursor:'pointer' }}>
            🔄 ループ
          </motion.button>
        </div>
      </div>

      {/* Run / Reset / Clear */}
      <div style={{ display:'flex', gap:8, margin:'6px 0', width:'90%', maxWidth:440 }}>
        <motion.button whileTap={{ scale:0.93 }} onClick={handleRun} disabled={gameState==='running' || commands.length===0}
          style={{ flex:2, background: gameState==='running' ? '#555' : 'linear-gradient(135deg, #a29bfe, #6c5ce7)', border:'none', borderRadius:14, padding:'12px 0', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 4px 12px rgba(108,92,231,0.4)' }}>
          {gameState==='running' ? '▶ 演奏中...' : '▶ 演奏する！'}
        </motion.button>
        <motion.button whileTap={{ scale:0.93 }} onClick={handleReset}
          style={{ flex:1, background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'12px 0', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          ↺ リセット
        </motion.button>
        <motion.button whileTap={{ scale:0.93 }} onClick={() => { if(gameState!=='running') setCommands([]); }}
          style={{ flex:1, background:'rgba(255,100,100,0.1)', border:'1.5px solid rgba(255,100,100,0.3)', borderRadius:14, padding:'12px 0', color:'#ff6b6b', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          🗑 けす
        </motion.button>
      </div>

      {/* Success / Failure overlay */}
      <AnimatePresence>
        {gameState === 'success' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <motion.div initial={{ scale:0.5, y:40 }} animate={{ scale:1, y:0 }} transition={{ type:'spring', bounce:0.5 }}
              style={{ background:'linear-gradient(135deg,#6c5ce7,#a29bfe)', borderRadius:24, padding:'32px 40px', textAlign:'center', maxWidth:340 }}>
              <div style={{ fontSize:56 }}>🎉</div>
              <div style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>せいこう！</div>
              <div style={{ fontSize:32, marginBottom:16 }}>{'⭐'.repeat(stars[levelIndex]??1)}</div>
              {levelIndex < MUSIC_LEVELS.length - 1 && (
                <motion.button whileTap={{ scale:0.93 }} onClick={handleNext}
                  style={{ background:'#fff', color:'#6c5ce7', border:'none', borderRadius:14, padding:'12px 24px', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer', marginRight:8 }}>
                  つぎへ →
                </motion.button>
              )}
              <motion.button whileTap={{ scale:0.93 }} onClick={handleRetry}
                style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', borderRadius:14, padding:'12px 20px', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                もう一度
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {gameState === 'failure' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <motion.div initial={{ scale:0.5 }} animate={{ scale:1 }} transition={{ type:'spring', bounce:0.4 }}
              style={{ background:'linear-gradient(135deg,#d63031,#e17055)', borderRadius:24, padding:'32px 40px', textAlign:'center', maxWidth:340 }}>
              <div style={{ fontSize:48 }}>🎵😿</div>
              <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>音がちがうよ！</div>
              <div style={{ fontSize:12, opacity:0.85, marginBottom:16 }}>もう一度メロディーをよく聞いて！</div>
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
              style={{ background:'#302b63', borderRadius:20, padding:'24px 32px', textAlign:'center', minWidth:240 }}>
              <div style={{ fontSize:16, fontWeight:800, marginBottom:12 }}>🔄 何回くりかえす？</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:16 }}>
                <motion.button whileTap={{ scale:0.9 }} onClick={() => setLoopCount(n => Math.max(2,n-1))}
                  style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, width:36, height:36, color:'#fff', fontSize:18, cursor:'pointer', fontFamily:'inherit' }}>－</motion.button>
                <span style={{ fontSize:28, fontWeight:800 }}>{loopCount}</span>
                <motion.button whileTap={{ scale:0.9 }} onClick={() => setLoopCount(n => Math.min(8,n+1))}
                  style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, width:36, height:36, color:'#fff', fontSize:18, cursor:'pointer', fontFamily:'inherit' }}>＋</motion.button>
              </div>
              <motion.button whileTap={{ scale:0.93 }} onClick={handleConfirmLoop}
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
              style={{ background:'#302b63', borderRadius:20, padding:'20px', maxWidth:380, width:'90%', maxHeight:'80vh', overflowY:'auto' }}>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:12, textAlign:'center' }}>🗺️ レベルせんたく</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                {MUSIC_LEVELS.map((lv, i) => {
                  const unlocked = i < unlockedCount;
                  const s = stars[i] ?? 0;
                  return (
                    <motion.button key={lv.id} whileTap={unlocked ? { scale:0.9 } : {}}
                      disabled={!unlocked}
                      onClick={() => { if(unlocked){ setLevelIndex(i); setCommands([]); setGameState('idle'); setShowLevelSelect(false); } }}
                      style={{ background: i===levelIndex ? 'linear-gradient(135deg,#a29bfe,#6c5ce7)' : unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 4px', cursor: unlocked ? 'pointer' : 'default', fontFamily:'inherit', color: unlocked ? '#fff' : '#666' }}>
                      <div style={{ fontSize:13, fontWeight:800 }}>{lv.id}</div>
                      <div style={{ fontSize:9 }}>{s > 0 ? '⭐'.repeat(s) : unlocked ? '☆☆☆' : '🔒'}</div>
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
