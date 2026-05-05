import { motion } from 'framer-motion';
import { CommandType } from '../types';

interface CommandButtonProps {
  type: CommandType;
  onClick: () => void;
  disabled?: boolean;
  size?: 'normal' | 'small';
}

export const CMD_CONFIG: Record<CommandType, { label: string; emoji: string; color: string; bg: string }> = {
  up:     { label: 'うえ',     emoji: '⬆️',  color: '#fff', bg: '#4caf50' },
  down:   { label: 'した',     emoji: '⬇️',  color: '#fff', bg: '#2196f3' },
  left:   { label: 'ひだり',   emoji: '⬅️',  color: '#fff', bg: '#ff9800' },
  right:  { label: 'みぎ',     emoji: '➡️',  color: '#fff', bg: '#9c27b0' },
  jump:   { label: 'ジャンプ', emoji: '🦘',  color: '#fff', bg: '#00bcd4' },
  attack: { label: 'こうげき', emoji: '⚔️',  color: '#fff', bg: '#f44336' },
  loop:   { label: 'ループ',   emoji: '🔁',  color: '#fff', bg: '#ff5722' },
};

export default function CommandButton({ type, onClick, disabled, size = 'normal' }: CommandButtonProps) {
  const cfg = CMD_CONFIG[type];
  const isSmall = size === 'small';

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#888' : cfg.bg,
        color: cfg.color,
        border: 'none',
        borderRadius: isSmall ? 8 : 12,
        padding: isSmall ? '4px 8px' : '8px 12px',
        fontSize: isSmall ? 13 : 16,
        fontFamily: 'inherit',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        boxShadow: disabled ? 'none' : '0 4px 0 rgba(0,0,0,0.3)',
        minWidth: isSmall ? 44 : 60,
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s',
      }}
    >
      <span style={{ fontSize: isSmall ? 16 : 22, lineHeight: 1 }}>{cfg.emoji}</span>
      <span style={{ fontSize: isSmall ? 9 : 11 }}>{cfg.label}</span>
    </motion.button>
  );
}
