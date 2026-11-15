// Compone el lienzo final de un material: diseño + juntas (lechada).
// Sirve tanto para la textura 3D como para las miniaturas del catálogo.
import { crearLienzo } from './util.js';
import * as F1 from './familias1.js';
import * as F2 from './familias2.js';

const FAMILIAS = {
  madera: F1.madera, marmol: F1.marmol, cemento: F1.cemento, piedra: F1.piedra,
  damero: F1.damero, liso: F1.liso, mosaico: F1.mosaico,
  espiga: F2.espiga, hexagono: F2.hexagono, subway: F2.subway, ladrillo: F2.ladrillo,
  hidraulico: F2.hidraulico, talavera: F2.talavera, imagen: F2.imagen,
};

export const familiaDe = (mat) => (mat.origen === 'generado' ? FAMILIAS[mat.familia] : FAMILIAS.imagen);
export const moduloCm = (mat) => familiaDe(mat).modulo(mat);

// ---- Imágenes (fotos de fábrica o subidas)
const imgCache = new Map();
export function cargarImagen(url) {
  if (!imgCache.has(url)) {
    imgCache.set(url, new Promise((res, rej) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => res(img);
      img.onerror = () => { imgCache.delete(url); rej(new Error(`No se pudo cargar la imagen: ${url}`)); };
      img.src = url;
    }));
  }
  return imgCache.get(url);
}

// ---- Cache del diseño sin juntas (así mover el control de juntas no vuelve a dibujar todo)
const arteCache = new Map();
const MAX_ARTE = 24;

export function claveMaterial(mat) {
  const m = mat.modulo || {};
  return [mat.id, mat.imagen || '', mat.pieza.ancho, mat.pieza.largo, m.cols || 1, m.filas || 1].join('|');
}

async function obtenerArte(mat, maxPx) {
  const clave = `${claveMaterial(mat)}|${maxPx}`;
  if (arteCache.has(clave)) {
    const v = arteCache.get(clave);
    arteCache.delete(clave); arteCache.set(clave, v);
    return v;
  }
  const fam = familiaDe(mat);
  const img = mat.origen === 'generado' ? null : await cargarImagen(mat.imagen);
  const mod = fam.modulo(mat);
  const px = maxPx / Math.max(mod.ancho, mod.largo);
  const W = Math.max(8, Math.round(mod.ancho * px));
  const H = Math.max(8, Math.round(mod.largo * px));
  const lienzo = crearLienzo(W, H);
  const ctx = lienzo.getContext('2d');
  fam.arte(ctx, W, H, mat, px, img);
  const v = { lienzo, W, H, px, modulo: mod };
  arteCache.set(clave, v);
  if (arteCache.size > MAX_ARTE) arteCache.delete(arteCache.keys().next().value);
  return v;
}

/**
 * Devuelve { lienzo, W, H, px, modulo } con el diseño y las juntas dibujadas.
 * juntaMm = 0 => sin juntas.
 */
export async function componerMaterial(mat, { juntaMm = 3, juntaColor = '#d8d4cc', maxPx = 1024 } = {}) {
  const base = await obtenerArte(mat, maxPx);
  const { W, H, px } = base;
  const lienzo = crearLienzo(W, H);
  const ctx = lienzo.getContext('2d');
  ctx.drawImage(base.lienzo, 0, 0);
  if (juntaMm > 0) {
    const fam = familiaDe(mat);
    const jp = Math.max(1.3, (juntaMm / 10) * px);
    ctx.lineJoin = 'round';
    // halo oscuro suave: da la sensación de junta hundida
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    fam.juntas(ctx, W, H, mat, px, jp * 2.3);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = juntaColor;
    fam.juntas(ctx, W, H, mat, px, jp);
    ctx.restore();
  }
  return { lienzo, W, H, px, modulo: base.modulo };
}

/** Dibuja una miniatura que muestra el patrón repetido (cuadrado de lado `canvas.width`). */
export async function dibujarMiniatura(canvas, mat, juntaColor = '#d8d4cc') {
  const size = canvas.width;
  const mod = moduloCm(mat);
  const mayor = Math.max(mod.ancho, mod.largo);
  const vista = Math.max(mayor, 80); // cm que se ven en la miniatura
  const pxCm = size / vista;
  const r = await componerMaterial(mat, { juntaMm: 3, juntaColor, maxPx: Math.max(16, Math.round(mayor * pxCm)) });
  const ctx = canvas.getContext('2d');
  const patron = ctx.createPattern(r.lienzo, 'repeat');
  ctx.fillStyle = patron;
  ctx.fillRect(0, 0, size, size);
}
