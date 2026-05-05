import { Command, Position, Level, CellType } from '../types';

export interface StepResult {
  position: Position;
  action: 'move' | 'jump' | 'attack' | 'fail';
  failReason?: 'wall' | 'hole' | 'water' | 'boundary' | 'enemy';
  attackedEnemy?: Position;
}

function expandCommands(commands: Command[]): Array<{ type: string }> {
  const expanded: Array<{ type: string }> = [];
  for (const cmd of commands) {
    if (cmd.type === 'loop') {
      for (let i = 0; i < cmd.count; i++) {
        for (const inner of cmd.commands) {
          expanded.push({ type: inner.type });
        }
      }
    } else {
      expanded.push({ type: cmd.type });
    }
  }
  return expanded;
}

export function simulateCommands(
  commands: Command[],
  level: Level
): StepResult[] {
  const steps: StepResult[] = [];
  let pos: Position = { ...level.start };
  const expanded = expandCommands(commands);

  const enemies = new Set<string>(
    (level.enemies ?? []).map(e => `${e.row},${e.col}`)
  );

  const gridEnemies = new Set<string>();
  for (let r = 0; r < level.gridSize; r++) {
    for (let c = 0; c < level.gridSize; c++) {
      if (level.grid[r]?.[c] === 'enemy') {
        gridEnemies.add(`${r},${c}`);
      }
    }
  }
  gridEnemies.forEach(e => enemies.add(e));

  const walls = new Set<string>();
  const holes = new Set<string>();
  const water = new Set<string>();

  for (let r = 0; r < level.gridSize; r++) {
    for (let c = 0; c < level.gridSize; c++) {
      const cell: CellType = level.grid[r]?.[c] ?? 'empty';
      if (cell === 'wall') walls.add(`${r},${c}`);
      if (cell === 'hole') holes.add(`${r},${c}`);
      if (cell === 'water') water.add(`${r},${c}`);
    }
  }

  function getNext(p: Position, dir: string): Position {
    const d = { row: 0, col: 0 };
    if (dir === 'up') d.row = -1;
    if (dir === 'down') d.row = 1;
    if (dir === 'left') d.col = -1;
    if (dir === 'right') d.col = 1;
    return { row: p.row + d.row, col: p.col + d.col };
  }

  function inBounds(p: Position): boolean {
    return p.row >= 0 && p.row < level.gridSize && p.col >= 0 && p.col < level.gridSize;
  }

  for (const cmd of expanded) {
    if (cmd.type === 'attack') {
      const dirs = ['up', 'down', 'left', 'right'];
      let attacked: Position | undefined;
      for (const dir of dirs) {
        const next = getNext(pos, dir);
        if (enemies.has(`${next.row},${next.col}`)) {
          enemies.delete(`${next.row},${next.col}`);
          attacked = next;
          break;
        }
      }
      steps.push({ position: { ...pos }, action: 'attack', attackedEnemy: attacked });
      continue;
    }

    if (cmd.type === 'jump') {
      continue;
    }

    const next = getNext(pos, cmd.type);

    if (!inBounds(next)) {
      steps.push({ position: { ...pos }, action: 'fail', failReason: 'boundary' });
      break;
    }

    const key = `${next.row},${next.col}`;

    if (walls.has(key)) {
      steps.push({ position: { ...pos }, action: 'fail', failReason: 'wall' });
      break;
    }

    if (holes.has(key)) {
      steps.push({ position: next, action: 'fail', failReason: 'hole' });
      pos = next;
      break;
    }

    if (water.has(key)) {
      steps.push({ position: next, action: 'fail', failReason: 'water' });
      pos = next;
      break;
    }

    if (enemies.has(key)) {
      steps.push({ position: next, action: 'fail', failReason: 'enemy' });
      pos = next;
      break;
    }

    pos = next;
    steps.push({ position: { ...pos }, action: 'move' });
  }

  return steps;
}

export function calculateStars(commandCount: number, optimal: number): number {
  if (commandCount <= optimal) return 3;
  if (commandCount <= optimal + 3) return 2;
  return 1;
}

export function countExpandedCommands(commands: Command[]): number {
  return expandCommands(commands).length;
}
