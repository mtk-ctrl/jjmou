import { motion, AnimatePresence } from 'framer-motion';
import { Command } from '../types';
import { CMD_CONFIG } from './CommandButton';

interface CommandQueueProps {
  commands: Command[];
  activeIndex: number | null;
  onRemove: (id: string) => void;
  onRemoveLoopCommand: (loopId: string, cmdId: string) => void;
  running: boolean;
  editingLoopId: string | null;
}

export default function CommandQueue({
  commands, activeIndex, onRemove, onRemoveLoopCommand, running, editingLoopId
}: CommandQueueProps) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      padding: '8px',
      background: 'rgba(0,0,0,0.25)',
      borderRadius: 12,
      minHeight: 60,
      alignItems: 'flex-start',
      alignContent: 'flex-start',
    }}>
      <AnimatePresence>
        {commands.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 13,
              fontWeight: 700,
              alignSelf: 'center',
              padding: '4px 8px',
            }}
          >
            ↓ コマンドをタップして追加しよう！
          </motion.div>
        )}
        {commands.map((cmd, idx) => {
          const isActive = activeIndex === idx;

          if (cmd.type === 'loop') {
            const isEditing = editingLoopId === cmd.id;
            return (
              <motion.div
                key={cmd.id}
                layout
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                style={{
                  background: isActive
                    ? 'rgba(255, 200, 0, 0.9)'
                    : isEditing
                    ? 'rgba(255, 120, 0, 0.85)'
                    : 'rgba(255, 87, 34, 0.85)',
                  border: isActive
                    ? '3px solid #ffd700'
                    : isEditing
                    ? '2px dashed #fff'
                    : '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 10,
                  padding: '4px 6px',
                  cursor: running ? 'default' : 'pointer',
                  boxShadow: isActive ? '0 0 12px #ffd700' : '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                {/* Loop header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 4,
                  }}
                  onClick={() => !running && onRemove(cmd.id)}
                >
                  <span style={{ fontSize: 16 }}>🔁</span>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>
                    ×{cmd.count}
                  </span>
                  {!running && (
                    <span style={{
                      marginLeft: 4,
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 14,
                      fontWeight: 700,
                    }}>✕</span>
                  )}
                </div>
                {/* Loop inner commands */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {cmd.commands.map((inner) => {
                    const cfg = CMD_CONFIG[inner.type];
                    return (
                      <motion.div
                        key={inner.id}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => !running && onRemoveLoopCommand(cmd.id, inner.id)}
                        style={{
                          background: cfg.bg,
                          borderRadius: 6,
                          padding: '2px 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: running ? 'default' : 'pointer',
                          fontSize: 11,
                          color: '#fff',
                          fontWeight: 700,
                          minWidth: 32,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
                        <span>{cfg.label}</span>
                      </motion.div>
                    );
                  })}
                  {cmd.commands.length === 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, padding: '2px 4px' }}>
                      {isEditing ? 'コマンドをタップ→' : '（空）'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          }

          const cfg = CMD_CONFIG[cmd.type];
          return (
            <motion.button
              key={cmd.id}
              layout
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1, opacity: 1,
                boxShadow: isActive ? '0 0 14px #ffd700' : '0 2px 6px rgba(0,0,0,0.3)',
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={() => !running && onRemove(cmd.id)}
              style={{
                background: isActive ? '#ffd700' : cfg.bg,
                color: isActive ? '#333' : '#fff',
                border: isActive ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                padding: '4px 8px',
                cursor: running ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                fontFamily: 'inherit',
                fontWeight: 700,
                minWidth: 40,
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.1s, background 0.1s',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{cfg.emoji}</span>
              <span style={{ fontSize: 10 }}>{cfg.label}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
