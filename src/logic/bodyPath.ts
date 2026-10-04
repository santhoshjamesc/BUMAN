/**
 * A stylized standing human silhouette, used as the vessel the progress
 * "liquid" fills. Drawn in a BODY_WIDTH × BODY_HEIGHT box.
 */
export const BODY_WIDTH = 200;
export const BODY_HEIGHT = 424;

/** Top of the head and soles of the feet, so the fill level maps to the visible body. */
export const BODY_TOP = 8;
export const BODY_BOTTOM = 417;

type Point = readonly [number, number];

const CENTER = BODY_WIDTH / 2;

/**
 * Right half of one continuous outline, from the crown down to the crotch;
 * mirrored for the left. Roughly seven and a half heads tall.
 */
const RIGHT_HALF: readonly Point[] = [
  // head
  [100, 8],
  [111, 10],
  [119, 17],
  [122, 29],
  [121, 41],
  [117, 51],
  [110, 59],
  // neck, trapezius, shoulder
  [108, 68],
  [110, 80],
  [127, 88],
  [144, 93],
  [155, 102],
  [160, 118],
  // outer arm, hand
  [161, 142],
  [162, 168],
  [164, 194],
  [166, 216],
  [167, 232],
  [170, 246],
  [169, 260],
  [164, 268],
  [159, 260],
  [157, 246],
  [156, 232],
  // inner arm up to the armpit
  [153, 212],
  [150, 190],
  [147, 164],
  [145, 140],
  [143, 128],
  // torso: lats, waist, hips
  [139, 142],
  [136, 166],
  [134, 186],
  [137, 208],
  [140, 230],
  // outer leg, foot
  [139, 258],
  [136, 286],
  [132, 312],
  [133, 334],
  [130, 360],
  [124, 389],
  [126, 401],
  [133, 410],
  [128, 417],
  [112, 417],
  [109, 405],
  // inner leg up to the crotch
  [110, 390],
  [111, 362],
  [113, 336],
  [111, 312],
  [109, 286],
  [106, 264],
  [100, 246],
];

const fmt = (n: number) => Math.round(n * 10) / 10;

/** Smooth closed curve through every point (Catmull-Rom converted to cubic Béziers). */
function smoothClosedPath(points: readonly Point[]): string {
  const n = points.length;
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return `${d} Z`;
}

const mirror = ([x, y]: Point): Point => [2 * CENTER - x, y];

const outline: Point[] = [
  ...RIGHT_HALF,
  ...RIGHT_HALF.slice(1, -1).reverse().map(mirror),
];

export const BODY_PATH = smoothClosedPath(outline);
