// Catálogo de arranque generado por código: no necesita imágenes ni base de datos.
import { hashStr } from './util.js';

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function crear({ familia, tipo, nombre, paleta, ancho, largo, acabado, precioM2, extra = {}, cajaM2 = 1.44 }) {
  const id = `g-${familia}-${tipo}-${slug(nombre)}`;
  const area = extra.forma === 'hex' ? (Math.sqrt(3) / 2) * ancho * ancho : ancho * largo;
  const piezasPorCaja = Math.max(1, Math.round((cajaM2 * 10000) / area));
  const real = (piezasPorCaja * area) / 10000;
  // pequeña variación determinista para que los precios no sean todos redondos
  const ajuste = 1 + ((hashStr(id) % 21) - 10) / 100;
  return {
    id, nombre, tipo, origen: 'generado', familia, paleta,
    pieza: { ancho, largo }, modulo: { cols: 1, filas: 1 },
    piezasPorCaja,
    precioCaja: Math.round(precioM2 * ajuste * real * 100) / 100,
    marca: 'Colección digital', acabado,
    calculo: 'grilla', ...extra,
  };
}

const lista = [];
const add = (def, items) => items.forEach((it) => lista.push(crear({ ...def, ...it })));

// ---- PISOS
add({ familia: 'madera', tipo: 'piso', ancho: 20, largo: 120, acabado: 'Mate', precioM2: 82 }, [
  { nombre: 'Madera Roble Claro', paleta: { claro: '#d9bd90', oscuro: '#c29c68', veta: '#6b4a26' } },
  { nombre: 'Madera Roble Natural', paleta: { claro: '#cba576', oscuro: '#a97c4b', veta: '#5a3b1c' } },
  { nombre: 'Madera Nogal', paleta: { claro: '#8f5e3c', oscuro: '#6e4228', veta: '#2e1a0e' } },
  { nombre: 'Madera Caoba', paleta: { claro: '#9f4f33', oscuro: '#7a3322', veta: '#33150c' } },
  { nombre: 'Madera Ceniza', paleta: { claro: '#cbc4b8', oscuro: '#aaa194', veta: '#5b5448' } },
  { nombre: 'Madera Wengué', paleta: { claro: '#4d362b', oscuro: '#33221a', veta: '#150c07' } },
  { nombre: 'Madera Cedro', paleta: { claro: '#cc8d5c', oscuro: '#b06d3f', veta: '#5f3318' } },
  { nombre: 'Madera Gris Envejecido', paleta: { claro: '#aca7a0', oscuro: '#8c867e', veta: '#4a453f' } },
]);

const MARMOLES = [
  { nombre: 'Mármol Carrara', paleta: { base1: '#eceeef', base2: '#d6d9dd', vein: '#8a9097', veinAlpha: 0.85, veinScale: 0.9, veinPow: 8, warp: 0.8 } },
  { nombre: 'Mármol Calacatta', paleta: { base1: '#f5f2ec', base2: '#e6e1d6', vein: '#a98b52', veinAlpha: 0.95, veinScale: 0.7, veinPow: 10, warp: 1.0 } },
  { nombre: 'Mármol Negro Marquina', paleta: { base1: '#18181a', base2: '#2b2b2f', vein: '#ececec', veinAlpha: 0.9, veinScale: 0.8, veinPow: 12, warp: 0.9 } },
  { nombre: 'Mármol Verde Alpes', paleta: { base1: '#1d4637', base2: '#2f6a52', vein: '#d0e6d8', veinAlpha: 0.8, veinScale: 0.85, veinPow: 9, warp: 0.9 } },
  { nombre: 'Mármol Rosa Portugal', paleta: { base1: '#ead0c5', base2: '#dcb4a7', vein: '#fff3ee', veinAlpha: 0.8, veinScale: 0.8, veinPow: 9, warp: 0.8 } },
  { nombre: 'Travertino Romano', paleta: { base1: '#dccaa9', base2: '#c9b48f', vein: '#9c825a', veinAlpha: 0.55, veinScale: 1.1, veinPow: 6, warp: 0.5, estira: [0.3, 1.5] } },
  { nombre: 'Mármol Gris Emperador', paleta: { base1: '#6f5d55', base2: '#4a3c36', vein: '#d2c4ba', veinAlpha: 0.8, veinScale: 0.8, veinPow: 9, warp: 0.9 } },
  { nombre: 'Mármol Azul Macaubas', paleta: { base1: '#2a4f78', base2: '#477099', vein: '#dbe7f3', veinAlpha: 0.85, veinScale: 0.8, veinPow: 9, warp: 1.0 } },
];
add({ familia: 'marmol', tipo: 'piso', ancho: 60, largo: 60, acabado: 'Brillante', precioM2: 96 }, MARMOLES);

