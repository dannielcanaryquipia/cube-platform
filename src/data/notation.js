// Move lessons for the notation page. "trick" is a suggested finger trick for right-handed solvers.
// Hold the cube with white on the bottom, yellow on top and green facing you.
export const NOTATION = [
  {
    id: "faces", title: "Face turns", text: "Each capital letter turns one outer face a quarter turn clockwise, as if you were looking straight at that face.",
    moves: [
      { m: "R", d: "Right face turns up: its front stickers rise", trick: "Flick the right face up with the right index finger, or turn the whole right wrist up; thumb rests on the front." },
      { m: "L", d: "Left face turns down toward you", trick: "Left wrist turns the face toward you; keep the thumb on the front." },
      { m: "U", d: "Top face turns to the left", trick: "Right index finger flicks the top-back layer to the left." },
      { m: "D", d: "Bottom face turns to the right", trick: "Left ring or middle finger pulls the bottom layer toward you." },
      { m: "F", d: "Front face clockwise", trick: "Right thumb pushes the bottom-front up, or left hand turns while the right regrips." },
      { m: "B", d: "Back face, clockwise seen from behind", trick: "Left ring finger pushes the back-left layer up; used rarely, rotate instead when you can." },
    ],
  },
  {
    id: "prime", title: "Primes (counter-clockwise)", text: "An apostrophe, said \"prime\", means turn that face counter-clockwise instead.",
    moves: [
      { m: "R'", d: "Right face turns down", trick: "Right thumb flicks the right face down, or the right wrist turns back toward you." },
      { m: "L'", d: "Left face turns up", trick: "Left index finger flicks the left face up, or the left wrist turns away from you." },
      { m: "U'", d: "Top face turns to the right", trick: "Left index finger flicks the top-back layer to the right." },
      { m: "D'", d: "Bottom face turns to the left", trick: "Right ring or middle finger pulls the bottom layer toward you." },
      { m: "F'", d: "Front face counter-clockwise", trick: "Left thumb pushes the bottom-front up, or right hand turns while the left regrips." },
      { m: "B'", d: "Back face, counter-clockwise from behind", trick: "Right ring finger pushes the back-right layer up." },
    ],
  },
  {
    id: "double", title: "Double turns", text: "A 2 means turn that face twice (a half turn). Direction does not matter, so R2 and R2' are the same.",
    moves: [
      { m: "R2", d: "Right face half turn", trick: "Two quick index flicks up, or one index flick plus a thumb push back." },
      { m: "L2", d: "Left face half turn", trick: "Two left-index flicks, mirror of R2." },
      { m: "U2", d: "Top face half turn", trick: "Right index and middle fingers double-flick the top layer in one motion." },
      { m: "D2", d: "Bottom face half turn", trick: "Double flick with the ring finger underneath." },
      { m: "F2", d: "Front face half turn", trick: "Regrip-free: thumb up then index down, or just two F motions." },
      { m: "B2", d: "Back face half turn", trick: "Two back flicks; prefer rotating the cube so it becomes an F2 when you can." },
    ],
  },
  {
    id: "wide", title: "Wide moves", text: "A lowercase letter (also written with a w, as in Rw) turns the outer face plus the middle layer next to it together — two layers as one.",
    moves: [
      { m: "r", d: "Right two layers up (R + M')", trick: "Same index/wrist motion as R, but grip two layers." },
      { m: "r'", d: "Right two layers down (R' + M)", trick: "Thumb flick down gripping two layers." },
      { m: "l", d: "Left two layers down (L + M)", trick: "Mirror of r, left wrist toward you." },
      { m: "l'", d: "Left two layers up (L' + M')", trick: "Left index flicks two layers up." },
      { m: "u", d: "Top two layers to the left (U + E')", trick: "Index flick carrying the top two layers." },
      { m: "u'", d: "Top two layers to the right (U' + E)", trick: "Left index flick, two layers." },
      { m: "f", d: "Front two layers clockwise (F + S)", trick: "Thumbs push the bottom-front two layers up." },
      { m: "d", d: "Bottom two layers to the right (D + E)", trick: "Rarely used; usually rotate with y instead." },
    ],
  },
  {
    id: "slices", title: "Slice moves", text: "M, E and S turn only a middle layer, leaving both outer faces still. M follows the L direction, E follows D, and S follows F.",
    moves: [
      { m: "M", d: "Middle layer down, following L", trick: "Left ring finger pulls the M slice down from the top-front; the workhorse of M2 U M2 PLLs." },
      { m: "M'", d: "Middle layer up, following L'", trick: "Right ring or middle finger pushes the M slice up from the bottom-front." },
      { m: "M2", d: "Middle layer half turn", trick: "Ring finger pull then middle finger, or two M pushes in a row." },
      { m: "E", d: "Equator layer to the right, following D", trick: "Rare on its own; think of it as the hidden layer in u and d." },
      { m: "E'", d: "Equator layer to the left, following D'", trick: "Rare; usually hidden inside a wide move." },
      { m: "S", d: "Standing layer clockwise, following F", trick: "Right index and middle push the S slice up; appears in some OLLs as f minus F." },
      { m: "S'", d: "Standing layer counter-clockwise, following F'", trick: "Pull the S slice down with the fingers on the front." },
    ],
  },
  {
    id: "rotations", title: "Cube rotations", text: "x, y and z turn the whole cube in your hands. Nothing is scrambled — you only change which side faces you. Use them to avoid awkward B and D moves.",
    moves: [
      { m: "x", d: "Whole cube up, following R", trick: "Both wrists roll the cube up (top goes to the back)." },
      { m: "x'", d: "Whole cube down, following R'", trick: "Both wrists roll the cube toward you." },
      { m: "x2", d: "Whole cube flipped top-to-bottom", trick: "Roll up twice; brings the bottom layer to the top." },
      { m: "y", d: "Whole cube turns left, following U", trick: "Both hands rotate the cube left to face a new side; the standard F2L look-ahead turn." },
      { m: "y'", d: "Whole cube turns right, following U'", trick: "Both hands rotate the cube right." },
      { m: "y2", d: "Whole cube half turn (left/right swap)", trick: "Two y turns; swaps front and back." },
      { m: "z", d: "Whole cube tips right, following F", trick: "Both wrists tip the cube clockwise from your view." },
      { m: "z'", d: "Whole cube tips left, following F'", trick: "Both wrists tip the cube counter-clockwise." },
      { m: "z2", d: "Whole cube tips upside down", trick: "Two z turns; left and right faces swap." },
    ],
  },
  {
    id: "triggers", title: "Triggers worth memorising", text: "These short groups appear everywhere in F2L, OLL and PLL. Learn each as one flowing motion, not as separate letters.",
    moves: [
      { m: "R U R' U'", d: "The “sexy move” — the most common trigger of all", trick: "Index flick R, index U, thumb R', index U'. Fast and regrip-free; drill it until it is automatic." },
      { m: "R U R'", d: "Insert / set-up trigger", trick: "Right index flicks U between two wrist turns; the core of most F2L inserts." },
      { m: "R' F R F'", d: "The “sledgehammer”", trick: "Thumb F, index R, thumb F'; pairs with the sexy move in many OLLs." },
      { m: "F R U R' U' F'", d: "Edge-orient trigger (OLL 45 / dot set-up)", trick: "A sexy move wrapped in F … F'. Keep the left thumb on the front for both F turns." },
      { m: "R U R' U R U2 R'", d: "Sune", trick: "Sexy-style flicks ending in a U2 double-flick; the first OLL most people learn." },
      { m: "R U2 R' U' R U' R'", d: "Anti-Sune", trick: "The mirror rhythm of Sune, starting with the U2." },
      { m: "R U R' U' R' F R F'", d: "T-shape OLL (sexy + sledgehammer)", trick: "Chain the two triggers you already know back to back." },
      { m: "M2 U M2 U2 M2 U M2", d: "H-perm (PLL)", trick: "Ring-finger M2 slices with index U turns between; stays in home grip the whole way." },
    ],
  },
];

export const TIPS = [
  { t: "Hold the cube the same way every time", d: "CFOP here uses white cross on the bottom, yellow on top and green facing you. Every diagram and the solver use that orientation." },
  { t: "Read triggers, not letters", d: "Groups like R U R' U' (sexy), R' F R F' (sledgehammer) and R U R' U R U2 R' (Sune) repeat everywhere. Learn them as single motions and whole algorithms click into place." },
  { t: "Keep your grip", d: "Good algorithms are chosen so you rarely let go of the cube. A regrip costs more time than an extra move, so favour R- and U-heavy solutions." },
  { t: "Turn with your fingers, not your arm", d: "Flicks from the index, thumb and ring fingers are far faster than wrist turns. The finger tricks above show which finger drives each move." },
  { t: "Slow is smooth, smooth is fast", d: "Turn at a steady pace you can hold without pausing. Speed comes from never stopping to look, not from rushing each turn." },
  { t: "Avoid B and D moves", d: "They are awkward to finger-trick. Rotate the cube with y or x so the work happens on the R, U and F faces instead." },
];
