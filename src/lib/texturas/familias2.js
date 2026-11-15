// Familias de patrones (parte 2): espiga, hexágono, ladrillo/subway, hidráulico, talavera, imagen.
import { mulberry32, hashStr, hash3, noise2, tono, mezcla, rgbHex, rgba, variar } from './util.js';
import { TAU, envolver, juntasRejilla, porPiezas } from './familias1.js';

const SQ2 = Math.SQRT2;
const SQ3 = Math.sqrt(3);

// ---------------------------------------------------------------- ESPIGA (parquet 45°)
// Teselado de tablones 1 x L. Se gira 45° y se obtiene un bloque rectangular que repite sin cortes.
const ESP_NX = 2, ESP_NY = 5;
const espigaL = (m) => Math.max(2, Math.round(m.pieza.largo / m.pieza.ancho));

function recorrerTablones(mat, W, H, cb) {
  const L = espigaL(mat);
  const Wr = SQ2 * L * ESP_NX, Hr = SQ2 * ESP_NY;
  const c = Math.SQRT1_2;
  const esq = [[0, 0], [Wr, 0], [0, Hr], [Wr, Hr]].map(([X, Y]) => [c * X + c * Y, -c * X + c * Y]);
  const xmin = Math.min(...esq.map((e) => e[0])), xmax = Math.max(...esq.map((e) => e[0]));
  const ymin = Math.min(...esq.map((e) => e[1])), ymax = Math.max(...esq.map((e) => e[1]));
  for (let n = Math.floor(ymin - L - 2); n <= Math.ceil(ymax + 2); n++) {
    const m0 = Math.ceil((xmin - L - 2 - n) / (2 * L));
    const m1 = Math.floor((xmax + 2 - n) / (2 * L));
    for (let m = m0; m <= m1; m++) {
      const q = Math.floor(m / ESP_NX);
      const mm = m - ESP_NX * q;
      const nn = n + L * ESP_NX * q;
      const n2 = ((nn % ESP_NY) + ESP_NY) % ESP_NY;
      const X = n + 2 * L * m;
      cb('H', hash3(mm, n2, 1), X, n, L, 1);
      cb('V', hash3(mm, n2, 2), X + L, n - L + 1, 1, L);
    }
  }
  return { Wr, Hr };
}

function aplicarGiro(ctx, W, H, mat) {
  const L = espigaL(mat);
  const Wr = SQ2 * L * ESP_NX, Hr = SQ2 * ESP_NY;
  const sx = W / Wr, sy = H / Hr, c = Math.SQRT1_2;
  ctx.setTransform(sx * c, sy * c, -sx * c, sy * c, 0, 0);
  return (sx + sy) / 2;
}

export const espiga = {
  modulo: (m) => {
    const L = espigaL(m), u = m.pieza.ancho;
    return { ancho: SQ2 * L * ESP_NX * u, largo: SQ2 * ESP_NY * u };
  },
  arte(ctx, W, H, mat) {
    const p = mat.paleta;
    ctx.save();
    ctx.fillStyle = p.oscuro;
    ctx.fillRect(0, 0, W, H);
    aplicarGiro(ctx, W, H, mat);
    recorrerTablones(mat, W, H, (tipo, h, x, y, w, hh) => {
      const rng = mulberry32(Math.floor(h * 4294967295));
      const base = rgbHex(mezcla(p.claro, p.oscuro, rng()));
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, hh);
      ctx.clip();
      const horiz = tipo === 'H';
      const g = horiz ? ctx.createLinearGradient(0, y, 0, y + hh) : ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, tono(base, 0.06));
      g.addColorStop(0.5, base);
      g.addColorStop(1, tono(base, -0.06));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, hh);
      for (let i = 0; i < 7; i++) {
        const t = rng();
        ctx.strokeStyle = rng() < 0.7 ? rgba(p.veta, 0.07 + rng() * 0.14) : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.02 + rng() * 0.04;
        ctx.beginPath();
        if (horiz) { ctx.moveTo(x, y + t); ctx.lineTo(x + w, y + t + (rng() - 0.5) * 0.08); }
        else { ctx.moveTo(x + t, y); ctx.lineTo(x + t + (rng() - 0.5) * 0.08, y + hh); }
        ctx.stroke();
      }
      ctx.restore();
    });
    ctx.restore();
  },
  juntas(ctx, W, H, mat, px, jp) {
    ctx.save();
    const s = aplicarGiro(ctx, W, H, mat);
    ctx.lineWidth = jp / s;
    ctx.lineJoin = 'miter';
    recorrerTablones(mat, W, H, (tipo, h, x, y, w, hh) => ctx.strokeRect(x, y, w, hh));
    ctx.restore();
  },
};

