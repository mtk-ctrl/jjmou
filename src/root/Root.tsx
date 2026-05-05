import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import App from '../App';
import MusicApp from '../apps/music/MusicApp';
import DotArtApp from '../apps/dotart/DotArtApp';
import HiraganaApp from '../apps/hiragana/HiraganaApp';
import ShapesApp from '../apps/shapes/ShapesApp';

type AppId = 'home' | 'nyanko' | 'music' | 'dotart' | 'hiragana' | 'shapes' | 'stats';

const GLOBAL_USERS_KEY = 'pg_land_users_v1';
const GLOBAL_CURRENT_USER_KEY = 'pg_land_current_user_v1';

const AVATAR_COLORS = ['#6c5ce7','#e84393','#00b894','#e17055','#0984e3','#fdcb6e','#a29bfe','#fd79a8'];

interface GlobalUser {
  name: string;
  colorIndex: number;
  createdAt: number;
}

function loadGlobalUsers(): Record<string, GlobalUser> {
  try { const s = localStorage.getItem(GLOBAL_USERS_KEY); if (s) return JSON.parse(s); } catch { /**/ }
  return {};
}
function saveGlobalUsers(users: Record<string, GlobalUser>) {
  try { localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(users)); } catch { /**/ }
}
function loadCurrentGlobalUser(): string | null {
  return localStorage.getItem(GLOBAL_CURRENT_USER_KEY);
}
function saveCurrentGlobalUser(name: string) {
  localStorage.setItem(GLOBAL_CURRENT_USER_KEY, name);
}
function getAppStars(key: string): number {
  try { const s = localStorage.getItem(key); if (!s) return 0; const obj = JSON.parse(s) as Record<number,number>; return Object.values(obj).reduce((a,b)=>a+b,0); } catch { return 0; }
}
function getCodenyankoStars(username: string): number {
  try {
    const s = localStorage.getItem('codenyanko_users_v1');
    if (!s) return 0;
    const obj = JSON.parse(s) as Record<string, { stars: Record<number,number> }>;
    const prog = obj[username];
    if (!prog) return 0;
    return Object.values(prog.stars).reduce((a,b)=>a+b,0);
  } catch { return 0; }
}

const APP_DEFS = [
  { id:'nyanko' as AppId, emoji:'🐱', title:'コードにゃんこ', desc:'ネコをコマンドで動かしてゴールへ！', sub:'全50問　ループ・ジャンプ・攻撃', bg:'linear-gradient(135deg,#6c5ce7,#a29bfe)', border:'#a29bfe', tag:'大人気', maxStars:150 },
  { id:'music' as AppId, emoji:'🎵', title:'おんがくプログラミング', desc:'コードで音符をならべてメロディーを！', sub:'全50問　音符・ループ・童謡', bg:'linear-gradient(135deg,#0f0c29,#302b63)', border:'#a29bfe', tag:'NEW', maxStars:150 },
  { id:'dotart' as AppId, emoji:'🎨', title:'ドット絵プログラミング', desc:'コマンドでドット絵を描こう！', sub:'全50問　移動・色・ループ', bg:'linear-gradient(135deg,#1a1a2e,#0f3460)', border:'#ffd700', tag:'NEW', maxStars:150 },
  { id:'hiragana' as AppId, emoji:'✏️', title:'ひらがなかきかた', desc:'ひらがなをなぞり書きで覚えよう！', sub:'全50もじ　あいうえお〜だく音', bg:'linear-gradient(135deg,#1a0533,#6c2bbd)', border:'#a29bfe', tag:'NEW', maxStars:150 },
  { id:'shapes' as AppId, emoji:'🔷', title:'かたちパズル', desc:'かたちのシルエットをみつけよう！', sub:'全50問　きほん〜マスター', bg:'linear-gradient(135deg,#0f3460,#16213e)', border:'#FFD93D', tag:'NEW', maxStars:150 },
];

