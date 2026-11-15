// Procesa imágenes subidas por el usuario: redimensiona y convierte a WebP en el navegador.
import { IMAGEN_SUBIDA_MAX_PX } from '../config.js';

export async function procesarImagen(file, maxPx = IMAGEN_SUBIDA_MAX_PX) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('El archivo no es una imagen válida.'));
      i.src = url;
    });
    const k = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * k));
    c.height = Math.max(1, Math.round(img.naturalHeight * k));
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    let blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.88));
    return { blob, ancho: c.width, alto: c.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobADataUrl(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}
export async function dataUrlABlob(dataUrl) {
  const r = await fetch(dataUrl);
  return r.blob();
}
