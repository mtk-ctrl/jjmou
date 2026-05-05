export type Color = 'red' | 'blue' | 'yellow' | 'green' | 'black' | 'white' | 'pink' | 'orange';

export const COLOR_LABEL: Record<Color, string> = {
  red: 'あか',
  blue: 'あお',
  yellow: 'きいろ',
  green: 'みどり',
  black: 'くろ',
  white: 'しろ',
  pink: 'ピンク',
  orange: 'オレンジ',
};

export const COLOR_HEX: Record<Color, string> = {
  red: '#FF4757',
  blue: '#4B7BEC',
  yellow: '#F7D794',
  green: '#26de81',
  black: '#2f3542',
  white: '#f1f2f6',
  pink: '#FF6CAE',
  orange: '#FD9644',
};

export interface DotLevel {
  id: number;
  title: string;
  hint: string;
  gridSize: number;
  startRow: number;
  startCol: number;
  target: (Color | null)[][];
  availableColors: Color[];
  optimalCommands: number;
}

function makeGrid(size: number): (Color | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export const DOT_LEVELS: DotLevel[] = [
  {
    id: 1,
    title: 'よこせん',
    hint: '「みぎ」を3回ならべてみよう！',
    gridSize: 6,
    startRow: 2,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      [0,1,2,3].forEach(c => g[2][c] = 'red');
      return g;
    })(),
    availableColors: ['red'],
    optimalCommands: 4,
  },
  {
    id: 2,
    title: 'たてせん',
    hint: '「した」をくりかえそう！',
    gridSize: 6,
    startRow: 0,
    startCol: 2,
    target: (() => {
      const g = makeGrid(6);
      [0,1,2,3].forEach(r => g[r][2] = 'blue');
      return g;
    })(),
    availableColors: ['blue'],
    optimalCommands: 4,
  },
  {
    id: 3,
    title: 'Lのかたち',
    hint: '右に行ってから下に行ってみよう！',
    gridSize: 6,
    startRow: 0,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      [0,1,2].forEach(c => g[0][c] = 'green');
      [1,2,3].forEach(r => g[r][2] = 'green');
      return g;
    })(),
    availableColors: ['green'],
    optimalCommands: 6,
  },
  {
    id: 4,
    title: 'しかく',
    hint: '4辺を順番に描いてみよう！',
    gridSize: 6,
    startRow: 0,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      [0,1,2,3].forEach(c => { g[0][c] = 'red'; g[3][c] = 'red'; });
      [0,1,2,3].forEach(r => { g[r][0] = 'red'; g[r][3] = 'red'; });
      return g;
    })(),
    availableColors: ['red'],
    optimalCommands: 12,
  },
  {
    id: 5,
    title: 'ループでしましま',
    hint: 'ループを使うとしましまが作れる！',
    gridSize: 6,
    startRow: 0,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      for (let r = 0; r < 6; r++) {
        g[r][0] = r % 2 === 0 ? 'red' : 'blue';
      }
      return g;
    })(),
    availableColors: ['red', 'blue'],
    optimalCommands: 4,
  },
  {
    id: 6,
    title: 'たいかくせん',
    hint: '右と下を交互に！',
    gridSize: 6,
    startRow: 0,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      [0,1,2,3,4].forEach(i => g[i][i] = 'yellow');
      return g;
    })(),
    availableColors: ['yellow'],
    optimalCommands: 9,
  },
  {
    id: 7,
    title: '2しょくましましま',
    hint: 'ループで2色のしましまを作ろう！',
    gridSize: 6,
    startRow: 0,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          g[r][c] = (r + c) % 2 === 0 ? 'pink' : 'white';
        }
      }
      return g;
    })(),
    availableColors: ['pink', 'white'],
    optimalCommands: 8,
  },
  {
    id: 8,
    title: 'にじのせん',
    hint: '色を変えながら右へ進もう！',
    gridSize: 6,
    startRow: 2,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      const colors: Color[] = ['red','orange','yellow','green','blue','pink'];
      colors.forEach((c, i) => g[2][i] = c);
      return g;
    })(),
    availableColors: ['red','orange','yellow','green','blue','pink'],
    optimalCommands: 12,
  },
  {
    id: 9,
    title: 'くろすのかたち',
    hint: 'たてとよこに線を引こう！',
    gridSize: 7,
    startRow: 0,
    startCol: 3,
    target: (() => {
      const g = makeGrid(7);
      for (let r = 0; r < 7; r++) g[r][3] = 'red';
      for (let c = 0; c < 7; c++) g[3][c] = 'red';
      return g;
    })(),
    availableColors: ['red'],
    optimalCommands: 12,
  },
  {
    id: 10,
    title: 'はたのかたち',
    hint: 'ループで3色のしましまを作ろう！',
    gridSize: 6,
    startRow: 0,
    startCol: 0,
    target: (() => {
      const g = makeGrid(6);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const colors: Color[] = ['red','white','blue'];
          g[r][c] = colors[Math.floor(c / 2)];
        }
      }
      return g;
    })(),
    availableColors: ['red','white','blue'],
    optimalCommands: 8,
  },
];
