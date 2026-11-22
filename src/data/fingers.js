// Suggested finger for each move, for a right-handed solver. These match the finger tricks on
// the Notation page. hand: "L" | "R"; finger: 0 thumb · 1 index · 2 middle · 3 ring · 4 pinky.
// finger -1 means the whole hand / wrist (used for cube rotations).
export const FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];

const MAP = {
  R: ["R", 1], "R'": ["R", 0],
  L: ["L", 0], "L'": ["L", 1],
  U: ["R", 1], "U'": ["L", 1],
  D: ["L", 3], "D'": ["R", 3],
  F: ["R", 0], "F'": ["L", 0],
  B: ["L", 3], "B'": ["R", 3],
  M: ["L", 3], "M'": ["R", 2],
  E: ["L", 3], "E'": ["R", 3],
  S: ["R", 1], "S'": ["L", 1],
};

// Normalise a move string ("R2", "r'", "Uw", "x2") to a finger assignment.
export function fingersFor(move) {
  if (!move) return [];
  let s = move.replace(/2/g, "").replace(/w/gi, "");
  const prime = s.includes("'");
  let face = s.replace(/'/g, "");
  if ("xyz".includes(face)) return [{ hand: "L", finger: -1 }, { hand: "R", finger: -1 }];
  if (face && face >= "a" && face <= "z") face = face.toUpperCase(); // wide move -> same hand as the face
  const key = face + (prime ? "'" : "");
  const m = MAP[key];
  return m ? [{ hand: m[0], finger: m[1] }] : [];
}

export function describeFingers(move) {
  const act = fingersFor(move);
  if (!act.length) return "turn with your wrist";
  if (act.some((a) => a.finger === -1)) return "turn the whole cube with both wrists";
  return act.map((a) => `${a.hand === "R" ? "right" : "left"} ${FINGER_NAMES[a.finger]}`).join(" + ");
}
