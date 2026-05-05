export type ShapeType =
  | 'circle' | 'square' | 'triangle' | 'rectangle_h' | 'rectangle_v'
  | 'oval_h' | 'oval_v' | 'diamond' | 'star' | 'pentagon'
  | 'hexagon' | 'heart' | 'cross' | 'arrow' | 'moon'
  | 'house' | 'tree' | 'fish' | 'cat' | 'flower'
  | 'lightning' | 'cloud' | 'crown' | 'shield' | 'bell';

export interface ShapePuzzle {
  id: number;
  levelNum: number;
  questionNum: number;
  title: string;
  hint: string;
  target: ShapeType;
  choices: [ShapeType, ShapeType, ShapeType, ShapeType];
  correctIndex: 0 | 1 | 2 | 3;
}

const P = (
  id: number, l: number, q: number, title: string, hint: string,
  target: ShapeType, choices: [ShapeType, ShapeType, ShapeType, ShapeType],
  ci: 0|1|2|3
): ShapePuzzle => ({ id, levelNum: l, questionNum: q, title, hint, target, choices, correctIndex: ci });

export const SHAPE_PUZZLES: ShapePuzzle[] = [
  // ── Level 1: きほんのかたち ──────────────────
  P(1,1,1,'まるをさがせ！','どれがまるいかな？','circle',['circle','square','triangle','diamond'],0),
  P(2,1,2,'しかくをさがせ！','よんかどのかたちは？','square',['triangle','square','circle','rectangle_h'],1),
  P(3,1,3,'さんかくをさがせ！','とんがったかたちは？','triangle',['circle','rectangle_h','triangle','square'],2),
  P(4,1,4,'よこながをさがせ！','よこにながいかたちは？','rectangle_h',['oval_v','diamond','square','rectangle_h'],3),
  P(5,1,5,'たてながをさがせ！','たてにながいかたちは？','rectangle_v',['rectangle_v','circle','triangle','square'],0),

  // ── Level 2: もっとかたち ─────────────────────
  P(6,2,1,'ひしがたをさがせ！','ダイヤのかたちは？','diamond',['square','circle','diamond','triangle'],2),
  P(7,2,2,'ほしをさがせ！','キラキラのかたちは？','star',['flower','star','pentagon','hexagon'],1),
  P(8,2,3,'ごかくけいをさがせ！','5つのかどのかたちは？','pentagon',['hexagon','square','circle','pentagon'],3),
  P(9,2,4,'ろっかくけいをさがせ！','ハチのすのかたちは？','hexagon',['hexagon','pentagon','diamond','star'],0),
  P(10,2,5,'たまごをさがせ！','たてにながいまるは？','oval_v',['circle','rectangle_v','oval_v','oval_h'],2),

  // ── Level 3: とくしゅなかたち ──────────────────
  P(11,3,1,'はーとをさがせ！','ラブラブなかたちは？','heart',['heart','star','flower','cloud'],0),
  P(12,3,2,'じゅうじをさがせ！','プラスのかたちは？','cross',['arrow','cross','heart','crown'],1),
  P(13,3,3,'やじるしをさがせ！','→のかたちは？','arrow',['cross','crown','arrow','shield'],2),
  P(14,3,4,'つきをさがせ！','三日月のかたちは？','moon',['oval_h','moon','cloud','circle'],1),
  P(15,3,5,'かみなりをさがせ！','ぴかっとしたかたちは？','lightning',['arrow','lightning','star','cross'],1),

  // ── Level 4: どうぶつシルエット ─────────────────
  P(16,4,1,'ねこをさがせ！','ニャーのどうぶつは？','cat',['fish','cat','cloud','tree'],1),
  P(17,4,2,'さかなをさがせ！','スイスイのどうぶつは？','fish',['fish','cat','cloud','moon'],0),
  P(18,4,3,'はなをさがせ！','きれいにさくのは？','flower',['tree','flower','cloud','bell'],1),
  P(19,4,4,'くもをさがせ！','ふわふわのかたちは？','cloud',['moon','oval_h','cloud','heart'],2),
  P(20,4,5,'きをさがせ！','もりにあるのは？','tree',['house','tree','flower','crown'],1),

  // ── Level 5: もっとかたち ─────────────────────
  P(21,5,1,'おうちをさがせ！','さんかくのやねのかたちは？','house',['house','tree','cross','pentagon'],0),
  P(22,5,2,'かんむりをさがせ！','おうじさまがかぶるのは？','crown',['bell','star','crown','flower'],2),
  P(23,5,3,'たてをさがせ！','かっこいいまもりは？','shield',['diamond','shield','pentagon','house'],1),
  P(24,5,4,'ベルをさがせ！','キンコーンのかたちは？','bell',['bell','crown','flower','cloud'],0),
  P(25,5,5,'おうぎがたをさがせ！','よこながまるは？','oval_h',['oval_v','oval_h','circle','rectangle_h'],1),

  // ── Level 6: にているかたちをくべつしよう ────────
  P(26,6,1,'まるかたまごか','おおきさがちがうよ！','circle',['oval_v','circle','oval_h','rectangle_v'],1),
  P(27,6,2,'しかくかひしがたか','むきがちがう！','square',['diamond','rectangle_h','square','rectangle_v'],2),
  P(28,6,3,'ほしかはなか','とんがりかやわらかか！','star',['flower','heart','crown','star'],3),
  P(29,6,4,'つきかまるか','まんまるじゃないのは？','moon',['circle','oval_h','moon','oval_v'],2),
  P(30,6,5,'さんかくかやじるしか','とんがりのほうこうは？','triangle',['arrow','cross','triangle','pentagon'],2),

  // ── Level 7: もっとにているかたち ─────────────
  P(31,7,1,'ごかくかろっかくか','かどのかずをかぞえよう！','pentagon',['hexagon','pentagon','star','diamond'],1),
  P(32,7,2,'はーとかはなか','どっちがまるっこい？','heart',['star','heart','flower','cloud'],1),
  P(33,7,3,'じゅうじかやじるしか','どっちがながい？','cross',['arrow','cross','lightning','star'],1),
  P(34,7,4,'ろっかくかたてながか','かどがあるかな？','hexagon',['rectangle_v','oval_v','hexagon','pentagon'],2),
  P(35,7,5,'たてかたまごか','まっすぐかまるっこいか！','rectangle_v',['oval_v','rectangle_v','oval_h','circle'],1),

  // ── Level 8: シルエットクイズ ─────────────────
  P(36,8,1,'ねこかさかなか','どっちにしっぽがある？','cat',['fish','tree','cat','cloud'],2),
  P(37,8,2,'きかはなか','うえにえだがのびているのは？','tree',['flower','house','tree','crown'],2),
  P(38,8,3,'おうちかたてか','やねがあるのは？','house',['shield','diamond','bell','house'],3),
  P(39,8,4,'かんむりかべるか','キンコーンなるのは？','bell',['crown','bell','flower','star'],1),
  P(40,8,5,'はなかクラウドか','ふわふわしているのは？','cloud',['flower','cloud','star','heart'],1),

  // ── Level 9: むずかしいくべつ ─────────────────
  P(41,9,1,'まるかおうぎかたまごか','いちばんまるいのはどれ？','circle',['oval_h','oval_v','circle','rectangle_h'],2),
  P(42,9,2,'ほしかかみなりか','とんがりがおおいのは？','star',['lightning','arrow','crown','star'],3),
  P(43,9,3,'はーとかクラウドか','したにとがっているのは？','heart',['cloud','moon','heart','oval_v'],2),
  P(44,9,4,'ゆきかろっかくか','6まいのはなびらみたいなのは？','hexagon',['flower','star','hexagon','pentagon'],2),
  P(45,9,5,'たてかたまごか','かどがきっちりあるのは？','rectangle_v',['oval_v','rectangle_v','circle','oval_h'],1),

  // ── Level 10: マスター ─────────────────────────
  P(46,10,1,'8かくけい？6かくけい？','かどのかずをよくかぞえて！','hexagon',['pentagon','hexagon','star','octagon' as ShapeType],1),
  P(47,10,2,'ふくざつなほし','6まいのほしか5まいか？','star',['hexagon','flower','star','pentagon'],2),
  P(48,10,3,'たてかさんかくか','どっちのほうがほそながい？','triangle',['rectangle_v','triangle','arrow','cross'],1),
  P(49,10,4,'かんむりかたてか','おうじさまがもつのは？','crown',['shield','crown','bell','star'],1),
  P(50,10,5,'さいきょうのかたちはどれ？','ぜんぶのかたちのなかからさがせ！','shield',['house','shield','cross','crown'],1),
];

export const SHAPE_COLORS: Record<ShapeType, string> = {
  circle: '#FF6B6B', square: '#4ECDC4', triangle: '#FFD93D', rectangle_h: '#6BCB77',
  rectangle_v: '#4D96FF', oval_h: '#FF9F43', oval_v: '#A29BFE', diamond: '#FD79A8',
  star: '#FDCB6E', pentagon: '#00CEC9', hexagon: '#74B9FF', heart: '#FF7675',
  cross: '#B2BEC3', arrow: '#0984E3', moon: '#F0E130', house: '#E17055',
  tree: '#00B894', fish: '#0984E3', cat: '#FDCB6E', flower: '#FD79A8',
  lightning: '#F9CA24', cloud: '#DFE6E9', crown: '#F0E130', shield: '#636E72', bell: '#FDCB6E',
};

export const SHAPE_DISPLAY_COLORS: Record<ShapeType, string> = {
  ...SHAPE_COLORS,
};
