import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import App from '../App';
import MusicApp from '../apps/music/MusicApp';
import DotArtApp from '../apps/dotart/DotArtApp';
import HiraganaApp from '../apps/hiragana/HiraganaApp';
import ShapesApp from '../apps/shapes/ShapesApp';

type AppId = 'home' | 'nyanko' | 'music' | 'dotart' | 'hiragana' | 'shapes' | 'stats';

// ── 4スロット式ユーザー管理 ──────────────────────────────
const SLOTS_KEY = 'pg_land_slots_v2';
const CURRENT_SLOT_KEY = 'pg_land_current_slot_v2';

// 4つのどうぶつアバター（子供がすぐわかる）
const SLOT_ANIMALS = [
  { emoji: '🐱', color: '#6c5ce7', name: 'ネコ' },
  { emoji: '🐶', color: '#e17055', name: 'イヌ' },
  { emoji: '🐸', color: '#00b894', name: 'カエル' },
  { emoji: '🐰', color: '#fd79a8', name: 'ウサギ' },
];

interface Slot {
  name: string;      // 子供の名前（空文字 = スロット未使用）
  animalIdx: number; // 0-3
}

type Slots = [Slot, Slot, Slot, Slot];

const EMPTY_SLOT: Slot = { name: '', animalIdx: 0 };

function loadSlots(): Slots {
  try {
    const s = localStorage.getItem(SLOTS_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Slots;
      if (Array.isArray(parsed) && parsed.length === 4) return parsed;
    }
  } catch { /**/ }
  return [
    { name: '', animalIdx: 0 },
    { name: '', animalIdx: 1 },
    { name: '', animalIdx: 2 },
    { name: '', animalIdx: 3 },
  ];
}

function saveSlots(slots: Slots) {
  try { localStorage.setItem(SLOTS_KEY, JSON.stringify(slots)); } catch { /**/ }
}

function loadCurrentSlot(): number | null {
  const v = localStorage.getItem(CURRENT_SLOT_KEY);
  if (v === null) return null;
  const n = Number(v);
  return n >= 0 && n < 4 ? n : null;
}

function saveCurrentSlot(idx: number) {
  localStorage.setItem(CURRENT_SLOT_KEY, String(idx));
}

// ── アプリの星を取得 ────────────────────────────────────
function getAppStars(key: string): number {
  try {
    const s = localStorage.getItem(key);
    if (!s) return 0;
    const obj = JSON.parse(s) as Record<number, number>;
    return Object.values(obj).reduce((a, b) => a + b, 0);
  } catch { return 0; }
}

function getNyankoStars(username: string): number {
  try {
    const s = localStorage.getItem('codenyanko_users_v1');
    if (!s) return 0;
    const obj = JSON.parse(s) as Record<string, { stars: Record<number, number> }>;
    const prog = obj[username];
    if (!prog) return 0;
    return Object.values(prog.stars).reduce((a, b) => a + b, 0);
  } catch { return 0; }
}

function getUserTotalStars(name: string): number {
  if (!name) return 0;
  return (
    getNyankoStars(name) +
    getAppStars(`musicprog_stars_${name}_v1`) +
    getAppStars(`dotart_stars_${name}_v1`) +
    getAppStars(`hiragana_stars_${name}_v1`) +
    getAppStars(`shapes_stars_${name}_v1`)
  );
}

