# Visualizador de cerámicas

Aplicación web para visualizar pisos y paredes en un modelo 3D de un cuarto, explorar un catálogo de materiales y estimar cantidades y costos de instalación.

Está construida con React, Vite y Three.js. No requiere servidor ni base de datos: el catálogo de fábrica se genera a partir de archivos locales y los materiales agregados desde la interfaz se guardan en el navegador.

## Contenido

- [Funciones](#funciones)
- [Origen de los materiales](#origen-de-los-materiales)
- [Requisitos e instalación](#requisitos-e-instalación)
- [Ejecución y comandos](#ejecución-y-comandos)
- [Cómo usar la aplicación](#cómo-usar-la-aplicación)
- [Agregar materiales con imágenes](#agregar-materiales-con-imágenes)
- [Informar precio, caja y acabado](#informar-precio-caja-y-acabado)
- [Cómo se estiman cantidades y costos](#cómo-se-estiman-cantidades-y-costos)
- [Publicar el proyecto](#publicar-el-proyecto)
- [Estructura del proyecto](#estructura-del-proyecto)

## Funciones

### Modelo 3D

- Visualiza un cuarto y cambia sus medidas de largo, ancho y alto.
- Alterna entre una vista de esquina con dos paredes y una vista de cuatro paredes.
- Gira la vista con el mouse o el dedo.
- Selecciona materiales distintos para el piso y las paredes.
- Ajusta el grosor y el color de las juntas.
- Configura el zócalo, el color de pintura y la altura del revestimiento.
- Decide qué paredes llevan cerámica y permite girar las piezas 90°.
- Guarda una captura del modelo para incluirla en el informe de costos.

### Catálogo

- Busca por nombre o marca y filtra por tipo, medida, acabado, origen y precio por metro cuadrado.
- Ordena los resultados por nombre o precio por metro cuadrado.
- Combina la colección digital, los materiales de fábrica y los materiales propios.
- Permite agregar, editar y eliminar materiales propios, con un límite de 50 por navegador.
- Permite exportar e importar los materiales propios mediante un archivo JSON.

### Informe de costos

- Resume áreas, piezas, cajas, costos y desperdicio estimado para el piso y las paredes revestidas.
- Permite configurar margen de seguridad, grosor de junta, reutilización de recortes y giro de piezas.
- Considera puertas y ventanas en el cálculo de las paredes.
- El informe está maquetado para papel A4 y se puede imprimir o guardar como PDF desde el navegador. En el diálogo, selecciona **Guardar como PDF** y desactiva los encabezados y pies del navegador.

### Asistente de ayuda

- Acepta consultas escritas sobre navegación, ajustes del modelo, materiales, catálogo, cálculos e informes, y ofrece accesos directos a las secciones.
- Puede consultar los datos del catálogo para responder por un producto específico e incluir su imagen, medida, piezas por caja, precio, marca y acabado; si no encuentra el nombre o falta un precio, lo indica sin inventar datos.
- Compara productos, busca opciones por tipo, acabado, color y presupuesto, y estima cajas y costos usando las medidas indicadas o el espacio actual.
- Reconoce sinónimos y distintas formas de expresar una consulta mediante reglas locales.
- No usa IA, API ni base de datos; para preguntas fuera de estos temas ofrece una respuesta de orientación.

> **Importante:** las cantidades y los costos son estimaciones para orientar la planificación. No sustituyen la medición ni el criterio del instalador.

## Origen de los materiales

El catálogo reúne tres tipos de materiales:

1. **Colección digital:** patrones generados por código, como madera, mármol, espiga, hexágonos, hidráulicos, mosaicos, subway, ladrillo, cemento, pizarra, damero y superficies lisas. Su definición está en [`src/lib/texturas/catalogoGenerado.js`](./src/lib/texturas/catalogoGenerado.js).
2. **Imágenes de fábrica:** productos cargados desde `public/texturas/pisos` y `public/texturas/paredes`, con sus datos en `public/texturas/datos.csv`.
3. **Materiales propios:** los que se agregan en la interfaz; se guardan en IndexedDB del navegador y se pueden respaldar como archivo JSON.

## Requisitos e instalación

- Node.js 18 o superior.
- npm, que se instala junto con Node.js.

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```powershell
npm install
npm run dev
```

Vite mostrará una dirección local, normalmente <http://localhost:5173>. Ábrela en el navegador. Para detener el servidor, vuelve a la terminal y presiona `Ctrl+C`.

## Ejecución y comandos

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Genera el catálogo de imágenes y arranca el servidor de desarrollo. |
| `npm run catalogo` | Actualiza `public/catalogo-imagenes.json` usando las imágenes y los datos actuales. |
| `npm run optimizar` | Convierte las imágenes de `texturas-originales` a WebP, crea miniaturas y actualiza el catálogo. |
| `npm run build` | Genera el catálogo y compila el sitio en `dist/`. |
| `npm run preview` | Sirve localmente la compilación existente en `dist/`. Ejecuta primero `npm run build`. |

Si solo cambiaste filas de `public/texturas/datos.csv`, ejecuta `npm run catalogo`; no hace falta volver a optimizar las imágenes. `npm run dev` y `npm run build` también generan el catálogo al iniciarse.

El optimizador necesita `sharp`. Se instala como dependencia opcional con `npm install`. Si el comando informa que no está disponible, instálalo con:

```powershell
npm install sharp
```

## Cómo usar la aplicación

La barra de navegación contiene tres secciones:

1. **Modelo 3D:** selecciona el piso y la pared en el panel de materiales. Ajusta las medidas del cuarto, la vista, las juntas, el zócalo y el revestimiento. Usa **Guardar vista** para agregar una captura al informe.
2. **Catálogo:** explora los materiales o utiliza los filtros. **Agregar material** guarda un material propio en el navegador actual. También puedes exportar tus materiales para respaldarlos o importarlos en otro navegador.
3. **Costos:** revisa las cantidades y el desperdicio estimado. Configura los controles y utiliza **Imprimir o guardar PDF** para generar una copia del informe.

### Dónde se guardan los materiales propios

Los materiales que se agregan desde la interfaz se guardan en IndexedDB del navegador en el que se crearon. **No se comparten automáticamente con otras personas ni con otros equipos**, aunque el sitio se publique en internet. Para moverlos, usa **Exportar mis materiales** e **Importar**.

Los materiales que quieras incluir para todos los visitantes deben agregarse como archivos del proyecto en `public/texturas` y registrarse en `public/texturas/datos.csv`.

## Agregar materiales con imágenes

Hay dos formas de incorporar imágenes al catálogo de fábrica.

### Opción recomendada: conservar originales y optimizarlos

1. Crea estas carpetas si aún no existen:

   ```text
   texturas-originales/
   ├── pisos/
   └── paredes/
   ```

2. Guarda cada fotografía en la carpeta correspondiente. Usa una imagen de frente, sin perspectiva pronunciada y, de ser posible, sin junta.
3. Nombra cada archivo con el formato `Nombre_Producto-ANCHOxLARGO.ext`. Las medidas corresponden a **una pieza** y se expresan en centímetros. Por ejemplo:

   ```text
   Madera_Clara-20x120.png
   ```

4. Si una imagen muestra un diseño compuesto por varias piezas, agrega `-mCOLUMNASxFILAS` al nombre. Por ejemplo, `Mayolica_Mar-20x20-m2x2.png` representa un diseño de 2 columnas por 2 filas; `20x20` sigue siendo la medida de cada pieza individual.
5. Desde la raíz del proyecto ejecuta:

   ```powershell
   npm run optimizar
   ```

El proceso crea imágenes WebP de hasta 1024 px y miniaturas de 160 px en `public/texturas/pisos` o `public/texturas/paredes`. Después genera el catálogo. Conserva los originales en `texturas-originales`; la aplicación usa las versiones de `public/texturas`.

### Opción directa: usar imágenes ya optimizadas

También puedes colocar una imagen directamente en `public/texturas/pisos` o `public/texturas/paredes`. El nombre debe incluir las medidas, como `Mayolica_Azul-20x20.webp`. Luego ejecuta `npm run catalogo`.

### Convenciones de nombre

- Las medidas del nombre se interpretan en centímetros.
- Usa `-` antes de las medidas y `x` entre ancho y largo.
- Usa el sufijo opcional `-m2x2` para indicar columnas y filas del diseño.
- Los guiones bajos del nombre se muestran como espacios en el catálogo.
- El nombre debe terminar en una extensión admitida: `.webp`, `.png`, `.jpg` o `.jpeg` para el catálogo. El optimizador también acepta `.tif` y `.tiff` como originales.

## Informar precio, caja y acabado

Edita `public/texturas/datos.csv`. Añade una fila por imagen con las columnas en este orden:

```csv
archivo,nombre,piezas_por_caja,precio_caja,marca,acabado
Madera_Clara-20x120.webp,Madera Clara,6,245.00,Marca Ejemplo,Mate
```

- **`archivo`:** nombre exacto de la imagen que está en `public/texturas/pisos` o `public/texturas/paredes`, incluida la extensión. Después de optimizar, normalmente será `.webp`. La comparación no distingue mayúsculas de minúsculas.
- **`nombre`:** nombre que se mostrará en el catálogo. Es opcional; si se deja vacío, se deriva del nombre del archivo.
- **`piezas_por_caja`:** cantidad de piezas que contiene una caja.
- **`precio_caja`:** precio total de la caja, en la moneda de la aplicación (`S/`). Escribe solo el número, sin símbolo de moneda, y usa punto para los decimales.
- **`marca`:** marca del producto; puede quedar vacía.
- **`acabado`:** usa `Brillante`, `Satinado`, `Mate`, `Rústico` o `Relieve 3D`.

El archivo usa comas como separadores; evita incluir comas dentro del nombre, la marca o el acabado.

El área por caja y el precio por metro cuadrado se calculan a partir de la medida de la pieza, la cantidad de piezas por caja y el precio de la caja. No hace falta introducir esos dos valores. Por ejemplo, una pieza de 45 × 45 cm ocupa 0.2025 m²; con 11 piezas, la caja cubre 2.2275 m².

`Relieve 3D` es una categoría de acabado del catálogo y usa una apariencia mate en el visor. No genera relieve geométrico: la forma visible del diseño depende de la imagen de textura.

El generador produce `public/catalogo-imagenes.json`; **no edites ese archivo manualmente**, porque se vuelve a crear con `npm run catalogo`, `npm run dev` o `npm run build`. El archivo `public/texturas/datos.csv` incluye filas de ejemplo que puedes editar o quitar junto con las imágenes `Ejemplo_*`.

## Cómo se estiman cantidades y costos

- El cálculo se realiza para el piso y para cada pared seleccionada para revestir.
- Se cuentan piezas completas y piezas de borde que requieren corte, considerando el grosor de la junta.
- La opción **Reutilizar los recortes** estima el reaprovechamiento de sobrantes y descuenta 3 mm por corte. Desactívala cuando el patrón no permita reutilizar piezas.
- **Girar 90°** compara las dos orientaciones y elige la que necesita menos piezas. Úsalo solo en diseños que se vean bien girados.
- El margen de seguridad se aplica a las piezas estimadas y el total se redondea a cajas completas.
- Las puertas y ventanas descuentan solo piezas enteras; es una estimación conservadora. No se dibujan en el modelo 3D.
- Los patrones en espiga y hexagonales se estiman por área con porcentajes de corte propios del diseño.
- El informe separa el desperdicio por cortes del excedente debido al margen y a las piezas sobrantes de las cajas compradas.
- El costo por metro cuadrado del catálogo se deriva del precio de la caja y el área que cubren sus piezas.

Las condiciones reales de instalación, la forma del cuarto, la orientación del patrón y los cortes pueden cambiar el resultado.

## Publicar el proyecto

Antes de publicar, comprueba que las imágenes puedan compartirse. El contenido en un repositorio público y las imágenes servidas por el sitio pueden ser visibles para cualquiera. Usa imágenes propias, con licencia adecuada o con autorización del titular, y añade los créditos requeridos por su licencia.

### GitHub Pages

El flujo [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) compila y publica el sitio automáticamente al subir cambios a la rama `main`.

1. Crea un repositorio en GitHub. Si vas a subir el proyecto desde esta carpeta, créalo vacío (sin README inicial).
2. Abre una terminal en la raíz del proyecto. Si todavía no es un repositorio Git, inicialízalo y sube la rama `main`:

   ```powershell
   git init -b main
   git add .
   git commit -m "Publicar visualizador de cerámicas"
   git remote add origin https://github.com/TU_USUARIO/modelo3d-ceramicas.git
   git push -u origin main
   ```

   Reemplaza `TU_USUARIO` por tu nombre de usuario de GitHub. Si ya tienes un repositorio Git configurado, no repitas `git init` ni `git remote add`.

3. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como origen de publicación.
4. Revisa la pestaña **Actions**. Cuando el flujo **Publicar** termine correctamente, GitHub mostrará el enlace del sitio.

En adelante, cada `git push` a `main` inicia una nueva publicación. El flujo instala las dependencias, genera el catálogo y compila el sitio.

### Vercel o Netlify

Importa el repositorio y configura:

- **Comando de compilación:** `npm run build`
- **Directorio de publicación:** `dist`

La aplicación utiliza rutas con `#` y una base relativa, por lo que funciona en alojamientos estáticos y en subrutas.

## Estructura del proyecto

```text
public/
  catalogo-imagenes.json       Catálogo de imágenes generado
  texturas/
    datos.csv                  Precio, caja, marca y acabado
    pisos/                     Imágenes de piso y miniaturas
    paredes/                   Imágenes de pared y miniaturas
texturas-originales/
  pisos/                       Imágenes originales para optimizar
  paredes/
scripts/
  generar-catalogo.mjs         Lee imágenes y datos.csv
  optimizar-imagenes.mjs       Convierte originales a WebP
src/
  components/                  Componentes de interfaz y modelo 3D
  pages/                       Modelo 3D, Catálogo e Informe de costos
  lib/calculos.js              Cálculo de piezas, cajas y desperdicio
  lib/texturas/                Generadores de patrones y texturas
  store/                       Estado del cuarto y catálogo del navegador
  config.js                    Moneda, acabados y límites de materiales
```

## Tecnologías

React, Vite, Tailwind CSS, Three.js, React Three Fiber, React Three Drei, React Router y Zustand. Las imágenes agregadas desde la aplicación se almacenan localmente con IndexedDB.
