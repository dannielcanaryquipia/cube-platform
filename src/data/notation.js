// Move lessons for the notation page. "trick" is a suggested finger trick for right-handed solvers.
export const NOTATION = [
  {
    id: "faces", title: "Face turns", text: "Each letter turns one outer face a quarter turn clockwise, as if you were looking straight at that face.",
    moves: [
      { m: "R", d: "Right face turns up: its front stickers rise", trick: "Right wrist turns the face up; thumb stays on the front." },
      { m: "L", d: "Left face turns down: its front stickers drop", trick: "Left wrist turns the face toward you." },
      { m: "U", d: "Top face to the left", trick: "Right index finger flicks the back-right of the top layer." },
      { m: "D", d: "Bottom face to the right", trick: "Left ring finger pulls the bottom layer toward you." },
      { m: "F", d: "Front face clockwise", trick: "Right thumb or index pushes the front face down." },
      { m: "B", d: "Back face, clockwise from behind", trick: "Right ring finger pushes the back layer down." },
    ],
  },
  {
    id: "prime", title: "Prime and double turns", text: "An apostrophe (say it \"prime\") means turn counter-clockwise. A 2 means turn twice, which is the same in either direction.",
    moves: [
      { m: "R'", d: "Right face turns down", trick: "Right wrist turns back toward you." },
      { m: "U'", d: "Top face to the right", trick: "Left index finger flicks the top layer." },
      { m: "F'", d: "Front face counter-clockwise", trick: "Left thumb or right index pulls the front face up." },
      { m: "L'", d: "Left face turns up", trick: "Left wrist turns the face away from you." },
      { m: "D'", d: "Bottom face to the left", trick: "Right ring finger pulls the bottom layer." },
      { m: "B'", d: "Back face, counter-clockwise from behind", trick: "Left ring finger pushes the back layer down." },
      { m: "R2", d: "Right face twice", trick: "Two wrist turns, or one big regrip-free turn." },
      { m: "U2", d: "Top face twice", trick: "Right index and middle fingers flick twice in a row." },
    ],
  },
  {
    id: "wide", title: "Wide moves", text: "A lowercase letter (or a w, as in Rw) turns the outer face plus the middle layer next to it together.",
    moves: [
      { m: "r", d: "Right two layers up", trick: "Same wrist motion as R, gripping two layers." },
      { m: "l", d: "Left two layers turn down" },
      { m: "u", d: "Top two layers to the left" },
      { m: "d", d: "Bottom two layers to the right" },
      { m: "f", d: "Front two layers clockwise" },
      { m: "r'", d: "Right two layers turn down" },
    ],
  },
  {
    id: "slices", title: "Slice moves", text: "M, E and S turn only a middle layer. M follows L, E follows D, and S follows F.",
    moves: [
      { m: "M", d: "Middle layer turns down, like L", trick: "Left ring finger pulls the middle layer down from the top." },
      { m: "M'", d: "Middle layer turns up, like L'", trick: "Right ring finger pushes up from the bottom back, or left ring finger from the back." },
      { m: "E", d: "Equator layer to the right, like D" },
      { m: "S", d: "Standing layer clockwise, like F" },
      { m: "M2", d: "Middle layer twice", trick: "Ring then middle finger, flicking the back of the M slice." },
    ],
  },
  {
    id: "rotations", title: "Cube rotations", text: "x, y and z turn the whole cube in your hands. Nothing gets scrambled: you are only changing which side faces you.",
    moves: [
      { m: "x", d: "Whole cube like R" },
      { m: "y", d: "Whole cube like U" },
      { m: "z", d: "Whole cube like F" },
      { m: "x'", d: "Whole cube like R'" },
      { m: "y'", d: "Whole cube like U'" },
      { m: "z'", d: "Whole cube like F'" },
    ],
  },
];

export const TIPS = [
  { t: "Hold the cube the same way every time", d: "CFOP here uses white cross on the bottom, yellow on top and green facing you. All diagrams use that orientation." },
  { t: "Read triggers, not letters", d: "Short groups repeat everywhere: R U R' U' (the sexy move), R' F R F' (the sledgehammer) and R U R' U R U2 R' (Sune). Learn them as single motions." },
  { t: "Keep your grip", d: "Good algorithms are chosen so you rarely let go. Regrips cost more time than an extra move." },
  { t: "Slow is smooth", d: "Turn at a steady speed you can keep without pauses. Turning speed comes from not stopping, not from rushing." },
];
