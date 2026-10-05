/**
 * Utilidades para graficar funciones matemáticas sin dependencias externas.
 *
 * Sintaxis admitida por `parseExpression`:
 *   - Variables: `x` (y `y`/`t` según la función de compilación usada)
 *   - Constantes: `pi`, `e`, `tau`
 *   - Operadores: `+ - * / ^`, unario `-`, paréntesis
 *   - Multiplicación implícita: `2x`, `3sin(x)`, `2(x+1)`
 *   - Funciones: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh,
 *     exp, ln, log (base 10), log2, sqrt, abs, floor, ceil, round, sign,
 *     gamma, erf
 */

type Token =
  | { type: 'num'; value: number }
  | { type: 'id'; value: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

type Node =
  | { type: 'num'; value: number }
  | { type: 'const'; value: number }
  | { type: 'var'; index: number }
  | { type: 'neg'; operand: Node }
  | { type: 'bin'; op: string; left: Node; right: Node }
  | { type: 'call'; name: string; args: Node[] };

export interface Point {
  x: number;
  y: number | null;
}

const BINARY_PREC: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 4,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

/** Aproximación de Lanczos para la función Gamma. */
function gammaFn(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
  z -= 1;
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = coefficients[0]!;
  for (let i = 1; i < g + 2; i++) x += coefficients[i]! / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/** Aproximación de Abramowitz y Stegun (7.1.26) para la función error. */
function erfFn(x: number): number {
  const sign = Math.sign(x);
  const value = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * value);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-value * value);
  return sign * y;
}

