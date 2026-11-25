#!/usr/bin/env node
/**
 * oc-delegate.mjs — Claude Code -> OpenCode bridge.
 *
 * Lets an upper agent (Claude Code) hand a self-contained task to the local
 * OpenCode CLI, which runs it with one of the ~/.opencode crews:
 * dev-build, design-studio, game-dev, qa-review, ops-planning.
 *
 * Design goals:
 *   - No quoting hell: the task is written to a brief file and attached with -f.
 *   - No context leakage: the brief carries everything OpenCode needs.
 *   - Machine readable: --json returns one object; the human report is Markdown.
 *   - Recoverable: every run has a log dir, and sessions can be continued.
 *
 * Usage:
 *   node oc-delegate.mjs --crew dev-build --dir . --task "Fix the failing test" --json
 *   node oc-delegate.mjs --crew qa-review --task-file review.md --timeout 300
 *   node oc-delegate.mjs --crew auto --task "Polish the landing page hero"
 *   node oc-delegate.mjs --session ses_abc123 --task "Now add tests"
 *   node oc-delegate.mjs --continue-last --task "Apply the review nits"
 *   node oc-delegate.mjs --list-crews
 *   node oc-delegate.mjs --list-models
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = os.homedir();
const ROOT = path.resolve(HERE, '..');
const BASE = path.join(process.env.LOCALAPPDATA || path.join(HOME, '.local', 'share'), 'oc-bridge');
const RUNS = path.join(BASE, 'runs');
const SESSIONS = path.join(BASE, 'sessions.json');
const BUILTIN_CREWS = new Set(['build', 'plan']);
const CREW_ORDER = ['dev-build', 'design-studio', 'game-dev', 'qa-review', 'ops-planning'];
const MODEL_PREFERENCE = [
  'opencode/deepseek-v4.1-flash-free',
  'opencode/big-pickle',
  'opencode/nemotron-3.5-super-free',
  'opencode/glm-5.3-flash-free',
];
const DEFAULT_TIMEOUT_SEC = 540;
const BRIDGE_MESSAGE =
  'Read the attached brief and execute it. Follow its Scope and Output contract exactly. ' +
  'Do not ask questions; work autonomously and report evidence.';

// ---------------------------------------------------------------------------
// small utilities
// ---------------------------------------------------------------------------

const stripAnsi = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, '');
const oneLine = (s, n = 160) => {
  const v = String(s).replace(/\s+/g, ' ').trim();
  return v.length > n ? v.slice(0, n - 1) + '…' : v;
};
const exists = (p) => { try { return fs.existsSync(p); } catch { return false; } };
const readJson = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; } };
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n', 'utf8');
const fmtTokens = (n) => Number(n || 0).toLocaleString('en-US');

const SCAN_SKIP = new Set([
  '.git', 'node_modules', '.next', '.nuxt', '.svelte-kit', 'dist', 'build', 'out',
  'coverage', '.venv', 'venv', '__pycache__', '.turbo', '.cache', '.parcel-cache',
  '.pytest_cache', '.mypy_cache', 'target', '.gradle', '.idea', '.vscode',
]);
const SCAN_CAP = 12000;

/**
 * Cheap before/after snapshot so files written through the shell are still
 * reported. Skips dependency/build directories and caps the walk.
 */
function snapshotDir(root) {
  const files = new Map();
  let count = 0;
  let truncated = false;

  const walk = (dir) => {
    if (count >= SCAN_CAP) { truncated = true; return; }
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (count >= SCAN_CAP) { truncated = true; return; }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SCAN_SKIP.has(entry.name) && !entry.name.startsWith('.git')) walk(full);
      } else if (entry.isFile()) {
        try {
          const st = fs.statSync(full);
          files.set(full, `${st.mtimeMs}:${st.size}`);
          count++;
        } catch { /* vanished or locked */ }
      }
    }
  };

  walk(root);
  return { files, truncated };
}

