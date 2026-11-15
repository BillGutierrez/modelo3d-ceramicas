// Convierte las fotos de texturas-originales/{pisos,paredes} a WebP (máx. 1024 px) + miniatura (160 px)
// y las deja en public/texturas/{pisos,paredes}. Requiere la librería "sharp" (npm install la instala).
import fs from 'node:fs';
import path from 'node:path';

let sharp;
try { sharp = (await import('sharp')).default; } catch {
  console.error('No se encontró "sharp". Ejecuta: npm install sharp');
  process.exit(1);
}
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
let total = 0;
for (const tipo of ['pisos', 'paredes']) {
  const origen = path.resolve('texturas-originales', tipo);
  const destino = path.resolve('public', 'texturas', tipo);
  if (!fs.existsSync(origen)) continue;
  fs.mkdirSync(path.join(destino, 'min'), { recursive: true });
  for (const f of fs.readdirSync(origen)) {
    if (!EXT.has(path.extname(f).toLowerCase())) continue;
    const base = path.basename(f, path.extname(f));
    const entrada = path.join(origen, f);
    await sharp(entrada).rotate().resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(destino, `${base}.webp`));
    await sharp(entrada).rotate().resize({ width: 160, height: 160, fit: 'inside' }).webp({ quality: 70 }).toFile(path.join(destino, 'min', `${base}.webp`));
    total++;
    console.log(`  ${tipo}/${base}.webp`);
  }
}
console.log(`Listo: ${total} imagen(es) optimizadas.`);