const FUNCTIONS: Record<string, (args: number[]) => number> = {
  sin: (a) => Math.sin(a[0]),
  cos: (a) => Math.cos(a[0]),
  tan: (a) => Math.tan(a[0]),
  asin: (a) => Math.asin(a[0]),
  acos: (a) => Math.acos(a[0]),
  atan: (a) => Math.atan(a[0]),
  sinh: (a) => Math.sinh(a[0]),
  cosh: (a) => Math.cosh(a[0]),
  tanh: (a) => Math.tanh(a[0]),
  exp: (a) => Math.exp(a[0]),
  ln: (a) => Math.log(a[0]),
  log: (a) => (a.length > 1 ? Math.log(a[0]) / Math.log(a[1]) : Math.log10(a[0])),
  log2: (a) => Math.log2(a[0]),
  sqrt: (a) => Math.sqrt(a[0]),
  abs: (a) => Math.abs(a[0]),
  floor: (a) => Math.floor(a[0]),
  ceil: (a) => Math.ceil(a[0]),
  round: (a) => Math.round(a[0]),
  sign: (a) => Math.sign(a[0]),
  gamma: (a) => gammaFn(a[0]),
  erf: (a) => erfFn(a[0]),
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    if ('+-*/^'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const match = /^[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/.exec(input.slice(i));
      const text = match ? match[0] : '';
      if (!text || !/[0-9]/.test(text)) {
        throw new Error(`Número inválido en la posición ${i}`);
      }
      tokens.push({ type: 'num', value: Number(text) });
      i += text.length;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      const match = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(input.slice(i));
      const text = match ? match[0] : '';
      tokens.push({ type: 'id', value: text });
      i += text.length;
      continue;
    }
    throw new Error(`Carácter inesperado «${ch}» en la posición ${i}`);
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private variables: string[];
  private pos = 0;

  constructor(tokens: Token[], variables: string[]) {
    this.tokens = tokens;
    this.variables = variables;
  }

  parse(): Node {
    const node = this.parseExpression(0);
    if (this.pos < this.tokens.length) {
      throw new Error('Expresión mal formada');
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  private parseExpression(minPrec: number): Node {
    let left = this.parseUnary();
    for (;;) {
      const token = this.peek();
      let op: string | null = null;
      let prec = 0;
      let implicit = false;
      if (token && token.type === 'op' && token.value !== '^' && BINARY_PREC[token.value] !== undefined) {
        op = token.value;
        prec = BINARY_PREC[op]!;
      } else if (token && (token.type === 'num' || token.type === 'id' || token.type === 'lparen')) {
        op = '*';
        prec = BINARY_PREC['*']!;
        implicit = true;
      } else {
        break;
      }
      if (prec < minPrec) break;
      if (!implicit) this.next();
      const right = this.parseExpression(prec + 1);
      left = { type: 'bin', op, left, right };
    }
    return left;
  }

  private parseUnary(): Node {
    const token = this.peek();
    if (token && token.type === 'op' && (token.value === '-' || token.value === '+')) {
      this.next();
      const operand = this.parseUnary();
      return token.value === '-' ? { type: 'neg', operand } : operand;
    }
    return this.parsePower();
  }

  private parsePower(): Node {
    const base = this.parsePrimary();
    const token = this.peek();
    if (token && token.type === 'op' && token.value === '^') {
      this.next();
      const exponent = this.parseUnary();
      return { type: 'bin', op: '^', left: base, right: exponent };
    }
    return base;
  }

  private parsePrimary(): Node {
    const token = this.next();
    if (!token) throw new Error('Expresión incompleta');

    if (token.type === 'num') return { type: 'num', value: token.value };

    if (token.type === 'lparen') {
      const node = this.parseExpression(0);
      const close = this.next();
      if (!close || close.type !== 'rparen') throw new Error('Falta un paréntesis de cierre');
      return node;
    }

    if (token.type === 'id') {
      const name = token.value;
      const nextToken = this.peek();
      if (nextToken && nextToken.type === 'lparen') {
        if (!(name in FUNCTIONS)) throw new Error(`Función desconocida «${name}»`);
        this.next();
        const args: Node[] = [];
        if (this.peek()?.type !== 'rparen') {
          args.push(this.parseExpression(0));
          while (this.peek()?.type === 'comma') {
            this.next();
            args.push(this.parseExpression(0));
          }
        }
        const close = this.next();
        if (!close || close.type !== 'rparen') throw new Error('Falta un paréntesis de cierre');
        return { type: 'call', name, args };
      }
      const varIndex = this.variables.indexOf(name);
      if (varIndex >= 0) return { type: 'var', index: varIndex };
      if (name in CONSTANTS) return { type: 'const', value: CONSTANTS[name]! };
      throw new Error(`Identificador desconocido «${name}»`);
    }

    throw new Error('Token inesperado');
  }
}

function evaluate(node: Node, vars: number[]): number {
  switch (node.type) {
    case 'num':
      return node.value;
    case 'const':
      return node.value;
    case 'var':
      return vars[node.index]!;
    case 'neg':
      return -evaluate(node.operand, vars);
    case 'bin': {
      const left = evaluate(node.left, vars);
      const right = evaluate(node.right, vars);
      switch (node.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
        case '^':
          return Math.pow(left, right);
        default:
          throw new Error(`Operador desconocido «${node.op}»`);
      }
    }
    case 'call':
      return FUNCTIONS[node.name]!(node.args.map((arg) => evaluate(arg, vars)));
    default:
      throw new Error('Nodo desconocido');
  }
}

export function compileExpression(
  source: string,
  variables: string[]
): (...args: number[]) => number {
  const tokens = tokenize(source);
  const ast = new Parser(tokens, variables).parse();
  return (...args: number[]) => evaluate(ast, args);
}

export function parseExpression(source: string): (x: number) => number {
  const compiled = compileExpression(source, ['x']);
  return (x: number) => compiled(x);
}

export function parseExpression2(source: string): (x: number, y: number) => number {
  const compiled = compileExpression(source, ['x', 'y']);
  return (x: number, y: number) => compiled(x, y);
}

export function parseExpressionT(source: string): (t: number) => number {
  return compileExpression(source, ['t']);
}

export function sampleFunction(
  f: (x: number) => number,
  xmin: number,
  xmax: number,
  samples: number
): Point[] {
  const points: Point[] = [];
  const count = Math.max(2, Math.floor(samples));
  for (let i = 0; i <= count; i++) {
    const x = xmin + ((xmax - xmin) * i) / count;
    let y: number;
    try {
      y = f(x);
    } catch {
      y = NaN;
    }
    points.push({ x, y: Number.isFinite(y) ? y : null });
  }
  return points;
}

export function linearScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number
): (value: number) => number {
  const span = domainMax - domainMin || 1;
  return (value: number) => rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin);
}

export function niceTicks(min: number, max: number, target = 8): number[] {
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return [min];
  const rawStep = span / Math.max(2, target);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let step: number;
  if (normalized < 1.5) step = 1;
  else if (normalized < 3) step = 2;
  else if (normalized < 7) step = 5;
  else step = 10;
  step *= magnitude;

  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let value = start; value <= max + step * 1e-6; value += step) {
    ticks.push(Math.round(value / step) * step);
  }
  return ticks;
}

/** Rango robusto recortando valores atípicos (asíntotas) por rango intercuartílico. */
export function robustRange(values: number[]): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return [-1, 1];

  const sorted = [...finite].sort((a, b) => a - b);
  const pick = (p: number) => sorted[Math.round(p * (sorted.length - 1))]!;
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;
  const q1 = pick(0.25);
  const q3 = pick(0.75);
  const median = pick(0.5);
  const iqr = q3 - q1;

  let lo = min;
  let hi = max;
  if (iqr > 0) {
    const limit = 3 * iqr;
    lo = Math.max(lo, median - limit);
    hi = Math.min(hi, median + limit);
  }
  if (!(hi > lo)) {
    const center = (lo + hi) / 2;
    lo = center - 1;
    hi = center + 1;
  }
  const padding = (hi - lo) * 0.08;
  return [lo - padding, hi + padding];
}

export function autoYRange(points: Point[]): [number, number] {
  return robustRange(points.filter((p) => p.y !== null).map((p) => p.y as number));
}