// ---------------------------------------------------------------- HEXÁGONO
const HEX_NX = 3, HEX_NY = 2;
function hexDatos(mat) {
  const A = mat.pieza.ancho; // distancia entre lados paralelos
  const r = A / SQ3;
  return { A, r, anchoM: HEX_NX * A, altoM: HEX_NY * 3 * r };
}
function recorrerHex(mat, W, H, cb) {
  const { A, r, anchoM, altoM } = hexDatos(mat);
  const kx = W / anchoM, ky = H / altoM;
  for (let k = 0; k < 2 * HEX_NY; k++) {
    for (let i = 0; i < HEX_NX; i++) {
      const cx = ((k % 2 === 0 ? A / 2 : A) + i * A) * kx;
      const cy = (r + k * 1.5 * r) * ky;
      cb(k, i, cx, cy, r * kx, r * ky);
    }
  }
}
function trazoHex(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
export const hexagono = {
  modulo: (m) => { const d = hexDatos(m); return { ancho: d.anchoM, largo: d.altoM }; },
  arte(ctx, W, H, mat, px) {
    const p = mat.paleta, rng0 = mulberry32(hashStr(mat.id));
    const asign = {};
    recorrerHex(mat, W, H, (k, i) => { asign[`${k}_${i}`] = Math.floor(rng0() * p.colores.length); });
    ctx.fillStyle = p.colores[0];
    ctx.fillRect(0, 0, W, H);
    envolver(ctx, W, H, () => {
      recorrerHex(mat, W, H, (k, i, cx, cy, rx, ry) => {
        const rng = mulberry32(hashStr(`${mat.id}h${k}_${i}`));
        const col = variar(p.colores[asign[`${k}_${i}`]], rng, 0.035);
        trazoHex(ctx, cx, cy, rx, ry);
        ctx.fillStyle = col;
        ctx.fill();
        const g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
        g.addColorStop(0, 'rgba(255,255,255,0.14)');
        g.addColorStop(1, 'rgba(0,0,0,0.10)');
        ctx.fillStyle = g;
        ctx.fill();
      });
    });
  },
  juntas(ctx, W, H, mat, px, jp) {
    ctx.lineWidth = jp;
    ctx.lineJoin = 'round';
    envolver(ctx, W, H, () => recorrerHex(mat, W, H, (k, i, cx, cy, rx, ry) => { trazoHex(ctx, cx, cy, rx, ry); ctx.stroke(); }));
  },
};

// ---------------------------------------------------------------- LADRILLO / SUBWAY (trabado a media pieza)
function piezasTrabadas(W, H) {
  const aw = W / 2, ah = H / 2;
  return [
    { x: 0, y: 0, w: aw, h: ah, id: 0 }, { x: aw, y: 0, w: aw, h: ah, id: 1 },
    { x: aw / 2, y: ah, w: aw, h: ah, id: 2 }, { x: aw * 1.5, y: ah, w: aw, h: ah, id: 3 },
  ];
}
function trabado(estilo) {
  return {
    modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
    arte(ctx, W, H, mat, px) {
      const p = mat.paleta;
      ctx.fillStyle = p.color || p.colores[0];
      ctx.fillRect(0, 0, W, H);
      envolver(ctx, W, H, () => {
        piezasTrabadas(W, H).forEach((q) => {
          const rng = mulberry32(hashStr(`${mat.id}b${q.id}`));
          const col = estilo === 'ladrillo'
            ? p.colores[Math.floor(rng() * p.colores.length)]
            : variar(p.color, rng, 0.018);
          ctx.fillStyle = estilo === 'ladrillo' ? variar(col, rng, 0.05) : col;
          ctx.fillRect(q.x, q.y, q.w, q.h);
          if (estilo === 'ladrillo') {
            for (let k = 0; k < 320; k++) {
              ctx.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)';
              const s = Math.max(1, px * 0.22 * rng());
              ctx.fillRect(q.x + rng() * q.w, q.y + rng() * q.h, s, s);
            }
          } else {
            const g = ctx.createLinearGradient(q.x, q.y, q.x + q.w * 0.5, q.y + q.h);
            g.addColorStop(0, 'rgba(255,255,255,0.20)');
            g.addColorStop(0.5, 'rgba(255,255,255,0.02)');
            g.addColorStop(1, 'rgba(0,0,0,0.10)');
            ctx.fillStyle = g;
            ctx.fillRect(q.x, q.y, q.w, q.h);
            const b = Math.max(1.5, px * 0.28);
            ctx.fillStyle = 'rgba(255,255,255,0.30)';
            ctx.fillRect(q.x, q.y, q.w, b); ctx.fillRect(q.x, q.y, b, q.h);
            ctx.fillStyle = 'rgba(0,0,0,0.20)';
            ctx.fillRect(q.x, q.y + q.h - b, q.w, b); ctx.fillRect(q.x + q.w - b, q.y, b, q.h);
          }
        });
      });
    },
    juntas(ctx, W, H, mat, px, jp) {
      ctx.lineWidth = jp;
      envolver(ctx, W, H, () => piezasTrabadas(W, H).forEach((q) => ctx.strokeRect(q.x, q.y, q.w, q.h)));
    },
  };
}
export const subway = trabado('subway');
export const ladrillo = trabado('ladrillo');