const APP_DEFS = [
  { id: 'nyanko' as AppId, emoji: '🐱', title: 'コードにゃんこ', desc: 'ネコをコマンドで動かしてゴールへ！', bg: 'linear-gradient(135deg,#6c5ce7,#a29bfe)', border: '#a29bfe', tag: '大人気' },
  { id: 'music' as AppId, emoji: '🎵', title: 'おんがくプログラミング', desc: 'コードで音符をならべてメロディーを！', bg: 'linear-gradient(135deg,#0f0c29,#302b63)', border: '#a29bfe', tag: 'NEW' },
  { id: 'dotart' as AppId, emoji: '🎨', title: 'ドット絵プログラミング', desc: 'コマンドでドット絵を描こう！', bg: 'linear-gradient(135deg,#1a1a2e,#0f3460)', border: '#ffd700', tag: 'NEW' },
  { id: 'hiragana' as AppId, emoji: '✏️', title: 'ひらがなかきかた', desc: 'ひらがなをなぞり書きで覚えよう！', bg: 'linear-gradient(135deg,#1a0533,#6c2bbd)', border: '#a29bfe', tag: 'NEW' },
  { id: 'shapes' as AppId, emoji: '🔷', title: 'かたちパズル', desc: 'かたちのシルエットをみつけよう！', bg: 'linear-gradient(135deg,#0f3460,#16213e)', border: '#FFD93D', tag: 'NEW' },
];

// ── スロット選択画面（メイン） ─────────────────────────
function SlotSelectScreen({ slots, onSelect, onEdit }: {
  slots: Slots;
  onSelect: (idx: number) => void;
  onEdit: (idx: number) => void;
}) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg,#0a0a2e 0%,#1a1060 50%,#2d1b69 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'M PLUS Rounded 1c',sans-serif", color: '#fff', padding: 24,
    }}>
      {/* 浮かぶ星 */}
      {['⭐','🌟','✨','💫','🌙'].map((e, i) => (
        <motion.div key={i} animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.7 }}
          style={{ position: 'fixed', top: `${8 + i * 17}%`, left: i % 2 === 0 ? `${6 + i * 3}%` : undefined, right: i % 2 !== 0 ? `${6 + i * 3}%` : undefined, fontSize: 22, pointerEvents: 'none', zIndex: 0 }}
        >{e}</motion.div>
      ))}

      {/* ロゴ */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.4 }}
        style={{ textAlign: 'center', marginBottom: 32, zIndex: 1 }}>
        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 60, marginBottom: 8 }}>🎮</motion.div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#ffd700', textShadow: '0 2px 12px rgba(255,215,0,0.5)' }}>
          プログラミングランド
        </div>
        <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>だれがあそぶ？ えらんでね！</div>
      </motion.div>

      {/* 4つのスロットカード */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, width: '100%', maxWidth: 360, zIndex: 1 }}>
        {slots.map((slot, i) => {
          const animal = SLOT_ANIMALS[slot.animalIdx ?? i];
          const filled = !!slot.name;
          const totalStars = getUserTotalStars(slot.name);

          return (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', bounce: 0.4 }}>
              {/* メインカード（タップで選択） */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => filled ? onSelect(i) : onEdit(i)}
                style={{
                  width: '100%',
                  background: filled
                    ? `linear-gradient(135deg, ${animal.color}cc, ${animal.color}88)`
                    : 'rgba(255,255,255,0.06)',
                  border: filled
                    ? `2.5px solid ${animal.color}`
                    : '2.5px dashed rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  padding: '20px 12px 14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: filled ? `0 6px 24px ${animal.color}55` : 'none',
                  position: 'relative',
                }}>

                {/* 編集ボタン（登録済みスロットのみ） */}
                {filled && (
                  <motion.div whileTap={{ scale: 0.8 }}
                    onClick={e => { e.stopPropagation(); onEdit(i); }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
                      width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, cursor: 'pointer',
                    }}>⚙️</motion.div>
                )}

                {/* アニマルアイコン */}
                <motion.div
                  animate={filled ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                  style={{ fontSize: 52, lineHeight: 1 }}>
                  {filled ? animal.emoji : '➕'}
                </motion.div>

                {/* 名前と星 */}
                {filled ? (
                  <>
                    <div style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {slot.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 700 }}>
                      ⭐ {totalStars}
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.2)', borderRadius: 20, height: 6, width: '80%', overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${Math.min(totalStars / 750 * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        style={{ height: '100%', background: '#ffd700', borderRadius: 20 }} />
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.5, textAlign: 'center' }}>
                    タップして<br />はじめよう！
                  </div>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ marginTop: 20, fontSize: 11, opacity: 0.35, textAlign: 'center', zIndex: 1 }}>
        🐱 プログラミングランド ver 3.0　最大4人で遊べます
      </motion.div>
    </div>
  );
}

