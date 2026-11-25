export type Penalty = 'ok' | '+2' | 'dnf';
export type Solve = { t: number; penalty: Penalty; scramble: string; at: number };

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];

export function randomScramble(len = 20) {
  const moves: { face: string; amount: number }[] = [];
  let last = '';
  for (let i = 0; i < len; i++) {
    let f = '';
    do {
      f = FACES[(Math.random() * 6) | 0];
    } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return moves.map((m) => m.face + (m.amount === 2 ? '2' : m.amount === 3 ? "'" : '')).join(' ');
}

/** mm:ss.cc from milliseconds (WCA-style hundredths). */
export function formatTime(ms: number | null | undefined) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const total = Math.floor(Math.abs(ms) / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function formatStat(v: number | 'DNF' | null | undefined) {
  if (v == null) return '—';
  if (v === 'DNF') return 'DNF';
  return formatTime(v);
}

export function normalizeHistory(raw: unknown): Solve[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x: unknown) => {
      if (typeof x === 'number') return { t: x, penalty: 'ok' as Penalty, scramble: '', at: Date.now() };
      if (x && typeof x === 'object' && typeof (x as Solve).t === 'number') {
        const s = x as Partial<Solve>;
        return { t: s.t as number, penalty: (s.penalty || 'ok') as Penalty, scramble: s.scramble || '', at: s.at || Date.now() };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 100) as Solve[];
}

export function effectiveMs(solve: Solve | null | undefined) {
  if (!solve || solve.penalty === 'dnf') return null;
  return solve.t + (solve.penalty === '+2' ? 2000 : 0);
}

/** WCA average of N: drop best and worst. Two DNFs → DNF. */
export function aoN(history: Solve[], n: number): number | 'DNF' | null {
  const slice = history.slice(0, n);
  if (slice.length < n) return null;
  const vals = slice.map((s) => (s.penalty === 'dnf' ? Infinity : (effectiveMs(s) as number)));
  const dnfs = vals.filter((v) => v === Infinity).length;
  if (dnfs >= 2) return 'DNF';
  const sorted = [...vals].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  if (trimmed.some((v) => v === Infinity)) return 'DNF';
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

/** Mean of N with no trim. Any DNF → DNF. */
export function moN(history: Solve[], n: number): number | 'DNF' | null {
  const slice = history.slice(0, n);
  if (slice.length < n) return null;
  const vals = slice.map(effectiveMs);
  if (vals.some((v) => v == null)) return 'DNF';
  return (vals as number[]).reduce((a, b) => a + b, 0) / n;
}

export function meanOf(history: Solve[]) {
  const valid = history.map(effectiveMs).filter((v): v is number => v != null);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function bestOf(history: Solve[]) {
  const valid = history.map(effectiveMs).filter((v): v is number => v != null);
  if (!valid.length) return null;
  return Math.min(...valid);
}

/** Sample standard deviation of valid (non-DNF) times. */
export function stddevOf(history: Solve[]) {
  const valid = history.map(effectiveMs).filter((v): v is number => v != null);
  if (valid.length < 2) return null;
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const varSum = valid.reduce((a, b) => a + (b - mean) ** 2, 0) / (valid.length - 1);
  return Math.sqrt(varSum);
}

export function bestAverage(history: Solve[], n: number): number | 'DNF' | null {
  if (history.length < n) return null;
  let best: number | null = null;
  let sawDnf = false;
  for (let i = 0; i <= history.length - n; i++) {
    const v = aoN(history.slice(i), n);
    if (v === 'DNF') {
      sawDnf = true;
      continue;
    }
    if (typeof v === 'number' && (best == null || v < best)) best = v;
  }
  if (best != null) return best;
  return sawDnf ? 'DNF' : null;
}

export function sessionStats(history: Solve[]) {
  return {
    count: history.length,
    best: bestOf(history),
    avg: meanOf(history),
    sd: stddevOf(history),
    mo3: moN(history, 3),
    ao5: aoN(history, 5),
    ao12: aoN(history, 12),
    bestAo5: bestAverage(history, 5),
    bestAo12: bestAverage(history, 12),
  };
}