function diffSnapshots(before, after) {
  const changes = new Map();
  for (const [p, sig] of after.files) {
    if (!before.files.has(p)) changes.set(p, 'created');
    else if (before.files.get(p) !== sig) changes.set(p, 'modified');
  }
  for (const p of before.files.keys()) {
    if (!after.files.has(p)) changes.set(p, 'deleted');
  }
  return { changes, truncated: before.truncated || after.truncated };
}

function mergeFiles(toolFiles, snapshotChanges, root) {
  const map = new Map();
  const add = (rawPath, op) => {
    if (!rawPath) return;
    const abs = path.isAbsolute(rawPath) ? path.normalize(rawPath) : path.resolve(root, rawPath);
    const entry = map.get(abs) || { abs, ops: new Set() };
    entry.ops.add(op);
    map.set(abs, entry);
  };

  for (const f of toolFiles) {
    for (const op of f.ops || ['changed']) add(f.path, op);
  }
  for (const [p, op] of snapshotChanges) add(p, op);

  return [...map.values()]
    .map((e) => {
      const rel = path.relative(root, e.abs);
      const inside = rel && !rel.startsWith('..') && !path.isAbsolute(rel);
      return { path: inside ? rel : e.abs, abs: e.abs, ops: [...e.ops].sort() };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function fail(message, code = 3) {
  const err = new Error(message);
  err.exitCode = code;
  throw err;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = {
    crew: 'dev-build',
    timeout: DEFAULT_TIMEOUT_SEC,
    json: false,
    progress: false,
    files: [],
    dir: process.cwd(),
  };
  const positional = [];

  const take = (i, flag) => {
    if (i + 1 >= argv.length) fail(`${flag} needs a value`);
    return argv[i + 1];
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--task': out.task = take(i, a); i++; break;
      case '--task-file': out.taskFile = take(i, a); i++; break;
      case '--crew':
      case '--agent': out.crew = take(i, a).toLowerCase(); i++; break;
      case '--dir':
      case '--cwd': out.dir = take(i, a); i++; break;
      case '--model': case '-m': out.model = take(i, a); i++; break;
      case '--session': case '-s': out.session = take(i, a); i++; break;
      case '--continue': case '-c': out.continue = true; break;
      case '--continue-last': out.continueLast = true; break;
      case '--timeout': out.timeout = Number(take(i, a)); i++; break;
      case '--title': out.title = take(i, a); i++; break;
      case '--file': case '-f': out.files.push(take(i, a)); i++; break;
      case '--files':
        for (const f of take(i, a).split(',')) if (f.trim()) out.files.push(f.trim());
        i++;
        break;
      case '--json': out.json = true; break;
      case '--progress': out.progress = true; break;
      case '--quiet': out.quiet = true; break;
      case '--dry-run': out.dryRun = true; break;
      case '--list-crews': out.listCrews = true; break;
      case '--list-models': out.listModels = true; break;
      case '--help': case '-h': out.help = true; break;
      default:
        if (a.startsWith('-')) fail(`Unknown flag: ${a}. Run --help.`);
        positional.push(a);
    }
  }

  if (!out.task && positional.length) out.task = positional.join(' ');
  if (out.listCrews || out.listModels || out.help) return out;
  if (out.task && out.taskFile) fail('Use --task or --task-file, not both.');
  if (out.session && (out.continue || out.continueLast)) {
    fail('Use --session, --continue, or --continue-last — pick one.');
  }
  if (!out.task && !out.taskFile) fail('No task. Pass --task "<task>" or --task-file <path>.');
  if (!Number.isFinite(out.timeout) || out.timeout < 30) fail('--timeout must be at least 30 seconds.');
  return out;
}

const HELP = `
oc-delegate.mjs — delegate a task from Claude Code to the local OpenCode crew

  --crew <name>        dev-build (default) | design-studio | game-dev | qa-review |
                       ops-planning | build | plan | auto
  --task <text>        The self-contained task brief.
  --task-file <path>   Read the brief from a file instead.
  --dir <path>         Project directory OpenCode works in (default: cwd).
  --model <id>         provider/model override. Default: best available free model.
  --session <ses_id>   Continue an OpenCode session.
  --continue           Continue the most recent session.
  --continue-last      Continue the last session recorded for this directory.
  --file <path>        Attach a file to the prompt (repeatable).
  --files a,b          Attach several files.
  --timeout <seconds>  Hard timeout (default ${DEFAULT_TIMEOUT_SEC}, min 30).
  --title <text>       Session title shown in OpenCode.
  --json               Print one JSON object to stdout instead of Markdown.
  --progress           Stream tool-call progress to stderr.
  --quiet              Suppress the Markdown report (with --json).
  --dry-run            Write the brief and show the command without running it.
  --list-crews         List available crews and exit.
  --list-models        List models reported by \`opencode models\` and exit.
  --help               This help.

Examples:
  node oc-delegate.mjs --crew dev-build --dir . --task "Fix the failing auth test" --json
  node oc-delegate.mjs --crew qa-review --task-file review.md --timeout 300
  node oc-delegate.mjs --crew auto --task "Polish the hero section"
`;

// ---------------------------------------------------------------------------
// crews
// ---------------------------------------------------------------------------

function crewDirs() {
  return [path.join(ROOT, 'agent'), path.join(HOME, '.config', 'opencode', 'agents')];
}

function readCrews() {
  const map = new Map();
  for (const dir of crewDirs()) {
    if (!exists(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.toLowerCase().endsWith('.md')) continue;
      const name = file.replace(/\.md$/i, '');
      if (map.has(name)) continue;
      const full = path.join(dir, file);
      let text = '';
      try { text = fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, ''); } catch { continue; }
      const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let description = '';
      let mode = '';
      if (fm) {
        const dm = fm[1].match(/^description:\s*(?:"([\s\S]*?)"|'([\s\S]*?)'|(.+))$/m);
        if (dm) description = (dm[1] ?? dm[2] ?? dm[3] ?? '').replace(/\\n/g, ' ').trim();
        const mm = fm[1].match(/^mode:\s*(\w+)/m);
        if (mm) mode = mm[1];
      }
      map.set(name, { name, description, mode, file: full });
    }
  }
  return map;
}

function routeCrew(task) {
  const t = task || '';
  const rules = [
    [/\b(design|ui|ux|layout|typography|palette|color|landing page|frontend|css|tailwind|component|figma|brand|logo|hero)\b/i, 'design-studio'],
    [/\b(game|unity|unreal|godot|shader|sprite|tilemap|physics|multiplayer|vfx|blueprint)\b/i, 'game-dev'],
    [/\b(review|audit|qa|regression|security|compliance|verif(y|ication)|code smell|lint)\b/i, 'qa-review'],
    [/\b(plan|spec|prd|roadmap|research|architecture|estimate|document|docs|break down|proposal)\b/i, 'ops-planning'],
  ];
  for (const [rx, crew] of rules) if (rx.test(t)) return { crew, reason: `matched ${rx}` };
  return { crew: 'dev-build', reason: 'default: implementation' };
}

function resolveCrew(crews, requested, task) {
  if (requested === 'auto') {
    const r = routeCrew(task);
    return { ...r, auto: true };
  }
  if (BUILTIN_CREWS.has(requested)) return { crew: requested, reason: 'built-in OpenCode agent' };
  if (!crews.has(requested)) {
    const names = [...new Set([...crews.keys(), ...BUILTIN_CREWS])].sort();
    fail(`Unknown crew "${requested}". Available: ${names.join(', ')}`);
  }
  return { crew: requested, reason: crews.get(requested).description || 'crew' };
}

// ---------------------------------------------------------------------------
// models / executable
// ---------------------------------------------------------------------------

function resolveOpencode() {
  if (process.env.OC_BRIDGE_OPENCODE) return { cmd: process.env.OC_BRIDGE_OPENCODE, base: [] };

  if (process.platform === 'win32' && process.env.APPDATA) {
    const exe = path.join(process.env.APPDATA, 'npm', 'node_modules', '@opencode', 'cli', 'bin', 'opencode.exe');
    if (exists(exe)) return { cmd: exe, base: [] };
  }

  const which = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', ['opencode'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  const first = String(which.stdout || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
  if (first) {
    if (first.toLowerCase().endsWith('.exe')) return { cmd: first, base: [] };
    const sibling = path.join(path.dirname(first), 'node_modules', '@opencode', 'cli', 'bin',
      process.platform === 'win32' ? 'opencode.exe' : 'opencode');
    if (exists(sibling)) return { cmd: sibling, base: [] };
  }

  return { cmd: 'opencode', base: [], shell: true };
}

function listModels() {
  const oc = resolveOpencode();
  const r = spawnSync(oc.cmd, oc.base.concat(['models']), {
    encoding: 'utf8',
    timeout: 45000,
    windowsHide: true,
    shell: Boolean(oc.shell),
  });
  if (r.error) fail(`Could not run opencode models: ${r.error.message}`);
  return String(r.stdout || '')
    .split(/\r?\n/)
    .map((s) => stripAnsi(s).trim())
    .filter((s) => /^[^\s/]+\/[^\s]+$/.test(s));
}

function pickModel(requested, models) {
  if (requested) {
    if (models.length && !models.includes(requested)) {
      process.stderr.write(`[oc-bridge] warning: "${requested}" is not in \`opencode models\`; trying anyway.\n`);
    }
    return requested;
  }
  const env = process.env.OC_BRIDGE_MODEL;
  if (env) return env;
  for (const m of MODEL_PREFERENCE) if (models.includes(m)) return m;
  return models[0] || 'opencode/big-pickle';
}

// ---------------------------------------------------------------------------
// sessions
// ---------------------------------------------------------------------------

function loadSessions() {
  const v = readJson(SESSIONS, {});
  return v && typeof v === 'object' ? v : {};
}

function lastSessionFor(dir) {
  const sessions = loadSessions();
  const key = path.resolve(dir).toLowerCase();
  return sessions[key]?.session || null;
}

function saveSession(dir, info) {
  const sessions = loadSessions();
  sessions[path.resolve(dir).toLowerCase()] = { ...info, at: new Date().toISOString() };
  try {
    fs.mkdirSync(path.dirname(SESSIONS), { recursive: true });
    writeJson(SESSIONS, sessions);
  } catch { /* session memory is best effort */ }
}

// ---------------------------------------------------------------------------
// brief
// ---------------------------------------------------------------------------

function buildBrief({ task, dir, crew, crewDescription, files }) {
  const lines = [
    '# Delegated task — Claude Code → OpenCode bridge',
    '',
    'You are running headless as a sub-agent of Claude Code. Work autonomously and return a report.',
    '',
    '## Context',
    `- Target directory: ${dir}`,
    `- Crew: ${crew}${crewDescription ? ` — ${crewDescription}` : ''}`,
    `- Requested by: Claude Code (upper agent)`,
    `- Time: ${new Date().toISOString()}`,
    '',
    '## Task',
    task.trim(),
    '',
  ];

  if (files.length) {
    lines.push('## Attached files', ...files.map((f) => `- ${f}`), '');
  }

  lines.push(
    '## Scope & rules',
    '1. Read the project\'s AGENTS.md / CLAUDE.md first if present; those rules win over this brief.',
    '2. Work only inside the target directory. Do not modify anything outside it.',
    '3. Load the skills named in your crew prompt before doing the work.',
    '4. Do not ask clarifying questions. Make the smallest reasonable assumption and state it in your report.',
    '5. Never read, print, or modify secrets (.env, credentials, SSH keys, tokens). Never touch .git internals.',
    '6. Do not commit, push, install global packages, or change system configuration unless the task explicitly says to.',
    '7. Prefer the repository\'s existing patterns and the simplest solution that works.',
    '8. Verify with real commands. If verification fails, fix it or report the exact failure — never claim success without evidence.',
    '9. If the task is ambiguous, unsafe, or blocked by missing information, stop and report what you need.',
    '',
    '## Output contract (your final message)',
    'Return a compact report with exactly these sections:',
    '1. **Summary** — what you did, 2–4 sentences.',
    '2. **Files changed** — paths, one per line (or "none").',
    '3. **Verification** — commands run and key output/exit codes.',
    '4. **Open items** — anything unfinished, uncertain, or needing review (or "none").',
    'Do not include hidden reasoning or tool transcripts. Another agent consumes this message.',
    'If the Task section explicitly demands a different final output (for example, "reply with exactly X"), that instruction wins over this report format.',
    '',
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// event parsing (OpenCode v2 `tool_use`, plus legacy `tool_call`)
// ---------------------------------------------------------------------------

function parseEvents(raw) {
  const events = [];
  const bad = [];
  for (const line of String(raw).split(/\r?\n/)) {
    const s = stripAnsi(line).trim();
    if (!s) continue;
    try {
      const ev = JSON.parse(s);
      if (ev && typeof ev === 'object') events.push(ev);
      else bad.push(s);
    } catch {
      bad.push(s);
    }
  }
  return { events, bad };
}

function summarize(events, startedAt) {
  const textParts = [];
  let lastToolTextCursor = 0;
  const calls = [];
  let input = 0;
  let output = 0;
  let reasoning = 0;
  let cost = 0;
  let session = null;
  const errors = [];

  const pushCall = (c) => calls.push(c);

  for (const ev of events) {
    const part = ev.part || {};
    const sid = ev.sessionID || part.sessionID;
    if (sid) session = sid;

    if (ev.type === 'text') {
      const t = stripAnsi(part.text || '');
      if (t) textParts.push(t);
      continue;
    }

    if (ev.type === 'tool_use' || ev.type === 'tool') {
      // Anything said before a tool call is narration, not the final report.
      lastToolTextCursor = textParts.length;
      const name = part.tool || part.name || 'unknown';
      const state = part.state || {};
      const callInput = state.input || part.input || {};
      const callOutput = state.output ?? part.output ?? '';
      const status = state.status || 'completed';
      const exit = state.metadata?.metadata?.exit;
      pushCall({
        name,
        input: callInput,
        output: stripAnsi(String(callOutput)),
        status,
        exit: typeof exit === 'number' ? exit : null,
      });
      if (status === 'error' || (typeof exit === 'number' && exit !== 0)) {
        errors.push({ tool: name, output: oneLine(callOutput, 400), exit: typeof exit === 'number' ? exit : null });
      }
      continue;
    }

    if (ev.type === 'tool_call') {
      lastToolTextCursor = textParts.length;
      pushCall({ name: part.name || 'unknown', input: part.input || {}, output: '', status: 'called', exit: null });
      continue;
    }

    if (ev.type === 'tool_result') {
      const last = calls[calls.length - 1];
      if (last) {
        last.output = stripAnsi(String(part.output || ''));
        last.status = 'completed';
      }
      continue;
    }

    if (ev.type === 'step_finish') {
      const t = part.tokens || {};
      input += t.input || 0;
      output += t.output || 0;
      reasoning += t.reasoning || 0;
      cost += part.cost || 0;
      continue;
    }

    if (ev.type === 'error') {
      errors.push({ tool: 'opencode', output: oneLine(part.message || part.error || JSON.stringify(part), 400), exit: null });
    }
  }

  const finalParts = textParts.length > lastToolTextCursor
    ? textParts.slice(lastToolTextCursor)
    : textParts.slice(-1);
  const text = finalParts.join('').trim();
  const files = new Map();
  const shellCommands = [];

  for (const c of calls) {
    const name = String(c.name).toLowerCase();
    if (['write', 'edit', 'multiedit', 'patch', 'apply_patch', 'create'].includes(name)) {
      const p = c.input.path || c.input.filePath || c.input.file_path || c.input.file || '';
      if (p) {
        const prev = files.get(p) || { path: p, ops: new Set() };
        prev.ops.add(name);
        files.set(p, prev);
      }
    } else if (['shell', 'bash', 'terminal'].includes(name)) {
      const cmd = String(c.input.command || c.input.cmd || '').trim();
      if (cmd) shellCommands.push({ command: cmd, exit: c.exit, status: c.status });
    }
  }

  const toolCounts = {};
  for (const c of calls) toolCounts[c.name] = (toolCounts[c.name] || 0) + 1;

  const verification = shellCommands
    .filter((c) => /\b(test|spec|lint|typecheck|type-check|build|tsc|eslint|ruff|pytest|vitest|jest|playwright|cargo|go\s+test|dotnet|msbuild|make|just)\b/i.test(c.command))
    .filter((c) => !/^\s*(Get-ChildItem|Test-Path|Get-Content|Get-Item|ls|dir|cat)\b/i.test(c.command))
    .slice(-12);

  return {
    text,
    session,
    calls,
    toolCounts,
    files: [...files.values()].map((f) => ({ path: f.path, ops: [...f.ops] })),
    shellCommands,
    verification,
    errors,
    tokens: { input, output, reasoning, total: input + output + reasoning },
    cost,
    durationMs: Date.now() - startedAt,
  };
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

function killTree(child) {
  if (!child || child.killed || !child.pid) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    } else {
      try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
    }
  } catch { /* best effort */ }
}

function runOpencode({ oc, args, cwd, timeoutSec, onLine }) {
  return new Promise((resolve) => {
    const env = { ...process.env, OPENCODE_DISABLE_AUTOUPDATE: 'true', NO_COLOR: '1' };
    let child;
    try {
      child = spawn(oc.cmd, oc.base.concat(args), {
        cwd,
        env,
        windowsHide: true,
        shell: Boolean(oc.shell),
        detached: process.platform !== 'win32',
        // OpenCode reads piped stdin and blocks waiting for EOF. Headless runs
        // must close stdin explicitly.
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      return resolve({ code: 127, signal: null, stdout: '', stderr: String(e.message), timedOut: false });
    }

    let stdout = '';
    let stderr = '';
    let lineBuf = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeoutSec * 1000);
    timer.unref?.();

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');

    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
      if (onLine) {
        lineBuf += chunk;
        const lines = lineBuf.split(/\r?\n/);
        lineBuf = lines.pop() || '';
        for (const line of lines) onLine(line);
      }
    });
    child.stderr?.on('data', (chunk) => { stderr += chunk; });

    const done = (code, signal) => {
      clearTimeout(timer);
      resolve({ code: code ?? (timedOut ? 124 : 1), signal, stdout, stderr, timedOut });
    };

    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: 127, signal: null, stdout, stderr: stderr + String(e.message), timedOut: false });
    });
    child.on('close', done);
  });
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

