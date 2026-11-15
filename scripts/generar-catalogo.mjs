// Lee las carpetas public/texturas/pisos y public/texturas/paredes y genera public/catalogo-imagenes.json
// Formato del nombre de archivo:  Nombre_Con_Espacios-ANCHOxLARGO.ext   (medidas en cm)
//   Si la imagen contiene varias piezas que forman el dibujo:  Nombre-60x60-m2x2.ext  (2 columnas x 2 filas)
// Datos opcionales (precio, piezas por caja, marca, acabado) en public/texturas/datos.csv
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), 'public');
const CARPETAS = { piso: 'texturas/pisos', pared: 'texturas/paredes' };
const EXT = new Set(['.webp', '.png', '.jpg', '.jpeg']);
const RE = /^(.+?)-(\d+(?:[.,]\d+)?)x(\d+(?:[.,]\d+)?)(?:-m(\d+)x(\d+))?$/i;
const num = (s) => Number(String(s).replace(',', '.'));

function leerCsv() {
  const f = path.join(RAIZ, 'texturas', 'datos.csv');
  const datos = new Map();
  if (!fs.existsSync(f)) return datos;
  const lineas = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
  const cab = lineas.shift().split(',').map((c) => c.trim().toLowerCase());
  for (const l of lineas) {
    const cols = l.split(',').map((c) => c.trim());
    const fila = Object.fromEntries(cab.map((c, i) => [c, cols[i]]));
    if (fila.archivo) datos.set(fila.archivo.toLowerCase(), fila);
  }
  return datos;
}

const csv = leerCsv();
const salida = [];
const avisos = [];

for (const [tipo, rel] of Object.entries(CARPETAS)) {
  const dir = path.join(RAIZ, rel);
  if (!fs.existsSync(dir)) continue;
  for (const archivo of fs.readdirSync(dir).sort()) {
    const ext = path.extname(archivo).toLowerCase();
    if (!EXT.has(ext)) continue;
    const base = path.basename(archivo, path.extname(archivo));
    const m = base.match(RE);
    if (!m) { avisos.push(`${rel}/${archivo}: nombre sin medidas (usa Nombre-60x60.jpg). Se omite.`); continue; }
    const [, nombreRaw, w, h, mc, mf] = m;
    const ancho = num(w), largo = num(h);
    const cols = mc ? Number(mc) : 1, filas = mf ? Number(mf) : 1;
    const extra = csv.get(archivo.toLowerCase()) || {};
    const areaPieza = ancho * largo;
    const piezasPorCaja = Number(extra.piezas_por_caja) || Math.max(1, Math.round(14400 / areaPieza));
    const mini = path.join(dir, 'min', `${base}.webp`);
    salida.push({
      id: `f-${tipo}-${base.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      nombre: (extra.nombre || nombreRaw.replace(/_/g, ' ')).trim(),
      tipo,
      imagen: `${rel}/${archivo}`,
      miniatura: fs.existsSync(mini) ? `${rel}/min/${base}.webp` : null,
      pieza: { ancho, largo },
      modulo: { cols, filas },
      piezasPorCaja,
      precioCaja: Number(extra.precio_caja) || 0,
      marca: extra.marca || '',
      acabado: ['Brillante', 'Satinado', 'Mate', 'Rústico', 'Relieve 3D'].includes(extra.acabado) ? extra.acabado : 'Satinado',
    });
  }
}

fs.writeFileSync(path.join(RAIZ, 'catalogo-imagenes.json'), JSON.stringify(salida, null, 1));
console.log(`catalogo-imagenes.json: ${salida.length} material(es) desde carpetas.`);
avisos.forEach((a) => console.warn('  aviso:', a));
