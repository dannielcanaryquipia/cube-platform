import { OLL, PLL } from "./ll.js";
import f2lData from "./f2l.json";

export const SETS = [
  {
    id: "f2l", path: "/f2l", title: "F2L", subtitle: "First two layers", stickering: "F2L", view: "f2l",
    intro: "Pair a white corner with its middle-layer edge in the top layer, then insert the pair into its slot. Every case below is for the front-right slot with the cross solved on the bottom.",
    groups: ["White sticker on the side", "White sticker on top", "Corner in slot", "Edge in slot", "Both in slot"],
    cases: f2lData.f2l,
  },
  {
    id: "advanced-f2l", path: "/advanced-f2l", title: "Advanced F2L", subtitle: "Other slots, no rotations", stickering: "F2L", view: "f2l",
    intro: "Solve pairs straight into the front-left and back slots instead of rotating the cube. These are the R and U cases from the basic set, mirrored to each slot.",
    groups: ["Front-left slot", "Back-right slot", "Back-left slot"],
    cases: f2lData.advanced,
  },
  {
    id: "oll", path: "/oll", title: "OLL", subtitle: "Orient the last layer", stickering: "OLL", view: "oll",
    intro: "Make the whole top face yellow. Recognise the case from the yellow stickers on top and on the sides of the top layer.",
    groups: ["Cross", "Corners oriented", "Dot", "Line", "L shape", "T shape", "C shape", "P shape", "W shape", "Square", "Small lightning", "Big lightning", "Fish", "Knight move", "Awkward"],
    cases: OLL,
  },
  {
    id: "pll", path: "/pll", title: "PLL", subtitle: "Permute the last layer", stickering: "PLL", view: "pll",
    intro: "Move the top-layer pieces to their solved spots. Arrows on each diagram show where pieces travel.",
    groups: ["Edges only", "Corners only", "Adjacent swap", "Diagonal swap", "G perms"],
    cases: PLL,
  },
];

export const ALL_CASES = SETS.flatMap((s) => s.cases.map((c) => ({ ...c, set: s })));
export const findCase = (id) => ALL_CASES.find((c) => c.id === id);
