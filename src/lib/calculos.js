// Cálculo de piezas, desperdicio y costos. Todas las medidas internas en centímetros.
import { areaPiezaCm2 } from './medidas.js';

const KERF = 0.3; // cm que consume el disco de corte
const EPS = 0.5;  // cm: sobrantes menores se consideran "calza justo"

/**
 * Piezas necesarias para cubrir un rectángulo a x b (cm) con piezas p x q (cm) y junta j (cm).
 * Con `reutilizar`, el sobrante de una pieza cortada se usa para la siguiente fila/columna.
 */
export function piezasRectangulo(a, b, p, q, j, reutilizar) {
  const nc = Math.max(0, Math.floor((a + j) / (p + j)));
  const nr = Math.max(0, Math.floor((b + j) / (q + j)));
  const wc = a - nc * (p + j);   // ancho de la pieza cortada de la última columna
  const hc = b - nr * (q + j);   // alto de la pieza cortada de la última fila
  const hayCorteCol = wc > EPS;
  const hayCorteFila = hc > EPS;
  const rendCol = reutilizar && hayCorteCol ? Math.max(1, Math.floor((p + KERF) / (wc + KERF))) : 1;
  const rendFila = reutilizar && hayCorteFila ? Math.max(1, Math.floor((q + KERF) / (hc + KERF))) : 1;
  const completas = nc * nr;
  const cortesCol = hayCorteCol ? Math.ceil(nr / rendCol) : 0;
  const cortesFila = hayCorteFila ? Math.ceil(nc / rendFila) : 0;
  const esquina = hayCorteCol && hayCorteFila ? 1 : 0;
  return {
    total: completas + cortesCol + cortesFila + esquina,
    completas, cortesCol, cortesFila, esquina,
    piezasCortadas: (hayCorteCol ? nr : 0) + (hayCorteFila ? nc : 0) + esquina,
    cols: nc + (hayCorteCol ? 1 : 0), filas: nr + (hayCorteFila ? 1 : 0),
  };
}

/** Elige la orientación (normal o girada 90°) que usa menos piezas. */
export function mejorOrientacion(a, b, p, q, j, reutilizar, permitirGirar) {
  const normal = { ...piezasRectangulo(a, b, p, q, j, reutilizar), girada: false, p, q };
  if (!permitirGirar) return normal;
  const girada = { ...piezasRectangulo(a, b, q, p, j, reutilizar), girada: true, p: q, q: p };
  return girada.total < normal.total ? girada : normal;
}

function ahorroAberturas(aberturas, pared, p, q, j, zocaloCm, tope) {
  // piezas que no hacen falta por puertas/ventanas (estimación conservadora: solo piezas enteras)
  let ahorro = 0, areaCm2 = 0, anchoPuertas = 0;
  for (const ab of aberturas) {
    if (ab.pared !== pared) continue;
    const w = ab.ancho * 100, h = ab.alto * 100, s = ab.alzado * 100;
    const solape = Math.max(0, Math.min(s + h, tope) - Math.max(s, zocaloCm));
    ahorro += ab.cantidad * Math.floor(w / (p + j)) * Math.floor(solape / (q + j));
    areaCm2 += ab.cantidad * w * solape;
    if (ab.tipo === 'puerta') anchoPuertas += ab.cantidad * ab.ancho;
  }
  return { ahorro, areaCm2, anchoPuertas };
}

function resumenSuperficie(nombre, mat, piezasGrilla, areaBrutaM2, areaAberturasM2, estado, margenPct, extras = {}) {
  const aPieza = areaPiezaCm2(mat) / 10000;
  const areaNeta = Math.max(0, areaBrutaM2 - areaAberturasM2);
  const factorJunta = estado.factorJunta;
  const areaVisible = areaNeta * factorJunta; // superficie cubierta por piezas (sin juntas)
  const conMargen = Math.ceil(piezasGrilla * (1 + margenPct / 100));
  const cajas = mat.piezasPorCaja > 0 ? Math.ceil(conMargen / mat.piezasPorCaja) : 0;
  const compradas = cajas * mat.piezasPorCaja;
  const areaCompradaM2 = compradas * aPieza;
  const desperdicioCorte = Math.max(0, piezasGrilla * aPieza - areaVisible);
  const excedente = Math.max(0, areaCompradaM2 - piezasGrilla * aPieza);
  const desperdicioTotal = desperdicioCorte + excedente;
  return {
    nombre, mat, areaBrutaM2, areaAberturasM2, areaNetaM2: areaNeta,
    piezasGrilla, piezasConMargen: conMargen, cajas, piezasCompradas: compradas,
    sobrantesEnCaja: compradas - conMargen,
    costo: cajas * (mat.precioCaja || 0),
    desperdicioCorteM2: desperdicioCorte, excedenteM2: excedente, desperdicioTotalM2: desperdicioTotal,
    desperdicioPct: areaCompradaM2 > 0 ? (desperdicioTotal / areaCompradaM2) * 100 : 0,
    ...extras,
  };
}

