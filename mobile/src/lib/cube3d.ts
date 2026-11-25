import type { ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

export type CubeColors = Record<string, string>;
export type CubeMove = { face: string; amount: number };

const ALL = [-1, 0, 1];
const PLASTIC = 0x1c232d;

export const MOVE_DEFS: Record<string, { axis: 0 | 1 | 2; layers: number[]; sign: 1 | -1 }> = {
  R: { axis: 0, layers: [1], sign: -1 },
  L: { axis: 0, layers: [-1], sign: 1 },
  M: { axis: 0, layers: [0], sign: 1 },
  x: { axis: 0, layers: ALL, sign: -1 },
  r: { axis: 0, layers: [0, 1], sign: -1 },
  l: { axis: 0, layers: [-1, 0], sign: 1 },
  U: { axis: 1, layers: [1], sign: -1 },
  D: { axis: 1, layers: [-1], sign: 1 },
  E: { axis: 1, layers: [0], sign: 1 },
  y: { axis: 1, layers: ALL, sign: -1 },
  u: { axis: 1, layers: [0, 1], sign: -1 },
  d: { axis: 1, layers: [-1, 0], sign: 1 },
  F: { axis: 2, layers: [1], sign: -1 },
  B: { axis: 2, layers: [-1], sign: 1 },
  S: { axis: 2, layers: [0], sign: -1 },
  z: { axis: 2, layers: ALL, sign: -1 },
  f: { axis: 2, layers: [0, 1], sign: -1 },
  b: { axis: 2, layers: [-1, 0], sign: 1 },
};

/** Cubies sit at ±1 with size 0.92 → half-extent 1.46. Sphere covers every corner while orbiting. */
const CUBE_EXTENT = 1.46;
const CUBE_SPHERE = CUBE_EXTENT * Math.sqrt(3);

const FACE_MATS: { axis: 0 | 1 | 2; sign: 1 | -1; key: string }[] = [
  { axis: 0, sign: 1, key: 'R' },
  { axis: 0, sign: -1, key: 'L' },
  { axis: 1, sign: 1, key: 'U' },
  { axis: 1, sign: -1, key: 'D' },
  { axis: 2, sign: 1, key: 'F' },
  { axis: 2, sign: -1, key: 'B' },
];

const SLOT_AZ: Record<string, number> = {
  FR: (32 * Math.PI) / 180,
  FL: (-32 * Math.PI) / 180,
  BR: (149 * Math.PI) / 180,
  BL: (-149 * Math.PI) / 180,
};

export function parseHex(s: string): number {
  const m = String(s).trim();
  const h = m[0] === '#' ? m.slice(1) : m;
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(full, 16);
  return Number.isFinite(n) ? n : 0x888888;
}

function greyHex(colors: CubeColors) {
  return parseHex(colors.X || '#7c8591');
}

/** Stickering matches the 2D case diagrams: F2L greys the last layer, OLL is U-orientation, PLL is U-face. */
function stickerHex(stickering: string, home: number[], face: (typeof FACE_MATS)[number], colors: CubeColors): number {
  const outer = home[face.axis] === face.sign;
  if (!outer) return PLASTIC;
  const faceHex = parseHex(colors[face.key] || '#888888');
  const grey = greyHex(colors);
  const onLastLayer = home[1] === 1;
  if (stickering === 'F2L') return onLastLayer ? grey : faceHex;
  if (stickering === 'OLL') {
    if (face.key === 'D') return PLASTIC;
    if (onLastLayer && face.key !== 'U') return grey;
    return faceHex;
  }
  if (stickering === 'PLL') {
    if (face.key === 'U') return faceHex;
    if (onLastLayer) return grey;
    return PLASTIC;
  }
  return faceHex;
}

function axisName(axis: 0 | 1 | 2): 'x' | 'y' | 'z' {
  return axis === 0 ? 'x' : axis === 1 ? 'y' : 'z';
}

function snap90(rad: number) {
  return Math.round(rad / (Math.PI / 2)) * (Math.PI / 2);
}

function now() {
  return globalThis.performance?.now?.() ?? Date.now();
}

const UNIMPLEMENTED_GL = [
  'getFramebufferAttachmentParameter',
  'getRenderbufferParameter',
  'compressedTexImage2D',
  'compressedTexSubImage2D',
  'getTexParameter',
  'getUniform',
  'getVertexAttrib',
  'getVertexAttribOffset',
  'getBufferSubData',
  'getInternalformatParameter',
  'renderbufferStorageMultisample',
  'compressedTexImage3D',
  'compressedTexSubImage3D',
  'fenceSync',
  'isSync',
  'deleteSync',
  'clientWaitSync',
  'waitSync',
  'getSyncParameter',
  'getActiveUniformBlockParameter',
] as const;

function wrapGL(gl: ExpoWebGLRenderingContext) {
  const attrs: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
    desynchronized: false,
    xrCompatible: false,
  };
  try {
    (gl as ExpoWebGLRenderingContext & { getContextAttributes: () => WebGLContextAttributes }).getContextAttributes = () => attrs;
  } catch {
    /* native getter may be readonly */
  }
  // expo-gl documents these as unimplemented; three probing them can native-crash a release APK.
  const g = gl as unknown as Record<string, unknown>;
  for (const name of UNIMPLEMENTED_GL) {
    try {
      g[name] = () => null;
    } catch {
      /* ignore */
    }
  }
  try {
    g.getExtension = () => null;
  } catch {
    /* ignore */
  }
  return gl;
}