function UserSetupScreen({ onLogin }: { onLogin: (name: string, colorIdx: number) => void }) {
  const [input, setInput] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const existing = Object.entries(loadGlobalUsers());

  const handleCreate = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > 10) return;
    const users = loadGlobalUsers();
    if (!users[trimmed]) {
      users[trimmed] = { name: trimmed, colorIndex: colorIdx, createdAt: Date.now() };
      saveGlobalUsers(users);
    }
    onLogin(trimmed, users[trimmed].colorIndex);
  };

  return (
    <div style={{ minHeight:'100dvh', background:'linear-gradient(180deg,#0a0a2e 0%,#1a1060 50%,#2d1b69 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'M PLUS Rounded 1c',sans-serif", color:'#fff', padding:24 }}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{type:'spring',bounce:0.4}}
        style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:56}}>🎮</div>
        <div style={{fontSize:22,fontWeight:800,color:'#ffd700',marginTop:8}}>プログラミングランド</div>
        <div style={{fontSize:13,opacity:0.6,marginTop:4}}>きみのなまえをおしえてね！</div>
      </motion.div>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.2,type:'spring',bounce:0.3}}
        style={{background:'rgba(255,255,255,0.08)',borderRadius:24,padding:24,width:'100%',maxWidth:340,backdropFilter:'blur(10px)'}}>
        <div style={{fontSize:14,fontWeight:800,marginBottom:10,textAlign:'center'}}>🌟 あなたのカラーを選ぼう！</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:16}}>
          {AVATAR_COLORS.map((c,i)=>(
            <motion.div key={i} whileTap={{scale:0.85}} onClick={()=>setColorIdx(i)}
              style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:colorIdx===i?'3px solid #fff':'3px solid transparent',boxShadow:colorIdx===i?`0 0 12px ${c}`:'none'}}/>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:'50%',background:AVATAR_COLORS[colorIdx],flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:`0 0 12px ${AVATAR_COLORS[colorIdx]}88`}}>
            {input.trim()[0]?.toUpperCase()||'？'}
          </div>
          <input
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleCreate()}
            maxLength={10} placeholder="なまえを入力（10文字まで）"
            style={{flex:1,background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',borderRadius:12,padding:'10px 14px',color:'#fff',fontFamily:'inherit',fontSize:15,outline:'none'}}/>
        </div>
        <motion.button whileTap={{scale:0.93}} onClick={handleCreate} disabled={!input.trim()}
          style={{width:'100%',background:input.trim()?'linear-gradient(135deg,#6c5ce7,#a29bfe)':'rgba(255,255,255,0.1)',border:'none',borderRadius:14,padding:'13px 0',color:'#fff',fontFamily:'inherit',fontWeight:800,fontSize:15,cursor:input.trim()?'pointer':'default'}}>
          🚀 はじめる！
        </motion.button>
        {existing.length > 0 && (
          <div style={{marginTop:16}}>
            <div style={{fontSize:11,opacity:0.5,textAlign:'center',marginBottom:8}}>またはユーザーを選ぼう</div>
            {existing.map(([name,u])=>(
              <motion.button key={name} whileTap={{scale:0.93}} onClick={()=>onLogin(name,u.colorIndex)}
                style={{display:'flex',alignItems:'center',gap:10,width:'100%',background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'8px 12px',cursor:'pointer',fontFamily:'inherit',color:'#fff',marginBottom:6,textAlign:'left'}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:AVATAR_COLORS[u.colorIndex],display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,flexShrink:0}}>{name[0].toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{name}</div>
                  <div style={{fontSize:10,opacity:0.5}}>
                    ⭐{[
                      getCodenyankoStars(name),
                      getAppStars(`musicprog_stars_${name}_v1`),
                      getAppStars(`dotart_stars_${name}_v1`),
                      getAppStars(`hiragana_stars_${name}_v1`),
                      getAppStars(`shapes_stars_${name}_v1`),
                    ].reduce((a,b)=>a+b,0)} ごうけい
                  </div>
                </div>
                <div style={{fontSize:16,opacity:0.5}}>›</div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatsScreen({ currentUser, colorIdx, onBack }: { currentUser: string; colorIdx: number; onBack: () => void }) {
  const appStars = [
    getCodenyankoStars(currentUser),
    getAppStars(`musicprog_stars_${currentUser}_v1`),
    getAppStars(`dotart_stars_${currentUser}_v1`),
    getAppStars(`hiragana_stars_${currentUser}_v1`),
    getAppStars(`shapes_stars_${currentUser}_v1`),
  ];
  const total = appStars.reduce((a,b)=>a+b,0);
  const MAX_TOTAL = 750;

  const BADGES = [
    { label:'はじめの一歩', icon:'🌱', cond: total >= 1 },
    { label:'スタートダッシュ', icon:'🚀', cond: total >= 30 },
    { label:'ほしをあつめよう', icon:'⭐', cond: total >= 100 },
    { label:'にゃんこマスター', icon:'🐱', cond: appStars[0] >= 50 },
    { label:'おんがくにんじゃ', icon:'🎵', cond: appStars[1] >= 50 },
    { label:'えかきめいじん', icon:'🎨', cond: appStars[2] >= 50 },
    { label:'もじはかせ', icon:'✏️', cond: appStars[3] >= 50 },
    { label:'かたちおうじ', icon:'🔷', cond: appStars[4] >= 50 },
    { label:'だいかつやく', icon:'🏆', cond: total >= 300 },
    { label:'プログラマー', icon:'💻', cond: total >= 600 },
  ];

  return (
    <div style={{ minHeight:'100dvh', background:'linear-gradient(180deg,#0a0a2e 0%,#1a1060 50%,#2d1b69 100%)', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:"'M PLUS Rounded 1c',sans-serif", color:'#fff', padding:'16px', paddingBottom:24 }}>
      <div style={{width:'100%',maxWidth:420,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <motion.button whileTap={{scale:0.9}} onClick={onBack}
          style={{background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.2)',borderRadius:10,padding:'7px 12px',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          ← もどる
        </motion.button>
        <div style={{fontWeight:800,fontSize:15}}>📊 {currentUser} のきろく</div>
        <div style={{width:60}}/>
      </div>

      <div style={{width:'100%',maxWidth:420}}>
        {/* Avatar */}
        <div style={{display:'flex',alignItems:'center',gap:14,background:'rgba(255,255,255,0.07)',borderRadius:20,padding:'16px 20px',marginBottom:12}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:AVATAR_COLORS[colorIdx],display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,boxShadow:`0 0 20px ${AVATAR_COLORS[colorIdx]}88`,flexShrink:0}}>
            {currentUser[0].toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:18,fontWeight:800}}>{currentUser}</div>
            <div style={{fontSize:13,color:'#ffd700',marginTop:2}}>⭐ {total} / {MAX_TOTAL} ほし</div>
            <div style={{background:'rgba(255,255,255,0.1)',borderRadius:20,height:8,marginTop:6,overflow:'hidden',width:160}}>
              <motion.div initial={{width:0}} animate={{width:`${Math.min(total/MAX_TOTAL*100,100)}%`}} transition={{duration:1,delay:0.3}}
                style={{height:'100%',background:'linear-gradient(90deg,#ffd700,#ff9f43)',borderRadius:20}}/>
            </div>
          </div>
        </div>

        {/* Per-app progress */}
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:'12px 16px',marginBottom:12}}>
          <div style={{fontWeight:800,fontSize:13,marginBottom:10}}>🎮 アプリべつせいせき</div>
          {APP_DEFS.map((app,i)=>(
            <div key={app.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={{fontSize:18,width:24}}>{app.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,marginBottom:3}}>{app.title}</div>
                <div style={{background:'rgba(255,255,255,0.08)',borderRadius:20,height:7,overflow:'hidden'}}>
                  <motion.div initial={{width:0}} animate={{width:`${Math.min(appStars[i]/150*100,100)}%`}} transition={{duration:0.8,delay:0.2+i*0.1}}
                    style={{height:'100%',background:app.border==='#ffd700'?'linear-gradient(90deg,#ffd700,#ff9f43)':'linear-gradient(90deg,#a29bfe,#6c5ce7)',borderRadius:20}}/>
                </div>
              </div>
              <div style={{fontSize:11,fontWeight:800,color:'#ffd700',width:48,textAlign:'right'}}>⭐{appStars[i]}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:'12px 16px'}}>
          <div style={{fontWeight:800,fontSize:13,marginBottom:10}}>🏅 バッジ</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {BADGES.map((b,i)=>(
              <motion.div key={i} whileTap={b.cond?{scale:0.9}:{}}
                style={{background:b.cond?'rgba(255,215,0,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${b.cond?'rgba(255,215,0,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'6px 10px',display:'flex',alignItems:'center',gap:5,opacity:b.cond?1:0.35}}>
                <span style={{fontSize:16}}>{b.icon}</span>
                <span style={{fontSize:10,fontWeight:700,color:b.cond?'#ffd700':'#888'}}>{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Root() {
  const [currentApp, setCurrentApp] = useState<AppId>('home');
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    const saved = loadCurrentGlobalUser();
    if (!saved) return null;
    const users = loadGlobalUsers();
    return users[saved] ? saved : null;
  });
  const [userColorIdx, setUserColorIdx] = useState(() => {
    const saved = loadCurrentGlobalUser();
    if (!saved) return 0;
    const users = loadGlobalUsers();
    return users[saved]?.colorIndex ?? 0;
  });

  const handleLogin = useCallback((name: string, colorIdx: number) => {
    setCurrentUser(name);
    setUserColorIdx(colorIdx);
    saveCurrentGlobalUser(name);
  }, []);

  const handleHome = useCallback(() => setCurrentApp('home'), []);

  if (!currentUser) {
    return <UserSetupScreen onLogin={handleLogin}/>;
  }

  if (currentApp === 'nyanko')   return <App onHome={handleHome} presetUser={currentUser}/>;
  if (currentApp === 'music')    return <MusicApp onHome={handleHome} currentUser={currentUser}/>;
  if (currentApp === 'dotart')   return <DotArtApp onHome={handleHome} currentUser={currentUser}/>;
  if (currentApp === 'hiragana') return <HiraganaApp onHome={handleHome} currentUser={currentUser}/>;
  if (currentApp === 'shapes')   return <ShapesApp onHome={handleHome} currentUser={currentUser}/>;
  if (currentApp === 'stats')    return <StatsScreen currentUser={currentUser} colorIdx={userColorIdx} onBack={handleHome}/>;

  const appStars = [
    getCodenyankoStars(currentUser),
    getAppStars(`musicprog_stars_${currentUser}_v1`),
    getAppStars(`dotart_stars_${currentUser}_v1`),
    getAppStars(`hiragana_stars_${currentUser}_v1`),
    getAppStars(`shapes_stars_${currentUser}_v1`),
  ];
  const totalStars = appStars.reduce((a,b)=>a+b,0);

  return (
    <div style={{
      minHeight:'100dvh',
      background:'linear-gradient(180deg,#0a0a2e 0%,#1a1060 40%,#2d1b69 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      fontFamily:"'M PLUS Rounded 1c',sans-serif", padding:'16px', color:'#fff',
    }}>
      {['⭐','🌟','✨','💫','🌙'].map((e,i)=>(
        <motion.div key={i} animate={{y:[-12,12,-12],opacity:[0.3,0.8,0.3],rotate:[0,180,360]}}
          transition={{repeat:Infinity,duration:4+i,delay:i*0.8}}
          style={{position:'fixed',top:`${8+i*18}%`,left:i%2===0?`${5+i*3}%`:undefined,right:i%2!==0?`${5+i*3}%`:undefined,fontSize:20,pointerEvents:'none',zIndex:0}}>{e}</motion.div>
      ))}

      {/* Header */}
      <div style={{width:'100%',maxWidth:420,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,zIndex:1}}>
        <motion.button whileTap={{scale:0.9}} onClick={()=>setCurrentApp('stats')}
          style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.08)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:12,padding:'7px 12px',cursor:'pointer',fontFamily:'inherit',color:'#fff'}}>
          <div style={{width:26,height:26,borderRadius:'50%',background:AVATAR_COLORS[userColorIdx],display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800}}>{currentUser[0].toUpperCase()}</div>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:11,fontWeight:800}}>{currentUser}</div>
            <div style={{fontSize:9,color:'#ffd700'}}>⭐{totalStars}</div>
          </div>
        </motion.button>
        <motion.button whileTap={{scale:0.9}} onClick={()=>{setCurrentUser(null);localStorage.removeItem(GLOBAL_CURRENT_USER_KEY);}}
          style={{background:'rgba(255,255,255,0.07)',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'7px 10px',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:11,cursor:'pointer'}}>
          🔄 かえる
        </motion.button>
      </div>

      {/* Logo */}
      <motion.div initial={{opacity:0,y:-30}} animate={{opacity:1,y:0}} transition={{duration:0.6,type:'spring',bounce:0.4}}
        style={{textAlign:'center',marginBottom:16,zIndex:1}}>
        <motion.div animate={{rotate:[-5,5,-5]}} transition={{repeat:Infinity,duration:3,ease:'easeInOut'}}
          style={{fontSize:50,marginBottom:4}}>🎮</motion.div>
        <div style={{fontSize:24,fontWeight:800,color:'#ffd700',textShadow:'0 2px 12px rgba(255,215,0,0.5)'}}>プログラミングランド</div>
        <div style={{fontSize:12,opacity:0.6,marginTop:3}}>あそびながら、コーディングをまなぼう！</div>
      </motion.div>

      {/* Mini stats bar */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
        onClick={()=>setCurrentApp('stats')}
        style={{display:'flex',gap:8,marginBottom:12,background:'rgba(255,255,255,0.06)',borderRadius:14,padding:'8px 14px',cursor:'pointer',zIndex:1,width:'100%',maxWidth:420,justifyContent:'space-around'}}>
        {APP_DEFS.map((app,i)=>(
          <div key={app.id} style={{textAlign:'center'}}>
            <div style={{fontSize:16}}>{app.emoji}</div>
            <div style={{fontSize:9,color:'#ffd700',fontWeight:700}}>⭐{appStars[i]}</div>
          </div>
        ))}
        <div style={{textAlign:'center',borderLeft:'1px solid rgba(255,255,255,0.1)',paddingLeft:8}}>
          <div style={{fontSize:11,fontWeight:800,color:'#ffd700'}}>⭐{totalStars}</div>
          <div style={{fontSize:8,opacity:0.5}}>ごうけい</div>
        </div>
      </motion.div>

      {/* App cards */}
      <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:420,zIndex:1}}>
        {APP_DEFS.map((app,i)=>{
          const s = appStars[i];
          const pct = Math.round(s/150*100);
          return (
            <motion.button key={app.id}
              initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}}
              transition={{delay:0.15+i*0.1,type:'spring',bounce:0.3}}
              whileTap={{scale:0.97}} whileHover={{scale:1.01}}
              onClick={()=>setCurrentApp(app.id)}
              style={{background:app.bg,border:`2px solid ${app.border}44`,borderRadius:20,padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:14,fontFamily:'inherit',color:'#fff',textAlign:'left',boxShadow:`0 4px 20px rgba(0,0,0,0.4)`,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-15,right:-15,width:80,height:80,background:`${app.border}18`,borderRadius:'50%',pointerEvents:'none'}}/>
              <div style={{fontSize:40,lineHeight:1,flexShrink:0}}>{app.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{fontSize:15,fontWeight:800}}>{app.title}</span>
                  <span style={{background:app.tag==='NEW'?'#ff4757':'#ffd700',color:app.tag==='NEW'?'#fff':'#000',fontSize:9,fontWeight:800,borderRadius:6,padding:'1px 5px',flexShrink:0}}>{app.tag}</span>
                </div>
                <div style={{fontSize:11,opacity:0.8,marginBottom:4}}>{app.desc}</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{flex:1,background:'rgba(0,0,0,0.2)',borderRadius:20,height:5,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:`linear-gradient(90deg,${app.border},white)`,borderRadius:20,transition:'width 0.5s ease'}}/>
                  </div>
                  <span style={{fontSize:9,color:'#ffd700',fontWeight:700,flexShrink:0}}>⭐{s}</span>
                </div>
              </div>
              <div style={{fontSize:18,opacity:0.5,flexShrink:0}}>›</div>
            </motion.button>
          );
        })}
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}
        style={{marginTop:16,fontSize:10,opacity:0.35,textAlign:'center',zIndex:1}}>
        🐱 プログラミングランド ver 3.0
      </motion.div>
    </div>
  );
}
