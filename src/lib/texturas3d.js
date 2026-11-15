// Convierte los lienzos en texturas de three.js (con caché para no regenerar).
import * as THREE from 'three';
import { componerMaterial, claveMaterial } from './texturas/render.js';

const cache = new Map();
const MAX = 18;

export const TEXTURA_BLANCA = (() => {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
})();

export function obtenerTextura(mat, junta, anisotropia = 8) {
  const clave = `${claveMaterial(mat)}|${junta.mm}|${junta.color}`;
  if (cache.has(clave)) {
    const p = cache.get(clave);
    cache.delete(clave); cache.set(clave, p);
    return p;
  }
  const promesa = componerMaterial(mat, { juntaMm: junta.mm, juntaColor: junta.color, maxPx: 1024 }).then((r) => {
    const tex = new THREE.CanvasTexture(r.lienzo);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropia;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return { tex, modulo: r.modulo };
  });
  cache.set(clave, promesa);
  promesa.catch(() => cache.delete(clave));
  if (cache.size > MAX) {
    const vieja = cache.keys().next().value;
    const p = cache.get(vieja);
    cache.delete(vieja);
    p.then((v) => v.tex.dispose()).catch(() => {});
  }
  return promesa;
}