function createCanvasShim(gl: ExpoWebGLRenderingContext) {
  const canvas: Record<string, unknown> = {
    width: gl.drawingBufferWidth || 1,
    height: gl.drawingBufferHeight || 1,
    style: { width: '100%', height: '100%' },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
    setAttribute() {},
    getContext(type?: string) {
      if (type && type !== 'webgl2' && type !== 'webgl' && type !== 'experimental-webgl') return null;
      return gl;
    },
    getContextAttributes() {
      return typeof gl.getContextAttributes === 'function' ? gl.getContextAttributes() : null;
    },
    getRootNode() {
      return canvas;
    },
  };
  Object.defineProperties(canvas, {
    clientWidth: { get: () => Number(canvas.width) || 1 },
    clientHeight: { get: () => Number(canvas.height) || 1 },
  });
  try {
    (gl as unknown as { canvas: unknown }).canvas = canvas;
  } catch {
    /* native gl.canvas may be readonly */
  }
  return canvas as unknown as HTMLCanvasElement;
}

type Anim = {
  axis: 'x' | 'y' | 'z';
  from: number;
  to: number;
  t0: number;
  dur: number;
  onDone: () => void;
};

export class CubeEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cubies: THREE.Mesh[] = [];
  pivot = new THREE.Group();
  anim: Anim | null = null;
  azimuth: number;
  /** Polar angle from +Y. ~0.96 is cubing.js default (~35° latitude). */
  polar = 0.96;
  radius = 12;
  gl: ExpoWebGLRenderingContext;
  colors: CubeColors;
  stickering: string;
  geo: THREE.BoxGeometry;
  disposed = false;

  constructor(
    gl: ExpoWebGLRenderingContext,
    opts: { colors: CubeColors; stickering?: string; slot?: string }
  ) {
    this.gl = wrapGL(gl);
    this.colors = opts.colors;
    this.stickering = opts.stickering ?? 'full';
    this.azimuth = SLOT_AZ[opts.slot ?? 'FR'] ?? SLOT_AZ.FR;
    this.polar = 0.96;

    const w = Math.max(1, gl.drawingBufferWidth);
    const h = Math.max(1, gl.drawingBufferHeight);
    const canvas = createCanvasShim(this.gl);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 80);
    this.geo = new THREE.BoxGeometry(0.92, 0.92, 0.92);

    // Do not pass `context` into three r163+. A native expo-gl handle is often
    // `instanceof WebGLRenderingContext`, which three treats as WebGL 1 and
    // throws. The canvas shim's getContext() returns the same gl instead.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.08));
    const key = new THREE.DirectionalLight(0xffffff, 0.5);
    key.position.set(4, 7, 5);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.2);
    fill.position.set(-5, -2, -3);
    this.scene.add(fill);

    this.scene.add(this.pivot);
    this.buildCubies();
    this.fitToView();
  }

  private materialFor(home: number[], face: (typeof FACE_MATS)[number]) {
    return new THREE.MeshLambertMaterial({ color: stickerHex(this.stickering, home, face, this.colors) });
  }

  buildCubies() {
    for (const cubie of this.cubies) {
      cubie.removeFromParent();
      (cubie.material as THREE.Material[]).forEach((m) => m.dispose());
    }
    this.cubies = [];
    this.pivot.clear();

    for (const x of ALL) {
      for (const y of ALL) {
        for (const z of ALL) {
          if (x === 0 && y === 0 && z === 0) continue;
          const home = [x, y, z];
          const mesh = new THREE.Mesh(
            this.geo,
            FACE_MATS.map((face) => this.materialFor(home, face))
          );
          mesh.position.set(x, y, z);
          mesh.userData.home = home;
          this.scene.add(mesh);
          this.cubies.push(mesh);
        }
      }
    }
  }

  recolor(colors: CubeColors) {
    this.colors = colors;
    for (const mesh of this.cubies) {
      const home = mesh.userData.home as number[];
      const mats = mesh.material as THREE.MeshLambertMaterial[];
      FACE_MATS.forEach((face, i) => {
        mats[i].color.setHex(stickerHex(this.stickering, home, face, colors));
      });
    }
  }

  resetSolved() {
    if (this.anim) this.finishAnim(true);
    this.buildCubies();
  }

  applyMovesInstant(moves: CubeMove[]) {
    for (const move of moves) this.turnInstant(move.face, move.amount);
  }

  turnInstant(face: string, amount: number) {
    const def = MOVE_DEFS[face];
    if (!def || !amount) return;
    this.gatherLayer(def);
    this.rotateAxis(this.pivot, def.axis, amount * def.sign * (Math.PI / 2));
    this.bakePivot();
  }

  startMove(face: string, amount: number, duration: number, onDone: () => void) {
    const def = MOVE_DEFS[face];
    if (!def || !amount) {
      onDone();
      return;
    }
    if (this.anim) this.finishAnim(true);
    this.gatherLayer(def);
    this.anim = {
      axis: axisName(def.axis),
      from: 0,
      to: amount * def.sign * (Math.PI / 2),
      t0: now(),
      dur: Math.max(36, duration),
      onDone,
    };
  }

  private gatherLayer(def: { axis: 0 | 1 | 2; layers: number[] }) {
    this.pivot.rotation.set(0, 0, 0);
    this.pivot.updateMatrixWorld();
    for (const mesh of this.cubies) {
      const v = [mesh.position.x, mesh.position.y, mesh.position.z][def.axis];
      if (def.layers.includes(Math.round(v))) {
        this.scene.remove(mesh);
        this.pivot.add(mesh);
      }
    }
  }

  private rotateAxis(obj: THREE.Object3D, axis: 0 | 1 | 2, angle: number) {
    if (axis === 0) obj.rotateX(angle);
    else if (axis === 1) obj.rotateY(angle);
    else obj.rotateZ(angle);
  }

  private bakePivot() {
    const world = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    this.pivot.updateMatrixWorld(true);
    const children = [...this.pivot.children] as THREE.Mesh[];
    for (const mesh of children) {
      mesh.getWorldPosition(world);
      mesh.getWorldQuaternion(quat);
      this.pivot.remove(mesh);
      this.scene.add(mesh);
      mesh.position.set(Math.round(world.x), Math.round(world.y), Math.round(world.z));
      euler.setFromQuaternion(quat, 'XYZ');
      euler.x = snap90(euler.x);
      euler.y = snap90(euler.y);
      euler.z = snap90(euler.z);
      mesh.quaternion.setFromEuler(euler);
    }
    this.pivot.rotation.set(0, 0, 0);
  }

  finishAnim(skipCb = false) {
    if (!this.anim) return;
    const { axis, to, onDone } = this.anim;
    this.pivot.rotation[axis] = to;
    this.bakePivot();
    this.anim = null;
    if (!skipCb) onDone();
  }

  tick(t = now()) {
    if (!this.anim) return;
    const { axis, from, to, t0, dur } = this.anim;
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - (1 - p) ** 3;
    this.pivot.rotation[axis] = from + (to - from) * eased;
    if (p >= 1) this.finishAnim();
  }

  orbit(dx: number, dy: number) {
    this.azimuth -= dx * 0.01;
    this.polar = Math.max(0.08, Math.min(Math.PI - 0.08, this.polar - dy * 0.01));
    this.updateCamera();
  }

  /** Pull the camera back so the full cube (including corners while orbiting) sits inside the view. */
  fitToView(padding = 1.42) {
    const fov = (this.camera.fov * Math.PI) / 180;
    const aspect = Math.max(0.25, this.camera.aspect || 1);
    const vDist = CUBE_SPHERE / Math.tan(fov / 2);
    const hDist = CUBE_SPHERE / (Math.tan(fov / 2) * aspect);
    this.radius = padding * Math.max(vDist, hDist);
    this.camera.near = 0.1;
    this.camera.far = Math.max(80, this.radius * 4);
    this.camera.updateProjectionMatrix();
    this.updateCamera();
  }

  updateCamera() {
    const theta = this.polar;
    const phi = this.azimuth;
    this.camera.position.set(
      this.radius * Math.sin(theta) * Math.sin(phi),
      this.radius * Math.cos(theta),
      this.radius * Math.sin(theta) * Math.cos(phi)
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 1, 0);
  }

  render() {
    if (this.disposed) return;
    try {
      this.renderer.render(this.scene, this.camera);
      this.gl.endFrameEXP();
    } catch {
      this.disposed = true;
    }
  }

  setSize(w: number, h: number) {
    if (w < 1 || h < 1) return;
    this.camera.aspect = w / h;
    this.fitToView();
    this.renderer.setSize(w, h, false);
    const el = this.renderer.domElement as unknown as { width: number; height: number };
    if (el) {
      el.width = w;
      el.height = h;
    }
  }

  dispose() {
    this.disposed = true;
    this.anim = null;
    try {
      this.geo.dispose();
      for (const cubie of this.cubies) {
        (cubie.material as THREE.Material[]).forEach((m) => m.dispose());
      }
      this.renderer.dispose();
    } catch {
      /* release GL teardown can throw after the view is gone */
    }
  }
}

/** Website BootLoader algs — scramble then inverse sexy-move solve. Native U is already yellow, so no z2. */
export const BOOT_SETUP = "F R U' R' F R U' R' F R U' R' F R U' R'";
export const BOOT_ALG = "R U R' F' R U R' F' R U R' F' R U R' F'";

/** cubing.js needed a z2 because its default is white-on-top. This engine's U is already yellow. */
export function withOrientation(setup: string) {
  return setup.trim();
}