// ---------------------------------------------------------------- HIDRÁULICO (mosaico de cemento / mayólica geométrica)
function motivoHidraulico(ctx, x, y, s, rot, i, j, p) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, s, s);
  ctx.clip();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate((rot * Math.PI) / 2);
  ctx.translate(-s / 2, -s / 2);
  const inv = (i + j) % 2 === 1;
  const fondo = inv && p.estilo === 'rombo' ? p.c1 : p.fondo;
  const color1 = inv && p.estilo === 'rombo' ? p.fondo : p.c1;
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, s, s);
  if (p.estilo === 'arcos') {
    for (const [cx, cy] of [[0, 0], [s, s]]) {
      ctx.fillStyle = p.c1;
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = p.fondo;
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.36, 0, TAU); ctx.fill();
      ctx.fillStyle = p.c2;
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.22, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = p.c2;
    ctx.lineWidth = s * 0.018;
    ctx.strokeRect(s * 0.04, s * 0.04, s * 0.92, s * 0.92);
  } else if (p.estilo === 'rombo') {
    const rombo = (k, col) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(s / 2, s / 2 - s * k); ctx.lineTo(s / 2 + s * k, s / 2);
      ctx.lineTo(s / 2, s / 2 + s * k); ctx.lineTo(s / 2 - s * k, s / 2);
      ctx.closePath(); ctx.fill();
    };
    rombo(0.5, color1);
    rombo(0.34, fondo);
    rombo(0.2, p.c2);
    ctx.fillStyle = p.c2;
    for (const [cx, cy] of [[0, 0], [s, 0], [0, s], [s, s]]) {
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.13, 0, TAU); ctx.fill();
    }
  } else {
    // flor
    for (const [cx, cy] of [[0, 0], [s, 0], [0, s], [s, s]]) {
      ctx.fillStyle = p.c3 || p.c2;
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.2, 0, TAU); ctx.fill();
    }
    for (let k = 0; k < 4; k++) {
      ctx.save();
      ctx.translate(s / 2, s / 2);
      ctx.rotate((k * Math.PI) / 2);
      ctx.fillStyle = p.c1;
      ctx.beginPath(); ctx.ellipse(0, -s * 0.24, s * 0.12, s * 0.22, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = p.c2;
      ctx.beginPath(); ctx.ellipse(0, -s * 0.24, s * 0.04, s * 0.13, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = p.c2;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, s * 0.09, 0, TAU); ctx.fill();
  }
  // leve brillo de esmalte
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, 'rgba(255,255,255,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.restore();
}
const ROT_HID = [[0, 1], [3, 2]];
export const hidraulico = {
  modulo: (m) => ({ ancho: 2 * m.pieza.ancho, largo: 2 * m.pieza.largo }),
  arte(ctx, W, H, mat) {
    const p = mat.paleta;
    porPiezas(W, H, 2, 2, (i, j, x, y, pw) => {
      const rot = p.estilo === 'arcos' ? ROT_HID[j][i] : 0;
      motivoHidraulico(ctx, x, y, pw, rot, i, j, p);
    });
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 2, 2, jp),
};