function statusOf(exit, summary, timedOut) {
  if (timedOut) return 'timeout';
  if (exit !== 0) return 'failed';
  if (!summary.text) return 'empty';
  return 'ok';
}

function renderMarkdown(result) {
  const lines = [];
  lines.push(`## OpenCode run — ${result.crew} @ ${result.dir}`);
  lines.push('');
  lines.push(`**Status:** ${result.status.toUpperCase()}${result.exitCode ? ` (exit ${result.exitCode})` : ''}`);
  lines.push(`**Model:** ${result.model}  |  **Session:** ${result.session || 'n/a'}`);
  lines.push(`**Duration:** ${(result.durationMs / 1000).toFixed(1)}s  |  **Tokens:** ${fmtTokens(result.tokens.input)} in / ${fmtTokens(result.tokens.output)} out  |  **Cost:** $${(result.cost || 0).toFixed(4)}`);
  lines.push(`**Tools:** ${result.toolCallCount} call(s)${Object.keys(result.toolCounts).length ? ` — ${Object.entries(result.toolCounts).map(([k, v]) => `${k}×${v}`).join(', ')}` : ''}`);
  lines.push('');
  lines.push('### Files changed');
  if (result.files.length) {
    for (const f of result.files) lines.push(`- \`${f.path}\` (${f.ops.join(', ')})`);
  } else {
    lines.push('- none detected');
  }
  lines.push('');
  lines.push('### Result');
  lines.push('');
  lines.push(result.text || '_(no text response)_');
  lines.push('');
  if (result.verification.length) {
    lines.push('### Verification commands');
    for (const c of result.verification) {
      const rc = c.exit === null ? '' : ` → exit ${c.exit}`;
      lines.push(`- \`${oneLine(c.command, 180)}\`${rc}`);
    }
    lines.push('');
  }
  if (result.errors.length) {
    lines.push('### Errors');
    for (const e of result.errors) lines.push(`- ${e.tool}${e.exit !== null ? ` (exit ${e.exit})` : ''}: ${oneLine(e.output, 300)}`);
    lines.push('');
  }
  lines.push(`**Log:** ${result.logDir}`);
  if (result.session) lines.push(`**Resume:** \`--session ${result.session}\``);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const crews = readCrews();

  if (opts.help) { process.stdout.write(HELP); return 0; }
  if (opts.listCrews) {
    const names = [...new Set([...CREW_ORDER, ...crews.keys(), ...BUILTIN_CREWS])];
    for (const name of names) {
      const c = crews.get(name);
      process.stdout.write(`${name}${c ? `\t${c.description}` : '\t(built-in)'}\n`);
    }
    return 0;
  }
  if (opts.listModels) {
    const models = listModels();
    if (!models.length) fail('`opencode models` returned nothing. Is a provider authenticated?');
    process.stdout.write(models.join('\n') + '\n');
    return 0;
  }

  const dir = path.resolve(opts.dir || process.cwd());
  if (!exists(dir)) fail(`Target directory does not exist: ${dir}`);
  if (!fs.statSync(dir).isDirectory()) fail(`Target is not a directory: ${dir}`);

  const task = opts.taskFile
    ? fs.readFileSync(path.resolve(opts.taskFile), 'utf8')
    : String(opts.task || '');
  if (!task.trim()) fail('Task is empty.');

  const routing = resolveCrew(crews, opts.crew, task);
  const crew = routing.crew;
  const crewInfo = crews.get(crew);

  const models = listModels();
  const model = pickModel(opts.model, models);

  let session = opts.session || null;
  if (!session && opts.continueLast) session = lastSessionFor(dir);
  if (opts.continueLast && !session) {
    process.stderr.write('[oc-bridge] no previous session for this directory; starting a new one.\n');
  }

  const files = opts.files.map((f) => path.resolve(dir, f)).filter((f) => {
    if (!exists(f)) process.stderr.write(`[oc-bridge] warning: attachment not found: ${f}\n`);
    return exists(f);
  });

  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${crew}-${crypto.randomBytes(3).toString('hex')}`;
  const logDir = path.join(RUNS, runId);
  fs.mkdirSync(logDir, { recursive: true });

  const brief = buildBrief({
    task,
    dir,
    crew,
    crewDescription: crewInfo?.description || routing.reason,
    files,
  });
  const briefPath = path.join(logDir, 'brief.md');
  fs.writeFileSync(briefPath, brief, 'utf8');

  const args = ['run', '--format', 'json', '--auto', '--model', model, '--agent', crew];
  if (session) args.push('--session', session);
  else if (opts.continue) args.push('--continue');
  if (opts.title) args.push('--title', opts.title);
  for (const f of files) args.push('--file', f);
  args.push('--file', briefPath, BRIDGE_MESSAGE);

  if (opts.dryRun) {
    const preview = `opencode ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`;
    const out = { status: 'dry-run', crew, model, dir, session, logDir, briefPath, command: preview };
    process.stdout.write(opts.json ? JSON.stringify(out, null, 2) + '\n' : `[dry-run] ${preview}\nBrief: ${briefPath}\n`);
    return 0;
  }

  const startedAt = Date.now();
  process.stderr.write(`[oc-bridge] ${crew} → ${dir} (model ${model}${session ? `, session ${session}` : ''})\n`);

  const beforeSnapshot = snapshotDir(dir);
  const oc = resolveOpencode();
  const run = await runOpencode({
    oc,
    args,
    cwd: dir,
    timeoutSec: opts.timeout,
    onLine: opts.progress
      ? (line) => {
          try {
            const ev = JSON.parse(line);
            const part = ev.part || {};
            if (ev.type === 'tool_use' || ev.type === 'tool') {
              const name = part.tool || part.name || 'tool';
              const input = part.state?.input || part.input || {};
              const hint = input.path || input.command || input.query || input.pattern || '';
              process.stderr.write(`[oc-bridge] ${name} ${oneLine(hint, 100)}\n`);
            }
          } catch { /* not json */ }
        }
      : null,
  });

  const { events, bad } = parseEvents(run.stdout);
  const summary = summarize(events, startedAt);
  const snapDiff = diffSnapshots(beforeSnapshot, snapshotDir(dir));
  const changedFiles = mergeFiles(summary.files, snapDiff.changes, dir);
  const status = statusOf(run.code, summary, run.timedOut);
  const exitCode = status === 'ok' ? 0 : status === 'timeout' ? 2 : 1;

  const result = {
    status,
    exitCode: run.code,
    crew,
    crewReason: routing.reason,
    autoRouted: Boolean(routing.auto),
    model,
    dir,
    session: summary.session || session,
    durationMs: summary.durationMs,
    tokens: summary.tokens,
    cost: summary.cost,
    files: changedFiles,
    filesChanged: changedFiles.map((f) => f.path),
    filesTruncated: snapDiff.truncated,
    toolCallCount: summary.calls.length,
    toolCounts: summary.toolCounts,
    commands: summary.shellCommands.map((c) => ({ command: c.command, exit: c.exit })),
    verification: summary.verification.map((c) => ({ command: c.command, exit: c.exit })),
    errors: summary.errors,
    text: summary.text,
    logDir,
    briefPath,
    stderr: stripAnsi(run.stderr).trim().slice(-4000),
    unparsedLines: bad.slice(0, 5),
  };

  fs.writeFileSync(path.join(logDir, 'events.ndjson'), run.stdout, 'utf8');
  fs.writeFileSync(path.join(logDir, 'stderr.log'), stripAnsi(run.stderr), 'utf8');
  writeJson(path.join(logDir, 'report.json'), result);
  fs.writeFileSync(path.join(logDir, 'report.md'), renderMarkdown(result) + '\n', 'utf8');

  if (status === 'ok' && result.session) {
    saveSession(dir, { session: result.session, crew, model });
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else if (!opts.quiet) {
    process.stdout.write(renderMarkdown(result) + '\n');
  }

  if (status !== 'ok') {
    const tail = stripAnsi(run.stderr).trim();
    if (tail) process.stderr.write(`[oc-bridge] stderr tail:\n${tail.slice(-1200)}\n`);
  }

  return exitCode;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(`[oc-bridge] ${err.message}\n`);
    process.exit(err.exitCode || 1);
  });