export function linspace(min: number, max: number, segments: number): number[] {
  const count = Math.max(1, Math.floor(segments));
  const values: number[] = [];
  for (let i = 0; i <= count; i++) values.push(min + ((max - min) * i) / count);
  return values;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Camera {
  right: Vec3;
  up: Vec3;
  forward: Vec3;
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

/** Construye la base de la cámara a partir de los ángulos (en grados). */
export function makeCamera(azimuth: number, elevation: number): Camera {
  const a = (azimuth * Math.PI) / 180;
  const e = (elevation * Math.PI) / 180;
  const forward: Vec3 = {
    x: Math.cos(e) * Math.cos(a),
    y: Math.cos(e) * Math.sin(a),
    z: Math.sin(e),
  };
  const right = normalize({ x: -forward.y, y: forward.x, z: 0 });
  const up: Vec3 = {
    x: forward.y * right.z - forward.z * right.y,
    y: forward.z * right.x - forward.x * right.z,
    z: forward.x * right.y - forward.y * right.x,
  };
  return { right, up, forward };
}

export interface Projected {
  sx: number;
  sy: number;
  depth: number;
}

export function projectPoint(
  point: Vec3,
  camera: Camera,
  perspective = false,
  distance = 4
): Projected {
  const rx = dot(point, camera.right);
  const ry = dot(point, camera.up);
  const depth = dot(point, camera.forward);
  if (perspective) {
    const denominator = Math.max(0.05, distance - depth);
    return { sx: (distance * rx) / denominator, sy: (distance * ry) / denominator, depth };
  }
  return { sx: rx, sy: ry, depth };
}

/** Normaliza un valor al intervalo [-0.5, 0.5] dado su rango. */
export function normalizeAxis(value: number, min: number, max: number): number {
  const span = max - min || 1;
  return (value - min) / span - 0.5;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function dotProduct(a: Vec3, b: Vec3): number {
  return dot(a, b);
}

export function normalizeVector(v: Vec3): Vec3 {
  return normalize(v);
}

const VIRIDIS: [number, number, number][] = [
  [68, 1, 84],
  [59, 82, 139],
  [33, 145, 140],
  [94, 201, 98],
  [253, 231, 37],
];

/** Interpola la paleta viridis; `t` se recorta a [0, 1]. */
export function colormap(t: number): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (VIRIDIS.length - 1);
  const index = Math.min(VIRIDIS.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const from = VIRIDIS[index]!;
  const to = VIRIDIS[index + 1]!;
  return [
    Math.round(from[0] + (to[0] - from[0]) * local),
    Math.round(from[1] + (to[1] - from[1]) * local),
    Math.round(from[2] + (to[2] - from[2]) * local),
  ];
}

export function rgbString([r, g, b]: [number, number, number], factor = 1): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${clamp(r)} ${clamp(g)} ${clamp(b)})`;
}

/** Gradiente CSS de la paleta viridis, útil para barras de color. */
export function viridisGradientCss(): string {
  const stops = VIRIDIS.map(
    (color, index) => `${rgbString(color)} ${(index / (VIRIDIS.length - 1)) * 100}%`
  );
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export function sampleInteger(
  f: (x: number) => number,
  xmin: number,
  xmax: number
): Point[] {
  const points: Point[] = [];
  const start = Math.ceil(xmin);
  const end = Math.floor(xmax);
  for (let k = start; k <= end; k++) {
    let y: number;
    try {
      y = f(k);
    } catch {
      y = NaN;
    }
    points.push({ x: k, y: Number.isFinite(y) ? y : null });
  }
  return points;
}

export function buildAreaPath(
  points: Point[],
  xScale: (value: number) => number,
  yScale: (value: number) => number,
  from: number,
  to: number
): string {
  const within = points.filter((p) => p.x >= from && p.x <= to && p.y !== null);
  if (within.length < 2) return '';
  const first = within[0]!;
  const last = within[within.length - 1]!;
  let path = `M${xScale(first.x).toFixed(2)} ${yScale(0).toFixed(2)}`;
  for (const point of within) {
    path += `L${xScale(point.x).toFixed(2)} ${yScale(point.y as number).toFixed(2)}`;
  }
  path += `L${xScale(last.x).toFixed(2)} ${yScale(0).toFixed(2)}Z`;
  return path;
}

export function buildPath(
  points: Point[],
  xScale: (value: number) => number,
  yScale: (value: number) => number,
  yRange: [number, number]
): string {
  const span = yRange[1] - yRange[0];
  let path = '';
  let pen = false;
  let previousY: number | null = null;

  for (const point of points) {
    if (point.y === null) {
      pen = false;
      previousY = null;
      continue;
    }
    if (pen && previousY !== null && Math.abs(point.y - previousY) > span * 1.5) {
      pen = false;
    }
    const px = xScale(point.x).toFixed(2);
    const py = yScale(point.y).toFixed(2);
    path += `${pen ? 'L' : 'M'}${px} ${py}`;
    pen = true;
    previousY = point.y;
  }
  return path;
}
