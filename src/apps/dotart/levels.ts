export type Color = 'red' | 'blue' | 'yellow' | 'green' | 'black' | 'white' | 'pink' | 'orange';

export const COLOR_LABEL: Record<Color, string> = {
  red:'あか', blue:'あお', yellow:'きいろ', green:'みどり',
  black:'くろ', white:'しろ', pink:'ピンク', orange:'オレンジ',
};

export const COLOR_HEX: Record<Color, string> = {
  red:'#FF4757', blue:'#4B7BEC', yellow:'#F7D794', green:'#26de81',
  black:'#2f3542', white:'#f1f2f6', pink:'#FF6CAE', orange:'#FD9644',
};

export interface DotLevel {
  id: number;
  levelNum: number;
  questionNum: number;
  title: string;
  hint: string;
  gridSize: number;
  startRow: number;
  startCol: number;
  target: (Color | null)[][];
  availableColors: Color[];
  optimalCommands: number;
}

function g(size: number): (Color | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function row(grid: (Color | null)[][], r: number, cols: number[], c: Color) {
  cols.forEach(col => { grid[r][col] = c; }); return grid;
}
function col(grid: (Color | null)[][], rows: number[], co: number, c: Color) {
  rows.forEach(r => { grid[r][co] = c; }); return grid;
}

export const DOT_LEVELS: DotLevel[] = [
  // ── Level 1: よこせん ──────────────────────────
  { id:1, levelNum:1, questionNum:1, title:'よこせん①', hint:'「みぎ」を3回！',
    gridSize:6, startRow:2, startCol:0, availableColors:['red'], optimalCommands:4,
    target: row(g(6),2,[0,1,2,3],'red') },
  { id:2, levelNum:1, questionNum:2, title:'よこせん②', hint:'「みぎ」を2回！',
    gridSize:6, startRow:0, startCol:0, availableColors:['blue'], optimalCommands:3,
    target: row(g(6),0,[0,1,2],'blue') },
  { id:3, levelNum:1, questionNum:3, title:'よこせん③', hint:'「みぎ」を4回！',
    gridSize:6, startRow:4, startCol:0, availableColors:['green'], optimalCommands:5,
    target: row(g(6),4,[0,1,2,3,4],'green') },
  { id:4, levelNum:1, questionNum:4, title:'よこせん④', hint:'ループで「みぎ」6回！',
    gridSize:6, startRow:1, startCol:0, availableColors:['yellow'], optimalCommands:4,
    target: row(g(6),1,[0,1,2,3,4,5],'yellow') },
  { id:5, levelNum:1, questionNum:5, title:'よこせん⑤', hint:'5マス進もう！',
    gridSize:6, startRow:5, startCol:1, availableColors:['pink'], optimalCommands:5,
    target: row(g(6),5,[1,2,3,4,5],'pink') },

  // ── Level 2: たてせん ──────────────────────────
  { id:6, levelNum:2, questionNum:1, title:'たてせん①', hint:'「した」を3回！',
    gridSize:6, startRow:0, startCol:2, availableColors:['blue'], optimalCommands:4,
    target: col(g(6),[0,1,2,3],2,'blue') },
  { id:7, levelNum:2, questionNum:2, title:'たてせん②', hint:'「した」を2回！',
    gridSize:6, startRow:0, startCol:5, availableColors:['red'], optimalCommands:3,
    target: col(g(6),[0,1,2],5,'red') },
  { id:8, levelNum:2, questionNum:3, title:'たてせん③', hint:'「した」を4回！',
    gridSize:6, startRow:0, startCol:0, availableColors:['green'], optimalCommands:5,
    target: col(g(6),[0,1,2,3,4],0,'green') },
  { id:9, levelNum:2, questionNum:4, title:'たてせん④', hint:'「した」を6回！',
    gridSize:6, startRow:0, startCol:3, availableColors:['orange'], optimalCommands:4,
    target: col(g(6),[0,1,2,3,4,5],3,'orange') },
  { id:10, levelNum:2, questionNum:5, title:'たてせん⑤', hint:'まんなかに線！',
    gridSize:6, startRow:1, startCol:2, availableColors:['pink'], optimalCommands:4,
    target: col(g(6),[1,2,3,4],2,'pink') },

  // ── Level 3: かどのかたち ───────────────────────
  { id:11, levelNum:3, questionNum:1, title:'Lのかたち', hint:'右に3、下に3！',
    gridSize:6, startRow:0, startCol:0, availableColors:['green'], optimalCommands:6,
    target: (() => { const gr=g(6); row(gr,0,[0,1,2],'green'); col(gr,[0,1,2,3],2,'green'); return gr; })() },
  { id:12, levelNum:3, questionNum:2, title:'さかさLのかたち', hint:'下に3、右に3！',
    gridSize:6, startRow:0, startCol:0, availableColors:['blue'], optimalCommands:6,
    target: (() => { const gr=g(6); col(gr,[0,1,2,3],0,'blue'); row(gr,3,[0,1,2],'blue'); return gr; })() },
  { id:13, levelNum:3, questionNum:3, title:'Uのかたち', hint:'左・下・右！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red'], optimalCommands:8,
    target: (() => { const gr=g(6); col(gr,[0,1,2,3],0,'red'); row(gr,3,[0,1,2,3],'red'); col(gr,[0,1,2,3],3,'red'); return gr; })() },
  { id:14, levelNum:3, questionNum:4, title:'Zのかたち', hint:'右・下・右！',
    gridSize:6, startRow:0, startCol:0, availableColors:['yellow'], optimalCommands:8,
    target: (() => { const gr=g(6); row(gr,0,[0,1,2],'yellow'); col(gr,[0,1,2],2,'yellow'); row(gr,2,[2,3,4],'yellow'); return gr; })() },
  { id:15, levelNum:3, questionNum:5, title:'Tのかたち', hint:'まんなかから！',
    gridSize:6, startRow:0, startCol:0, availableColors:['orange'], optimalCommands:8,
    target: (() => { const gr=g(6); row(gr,0,[0,1,2,3,4],'orange'); col(gr,[0,1,2,3],2,'orange'); return gr; })() },

  // ── Level 4: しかく ──────────────────────────────
  { id:16, levelNum:4, questionNum:1, title:'しかくのわく①', hint:'4辺を描こう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red'], optimalCommands:12,
    target: (() => { const gr=g(6); row(gr,0,[0,1,2,3],'red'); row(gr,3,[0,1,2,3],'red'); col(gr,[0,1,2,3],0,'red'); col(gr,[0,1,2,3],3,'red'); return gr; })() },
  { id:17, levelNum:4, questionNum:2, title:'ぬりつぶし①', hint:'2×2の正方形を塗ろう！',
    gridSize:6, startRow:1, startCol:1, availableColors:['blue'], optimalCommands:6,
    target: (() => { const gr=g(6); [1,2].forEach(r=>[1,2].forEach(c=>{gr[r][c]='blue';})); return gr; })() },
  { id:18, levelNum:4, questionNum:3, title:'ぬりつぶし②', hint:'3×3を塗ろう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['green'], optimalCommands:9,
    target: (() => { const gr=g(6); [0,1,2].forEach(r=>[0,1,2].forEach(c=>{gr[r][c]='green';})); return gr; })() },
  { id:19, levelNum:4, questionNum:4, title:'しかくのわく②', hint:'大きな正方形！',
    gridSize:6, startRow:0, startCol:0, availableColors:['yellow'], optimalCommands:14,
    target: (() => { const gr=g(6); row(gr,0,[0,1,2,3,4],'yellow'); row(gr,4,[0,1,2,3,4],'yellow'); col(gr,[0,1,2,3,4],0,'yellow'); col(gr,[0,1,2,3,4],4,'yellow'); return gr; })() },
  { id:20, levelNum:4, questionNum:5, title:'ちいさいしかく', hint:'2×3の長方形！',
    gridSize:6, startRow:2, startCol:2, availableColors:['pink'], optimalCommands:8,
    target: (() => { const gr=g(6); [2,3].forEach(r=>[2,3,4].forEach(c=>{gr[r][c]='pink';})); return gr; })() },

  // ── Level 5: ループしましま ───────────────────────
  { id:21, levelNum:5, questionNum:1, title:'しましま①', hint:'ループで赤青交互！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','blue'], optimalCommands:4,
    target: (() => { const gr=g(6); for(let r=0;r<6;r++) gr[r][0]=r%2===0?'red':'blue'; return gr; })() },
  { id:22, levelNum:5, questionNum:2, title:'しましま②', hint:'よこのしましま！',
    gridSize:6, startRow:0, startCol:0, availableColors:['green','yellow'], optimalCommands:4,
    target: (() => { const gr=g(6); for(let c=0;c<6;c++) gr[0][c]=c%2===0?'green':'yellow'; return gr; })() },
  { id:23, levelNum:5, questionNum:3, title:'しましま③', hint:'ループで3本の赤線！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','white'], optimalCommands:5,
    target: (() => { const gr=g(6); for(let c=0;c<6;c++) for(let r=0;r<6;r++) gr[r][c]=r%2===0?'red':'white'; return gr; })() },
  { id:24, levelNum:5, questionNum:4, title:'しましま④', hint:'みぎにすすみながらしましま！',
    gridSize:6, startRow:0, startCol:0, availableColors:['blue','orange'], optimalCommands:5,
    target: (() => { const gr=g(6); for(let c=0;c<6;c++) gr[2][c]=c%2===0?'blue':'orange'; return gr; })() },
  { id:25, levelNum:5, questionNum:5, title:'しましま⑤', hint:'たて2本のしましま！',
    gridSize:6, startRow:0, startCol:0, availableColors:['pink','green'], optimalCommands:6,
    target: (() => { const gr=g(6); for(let r=0;r<6;r++) for(let c=0;c<6;c+=2) { gr[r][c]='pink'; if(c+1<6) gr[r][c+1]='green'; } return gr; })() },

  // ── Level 6: たいかくせん ─────────────────────────
  { id:26, levelNum:6, questionNum:1, title:'たいかくせん①', hint:'右と下を交互に！',
    gridSize:6, startRow:0, startCol:0, availableColors:['yellow'], optimalCommands:9,
    target: (() => { const gr=g(6); for(let i=0;i<5;i++) gr[i][i]='yellow'; return gr; })() },
  { id:27, levelNum:6, questionNum:2, title:'ぎゃくたいかく', hint:'左と下を交互に！',
    gridSize:6, startRow:0, startCol:5, availableColors:['red'], optimalCommands:9,
    target: (() => { const gr=g(6); for(let i=0;i<5;i++) gr[i][4-i]='red'; return gr; })() },
  { id:28, levelNum:6, questionNum:3, title:'Xのかたち', hint:'2本の対角線を描こう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['blue'], optimalCommands:14,
    target: (() => { const gr=g(6); for(let i=0;i<5;i++) { gr[i][i]='blue'; gr[i][4-i]='blue'; } return gr; })() },
  { id:29, levelNum:6, questionNum:4, title:'ジグザグ①', hint:'右下右下！',
    gridSize:6, startRow:0, startCol:0, availableColors:['green'], optimalCommands:8,
    target: (() => { const gr=g(6); [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3],[3,3],[3,4]].forEach(([r,c])=>{gr[r][c]='green';}); return gr; })() },
  { id:30, levelNum:6, questionNum:5, title:'ジグザグ②', hint:'右上右上！',
    gridSize:6, startRow:4, startCol:0, availableColors:['orange'], optimalCommands:8,
    target: (() => { const gr=g(6); [[4,0],[3,0],[3,1],[2,1],[2,2],[1,2],[1,3],[0,3]].forEach(([r,c])=>{gr[r][c]='orange';}); return gr; })() },

  // ── Level 7: 2色パターン ──────────────────────────
  { id:31, levelNum:7, questionNum:1, title:'チェッカー①', hint:'市松模様を作ろう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['pink','white'], optimalCommands:8,
    target: (() => { const gr=g(6); for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=(r+c)%2===0?'pink':'white'; return gr; })() },
  { id:32, levelNum:7, questionNum:2, title:'2色タイル', hint:'赤青2マスずつ！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','blue'], optimalCommands:6,
    target: (() => { const gr=g(6); for(let c=0;c<6;c++) gr[0][c]=Math.floor(c/2)%2===0?'red':'blue'; return gr; })() },
  { id:33, levelNum:7, questionNum:3, title:'ストライプ旗', hint:'3色のしましま！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','white','blue'], optimalCommands:8,
    target: (() => { const gr=g(6); const cs:Color[]=['red','white','blue']; for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=cs[Math.floor(c/2)]; return gr; })() },
  { id:34, levelNum:7, questionNum:4, title:'2色ブロック', hint:'左半分と右半分！',
    gridSize:6, startRow:0, startCol:0, availableColors:['green','yellow'], optimalCommands:8,
    target: (() => { const gr=g(6); for(let r=0;r<4;r++) for(let c=0;c<6;c++) gr[r][c]=c<3?'green':'yellow'; return gr; })() },
  { id:35, levelNum:7, questionNum:5, title:'グラデーション風', hint:'オレンジとピンクのタイル！',
    gridSize:6, startRow:0, startCol:0, availableColors:['orange','pink'], optimalCommands:8,
    target: (() => { const gr=g(6); for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=((r+c)%3===0)?'orange':'pink'; return gr; })() },

  // ── Level 8: にじいろ ──────────────────────────────
  { id:36, levelNum:8, questionNum:1, title:'にじのせん', hint:'6色を使おう！',
    gridSize:6, startRow:2, startCol:0, availableColors:['red','orange','yellow','green','blue','pink'], optimalCommands:12,
    target: (() => { const gr=g(6); const cs:Color[]=['red','orange','yellow','green','blue','pink']; cs.forEach((c,i)=>{gr[2][i]=c;}); return gr; })() },
  { id:37, levelNum:8, questionNum:2, title:'たてにじ', hint:'たてに6色！',
    gridSize:6, startRow:0, startCol:3, availableColors:['red','orange','yellow','green','blue','pink'], optimalCommands:12,
    target: (() => { const gr=g(6); const cs:Color[]=['red','orange','yellow','green','blue','pink']; cs.forEach((c,i)=>{gr[i][3]=c;}); return gr; })() },
  { id:38, levelNum:8, questionNum:3, title:'カラフルスクエア', hint:'4色で正方形！',
    gridSize:6, startRow:1, startCol:1, availableColors:['red','blue','green','yellow'], optimalCommands:10,
    target: (() => { const gr=g(6); [[1,1,'red'],[1,2,'blue'],[2,1,'green'],[2,2,'yellow']].forEach(([r,c,col])=>{gr[r as number][c as number]=col as Color;}); return gr; })() },
  { id:39, levelNum:8, questionNum:4, title:'フラッグ', hint:'横3色旗！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','white','blue'], optimalCommands:10,
    target: (() => { const gr=g(6); const cs:Color[]=['red','white','blue']; for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=cs[Math.floor(r/2)]; return gr; })() },
  { id:40, levelNum:8, questionNum:5, title:'カラフルX', hint:'2色でXを描こう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['orange','pink'], optimalCommands:14,
    target: (() => { const gr=g(6); for(let i=0;i<5;i++) { gr[i][i]='orange'; gr[i][4-i]='pink'; } return gr; })() },

  // ── Level 9: 十字・矢印 ──────────────────────────
  { id:41, levelNum:9, questionNum:1, title:'くろす①', hint:'たてとよこ！',
    gridSize:7, startRow:0, startCol:3, availableColors:['red'], optimalCommands:12,
    target: (() => { const gr=g(7); for(let r=0;r<7;r++) gr[r][3]='red'; for(let c=0;c<7;c++) gr[3][c]='red'; return gr; })() },
  { id:42, levelNum:9, questionNum:2, title:'くろす②', hint:'小さい十字！',
    gridSize:6, startRow:0, startCol:2, availableColors:['blue'], optimalCommands:8,
    target: (() => { const gr=g(6); for(let r=0;r<4;r++) gr[r][2]='blue'; for(let c=0;c<6;c++) gr[1][c]='blue'; return gr; })() },
  { id:43, levelNum:9, questionNum:3, title:'やじるし→', hint:'右向き矢印！',
    gridSize:6, startRow:2, startCol:0, availableColors:['yellow'], optimalCommands:8,
    target: (() => { const gr=g(6); for(let c=0;c<4;c++) gr[2][c]='yellow'; [[1,4],[0,5],[1,4],[2,3]].forEach(([r,c])=>{if(r>=0&&r<6&&c>=0&&c<6) gr[r][c]='yellow';}); gr[3][4]='yellow'; gr[4][5]='yellow'; return gr; })() },
  { id:44, levelNum:9, questionNum:4, title:'ダブルクロス', hint:'2本の縦線と1本の横線！',
    gridSize:6, startRow:0, startCol:1, availableColors:['green'], optimalCommands:14,
    target: (() => { const gr=g(6); for(let r=0;r<6;r++) { gr[r][1]='green'; gr[r][4]='green'; } for(let c=0;c<6;c++) gr[2][c]='green'; return gr; })() },
  { id:45, levelNum:9, questionNum:5, title:'スター形', hint:'対角線と縦横！',
    gridSize:7, startRow:3, startCol:0, availableColors:['pink'], optimalCommands:14,
    target: (() => { const gr=g(7); for(let r=0;r<7;r++) gr[r][3]='pink'; for(let c=0;c<7;c++) gr[3][c]='pink'; for(let i=0;i<7;i++) { gr[i][i]='pink'; gr[i][6-i]='pink'; } return gr; })() },

  // ── Level 10: マスター ─────────────────────────────
  { id:46, levelNum:10, questionNum:1, title:'はたのかたち', hint:'ループで3色のしましまを作ろう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','white','blue'], optimalCommands:8,
    target: (() => { const gr=g(6); const cs:Color[]=['red','white','blue']; for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=cs[Math.floor(c/2)]; return gr; })() },
  { id:47, levelNum:10, questionNum:2, title:'フルチェッカー', hint:'完全な市松模様！',
    gridSize:6, startRow:0, startCol:0, availableColors:['black','white'], optimalCommands:8,
    target: (() => { const gr=g(6); for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=(r+c)%2===0?'black':'white'; return gr; })() },
  { id:48, levelNum:10, questionNum:3, title:'にじフレーム', hint:'外枠を虹色に！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','orange','yellow','green','blue','pink'], optimalCommands:14,
    target: (() => { const gr=g(6); const cs:Color[]=['red','orange','yellow','green','blue','pink']; for(let i=0;i<6;i++) { gr[0][i]=cs[i]; gr[5][i]=cs[5-i]; gr[i][0]=cs[i]; gr[i][5]=cs[5-i]; } return gr; })() },
  { id:49, levelNum:10, questionNum:4, title:'ビッグスター', hint:'大きな星形！',
    gridSize:7, startRow:3, startCol:0, availableColors:['yellow'], optimalCommands:16,
    target: (() => { const gr=g(7); for(let r=0;r<7;r++) gr[r][3]='yellow'; for(let c=0;c<7;c++) gr[3][c]='yellow'; for(let i=0;i<7;i++) { gr[i][i]='yellow'; gr[i][6-i]='yellow'; } return gr; })() },
  { id:50, levelNum:10, questionNum:5, title:'マスターピース', hint:'ループを3回使って完成させよう！',
    gridSize:6, startRow:0, startCol:0, availableColors:['red','orange','yellow','green','blue','pink'], optimalCommands:10,
    target: (() => { const gr=g(6); const cs:Color[]=['red','orange','yellow','green','blue','pink']; for(let r=0;r<6;r++) for(let c=0;c<6;c++) gr[r][c]=cs[(r+c)%6]; return gr; })() },
];
