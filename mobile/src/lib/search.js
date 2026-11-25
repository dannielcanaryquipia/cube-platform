// Matches case names ("oll 21", "t perm", "ja"), groups ("fish", "corner in slot") and alg text ("R U R' U'").
const norm = (s) => s.toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim();
const compact = (s) => norm(s).replace(/[\s()]/g, "");

export function matchCase(c, q) {
  const n = norm(q);
  if (!n) return true;
  const hay = norm(`${c.name} ${c.group} ${c.set.title} ${c.id.replace(/-/g, " ")}`);
  if (n.split(" ").every((w) => hay.includes(w))) return true;
  const qa = compact(q);
  return qa.length >= 2 && compact(c.alg).includes(qa);
}
