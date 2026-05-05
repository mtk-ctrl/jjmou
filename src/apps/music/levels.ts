export type Note = 'ド' | 'レ' | 'ミ' | 'ファ' | 'ソ' | 'ラ' | 'シ' | 'ド↑';

export const NOTE_FREQ: Record<Note, number> = {
  'ド':  261.63,
  'レ':  293.66,
  'ミ':  329.63,
  'ファ': 349.23,
  'ソ':  392.00,
  'ラ':  440.00,
  'シ':  493.88,
  'ド↑': 523.25,
};

export const NOTE_COLOR: Record<Note, string> = {
  'ド':  '#FF6B6B',
  'レ':  '#FF9F43',
  'ミ':  '#FFD93D',
  'ファ': '#6BCB77',
  'ソ':  '#4D96FF',
  'ラ':  '#9B59B6',
  'シ':  '#FF6CAE',
  'ド↑': '#FF4757',
};

export interface MusicLevel {
  id: number;
  title: string;
  hint: string;
  target: Note[];
  availableNotes: Note[];
  optimalCommands: number;
  bpm: number;
}

export const MUSIC_LEVELS: MusicLevel[] = [
  {
    id: 1,
    title: 'ドの音',
    hint: '「ド」を4回ならそう！',
    target: ['ド','ド','ド','ド'],
    availableNotes: ['ド'],
    optimalCommands: 4,
    bpm: 100,
  },
  {
    id: 2,
    title: 'ドレミ',
    hint: '「ド」「レ」「ミ」の順番でならそう！',
    target: ['ド','レ','ミ'],
    availableNotes: ['ド','レ','ミ'],
    optimalCommands: 3,
    bpm: 110,
  },
  {
    id: 3,
    title: 'ミレド',
    hint: '下がっていく音ならしてみよう',
    target: ['ミ','レ','ド'],
    availableNotes: ['ド','レ','ミ'],
    optimalCommands: 3,
    bpm: 110,
  },
  {
    id: 4,
    title: 'ドレミファ',
    hint: '4つの音を順番に！',
    target: ['ド','レ','ミ','ファ'],
    availableNotes: ['ド','レ','ミ','ファ'],
    optimalCommands: 4,
    bpm: 110,
  },
  {
    id: 5,
    title: 'くりかえし！',
    hint: 'ループをつかうと「ドレ」を3回くりかえせるよ！',
    target: ['ド','レ','ド','レ','ド','レ'],
    availableNotes: ['ド','レ','ミ'],
    optimalCommands: 3,
    bpm: 120,
  },
  {
    id: 6,
    title: 'ソラシド',
    hint: '上がっていく4音！',
    target: ['ソ','ラ','シ','ド↑'],
    availableNotes: ['ソ','ラ','シ','ド↑'],
    optimalCommands: 4,
    bpm: 120,
  },
  {
    id: 7,
    title: 'かえるのうた',
    hint: '有名な曲だよ！ドレミファミレド',
    target: ['ド','レ','ミ','ファ','ミ','レ','ド'],
    availableNotes: ['ド','レ','ミ','ファ'],
    optimalCommands: 7,
    bpm: 120,
  },
  {
    id: 8,
    title: 'キラキラ星（前半）',
    hint: 'ドドソソ！ループが使えるかも',
    target: ['ド','ド','ソ','ソ','ラ','ラ','ソ'],
    availableNotes: ['ド','レ','ミ','ファ','ソ','ラ','シ'],
    optimalCommands: 5,
    bpm: 110,
  },
  {
    id: 9,
    title: 'チューリップ',
    hint: 'ドレミドレミ… ループ2回使ってみよう！',
    target: ['ド','レ','ミ','ド','レ','ミ','ソ'],
    availableNotes: ['ド','レ','ミ','ファ','ソ'],
    optimalCommands: 4,
    bpm: 100,
  },
  {
    id: 10,
    title: 'きらきらメドレー',
    hint: 'ループを2回使うと楽に作れるよ！',
    target: ['ド','ミ','ソ','ド','ミ','ソ','ラ','ソ','ミ','ド'],
    availableNotes: ['ド','レ','ミ','ファ','ソ','ラ','シ','ド↑'],
    optimalCommands: 6,
    bpm: 120,
  },
];
