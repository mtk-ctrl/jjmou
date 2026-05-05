export type Direction = 'up' | 'down' | 'left' | 'right';
export type CommandType = 'up' | 'down' | 'left' | 'right' | 'jump' | 'attack' | 'loop';

export type CellType =
  | 'empty'
  | 'wall'
  | 'hole'
  | 'water'
  | 'goal'
  | 'enemy'
  | 'bridge';

export interface Cell {
  type: CellType;
}

export interface Position {
  row: number;
  col: number;
}

export interface LoopBlock {
  id: string;
  count: number;
  commands: BaseCommand[];
}

export interface BaseCommand {
  id: string;
  type: Exclude<CommandType, 'loop'>;
}

export type Command = BaseCommand | LoopCommand;

export interface LoopCommand {
  id: string;
  type: 'loop';
  count: number;
  commands: BaseCommand[];
}

export type Theme = 'park' | 'space' | 'magic' | 'robot';

export interface Level {
  id: number;
  levelNum: number;
  questionNum: number;
  theme: Theme;
  gridSize: number;
  grid: CellType[][];
  start: Position;
  goal: Position;
  maxCommands: number;
  optimalCommands: number;
  availableCommands: CommandType[];
  hint?: string;
  enemies?: Position[];
}

export type GameState = 'idle' | 'running' | 'success' | 'failure';

export interface GameProgress {
  currentLevelIndex: number;
  stars: Record<number, number>;
  unlockedLevels: number;
}
