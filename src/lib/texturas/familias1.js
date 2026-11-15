// Familias de patrones (parte 1): madera, mármol, cemento, piedra, damero, liso, mosaico.
// Cada familia define:
//   modulo(mat)  -> tamaño real (cm) del bloque que se repite
//   arte(...)    -> dibuja el diseño SIN juntas
//   juntas(...)  -> dibuja solo las juntas (lechada) sobre el diseño
import { mulberry32, hashStr, noise2, fbm, tono, mezcla, rgbHex, hexRgb, rgba, lienzoRuido, variar } from './util.js';

export const TAU = Math.PI * 2;

// Repite el dibujo en los 8 vecinos para que lo que cruza el borde continúe al otro lado
export function envolver(ctx, W, H, fn) {
  for (const dx of [-W, 0, W]) {
    for (const dy of [-H, 0, H]) {
      ctx.save();
      ctx.translate(dx, dy);
      fn();
      ctx.restore();
    }
  }
}

export function juntasRejilla(ctx, W, H, cols, rows, jp, { v = true, h = true } = {}) {
  ctx.lineWidth = jp;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  if (v) for (let i = 0; i <= cols; i++) { const x = (i * W) / cols; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  if (h) for (let j = 0; j <= rows; j++) { const y = (j * H) / rows; ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

// Reparte un bloque de NxM piezas y llama fn(i, j, x, y, w, h)
export function porPiezas(W, H, cols, rows, fn) {
  const pw = W / cols, ph = H / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) fn(i, j, i * pw, j * ph, pw, ph);
}

const resRuido = (w) => Math.min(256, Math.max(32, Math.round(w * 0.5)));

// ---------------------------------------------------------------- MADERA
function offsetsMadera(mat, cols, pl) {
  const r = mulberry32(hashStr(mat.id + 'off'));
  return Array.from({ length: cols }, () => r() * pl);
}

function tablon(ctx, x, y, w, h, seed, p, px) {
  const rng = mulberry32(seed);
  const base = rgbHex(mezcla(p.claro, p.oscuro, rng()));
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, tono(base, 0.05));
  g.addColorStop(0.5, base);
  g.addColorStop(1, tono(base, -0.05));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const lw = Math.max(0.6, px * 0.12);
  const nlin = Math.max(6, Math.round(w / (px * 0.55)));
  for (let i = 0; i < nlin; i++) {
    const gx = x + rng() * w;
    const a = 0.05 + rng() * 0.16;
    const oscura = rng() < 0.72;
    ctx.strokeStyle = oscura ? rgba(p.veta, a) : rgba('#ffffff', a * 0.7);
    ctx.lineWidth = lw * (0.5 + rng() * 2.4);
    ctx.beginPath();
    const ph = rng() * 100;
    const amp = w * 0.09;
    for (let yy = y; yy <= y + h + 8; yy += 8) {
      const xx = gx + (noise2(ph + i * 0.7, yy / (px * 9)) - 0.5) * amp * 2;
      if (yy === y) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  if (rng() < 0.5) {
    const cx = x + w * (0.25 + rng() * 0.5);
    const cy = y + h * (0.15 + rng() * 0.7);
    for (let r = 1; r <= 4; r++) {
      ctx.strokeStyle = rgba(p.veta, 0.3 / r);
      ctx.lineWidth = lw * 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.045 * r, w * 0.13 * r, 0, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export const madera = {
  modulo: (m) => ({ ancho: 4 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat, px) {
    const p = mat.paleta, cols = 4, aw = W / cols, pl = H / 2;
    const offs = offsetsMadera(mat, cols, pl);
    for (let c = 0; c < cols; c++) {
      for (let k = -1; k <= 2; k++) {
        const idx = ((k % 2) + 2) % 2;
        tablon(ctx, c * aw, k * pl - offs[c], aw, pl + 0.5, hashStr(`${mat.id}p${c}_${idx}`), p, px);
      }
    }
  },
  juntas(ctx, W, H, mat, px, jp) {
    const cols = 4, pl = H / 2;
    const offs = offsetsMadera(mat, cols, pl);
    ctx.lineWidth = jp;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) { const x = (c * W) / cols; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let c = 0; c < cols; c++) {
      const aw = W / cols;
      for (let k = -1; k <= 2; k++) {
        const y = k * pl - offs[c];
        ctx.moveTo(c * aw, y); ctx.lineTo((c + 1) * aw, y);
      }
    }
    ctx.stroke();
  },
};

// ---------------------------------------------------------------- MÁRMOL
function colorMarmol(u, v, seed, p) {
  const sx = p.estira ? p.estira[0] : 1, sy = p.estira ? p.estira[1] : 1;
  const x = u * 3 * sx + seed * 0.37, y = v * 3 * sy + seed * 0.61;
  const nube = fbm(x * 0.8, y * 0.8, 4, seed);
  const w = fbm(x * 1.6 + 11, y * 1.6 + 7, 3, seed + 5);
  const r1 = 1 - Math.abs(2 * fbm(x * p.veinScale + w * p.warp, y * p.veinScale + w * p.warp, 4, seed + 9) - 1);
  const v1 = Math.pow(r1, p.veinPow);
  const r2 = 1 - Math.abs(2 * fbm(x * p.veinScale * 2.3 + w * p.warp * 1.4 + 40, y * p.veinScale * 2.3 + w * p.warp * 1.4, 3, seed + 21) - 1);
  const v2 = Math.pow(r2, p.veinPow * 1.8) * 0.6;
  let col = mezcla(p.base1, p.base2, nube);
  col = mezcla(col, p.vein, Math.min(1, (v1 + v2) * p.veinAlpha));
  return col;
}

export const marmol = {
  modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat) {
    const p = mat.paleta;
    porPiezas(W, H, 2, 2, (i, j, x, y, pw, ph) => {
      const seed = hashStr(`${mat.id}${i}_${j}`) % 997;
      const r = resRuido(pw);
      const c = lienzoRuido(r, Math.max(8, Math.round((r * ph) / pw)), (u, v) => colorMarmol(u, v, seed, p));
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(c, x, y, pw, ph);
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 2, 2, jp),
};

// ---------------------------------------------------------------- CEMENTO
export const cemento = {
  modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat) {
    const p = mat.paleta;
    porPiezas(W, H, 2, 2, (i, j, x, y, pw, ph) => {
      const seed = hashStr(`${mat.id}${i}_${j}`) % 997;
      const r = resRuido(pw);
      const c = lienzoRuido(r, Math.max(8, Math.round((r * ph) / pw)), (u, v, px_, py_) => {
        const n = fbm(u * 3 + seed, v * 3 + seed * 0.5, 5, seed);
        const t = fbm(u * 1.5 + 3, v * 7 + 1, 3, seed + 3);
        const grano = (noise2(px_ * 0.9, py_ * 0.9, seed) - 0.5) * 0.18;
        const m = Math.min(1, Math.max(0, (n - 0.25) * 1.9 + (t - 0.5) * 0.4 + grano));
        return mezcla(p.c1, p.c2, m);
      });
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(c, x, y, pw, ph);
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 2, 2, jp),
};

// ---------------------------------------------------------------- PIEDRA / PIZARRA
export const piedra = {
  modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat) {
    const p = mat.paleta;
    porPiezas(W, H, 2, 2, (i, j, x, y, pw, ph) => {
      const seed = hashStr(`${mat.id}${i}_${j}`) % 997;
      const r = resRuido(pw);
      const tonoPieza = 0.9 + ((seed % 100) / 100) * 0.2;
      const c = lienzoRuido(r, Math.max(8, Math.round((r * ph) / pw)), (u, v) => {
        const n = fbm(u * 4 + seed, v * 4, 5, seed);
        const estrato = noise2(u * 5 + seed, v * 38, seed + 4);
        const mancha = fbm(u * 2.2 + 9, v * 2.2 + seed, 4, seed + 8);
        let col = mezcla(p.c1, p.c2, Math.min(1, Math.max(0, (n - 0.2) * 1.7)));
        col = mezcla(col, [col[0] * 0.78, col[1] * 0.78, col[2] * 0.78], estrato * 0.6);
        if (mancha > 0.58) col = mezcla(col, p.c3, Math.min(0.75, (mancha - 0.58) * 3));
        return [col[0] * tonoPieza, col[1] * tonoPieza, col[2] * tonoPieza];
      });
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(c, x, y, pw, ph);
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 2, 2, jp),
};

// ---------------------------------------------------------------- DAMERO
export const damero = {
  modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat, px) {
    const p = mat.paleta, rng = mulberry32(hashStr(mat.id));
    porPiezas(W, H, 2, 2, (i, j, x, y, pw, ph) => {
      const base = variar((i + j) % 2 === 0 ? p.c1 : p.c2, rng, 0.015);
      ctx.fillStyle = base;
      ctx.fillRect(x, y, pw, ph);
      const g = ctx.createLinearGradient(x, y, x + pw, y + ph);
      g.addColorStop(0, 'rgba(255,255,255,0.10)');
      g.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.07)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, pw, ph);
      // granulado fino tipo porcelanato
      for (let k = 0; k < 220; k++) {
        ctx.fillStyle = rng() < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
        const s = Math.max(1, px * 0.25 * rng());
        ctx.fillRect(x + rng() * pw, y + rng() * ph, s, s);
      }
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 2, 2, jp),
};

// ---------------------------------------------------------------- LISO (cerámica esmaltada)
export const liso = {
  modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat, px) {
    const p = mat.paleta, rng = mulberry32(hashStr(mat.id));
    porPiezas(W, H, 2, 2, (i, j, x, y, pw, ph) => {
      ctx.fillStyle = variar(p.color, rng, 0.02);
      ctx.fillRect(x, y, pw, ph);
      const g = ctx.createLinearGradient(x, y, x + pw * 0.6, y + ph);
      g.addColorStop(0, 'rgba(255,255,255,0.14)');
      g.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, pw, ph);
      if (p.estilo === 'lineas') {
        const paso = px * 1.6;
        for (let xx = x + paso / 2; xx < x + pw; xx += paso) {
          ctx.fillStyle = 'rgba(0,0,0,0.10)';
          ctx.fillRect(xx, y, Math.max(1, px * 0.25), ph);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(xx + Math.max(1, px * 0.25), y, Math.max(1, px * 0.2), ph);
        }
      } else if (p.estilo === 'ondas') {
        ctx.lineWidth = Math.max(1, px * 0.35);
        for (let yy = y + px * 1.2; yy < y + ph; yy += px * 1.2) {
          ctx.strokeStyle = 'rgba(255,255,255,0.14)';
          ctx.beginPath();
          for (let xx = x; xx <= x + pw; xx += 4) ctx.lineTo(xx, yy + Math.sin(((xx - x) / pw) * TAU * 3) * px * 0.35);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(0,0,0,0.10)';
          ctx.beginPath();
          for (let xx = x; xx <= x + pw; xx += 4) ctx.lineTo(xx, yy + px * 0.4 + Math.sin(((xx - x) / pw) * TAU * 3) * px * 0.35);
          ctx.stroke();
        }
      }
      // bisel suave en los bordes de la pieza
      const b = Math.max(1.5, px * 0.22);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x, y, pw, b); ctx.fillRect(x, y, b, ph);
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.fillRect(x, y + ph - b, pw, b); ctx.fillRect(x + pw - b, y, b, ph);
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 2, 2, jp),
};

// ---------------------------------------------------------------- MOSAICO (malla de piezas pequeñas)
const MOS_N = 6;
export const mosaico = {
  modulo: (m) => ({ ancho: m.pieza.ancho, largo: m.pieza.largo }),
  arte(ctx, W, H, mat) {
    const p = mat.paleta, rng = mulberry32(hashStr(mat.id));
    porPiezas(W, H, MOS_N, MOS_N, (i, j, x, y, pw, ph) => {
      const col = p.colores[Math.floor(rng() * p.colores.length)];
      ctx.fillStyle = variar(col, rng, 0.05);
      ctx.fillRect(x, y, pw, ph);
      const g = ctx.createLinearGradient(x, y, x + pw, y + ph);
      g.addColorStop(0, 'rgba(255,255,255,0.18)');
      g.addColorStop(1, 'rgba(0,0,0,0.10)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, pw, ph);
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, MOS_N, MOS_N, Math.max(1.2, jp * 0.8)),
};

export { hexRgb };