/**
 * Calcula el informe completo.
 * @param {{room, piso, pared, revestidas, zocalo, enchape, aberturas, calc, junta}} d
 */
export function calcularInforme(d) {
  const { room, piso, pared, revestidas, zocalo, enchape, aberturas, calc, junta } = d;
  const A = room.ancho * 100, L = room.largo * 100, H = room.alto * 100;
  const j = junta.mm / 10;
  const zCm = Math.min(zocalo.cm, H - 1);
  const tope = enchape.completo ? H : Math.min(enchape.m * 100, H);
  const altoEnchape = Math.max(0, tope - zCm);
  const factor = (mat) => {
    const pw = mat.pieza.ancho, ph = mat.pieza.largo;
    return mat.forma === 'hex' ? 1 / (1 + j / pw) ** 2 : (pw * ph) / ((pw + j) * (ph + j));
  };

  const superficies = [];

  // ---- PISO
  if (piso) {
    let piezas, detalle = null, nota = null;
    if (piso.calculo === 'area') {
      const aPieza = areaPiezaCm2(piso) / 10000;
      piezas = Math.ceil(((A * L) / 10000) * (1 + (piso.factorDesperdicio || 0.12)) / aPieza);
      nota = `Estimación por área (+${Math.round((piso.factorDesperdicio || 0.12) * 100)} % por cortes propios de este diseño).`;
    } else {
      const o = mejorOrientacion(A, L, piso.pieza.ancho, piso.pieza.largo, j, calc.reutilizar, calc.girar);
      piezas = o.total; detalle = o;
    }
    superficies.push(resumenSuperficie('Piso', piso, piezas, (A * L) / 10000, 0, { factorJunta: factor(piso) }, calc.margen, { detalle, nota, tipoSuperficie: 'piso' }));
  }

  // ---- PAREDES
  let zocaloLineal = 0, areaPintura = 0;
  const largoPared = { fondo: A, frente: A, izquierda: L, derecha: L };
  let piezasParedGrilla = 0, areaParedBruta = 0, areaParedAbert = 0;
  const detallePared = [];
  for (const id of ['fondo', 'izquierda', 'derecha', 'frente']) {
    const len = largoPared[id];
    const ab = ahorroAberturas(aberturas, id, pared?.pieza.ancho || 1, pared?.pieza.largo || 1, j, zCm, tope);
    zocaloLineal += Math.max(0, len / 100 - ab.anchoPuertas);
    if (!revestidas[id] || !pared || altoEnchape <= 0) {
      areaPintura += Math.max(0, (len * (H - zCm)) / 10000 - ab.areaCm2 / 10000);
      detallePared.push({ pared: id, revestida: false });
      continue;
    }
    areaPintura += (len * Math.max(0, H - tope)) / 10000;
    const brutaM2 = (len * altoEnchape) / 10000;
    const abertM2 = ab.areaCm2 / 10000;
    let piezas;
    if (pared.calculo === 'area') {
      const aPieza = areaPiezaCm2(pared) / 10000;
      piezas = Math.ceil(Math.max(0, brutaM2 - abertM2) * (1 + (pared.factorDesperdicio || 0.12)) / aPieza);
    } else {
      const o = mejorOrientacion(len, altoEnchape, pared.pieza.ancho, pared.pieza.largo, j, calc.reutilizar, calc.girar);
      const aEx = ahorroAberturas(aberturas, id, o.p, o.q, j, zCm, tope);
      piezas = Math.max(0, o.total - aEx.ahorro);
      detallePared.push({ pared: id, revestida: true, ...o, ahorro: aEx.ahorro, total: piezas });
    }
    piezasParedGrilla += piezas;
    areaParedBruta += brutaM2;
    areaParedAbert += abertM2;
    if (pared.calculo === 'area') detallePared.push({ pared: id, revestida: true, total: piezas });
  }
  if (pared && areaParedBruta > 0) {
    superficies.push(resumenSuperficie('Paredes', pared, piezasParedGrilla, areaParedBruta, areaParedAbert, { factorJunta: factor(pared) }, calc.margen, {
      detalle: detallePared, tipoSuperficie: 'pared',
      nota: pared.calculo === 'area' ? `Estimación por área (+${Math.round((pared.factorDesperdicio || 0.12) * 100)} % por cortes propios de este diseño).` : null,
    }));
  }

  const total = superficies.reduce((s, x) => s + x.costo, 0);
  const desperdicioM2 = superficies.reduce((s, x) => s + x.desperdicioTotalM2, 0);
  const compradaM2 = superficies.reduce((s, x) => s + (x.piezasCompradas * areaPiezaCm2(x.mat)) / 10000, 0);
  return {
    superficies, total,
    desperdicioM2, desperdicioPct: compradaM2 > 0 ? (desperdicioM2 / compradaM2) * 100 : 0,
    zocaloLineal, areaPintura,
    areaPisoM2: (A * L) / 10000,
    perimetroM: (2 * (A + L)) / 100,
  };
}
