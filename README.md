# Visualizador de cerámicas (Modelo 3D · Catálogo · Costos)

Página web hecha con **React + Vite + Tailwind CSS + three.js (react-three-fiber) + Zustand + React Router**.
Sin servidor ni base de datos: se despliega gratis (Vercel, Netlify o GitHub Pages).

## Cómo usarlo

```bash
npm install
npm run dev        # abre http://localhost:5173
npm run build      # genera la carpeta dist/ lista para publicar
```
Requiere Node 18 o superior.

## Las 3 páginas

| Página | Qué hace |
|---|---|
| **Modelo 3D** | Cuarto en 3D con piso y paredes. Largo, ancho y alto en tiempo real, vista de 2 paredes (esquina) o 4 paredes (las de adelante se ocultan solas), juntas con grosor y color, zócalo pintado, cerámica hasta cierta altura y pintura arriba, giro de piezas 90°, cambio de material con fundido suave y botón **Guardar vista**. |
| **Catálogo** | Lista de materiales con buscador y filtros (tipo, medida, acabado, origen, precio). Permite **agregar, editar y eliminar** materiales propios con su imagen. |
| **Costos** | Informe automático conectado al 3D: áreas, piezas, margen, cajas, costo y desperdicio. Se imprime o se guarda como PDF. |

## De dónde salen los materiales

1. **Colección digital (106 modelos)**: patrones dibujados por código (madera, mármol, espiga, hexágono, hidráulico, talavera, mosaico, subway, ladrillo, cemento, pizarra, damero, liso). Están en `src/lib/texturas/catalogoGenerado.js`. Para agregar otro color basta copiar una línea.
2. **Tus imágenes (de fábrica)**: carpetas `public/texturas/pisos` y `public/texturas/paredes`.
3. **Subidas por el usuario** desde la página Catálogo: se guardan en el navegador (IndexedDB). No se comparten con otros equipos; usa **Exportar / Importar** para respaldarlas.

## Cargar tus imágenes por carpeta

1. Pon la imagen del diseño de **una pieza**, de frente y sin junta, en `public/texturas/pisos` o `public/texturas/paredes`.
2. Nombre del archivo: `Nombre_Con_Espacios-ANCHOxLARGO.jpg` (medidas en cm).
   - `Mayolica_Azul-20x20.jpg`
   - Si la imagen trae varias piezas que forman un dibujo (2 columnas × 2 filas): `Mayolica_Mar-20x20-m2x2.jpg` (ancho y largo son de una sola pieza).
3. Precio, piezas por caja, marca y acabado: `public/texturas/datos.csv` (una fila por archivo).
4. Ejecuta `npm run dev` o `npm run build`. El catálogo se actualiza solo (también con `npm run catalogo`).

**Muchas imágenes:** guarda las fotos grandes en `texturas-originales/pisos` y `texturas-originales/paredes` y ejecuta `npm run optimizar`. Convierte todo a WebP de máximo 1024 px, crea miniaturas y actualiza el catálogo.

Los archivos `Ejemplo_*` son de prueba: bórralos cuando agregues los tuyos (y su fila en `datos.csv`).

> Usa solo imágenes con licencia libre (CC0, por ejemplo ambientCG o Poly Haven) o que la ferretería tenga autorización de usar. Si la licencia pide crédito (CC BY), agrégalo en la página.

## Cómo se calcula el desperdicio

Para cada superficie (piso y cada pared) se cuentan por fila y columna las piezas enteras que caben (incluida la junta) y las piezas de borde que hay que cortar.
- **Reutilizar recortes**: el sobrante de una pieza cortada se usa en la siguiente fila o columna (se descuentan 3 mm por corte). Desactívalo en diseños donde el dibujo no lo permite.
- **Girar 90°**: prueba la pieza en las dos orientaciones y elige la que usa menos. Actívalo solo en diseños lisos.
- **Margen de seguridad**: se aplica al total de piezas y luego se redondea a **cajas completas**.
- **Puertas y ventanas**: descuentan solo piezas enteras (estimación conservadora). No se dibujan en el 3D.
- **Espiga y hexágono**: se estiman por área con un porcentaje propio de corte (15 % y 12 %), porque su corte no sigue una rejilla.
- El informe separa el desperdicio **por cortes** del que viene del **margen y de las piezas sobrantes de caja**.

Es una estimación de referencia; el maestro de obra puede ajustarla según el corte real.

## Publicar gratis

- **Vercel / Netlify**: importa el repositorio. Comando `npm run build`, carpeta de salida `dist`.
- **GitHub Pages**: sube el proyecto a GitHub, en *Settings → Pages* elige **GitHub Actions**. El archivo `.github/workflows/deploy.yml` ya está listo.
- La página usa rutas con `#` (`/#/catalogo`), así que funciona en cualquier alojamiento sin configuración extra.

## Estructura

```
public/texturas/{pisos,paredes}/   imágenes de fábrica + datos.csv
texturas-originales/               fotos grandes (opcional, para npm run optimizar)
scripts/                           generar-catalogo.mjs, optimizar-imagenes.mjs
src/lib/texturas/                  generadores de patrones, juntas y catálogo generado
src/lib/calculos.js                piezas, desperdicio y costos
src/components/ y src/pages/       interfaz (Cuarto.jsx y Superficie.jsx son el 3D)
src/store/                         estado compartido (Zustand) y catálogo (IndexedDB)
src/config.js                      moneda (S/), límites y acabados
```
