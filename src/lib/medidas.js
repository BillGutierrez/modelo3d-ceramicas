// Medidas de pieza y precios derivados
const SQ3 = Math.sqrt(3);

export function areaPiezaCm2(mat) {
  if (mat.forma === 'hex') return (SQ3 / 2) * mat.pieza.ancho * mat.pieza.ancho;
  return mat.pieza.ancho * mat.pieza.largo;
}
export function areaCajaM2(mat) {
  return (areaPiezaCm2(mat) * mat.piezasPorCaja) / 10000;
}
export function precioM2(mat) {
  const a = areaCajaM2(mat);
  return a > 0 ? mat.precioCaja / a : 0;
}
export function etiquetaMedida(mat) {
  const f = (n) => (Number.isInteger(n) ? n : Number(n.toFixed(1)));
  if (mat.forma === 'hex') return `Hexágono ${f(mat.pieza.ancho)} cm`;
  return `${f(mat.pieza.ancho)} × ${f(mat.pieza.largo)} cm`;
}