add({ familia: 'cemento', tipo: 'piso', ancho: 60, largo: 60, acabado: 'Mate', precioM2: 58 }, [
  { nombre: 'Cemento Gris Claro', paleta: { c1: '#bcbcb9', c2: '#9d9d9a' } },
  { nombre: 'Cemento Gris Oscuro', paleta: { c1: '#80817f', c2: '#5e5f60' } },
  { nombre: 'Cemento Arena', paleta: { c1: '#cdbfa9', c2: '#ab9d86' } },
  { nombre: 'Cemento Grafito', paleta: { c1: '#4d4e50', c2: '#333435' } },
  { nombre: 'Cemento Humo', paleta: { c1: '#d6d4cf', c2: '#b4b1aa' } },
]);

add({ familia: 'piedra', tipo: 'piso', ancho: 40, largo: 40, acabado: 'Rústico', precioM2: 66 }, [
  { nombre: 'Pizarra Gris', paleta: { c1: '#5d6368', c2: '#3f4448', c3: '#7a5b45' } },
  { nombre: 'Pizarra Negra', paleta: { c1: '#3a3d40', c2: '#222426', c3: '#5a4637' } },
  { nombre: 'Pizarra Óxido', paleta: { c1: '#6b5a4e', c2: '#4a3c33', c3: '#a3562f' } },
  { nombre: 'Pizarra Verde', paleta: { c1: '#4f6258', c2: '#34443c', c3: '#8a7a4a' } },
  { nombre: 'Arenisca Beige', paleta: { c1: '#c9b08a', c2: '#a28a66', c3: '#dcc298' } },
]);

add({ familia: 'espiga', tipo: 'piso', ancho: 12, largo: 60, acabado: 'Satinado', precioM2: 105, extra: { calculo: 'area', factorDesperdicio: 0.15 } }, [
  { nombre: 'Espiga Roble', paleta: { claro: '#d3b283', oscuro: '#b48b58', veta: '#5e4222' } },
  { nombre: 'Espiga Nogal', paleta: { claro: '#8d5d3b', oscuro: '#6a4026', veta: '#2b180c' } },
  { nombre: 'Espiga Ceniza', paleta: { claro: '#c8c1b5', oscuro: '#a39a8c', veta: '#554e42' } },
  { nombre: 'Espiga Miel', paleta: { claro: '#d9a45f', oscuro: '#b9803a', veta: '#6a4519' } },
  { nombre: 'Espiga Gris', paleta: { claro: '#a8a39c', oscuro: '#858079', veta: '#46423d' } },
  { nombre: 'Espiga Chocolate', paleta: { claro: '#5e4130', oscuro: '#3e2a1e', veta: '#1c110a' } },
]);

add({ familia: 'damero', tipo: 'piso', ancho: 40, largo: 40, acabado: 'Brillante', precioM2: 62 }, [
  { nombre: 'Damero Blanco y Negro', paleta: { c1: '#f2f2f0', c2: '#202022' } },
  { nombre: 'Damero Gris y Blanco', paleta: { c1: '#a7a9ab', c2: '#eeeeec' } },
  { nombre: 'Damero Marino y Crema', paleta: { c1: '#1f3b63', c2: '#efe7d3' } },
  { nombre: 'Damero Verde y Crema', paleta: { c1: '#2c6a4f', c2: '#efe8d4' } },
  { nombre: 'Damero Terracota y Crema', paleta: { c1: '#b5603f', c2: '#f0e7d6' } },
  { nombre: 'Damero Negro y Gris', paleta: { c1: '#232325', c2: '#8d8f91' } },
  { nombre: 'Damero Mostaza y Gris', paleta: { c1: '#d1a22f', c2: '#9a9c9e' } },
  { nombre: 'Damero Rojo y Crema', paleta: { c1: '#a8312f', c2: '#f1e8d6' } },
]);

add({ familia: 'hexagono', tipo: 'piso', ancho: 20, largo: 23.1, acabado: 'Mate', precioM2: 92, cajaM2: 1.0, extra: { forma: 'hex', calculo: 'area', factorDesperdicio: 0.12 } }, [
  { nombre: 'Hexágono Gris', paleta: { colores: ['#9a9da0', '#b4b7ba', '#7f8386', '#c9cbce'] } },
  { nombre: 'Hexágono Verde', paleta: { colores: ['#2f6b57', '#4a8a72', '#88b9a3', '#d7e9df'] } },
  { nombre: 'Hexágono Azul', paleta: { colores: ['#1f3b63', '#37608f', '#7fa3c9', '#d9e6f2'] } },
  { nombre: 'Hexágono Terracota', paleta: { colores: ['#b5603f', '#cf8460', '#e6b595', '#8a4329'] } },
  { nombre: 'Hexágono Blanco', paleta: { colores: ['#f1f0ec', '#e4e2dc', '#d6d3cb'] } },
  { nombre: 'Hexágono Blanco y Negro', paleta: { colores: ['#222224', '#f2f2f0', '#5a5b5e'] } },
  { nombre: 'Hexágono Arena', paleta: { colores: ['#d8c8a8', '#c4b088', '#e8dcc2', '#a8946c'] } },
  { nombre: 'Hexágono Mostaza', paleta: { colores: ['#d4a62f', '#e6c15e', '#a97f14', '#f1dc9c'] } },
]);