// ── スロット編集画面（名前入力 / どうぶつ選択） ─────────────
function SlotEditScreen({ slotIdx, slot, onSave, onDelete, onCancel }: {
  slotIdx: number;
  slot: Slot;
  onSave: (name: string, animalIdx: number) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(slot.name || '');
  const [animalIdx, setAnimalIdx] = useState(slot.animalIdx ?? slotIdx);
  const animal = SLOT_ANIMALS[animalIdx];
  const isNew = !slot.name;

  return (
    <div style={{
      minHeight: '100dvh',
      background: `linear-gradient(180deg,${animal.color}33 0%,#0a0a2e 60%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'M PLUS Rounded 1c',sans-serif", color: '#fff', padding: 24,
    }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.4 }}>

        {/* 選択中のアニマル */}
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ textAlign: 'center', fontSize: 80, marginBottom: 12 }}>
          {animal.emoji}
        </motion.div>

        {/* どうぶつ選択 */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 10 }}>どうぶつをえらんでね</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {SLOT_ANIMALS.map((a, i) => (
              <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => setAnimalIdx(i)}
                style={{
                  fontSize: 36,
                  background: animalIdx === i ? `${a.color}44` : 'rgba(255,255,255,0.06)',
                  border: animalIdx === i ? `3px solid ${a.color}` : '3px solid transparent',
                  borderRadius: 16, padding: '8px 10px', cursor: 'pointer',
                  boxShadow: animalIdx === i ? `0 0 16px ${a.color}88` : 'none',
                }}>
                {a.emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 名前入力 */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px 24px',
          width: '100%', maxWidth: 320,
        }}>
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 10, textAlign: 'center' }}>
            なまえをいれてね（10文字まで）
          </div>
          <input
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim(), animalIdx)}
            maxLength={10}
            placeholder={`${animal.name}のなまえ…`}
            autoFocus
            style={{
              width: '100%', background: 'rgba(255,255,255,0.12)',
              border: `2px solid ${animal.color}88`, borderRadius: 14,
              padding: '12px 16px', color: '#fff', fontFamily: 'inherit',
              fontSize: 18, fontWeight: 700, outline: 'none',
              boxSizing: 'border-box', textAlign: 'center',
            }}
          />

          <motion.button whileTap={{ scale: 0.93 }}
            onClick={() => name.trim() && onSave(name.trim(), animalIdx)}
            disabled={!name.trim()}
            style={{
              width: '100%', marginTop: 14,
              background: name.trim() ? animal.color : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 14, padding: '13px 0',
              color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: 16,
              cursor: name.trim() ? 'pointer' : 'default',
              boxShadow: name.trim() ? `0 4px 16px ${animal.color}66` : 'none',
            }}>
            🚀 {isNew ? 'はじめる！' : 'ほぞんする！'}
          </motion.button>
        </div>

        {/* ボタン群 */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.93 }} onClick={onCancel}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 20px', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            ← もどる
          </motion.button>
          {!isNew && (
            <motion.button whileTap={{ scale: 0.93 }} onClick={onDelete}
              style={{ background: 'rgba(255,71,87,0.15)', border: '1.5px solid #ff4757', borderRadius: 12, padding: '10px 20px', color: '#ff4757', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              🗑 けす
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── 統計画面 ────────────────────────────────────────────
function StatsScreen({ slot, onBack }: { slot: Slot; onBack: () => void }) {
  const animal = SLOT_ANIMALS[slot.animalIdx ?? 0];
  const name = slot.name;

  const appStars = [
    getNyankoStars(name),
    getAppStars(`musicprog_stars_${name}_v1`),
    getAppStars(`dotart_stars_${name}_v1`),
    getAppStars(`hiragana_stars_${name}_v1`),
    getAppStars(`shapes_stars_${name}_v1`),
  ];
  const total = appStars.reduce((a, b) => a + b, 0);

  const BADGES = [
    { label: 'はじめの一歩', icon: '🌱', cond: total >= 1 },
    { label: 'スタートダッシュ', icon: '🚀', cond: total >= 30 },
    { label: 'ほしあつめ', icon: '⭐', cond: total >= 100 },
    { label: 'にゃんこめいじん', icon: '🐱', cond: appStars[0] >= 50 },
    { label: 'おんがくにんじゃ', icon: '🎵', cond: appStars[1] >= 50 },
    { label: 'えかきめいじん', icon: '🎨', cond: appStars[2] >= 50 },
    { label: 'もじはかせ', icon: '✏️', cond: appStars[3] >= 50 },
    { label: 'かたちおうじ', icon: '🔷', cond: appStars[4] >= 50 },
    { label: 'だいかつやく', icon: '🏆', cond: total >= 300 },
    { label: 'プログラマー', icon: '💻', cond: total >= 600 },
  ];

  return (
    <div style={{
      minHeight: '100dvh',
      background: `linear-gradient(180deg,${animal.color}22 0%,#0a0a2e 60%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'M PLUS Rounded 1c',sans-serif", color: '#fff', padding: '16px', paddingBottom: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '7px 12px', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          ← もどる
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: 15 }}>📊 {name} のきろく</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* アバター */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ fontSize: 52, flexShrink: 0 }}>{animal.emoji}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
            <div style={{ fontSize: 13, color: '#ffd700', marginTop: 2 }}>⭐ {total} / 750 ほし</div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, height: 8, marginTop: 6, overflow: 'hidden', width: 160 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(total / 750 * 100, 100)}%` }} transition={{ duration: 1, delay: 0.3 }}
                style={{ height: '100%', background: 'linear-gradient(90deg,#ffd700,#ff9f43)', borderRadius: 20 }} />
            </div>
          </div>
        </div>

        {/* アプリべつせいせき */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 16px', marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>🎮 アプリべつせいせき</div>
          {APP_DEFS.map((app, i) => (
            <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 18, width: 24 }}>{app.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{app.title}</div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, height: 7, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(appStars[i] / 150 * 100, 100)}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    style={{ height: '100%', background: app.border === '#ffd700' ? 'linear-gradient(90deg,#ffd700,#ff9f43)' : 'linear-gradient(90deg,#a29bfe,#6c5ce7)', borderRadius: 20 }} />
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ffd700', width: 48, textAlign: 'right' }}>⭐{appStars[i]}</div>
            </div>
          ))}
        </div>

        {/* バッジ */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>🏅 バッジ</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BADGES.map((b, i) => (
              <motion.div key={i}
                style={{
                  background: b.cond ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${b.cond ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5,
                  opacity: b.cond ? 1 : 0.35,
                }}>
                <span style={{ fontSize: 16 }}>{b.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: b.cond ? '#ffd700' : '#888' }}>{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ホーム画面（アプリ一覧） ────────────────────────────
function HomeScreen({ slot, slotIdx, onSelectApp, onStats, onSwitchUser }: {
  slot: Slot;
  slotIdx: number;
  onSelectApp: (id: AppId) => void;
  onStats: () => void;
  onSwitchUser: () => void;
}) {
  const animal = SLOT_ANIMALS[slot.animalIdx ?? slotIdx];
  const appStars = [
    getNyankoStars(slot.name),
    getAppStars(`musicprog_stars_${slot.name}_v1`),
    getAppStars(`dotart_stars_${slot.name}_v1`),
    getAppStars(`hiragana_stars_${slot.name}_v1`),
    getAppStars(`shapes_stars_${slot.name}_v1`),
  ];
  const total = appStars.reduce((a, b) => a + b, 0);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg,#0a0a2e 0%,#1a1060 40%,#2d1b69 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'M PLUS Rounded 1c',sans-serif", padding: '12px 16px', color: '#fff',
    }}>
      {['⭐', '🌟', '✨', '💫', '🌙'].map((e, i) => (
        <motion.div key={i} animate={{ y: [-12, 12, -12], opacity: [0.3, 0.8, 0.3], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.8 }}
          style={{ position: 'fixed', top: `${8 + i * 18}%`, left: i % 2 === 0 ? `${5 + i * 3}%` : undefined, right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined, fontSize: 20, pointerEvents: 'none', zIndex: 0 }} >{e}</motion.div>
      ))}

      {/* ヘッダー */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, zIndex: 1 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onStats}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${animal.color}22`, border: `1.5px solid ${animal.color}55`, borderRadius: 14, padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit', color: '#fff' }}>
          <div style={{ fontSize: 28 }}>{animal.emoji}</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>{slot.name}</div>
            <div style={{ fontSize: 10, color: '#ffd700' }}>⭐{total}</div>
          </div>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onSwitchUser}
          style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 12px', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
          🔄 かえる
        </motion.button>
      </div>

      {/* ロゴ */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }}
        style={{ textAlign: 'center', marginBottom: 12, zIndex: 1 }}>
        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 44, marginBottom: 2 }}>🎮</motion.div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#ffd700', textShadow: '0 2px 12px rgba(255,215,0,0.5)' }}>プログラミングランド</div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>あそびながら、コーディングをまなぼう！</div>
      </motion.div>

      {/* ミニ星サマリー */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        onClick={onStats}
        style={{ display: 'flex', gap: 6, marginBottom: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '8px 12px', cursor: 'pointer', zIndex: 1, width: '100%', maxWidth: 420, justifyContent: 'space-around' }}>
        {APP_DEFS.map((app, i) => (
          <div key={app.id} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15 }}>{app.emoji}</div>
            <div style={{ fontSize: 9, color: '#ffd700', fontWeight: 700 }}>⭐{appStars[i]}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ffd700' }}>⭐{total}</div>
          <div style={{ fontSize: 8, opacity: 0.5 }}>ごうけい</div>
        </div>
      </motion.div>

      {/* アプリカード */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420, zIndex: 1 }}>
        {APP_DEFS.map((app, i) => {
          const s = appStars[i];
          const pct = Math.min(Math.round(s / 150 * 100), 100);
          return (
            <motion.button key={app.id}
              initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring', bounce: 0.3 }}
              whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
              onClick={() => onSelectApp(app.id)}
              style={{
                background: app.bg, border: `2px solid ${app.border}44`,
                borderRadius: 20, padding: '13px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                fontFamily: 'inherit', color: '#fff', textAlign: 'left',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
              }}>
              <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, background: `${app.border}18`, borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>{app.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{app.title}</span>
                  <span style={{ background: app.tag === 'NEW' ? '#ff4757' : '#ffd700', color: app.tag === 'NEW' ? '#fff' : '#000', fontSize: 9, fontWeight: 800, borderRadius: 6, padding: '1px 5px', flexShrink: 0 }}>{app.tag}</span>
                </div>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>{app.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 20, height: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${app.border},white)`, borderRadius: 20, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 9, color: '#ffd700', fontWeight: 700, flexShrink: 0 }}>⭐{s}/150</span>
                </div>
              </div>
              <div style={{ fontSize: 18, opacity: 0.5, flexShrink: 0 }}>›</div>
            </motion.button>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        style={{ marginTop: 14, fontSize: 10, opacity: 0.3, textAlign: 'center', zIndex: 1 }}>
        🐱 プログラミングランド ver 3.0　最大4人で遊べます
      </motion.div>
    </div>
  );
}

// ── メインRoot ──────────────────────────────────────────
type RootView = 'slot_select' | 'slot_edit' | 'home' | 'stats' | 'app';

export default function Root() {
  const [slots, setSlots] = useState<Slots>(() => loadSlots());
  const [currentSlot, setCurrentSlot] = useState<number | null>(() => loadCurrentSlot());
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [currentApp, setCurrentApp] = useState<AppId>('home');
  const [view, setView] = useState<RootView>(() => {
    const s = loadCurrentSlot();
    if (s === null) return 'slot_select';
    const loaded = loadSlots();
    return loaded[s]?.name ? 'home' : 'slot_select';
  });

  const currentSlotData: Slot = currentSlot !== null ? (slots[currentSlot] ?? EMPTY_SLOT) : EMPTY_SLOT;
  const currentUser = currentSlotData.name;

  const handleSelectSlot = useCallback((idx: number) => {
    setCurrentSlot(idx);
    saveCurrentSlot(idx);
    setCurrentApp('home');
    setView('home');
  }, []);

  const handleEditSlot = useCallback((idx: number) => {
    setEditingSlot(idx);
    setView('slot_edit');
  }, []);

  const handleSaveSlot = useCallback((name: string, animalIdx: number) => {
    const idx = editingSlot!;
    const newSlots = [...slots] as Slots;
    newSlots[idx] = { name, animalIdx };
    setSlots(newSlots);
    saveSlots(newSlots);
    setCurrentSlot(idx);
    saveCurrentSlot(idx);
    setCurrentApp('home');
    setView('home');
    setEditingSlot(null);
  }, [slots, editingSlot]);

  const handleDeleteSlot = useCallback(() => {
    const idx = editingSlot!;
    const newSlots = [...slots] as Slots;
    newSlots[idx] = { name: '', animalIdx: idx };
    setSlots(newSlots);
    saveSlots(newSlots);
    if (currentSlot === idx) {
      setCurrentSlot(null);
      localStorage.removeItem(CURRENT_SLOT_KEY);
    }
    setView('slot_select');
    setEditingSlot(null);
  }, [slots, editingSlot, currentSlot]);

  const handleSwitchUser = useCallback(() => {
    setCurrentSlot(null);
    localStorage.removeItem(CURRENT_SLOT_KEY);
    setView('slot_select');
    setCurrentApp('home');
  }, []);

  const handleHome = useCallback(() => {
    setCurrentApp('home');
    setView('home');
  }, []);

  // ── アプリ描画 ──
  if (view === 'app' && currentApp !== 'home') {
    if (currentApp === 'nyanko')   return <App onHome={handleHome} presetUser={currentUser} />;
    if (currentApp === 'music')    return <MusicApp onHome={handleHome} currentUser={currentUser} />;
    if (currentApp === 'dotart')   return <DotArtApp onHome={handleHome} currentUser={currentUser} />;
    if (currentApp === 'hiragana') return <HiraganaApp onHome={handleHome} currentUser={currentUser} />;
    if (currentApp === 'shapes')   return <ShapesApp onHome={handleHome} currentUser={currentUser} />;
  }

  if (view === 'stats' && currentSlot !== null) {
    return <StatsScreen slot={currentSlotData} onBack={handleHome} />;
  }

  if (view === 'slot_edit' && editingSlot !== null) {
    return (
      <SlotEditScreen
        slotIdx={editingSlot}
        slot={slots[editingSlot]}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
        onCancel={() => { setView(currentSlot !== null ? 'home' : 'slot_select'); setEditingSlot(null); }}
      />
    );
  }

  if (view === 'home' && currentSlot !== null && currentSlotData.name) {
    return (
      <HomeScreen
        slot={currentSlotData}
        slotIdx={currentSlot}
        onSelectApp={(id) => { setCurrentApp(id); setView('app'); }}
        onStats={() => setView('stats')}
        onSwitchUser={handleSwitchUser}
      />
    );
  }

  // デフォルト: スロット選択
  return (
    <AnimatePresence mode="wait">
      <motion.div key="slot-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <SlotSelectScreen
          slots={slots}
          onSelect={handleSelectSlot}
          onEdit={handleEditSlot}
        />
      </motion.div>
    </AnimatePresence>
  );
}