// ---------------------------------------------------------------- TALAVERA (floral, una pieza se repite)
function flor(ctx, cx, cy, r, c1, c2, c3, petalos = 8) {
  for (let k = 0; k < petalos; k++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((k * TAU) / petalos);
    ctx.fillStyle = k % 2 === 0 ? c1 : c3;
    ctx.beginPath(); ctx.ellipse(0, -r * 0.62, r * 0.2, r * 0.4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = c2;
    ctx.lineWidth = r * 0.035;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(0, -r * 0.62, r * 0.05, r * 0.24, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = c2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.24, 0, TAU); ctx.fill();
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.15, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.arc(cx - r * 0.04, cy - r * 0.04, r * 0.04, 0, TAU); ctx.fill();
}
export const talavera = {
  modulo: (m) => ({ ancho: m.pieza.ancho, largo: m.pieza.largo }),
  arte(ctx, W, H, mat) {
    const p = mat.paleta, s = W;
    ctx.fillStyle = p.fondo;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.scale(1, H / W);
    // marco fino
    ctx.strokeStyle = rgba(p.c1, 0.55);
    ctx.lineWidth = s * 0.012;
    ctx.strokeRect(s * 0.035, s * 0.035, s * 0.93, s * 0.93);
    // flor en cada esquina (4 esquinas de piezas vecinas completan una flor)
    for (const [cx, cy] of [[0, 0], [s, 0], [0, s], [s, s]]) flor(ctx, cx, cy, s * 0.36, p.c1, p.c2, p.c3);
    // hojas diagonales hacia el centro
    ctx.fillStyle = p.c3;
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      ctx.save();
      ctx.translate(s / 2 + dx * s * 0.17, s / 2 + dy * s * 0.17);
      ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.045, s * 0.12, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    // flor central
    flor(ctx, s / 2, s / 2, s * 0.25, p.c1, p.c2, p.c3, 8);
    // rombos en los puntos medios de los bordes
    ctx.fillStyle = p.c2;
    for (const [cx, cy] of [[s / 2, 0], [s / 2, s], [0, s / 2], [s, s / 2]]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.07); ctx.lineTo(cx + s * 0.07, cy);
      ctx.lineTo(cx, cy + s * 0.07); ctx.lineTo(cx - s * 0.07, cy);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,255,255,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  },
  juntas: (ctx, W, H, mat, px, jp) => juntasRejilla(ctx, W, H, 1, 1, jp),
};

// ---------------------------------------------------------------- IMAGEN (fotos de fábrica o subidas por el usuario)
export const imagen = {
  modulo: (m) => {
    const c = m.modulo?.cols || 1, f = m.modulo?.filas || 1;
    return { ancho: c * m.pieza.ancho, largo: f * m.pieza.largo };
  },
  arte(ctx, W, H, mat, px, img) {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, W, H);
    if (img) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, W, H);
    }
  },
  juntas(ctx, W, H, mat, px, jp) {
    juntasRejilla(ctx, W, H, mat.modulo?.cols || 1, mat.modulo?.filas || 1, jp);
  },
};