const HIDRAULICOS = [
  { nombre: 'Hidráulico Azul Cobalto', paleta: { estilo: 'arcos', fondo: '#f1ead8', c1: '#1f4a9c', c2: '#e3b23c' } },
  { nombre: 'Hidráulico Terracota', paleta: { estilo: 'arcos', fondo: '#efe3cc', c1: '#b4532f', c2: '#2f5d62' } },
  { nombre: 'Hidráulico Verde Bosque', paleta: { estilo: 'arcos', fondo: '#f0ead7', c1: '#2d6a4f', c2: '#d98e3a' } },
  { nombre: 'Hidráulico Grafito', paleta: { estilo: 'arcos', fondo: '#ebe7de', c1: '#3d4147', c2: '#c5a15a' } },
  { nombre: 'Hidráulico Rombo Marino', paleta: { estilo: 'rombo', fondo: '#efe9da', c1: '#27456e', c2: '#d19a3a' } },
  { nombre: 'Hidráulico Rombo Rojo', paleta: { estilo: 'rombo', fondo: '#f3ecdc', c1: '#9c2f2f', c2: '#2f4b66' } },
  { nombre: 'Hidráulico Rombo Turquesa', paleta: { estilo: 'rombo', fondo: '#f2ecdc', c1: '#1f7a85', c2: '#c7653a' } },
  { nombre: 'Hidráulico Flor Índigo', paleta: { estilo: 'flor', fondo: '#f4efe2', c1: '#2b4a8b', c2: '#d7a62c', c3: '#4a7c59' } },
  { nombre: 'Hidráulico Flor Rosa', paleta: { estilo: 'flor', fondo: '#f4ebdf', c1: '#b44a5f', c2: '#2f6f5f', c3: '#d9a441' } },
  { nombre: 'Hidráulico Flor Mostaza', paleta: { estilo: 'flor', fondo: '#efe6d2', c1: '#c4902a', c2: '#3c5a78', c3: '#8b3a2f' } },
];
add({ familia: 'hidraulico', tipo: 'piso', ancho: 20, largo: 20, acabado: 'Satinado', precioM2: 74 }, HIDRAULICOS);

// ---- PAREDES
add({ familia: 'marmol', tipo: 'pared', ancho: 30, largo: 60, acabado: 'Brillante', precioM2: 70 },
  [MARMOLES[0], MARMOLES[1], MARMOLES[3], MARMOLES[5]].map((m) => ({ ...m, nombre: m.nombre.replace('Mármol', 'Revestimiento') })));

add({ familia: 'hidraulico', tipo: 'pared', ancho: 20, largo: 20, acabado: 'Brillante', precioM2: 68 },
  [HIDRAULICOS[0], HIDRAULICOS[2], HIDRAULICOS[6], HIDRAULICOS[7], HIDRAULICOS[8], HIDRAULICOS[5]]);

add({ familia: 'talavera', tipo: 'pared', ancho: 20, largo: 20, acabado: 'Brillante', precioM2: 88 }, [
  { nombre: 'Talavera Azul Cobalto', paleta: { fondo: '#f6f1e6', c1: '#1d4ea1', c2: '#e1a826', c3: '#4b8fb0' } },
  { nombre: 'Talavera Verde', paleta: { fondo: '#f6f1e6', c1: '#2e7d4f', c2: '#e1a826', c3: '#1d4ea1' } },
  { nombre: 'Talavera Terracota', paleta: { fondo: '#f6f0e3', c1: '#b4532f', c2: '#1d4ea1', c3: '#e1a826' } },
  { nombre: 'Talavera Amarillo', paleta: { fondo: '#f7f2e6', c1: '#d9a21b', c2: '#1d4ea1', c3: '#2e7d4f' } },
  { nombre: 'Talavera Turquesa', paleta: { fondo: '#f6f1e6', c1: '#1b8c93', c2: '#e1a826', c3: '#b4532f' } },
  { nombre: 'Talavera Rojo', paleta: { fondo: '#f6f1e6', c1: '#b02a30', c2: '#1d4ea1', c3: '#e1a826' } },
]);

