import { useState } from 'react';
import { motion } from 'framer-motion';
import App from '../App';
import MusicApp from '../apps/music/MusicApp';
import DotArtApp from '../apps/dotart/DotArtApp';

type AppId = 'home' | 'nyanko' | 'music' | 'dotart';

const APPS = [
  {
    id: 'nyanko' as AppId,
    emoji: '🐱',
    title: 'コードにゃんこ',
    desc: 'ネコをコマンドで動かしてゴールへ！',
    sub: '全50問　ループ・ジャンプ・攻撃',
    bg: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    border: '#a29bfe',
    levels: 100,
    tag: '大人気',
  },
  {
    id: 'music' as AppId,
    emoji: '🎵',
    title: 'おんがくプログラミング',
    desc: 'コードで音符をならべてメロディーを！',
    sub: '全10問　音符・ループ・童謡',
    bg: 'linear-gradient(135deg, #0f0c29, #302b63)',
    border: '#a29bfe',
    levels: 10,
    tag: 'NEW',
  },
  {
    id: 'dotart' as AppId,
    emoji: '🎨',
    title: 'ドット絵プログラミング',
    desc: 'コマンドでドット絵を描こう！',
    sub: '全10問　移動・色・ループ',
    bg: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
    border: '#ffd700',
    levels: 10,
    tag: 'NEW',
  },
];

export default function Root() {
  const [currentApp, setCurrentApp] = useState<AppId>('home');

  if (currentApp === 'nyanko') return <App onHome={() => setCurrentApp('home')} />;
  if (currentApp === 'music') return <MusicApp onHome={() => setCurrentApp('home')} />;
  if (currentApp === 'dotart') return <DotArtApp onHome={() => setCurrentApp('home')} />;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1060 40%, #2d1b69 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'M PLUS Rounded 1c', sans-serif",
      padding: '24px 16px',
      color: '#fff',
    }}>
      {/* Floating stars */}
      {['⭐','🌟','✨','💫','🌙'].map((e, i) => (
        <motion.div key={i}
          animate={{ y: [-12, 12, -12], opacity: [0.3, 0.8, 0.3], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.8 }}
          style={{ position: 'fixed', top: `${8 + i * 18}%`, left: i % 2 === 0 ? `${5 + i * 3}%` : undefined, right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined, fontSize: 20, pointerEvents: 'none', zIndex: 0 }}
        >{e}</motion.div>
      ))}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        style={{ textAlign: 'center', marginBottom: 32, zIndex: 1 }}
      >
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 56, marginBottom: 8 }}
        >🎮</motion.div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#ffd700', textShadow: '0 2px 12px rgba(255,215,0,0.5)' }}>
          プログラミングランド
        </div>
        <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>
          あそびながら、コーディングをまなぼう！
        </div>
      </motion.div>

      {/* App cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 400, zIndex: 1 }}>
        {APPS.map((app, i) => (
          <motion.button
            key={app.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, type: 'spring', bounce: 0.3 }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setCurrentApp(app.id)}
            style={{
              background: app.bg,
              border: `2px solid ${app.border}44`,
              borderRadius: 20,
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontFamily: 'inherit',
              color: '#fff',
              textAlign: 'left',
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${app.border}22`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: `${app.border}18`, borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ fontSize: 44, lineHeight: 1 }}>{app.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{app.title}</span>
                <span style={{ background: app.tag === 'NEW' ? '#ff4757' : '#ffd700', color: app.tag === 'NEW' ? '#fff' : '#000', fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '1px 6px' }}>{app.tag}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>{app.desc}</div>
              <div style={{ fontSize: 10, opacity: 0.55 }}>{app.sub}</div>
            </div>
            <div style={{ fontSize: 20, opacity: 0.6 }}>›</div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ marginTop: 24, fontSize: 11, opacity: 0.4, textAlign: 'center', zIndex: 1 }}
      >
        🐱 コードにゃんこシリーズ　ver 2.0
      </motion.div>
    </div>
  );
}
