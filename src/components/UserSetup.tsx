import { useState } from 'react';
import { motion } from 'framer-motion';

interface UserSetupProps {
  onComplete: (username: string) => void;
  existingUsers: string[];
}

export default function UserSetup({ onComplete, existingUsers }: UserSetupProps) {
  const [mode, setMode] = useState<'choose' | 'new' | 'select'>('choose');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNewUser = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('なまえをいれてね！'); return; }
    if (trimmed.length > 10) { setError('10もじいないでね！'); return; }
    if (existingUsers.includes(trimmed)) { setError('そのなまえはつかわれてるよ！'); return; }
    onComplete(trimmed);
  };

  const AVATARS = ['🐱','🐶','🐰','🐼','🦊','🐸','🐧','🦁','🐨','🐯'];
  const [avatar, setAvatar] = useState('🐱');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #1a0533 0%, #4a0e8f 50%, #87CEEB 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: 24, gap: 20,
      }}
    >
      {/* Floating decorations */}
      {['🌟','💫','✨','⭐','🌙'].map((s, i) => (
        <motion.div key={i}
          animate={{ y: [-15, 15, -15], rotate: [0, 360], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.8, delay: i * 0.4 }}
          style={{ position: 'fixed', top: `${8 + i * 18}%`, left: `${3 + i * 5}%`, fontSize: 22, pointerEvents: 'none' }}
        >{s}</motion.div>
      ))}

      {/* Title */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 64, lineHeight: 1 }}>🐱</div>
        <div style={{ color: '#ffd700', fontSize: 28, fontWeight: 800, textShadow: '0 0 20px #ffd700', marginTop: 8 }}>
          コードにゃんこ
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700, marginTop: 4 }}>
          プログラミングぼうけん！
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '2px solid rgba(255,255,255,0.25)',
          borderRadius: 20, padding: '24px 20px',
          width: '100%', maxWidth: 340,
          display: 'flex', flexDirection: 'column', gap: 16,
          backdropFilter: 'blur(10px)',
        }}
      >
        {mode === 'choose' && (
          <>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, textAlign: 'center' }}>
              はじめよう！
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setMode('new')}
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                border: 'none', borderRadius: 14, padding: '14px',
                color: '#333', fontSize: 16, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(255,215,0,0.4)',
              }}
            >
              ✨ あたらしくはじめる
            </motion.button>
            {existingUsers.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setMode('select')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 14, padding: '14px',
                  color: '#fff', fontSize: 16, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                👤 つづきからやる
              </motion.button>
            )}
          </>
        )}

        {mode === 'new' && (
          <>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, textAlign: 'center' }}>
              きみのなまえは？
            </div>

            {/* Avatar picker */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {AVATARS.map(a => (
                <motion.button
                  key={a}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setAvatar(a)}
                  style={{
                    fontSize: 28, background: avatar === a ? 'rgba(255,215,0,0.3)' : 'transparent',
                    border: avatar === a ? '2px solid #ffd700' : '2px solid transparent',
                    borderRadius: 10, padding: 4, cursor: 'pointer',
                  }}
                >{a}</motion.button>
              ))}
            </div>

            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleNewUser()}
              placeholder="なまえをいれてね（10もじまで）"
              maxLength={10}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 16, fontWeight: 700,
                fontFamily: 'inherit', outline: 'none', width: '100%',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <div style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMode('choose')}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.12)',
                  border: '2px solid rgba(255,255,255,0.25)', borderRadius: 12,
                  padding: '12px', color: '#fff', fontSize: 14,
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >← もどる</motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { onComplete(`${avatar}${name.trim()}`); }}
                style={{
                  flex: 2,
                  background: name.trim() ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(100,100,100,0.3)',
                  border: 'none', borderRadius: 12, padding: '12px',
                  color: '#fff', fontSize: 15, fontWeight: 800,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  boxShadow: name.trim() ? '0 4px 12px rgba(76,175,80,0.4)' : 'none',
                }}
              >
                {avatar} ぼうけん開始！
              </motion.button>
            </div>
          </>
        )}

        {mode === 'select' && (
          <>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, textAlign: 'center' }}>
              だれがやる？
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
              {existingUsers.map(u => (
                <motion.button
                  key={u}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(u)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderRadius: 12, padding: '12px 16px',
                    color: '#fff', fontSize: 16, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  {u}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMode('choose')}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.25)', borderRadius: 12,
                padding: '10px', color: '#fff', fontSize: 14,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >← もどる</motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