add({ familia: 'mosaico', tipo: 'pared', ancho: 30, largo: 30, acabado: 'Brillante', precioM2: 120 }, [
  { nombre: 'Mosaico Azules', paleta: { colores: ['#1d4ea1', '#2f6fc0', '#6aa6dd', '#cfe3f5', '#0f2f6b'] } },
  { nombre: 'Mosaico Verdes', paleta: { colores: ['#2e6b4f', '#4f9a70', '#9cd0aa', '#d8efdc', '#1d4333'] } },
  { nombre: 'Mosaico Arena', paleta: { colores: ['#d9c7a4', '#c0aa82', '#e6dac2', '#a8926a', '#f2eadb'] } },
  { nombre: 'Mosaico Grises', paleta: { colores: ['#6e7378', '#9aa0a5', '#c7cbcf', '#3f4347', '#e3e5e7'] } },
  { nombre: 'Mosaico Turquesa', paleta: { colores: ['#1b8c93', '#43b3b6', '#8bd3d1', '#d5f0ee', '#0e5b61'] } },
  { nombre: 'Mosaico Tierra', paleta: { colores: ['#a5502f', '#c77a4a', '#e3b08a', '#6d3420', '#f0d3b9'] } },
]);

add({ familia: 'liso', tipo: 'pared', ancho: 30, largo: 60, acabado: 'Brillante', precioM2: 46 }, [
  { nombre: 'Liso Blanco', paleta: { color: '#f3f3f1' } },
  { nombre: 'Blanco Ondas', paleta: { color: '#f1f1ee', estilo: 'ondas' }, acabado: 'Satinado' },
  { nombre: 'Liso Gris Perla', paleta: { color: '#c7c9cc' } },
  { nombre: 'Grafito Líneas', paleta: { color: '#5c6166', estilo: 'lineas' }, acabado: 'Satinado' },
  { nombre: 'Liso Beige', paleta: { color: '#d9ccb5' } },
  { nombre: 'Liso Negro', paleta: { color: '#242628' } },
  { nombre: 'Liso Verde Salvia', paleta: { color: '#9cae98' } },
  { nombre: 'Liso Azul Petróleo', paleta: { color: '#2f5d6b' } },
  { nombre: 'Terracota Líneas', paleta: { color: '#b86a4b', estilo: 'lineas' }, acabado: 'Satinado' },
  { nombre: 'Rosa Palo Ondas', paleta: { color: '#e6c4bd', estilo: 'ondas' }, acabado: 'Satinado' },
]);

add({ familia: 'subway', tipo: 'pared', ancho: 20, largo: 10, acabado: 'Brillante', precioM2: 52 }, [
  { nombre: 'Subway Blanco', paleta: { color: '#f5f5f2' } },
  { nombre: 'Subway Hueso', paleta: { color: '#ece5d4' } },
  { nombre: 'Subway Gris Claro', paleta: { color: '#cfd2d4' } },
  { nombre: 'Subway Gris Oscuro', paleta: { color: '#6b7076' } },
  { nombre: 'Subway Negro', paleta: { color: '#26282a' } },
  { nombre: 'Subway Menta', paleta: { color: '#bfe0d1' } },
  { nombre: 'Subway Verde Botella', paleta: { color: '#2c5a46' } },
  { nombre: 'Subway Azul Cielo', paleta: { color: '#a9cde6' } },
  { nombre: 'Subway Azul Marino', paleta: { color: '#1f3b63' } },
  { nombre: 'Subway Terracota', paleta: { color: '#b5603f' } },
  { nombre: 'Subway Mostaza', paleta: { color: '#d4a62f' } },
  { nombre: 'Subway Rosa', paleta: { color: '#e8c0c0' } },
]);

add({ familia: 'ladrillo', tipo: 'pared', ancho: 24, largo: 7, acabado: 'Rústico', precioM2: 58 }, [
  { nombre: 'Ladrillo Rojo', paleta: { colores: ['#a8482e', '#b5563a', '#9a3f28', '#c2634a'] } },
  { nombre: 'Ladrillo Blanco', paleta: { colores: ['#e8e2d6', '#dcd5c7', '#f0ebe0', '#d2cabc'] } },
  { nombre: 'Ladrillo Gris', paleta: { colores: ['#7b7e80', '#6a6d6f', '#8a8d8f', '#5e6163'] } },
  { nombre: 'Ladrillo Negro', paleta: { colores: ['#3a3a3c', '#2c2c2e', '#47474a', '#222224'] } },
]);

export const CATALOGO_GENERADO = lista;
