import { MONEDA } from '../config.js';
import { calcularInforme } from './calculos.js';
import { areaCajaM2, etiquetaMedida, precioM2 } from './medidas.js';

const ACCIONES = {
  modelo: { texto: 'Ir al Modelo 3D', ruta: '/' },
  catalogo: { texto: 'Abrir el catálogo', ruta: '/catalogo' },
  costos: { texto: 'Ver costos', ruta: '/costos' },
};

const INTENCIONES = [
  {
    grupos: [['junta', 'lechada', 'boquilla', 'separacion', 'lineas entre piezas'], ['color', 'grosor', 'espesor', 'ancho', 'cambiar', 'ajustar', 'configurar', 'regular', 'modificar', 'medida', 'que es', 'que significa', 'para que sirve']],
    texto: 'En «Modelo 3D», abre «Juntas (lechada)» para cambiar el grosor y el color. El grosor también aparece en el cálculo de «Costos».',
    ruta: 'modelo',
  },
  {
    grupos: [['margen', 'seguridad', 'extra', 'adicional', 'porcentaje de reserva', 'sobrante'], ['calculo', 'caja', 'compra', 'piezas', 'material', 'cambiar', 'ajustar', 'aumentar', 'disminuir', 'subir', 'bajar', 'que es', 'que significa', 'para que sirve', 'como se usa', 'configurar']],
    texto: 'En «Costos», cambia «Margen de seguridad» para agregar un porcentaje de reserva a la cantidad de piezas. Luego el cálculo redondea a cajas completas.',
    ruta: 'costos',
  },
  {
    grupos: [['recortes', 'sobrantes', 'retazos', 'pedazos', 'cortes'], ['reutilizar', 'reutilizo', 'aprovechar', 'aprovecho', 'usar', 'uso', 'guardar', 'desperdicio', 'calculo', 'opcion', 'casilla', 'que es', 'que significa', 'para que sirve', 'conviene']],
    texto: 'En «Costos» puedes activar «Reutilizar los recortes». Si lo desactivas, el cálculo no considera esos sobrantes para la siguiente fila.',
    ruta: 'costos',
  },
  {
    grupos: [['girar', 'giro', 'gira', 'giran', 'girarlo', 'rotar', 'roto', 'rotacion', 'orientacion', 'horizontal', 'vertical', 'direccion'], ['pieza', 'piezas', 'baldosa', 'baldosas', 'piso', 'pared', 'ceramica', 'loseta', '90']],
    texto: 'Puedes girar las piezas 90°. En «Modelo 3D» están los controles «Girar piso 90°» y «Girar pared 90°»; en «Costos» hay una opción equivalente para el cálculo. Desactívala si el diseño tiene una orientación fija.',
    ruta: 'modelo',
  },
  {
    grupos: [['pdf', 'imprimir', 'impresion', 'papel', 'documento', 'reporte', 'informe', 'presupuesto'], ['guardar', 'descargar', 'generar', 'sacar', 'exportar', 'obtener', 'hacer', 'imprimir', 'como', 'donde', 'costos']],
    texto: 'En «Costos», pulsa «Imprimir o guardar PDF». En el diálogo del navegador elige «Guardar como PDF». También puedes imprimirlo en papel.',
    ruta: 'costos',
  },
  {
    grupos: [['captura', 'foto', 'imagen', 'vista', 'pantalla', 'diseno', 'render'], ['guardar', 'guardo', 'tomar', 'tomar una', 'capturar', 'capturo', 'incluir', 'agregar', 'aparece', 'mostrar', 'conservar', 'exportar', 'descargar', 'modelo']],
    texto: 'En «Modelo 3D», usa «Guardar vista» para capturar el diseño actual. La imagen se muestra después en el informe de «Costos».',
    ruta: 'modelo',
  },
  {
    grupos: [['largo', 'ancho', 'alto', 'medida', 'medidas', 'dimension', 'dimensiones', 'tamano', 'metros', 'area', 'cuanto mide'], ['cuarto', 'habitacion', 'ambiente', 'espacio', 'piso', 'cambiar', 'ajustar', 'poner', 'modificar', 'configurar', 'ampliar', 'reducir', 'actualizar', 'definir', 'restablecer']],
    texto: 'En «Modelo 3D», abre el panel derecho «Medidas del cuarto» y ajusta largo, ancho y alto. El informe de «Costos» actualiza las áreas con esas dimensiones.',
    ruta: 'modelo',
  },
  {
    grupos: [['vista', 'ver', 'mostrar', 'cambiar', 'alternar', 'cambiar entre', 'completo', 'esquina'], ['cuarto', 'habitacion', 'dos', 'cuatro', '2', '4', 'camara', 'modelo', '3d']],
    texto: 'En «Modelo 3D», en «Vista del cuarto», puedes alternar entre la vista de dos paredes y la de cuatro paredes. En la vista 3D también puedes girar el cuarto con el mouse o el dedo.',
    ruta: 'modelo',
  },
  {
    grupos: [['girar', 'giro', 'gira', 'rotar', 'roto', 'mover', 'muevo', 'arrastrar', 'arrastro', 'navegar', 'orbitar', 'acercar', 'alejar'], ['camara', 'vista', 'cuarto', 'modelo', 'escena', 'mouse', 'raton', 'dedo', 'pantalla', '3d']],
    texto: 'Para cambiar el ángulo del modelo, arrastra sobre el cuarto con el mouse o el dedo. También puedes cambiar entre dos y cuatro paredes desde «Vista del cuarto».',
    ruta: 'modelo',
  },
  {
    grupos: [['zocalo', 'rodapie', 'zócalo', 'zócalos'], ['altura', 'alto', 'color', 'cambiar', 'ajustar', 'poner', 'quitar', 'medir', 'configurar', 'ancho', 'que es', 'que significa', 'para que sirve']],
    texto: 'En «Modelo 3D», la sección «Zócalo y pintura» permite ajustar la altura y el color del zócalo.',
    ruta: 'modelo',
  },
  {
    grupos: [['pintura', 'pintar', 'pared pintada', 'color de pared', 'paredes pintadas'], ['color', 'cambiar', 'elegir', 'ajustar', 'seleccionar', 'configurar', 'pared', 'arriba', 'parte superior']],
    texto: 'En «Modelo 3D», usa «Color de la pintura» para elegirlo. Si el enchape no llega hasta el techo, el área superior de la pared se muestra pintada.',
    ruta: 'modelo',
  },
  {
    grupos: [['enchape', 'revestimiento', 'ceramica', 'azulejo', 'pared con ceramica', 'paredes con ceramica'], ['altura', 'alto', 'techo', 'completo', 'hasta arriba', 'subir', 'bajar', 'poner', 'pongo', 'que es', 'que significa']],
    texto: 'En «Modelo 3D», en «Cerámica en la pared», puedes marcar «Hasta el techo» o definir una altura. También eliges qué paredes llevan cerámica.',
    ruta: 'modelo',
  },
  {
    grupos: [['que paredes', 'cuales paredes', 'paredes con ceramica', 'paredes revestidas', 'paredes que llevan ceramica', 'elegir paredes', 'marcar paredes'], ['activar', 'desactivar', 'elegir', 'elijo', 'escoger', 'seleccionar', 'selecciono', 'poner', 'pongo', 'quitar', 'marcar', 'cambiar']],
    texto: 'En «Modelo 3D», abre «Paredes con cerámica» para elegir cuáles paredes se revisten. Las que no llevan cerámica se calculan como pintadas.',
    ruta: 'modelo',
  },
  {
    grupos: [['cambiar', 'cambio', 'modificar', 'elegir', 'seleccionar', 'aplicar', 'poner', 'usar', 'reemplazar', 'escoger', 'asignar'], ['piso', 'suelo', 'pared', 'paredes', 'ceramica', 'azulejo', 'baldosa', 'loseta', 'material', 'revestimiento', 'enchape']],
    texto: 'En «Modelo 3D», el panel de materiales te permite elegir el material del piso y de las paredes. También puedes abrir «Catálogo» y pulsar «Ver en 3D» en un producto.',
    ruta: 'modelo',
  },
  {
    grupos: [['acabado', 'brillante', 'satinado', 'mate', 'rustico', 'relieve', 'textura superficial'], ['catalogo', 'material', 'producto', 'buscar', 'filtrar', 'elegir', 'seleccionar', 'agregar', 'cambiar', 'tipo', 'significa', 'opciones', 'que es', 'que significa', 'cuales']],
    texto: 'El acabado se puede revisar en la ficha del material y filtrar en «Catálogo». Al agregar un material propio, elige entre brillante, satinado, mate, rústico o relieve 3D.',
    ruta: 'catalogo',
  },
  {
    grupos: [['agregar', 'agrego', 'anadir', 'añadir', 'crear', 'registrar', 'subir', 'cargar', 'incorporar', 'nuevo', 'nueva', 'incluir'], ['material', 'materiales', 'producto', 'productos', 'ceramica', 'baldosa', 'piso', 'pared', 'imagen', 'textura']],
    texto: 'En «Catálogo», pulsa «Agregar material». Puedes subir una imagen y completar nombre, tipo, acabado, medidas, piezas por caja, precio por caja y marca. Se guarda en este navegador.',
    ruta: 'catalogo',
  },
  {
    grupos: [['editar', 'modificar', 'cambiar', 'actualizar', 'corregir', 'renombrar', 'reemplazar'], ['material', 'materiales', 'producto', 'nombre', 'precio', 'imagen', 'marca', 'datos', 'informacion', 'acabado']],
    texto: 'En «Catálogo», los materiales propios muestran el botón «Editar». Los productos de fábrica no se editan desde la página; sus datos se cambian en los archivos del proyecto.',
    ruta: 'catalogo',
  },
  {
    grupos: [['eliminar', 'borrar', 'quitar', 'remover', 'descartar'], ['material', 'materiales', 'producto', 'elemento', 'mio', 'propio', 'agregado']],
    texto: 'En «Catálogo», puedes eliminar los materiales propios con el botón «Eliminar». La app te pide confirmar antes de borrarlos.',
    ruta: 'catalogo',
  },
  {
    grupos: [['imagen', 'imagenes', 'foto', 'fotografia', 'textura', 'ficha tecnica'], ['donde', 'conseguir', 'obtener', 'buscar', 'encontrar', 'descargar', 'fuente', 'origen', 'fabricante', 'proveedor', 'catalogo oficial', 'no tengo', 'faltan', 'no me dieron', 'no proporcionaron', 'sin imagen']],
    texto: 'Puedes solicitar las imágenes al fabricante o proveedor, o buscarlas en sus catálogos oficiales; confirma que tengas permiso para usarlas. Si no consigues la imagen exacta, usa una textura genérica propia e indícala como referencial.',
    ruta: 'catalogo',
  },
  {
    grupos: [['imagen', 'foto', 'fotografia', 'textura', 'archivo', 'jpg', 'png', 'webp'], ['subir', 'cargar', 'agregar', 'necesito', 'sirve', 'usar', 'uso', 'utilizar', 'utilizo', 'preparar', 'elegir', 'cambiar', 'tamano', 'calidad', 'frente']],
    texto: 'Para agregar un material propio, usa una foto frontal, sin perspectiva pronunciada y, de ser posible, sin junta. El formulario acepta imágenes y las reduce para guardarlas en el navegador.',
    ruta: 'catalogo',
  },
  {
    grupos: [['columnas', 'filas', 'modulo', 'modulos', 'diseno repetido', 'varias piezas', 'mosaico'], ['imagen', 'pieza', 'piezas', 'ceramica', 'medida', 'indicar', 'configurar', 'significa', 'significan', 'significado', 'que es', 'que significa', 'que significan', 'para que sirve', 'para que sirven']],
    texto: 'Si la imagen muestra varias piezas que forman un patrón, indica columnas y filas en el formulario. El ancho y el largo siguen siendo las medidas de una sola pieza.',
    ruta: 'catalogo',
  },
  {
    grupos: [['piezas por caja', 'piezas en caja', 'caja trae', 'caja contiene', 'cuantas piezas', 'piezas', 'rendimiento', 'cobertura', 'area por caja'], ['material', 'ceramica', 'caja', 'calcular', 'poner', 'indicar', 'significa', 'precio', 'medida', 'trae', 'contiene', 'cuantas']],
    texto: 'Al agregar un material, indica cuántas piezas contiene cada caja. La app usa ese dato junto con las medidas de la pieza para estimar cajas y sobrantes.',
    ruta: 'catalogo',
  },
  {
    grupos: [['buscar', 'busqueda', 'busco', 'encontrar', 'hallar', 'localizar', 'filtrar', 'filtro', 'mostrar', 'ver', 'encontrare'], ['catalogo', 'material', 'producto', 'nombre', 'marca', 'acabado', 'medida', 'tamano', 'precio', 'tipo', 'piso', 'pared', 'baldosa', 'loseta', 'azulejo', 'ceramica']],
    texto: 'En «Catálogo» puedes buscar por nombre o marca y filtrar por tipo, medida, acabado, origen y precio máximo por metro cuadrado. «Limpiar filtros» restablece la búsqueda.',
    ruta: 'catalogo',
  },
  {
    grupos: [['ordenar', 'orden', 'acomodar', 'organizar', 'clasificar', 'sort', 'mostrar primero'], ['nombre', 'alfabetico', 'precio', 'barato', 'economico', 'caro', 'mayor', 'menor', 'catalogo', 'producto', 'material']],
    texto: 'En «Catálogo», usa «Ordenar por» para ordenar por nombre o por precio por metro cuadrado, de menor a mayor o de mayor a menor.',
    ruta: 'catalogo',
  },
  {
    grupos: [['exportar', 'descargar', 'guardar', 'respaldar', 'respaldo', 'copia', 'backup', 'llevar', 'transferir'], ['material', 'materiales', 'catalogo', 'archivo', 'json', 'ceramica', 'ceramicas', 'piso', 'pared', 'textura', 'otro equipo', 'otro navegador', 'datos']],
    texto: 'En «Catálogo», pulsa «Exportar mis materiales» para descargar un JSON con tus materiales propios. Guárdalo para tener una copia o importarlo en otro navegador.',
    ruta: 'catalogo',
  },
  {
    grupos: [['importar', 'restaurar', 'recuperar', 'cargar', 'subir', 'abrir', 'pasar', 'transferir'], ['material', 'materiales', 'archivo', 'json', 'copia', 'respaldo', 'otro equipo', 'otro navegador', 'catalogo']],
    texto: 'En «Catálogo», pulsa «Importar» y selecciona el archivo JSON que exportaste. Así recuperas tus materiales propios en el navegador actual.',
    ruta: 'catalogo',
  },
  {
    grupos: [['guardan', 'guarda', 'guardar', 'almacenamiento', 'almacena', 'persisten', 'permanecen', 'sincroniza', 'compartir', 'compartido', 'perdi', 'perder'], ['material', 'materiales', 'catalogo', 'navegador', 'equipo', 'computadora', 'celular', 'telefono', 'internet', 'cuenta', 'limite', '50']],
    texto: 'Los materiales propios se guardan en IndexedDB de este navegador; no se comparten automáticamente entre equipos ni cuentas. El límite es de 50 por navegador. Usa «Exportar mis materiales» para respaldarlos.',
    ruta: 'catalogo',
  },
  {
    grupos: [['precio', 'precios', 'costo', 'valor', 'vale', 'valdria', 'cuesta', 'caro', 'barato', 'economico'], ['material', 'producto', 'caja', 'metro', 'm2', 'catalogo', 'ceramica', 'precio del piso', 'precio de la pared', 'precio por caja', 'precio por metro', 'precio por m2', 'costo por caja', 'costo por metro']],
    texto: 'En «Catálogo» puedes ver el precio por caja y su equivalente por metro cuadrado cuando el material tiene precio registrado. En «Costos» ves el total estimado para el diseño.',
    ruta: 'catalogo',
  },
  {
    grupos: [['cuanto material', 'cuanta ceramica', 'cuantas cajas', 'cuantas piezas', 'calcular', 'calculo', 'necesito', 'comprar', 'piezas', 'cajas', 'cantidad', 'unidades', 'area'], ['material', 'ceramica', 'piso', 'pared', 'cuarto', 'habitacion', 'revestimiento', 'metros', 'metro cuadrado', 'metros cuadrados', 'm2', 'superficie', 'caja', 'cubrir', 'colocar']],
    texto: 'Para calcular cantidades, selecciona el piso y la pared en el Modelo 3D y abre «Costos». El informe estima área, piezas, cajas y sobrantes según las medidas y los datos de cada material.',
    ruta: 'costos',
  },
  {
    grupos: [['total', 'suma', 'presupuesto', 'importe', 'gasto', 'cuesta', 'costo', 'costos', 'precio'], ['proyecto', 'cuarto', 'habitacion', 'material', 'piso', 'pared', 'ceramica', 'informe', 'calcular', 'ver', 'consultar']],
    texto: 'En «Costos» revisa el costo estimado del piso y de las paredes revestidas. El cálculo depende del área, del número de cajas y del precio registrado para cada material.',
    ruta: 'costos',
  },
  {
    grupos: [['precio', 'costo', 'falta', 'sin precio', 'no tiene precio', 'no aparece el precio', 'cero'], ['informe', 'total', 'calculo', 'material', 'producto', 'caja', 'catalogo']],
    texto: 'Si el material no tiene precio, el informe indica que su costo no está incluido en el total. Puedes agregar el precio en «Catálogo» si es propio o actualizar los datos del proyecto.',
    ruta: 'catalogo',
  },
  {
    grupos: [['desperdicio', 'sobrante', 'cortes', 'recortes', 'merma', 'perdida', 'piezas extra'], ['calculo', 'informe', 'cuanto', 'porcentaje', 'ver', 'significa', 'que es', 'que significa', 'para que sirve', 'como', 'explicame', 'reducir', 'evitar', 'material', 'caja']],
    texto: 'El informe separa el desperdicio por cortes del excedente por margen de seguridad y cajas completas. Es una estimación; el patrón de colocación y los cortes reales pueden cambiarla.',
    ruta: 'costos',
  },
  {
    grupos: [['puerta', 'puertas', 'ventana', 'ventanas', 'abertura', 'aberturas'], ['agregar', 'agrego', 'anadir', 'añadir', 'quitar', 'borrar', 'editar', 'medir', 'descontar', 'descuento', 'pared', 'costos', 'calculo', 'poner', 'colocar', 'crear']],
    texto: 'En «Costos» puedes agregar puertas y ventanas, asignarles una pared y registrar ancho, alto, altura desde el piso y cantidad. Se descuentan piezas del cálculo de paredes, pero no se dibujan en el modelo 3D.',
    ruta: 'costos',
  },
  {
    grupos: [['junta', 'lechada', 'boquilla', 'grosor', 'espesor', 'separacion'], ['calculo', 'costo', 'piezas', 'medida', 'milimetro', 'mm', 'afecta', 'modifica', 'cambiar', 'ajustar']],
    texto: 'El grosor de la junta se configura en «Modelo 3D» y también en «Costos». El cálculo lo considera al estimar cuántas piezas caben por fila y columna.',
    ruta: 'costos',
  },
  {
    grupos: [['no hay', 'ningun', 'ninguno', 'nada', 'vacio', 'vacia', 'no aparece', 'no veo', 'no encuentro', 'desaparecio'], ['resultado', 'material', 'producto', 'catalogo', 'busqueda', 'lista', 'piso', 'pared']],
    texto: 'En «Catálogo», revisa si los filtros están limitando la lista y pulsa «Limpiar filtros». En el buscador del Modelo 3D, borra el texto para volver a mostrar los materiales.',
    ruta: 'catalogo',
  },
  {
    grupos: [['como', 'donde', 'puedo', 'quiero', 'necesito', 'ir', 'abrir', 'acceder', 'entrar', 'ver', 'mostrar'], ['modelo 3d', 'modelo', 'visualizador', 'cuarto', 'habitacion', 'simulador', 'vista 3d']],
    texto: 'Elige «Modelo 3D» en la barra superior para ver el cuarto, cambiar sus medidas y aplicar materiales.',
    ruta: 'modelo',
  },
  {
    grupos: [['como', 'donde', 'puedo', 'quiero', 'necesito', 'ir', 'abrir', 'acceder', 'entrar', 'ver', 'mostrar'], ['catalogo', 'lista de productos', 'lista de materiales', 'coleccion', 'productos', 'materiales']],
    texto: 'Elige «Catálogo» en la barra superior para buscar, filtrar, agregar o administrar materiales.',
    ruta: 'catalogo',
  },
  {
    grupos: [['como', 'donde', 'puedo', 'quiero', 'necesito', 'ir', 'abrir', 'acceder', 'entrar', 'ver', 'mostrar'], ['costos', 'calculo', 'informe', 'presupuesto', 'cajas', 'desperdicio']],
    texto: 'Elige «Costos» en la barra superior para revisar las cantidades, el desperdicio y el presupuesto estimado.',
    ruta: 'costos',
  },
];

function normalizar(texto) {
  return texto
    .toLowerCase()
    .replace(/²/g, '2')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function coincideTermino(texto, termino) {
  const normalizado = normalizar(termino);
  const palabras = texto.split(' ');
  if (normalizado.includes(' ')) {
    return ` ${texto} `.includes(` ${normalizado} `);
  }
  if (palabras.includes(normalizado) || palabras.includes(`${normalizado}s`) || palabras.includes(`${normalizado}es`)) return true;

  if (!/(ar|er|ir)$/.test(normalizado)) return false;
  const raiz = normalizado.slice(0, -2);
  return raiz.length >= 3 && palabras.some((palabra) => palabra.startsWith(raiz));
}

function coincide(texto, grupos) {
  return grupos.every((grupo) => grupo.some((termino) => coincideTermino(texto, termino)));
}

const PALABRAS_GENERALES_MATERIAL = new Set([
  'piso', 'pared', 'revestimiento', 'ceramica', 'azulejo', 'baldosa', 'loseta',
  'modelo', 'material', 'producto', 'el', 'la', 'los', 'las', 'de', 'del',
  'precio', 'precios', 'costo', 'costos', 'caja', 'cajas', 'pieza', 'piezas',
  'unidad', 'unidades', 'medida', 'medidas', 'tamano', 'ancho', 'largo',
  'marca', 'acabado', 'dato', 'datos',
]);
function variantesNombre(material) {
  const nombre = normalizar(material.nombre || '');
  const sinTipo = nombre.replace(/^(piso|pared|revestimiento)\s+/, '');
  return [...new Set([nombre, sinTipo].filter(Boolean))];
}

function buscarMaterial(texto, materiales) {
  const resultados = materiales.map((material) => {
    const variantes = variantesNombre(material);
    const palabras = [...new Set(variantes
      .flatMap((variante) => variante.split(' '))
      .filter((palabra) => palabra.length > 1 && !PALABRAS_GENERALES_MATERIAL.has(palabra)))];
    const encontradas = palabras.filter((palabra) => coincideTermino(texto, palabra));
    const fraseExacta = variantes.some((variante) => texto.includes(variante));
    const mencionaTipo = coincideTermino(texto, material.tipo);
    return {
      material,
      puntuacion: encontradas.reduce((total, palabra) => total + palabra.length, 0)
        + (encontradas.length === palabras.length ? 20 : 0)
        + (fraseExacta ? 100 : 0)
        + (mencionaTipo ? 3 : 0),
      coincidencias: encontradas.length,
    };
  }).filter((resultado) => resultado.coincidencias > 0);

  if (!resultados.length) return { material: null, ambiguos: [] };
  resultados.sort((a, b) => b.puntuacion - a.puntuacion);
  const mejores = resultados.filter((resultado) => resultado.puntuacion === resultados[0].puntuacion);
  if (mejores.length !== 1) {
    return { material: null, ambiguos: mejores.slice(0, 3).map((resultado) => resultado.material) };
  }
  return { material: mejores[0].material, ambiguos: [] };
}

function buscarNombreExacto(texto, materiales) {
  const coincidencias = materiales.filter((material) => {
    const nombre = normalizar(material.nombre || '');
    const sinTipo = nombre.replace(/^(piso|pared)\s+/, '');
    const conTipo = material.tipo ? `${normalizar(material.tipo)} ${nombre}` : nombre;
    return texto === nombre || texto === sinTipo || texto === conTipo;
  });
  if (coincidencias.length === 1) return { material: coincidencias[0], ambiguos: [] };
  return { material: null, ambiguos: coincidencias.slice(0, 3) };
}

function pideDatosDeProducto(texto) {
  return [
    'precio', 'precios', 'costo', 'costos', 'cuesta', 'cuestan', 'vale', 'valen', 'valor',
    'caja', 'cajas', 'piezas', 'unidades', 'medida', 'medidas', 'tamano', 'ancho', 'largo',
    'mide', 'marca', 'acabado', 'especificaciones', 'detalles', 'datos',
  ].some((termino) => coincideTermino(texto, termino));
}

function respuestaDatosProducto(texto, materiales, cargandoCatalogo) {
  const { material, ambiguos } = buscarMaterial(texto, materiales);
  if (material) {
    const areaCaja = areaCajaM2(material);
    const precio = Number(material.precioCaja) > 0
      ? `${MONEDA} ${Number(material.precioCaja).toFixed(2)} por caja (${MONEDA} ${precioM2(material).toFixed(2)}/m²)`
      : 'sin precio registrado';
    const detalles = [
      `${material.nombre} (${material.tipo})`,
      `Medida de pieza: ${etiquetaMedida(material)}`,
      `Caja: ${material.piezasPorCaja} piezas${areaCaja > 0 ? `, ${areaCaja.toFixed(2)} m²` : ''}`,
      `Precio del catálogo: ${precio}`,
      material.marca ? `Marca: ${material.marca}` : null,
      material.acabado ? `Acabado: ${material.acabado}` : null,
      material.origen === 'generado' ? 'El precio de la colección digital es referencial, no una cotización comercial.' : null,
    ].filter(Boolean);
    return { texto: detalles.join('\n'), producto: material, accion: ACCIONES.catalogo };
  }

  if (cargandoCatalogo) {
    return { texto: 'El catálogo todavía se está cargando. Intenta de nuevo en un momento.' };
  }

  if (ambiguos.length) {
    return {
      texto: `Encontré varios materiales que podrían coincidir: ${ambiguos.map((item) => `${item.nombre} (${item.tipo})`).join(', ')}. Escribe el nombre más completo para darte sus datos exactos.`,
      accion: ACCIONES.catalogo,
    };
  }

  return {
    texto: 'No encontré un material que coincida con ese nombre. Revisa cómo aparece en «Catálogo» y vuelve a preguntarme; así evito inventar precios o cantidades.',
    accion: ACCIONES.catalogo,
  };
}

function incluyeFrase(texto, frase) {
  return ` ${texto} `.includes(` ${frase} `);
}

function variantesDeNombre(material) {
  const nombre = normalizar(material.nombre || '');
  const yaIncluyeTipo = /^(piso|pared)\s+/.test(nombre);
  return [...new Set([nombre, material.tipo && !yaIncluyeTipo ? `${material.tipo} ${nombre}` : nombre])];
}

function buscarProductosMencionados(texto, materiales) {
  return materiales.filter((material) => (
    variantesDeNombre(material).some((variante) => variante.length > 3 && incluyeFrase(texto, variante))
  ));
}

function esPreguntaComparativa(texto) {
  return ['compara', 'comparar', 'comparame', 'comparacion', 'comparativa', 'diferencia', 'diferencias', 'versus', 'vs']
    .some((termino) => coincideTermino(texto, termino));
}

function responderComparacion(texto, materiales) {
  const productos = buscarProductosMencionados(texto, materiales);
  if (productos.length < 2) {
    return {
      texto: 'Para compararlos necesito los nombres de al menos dos productos, por ejemplo: «Compara Bill Toledo con Berna Gris».',
      accion: ACCIONES.catalogo,
    };
  }

  const comparados = productos.slice(0, 3);
  const conPrecio = comparados.filter((material) => Number(material.precioCaja) > 0);
  const masEconomico = conPrecio.sort((a, b) => precioM2(a) - precioM2(b))[0];
  const recomendacion = masEconomico
    ? `Menor precio por m²: ${masEconomico.nombre}${masEconomico.origen === 'generado' ? ' (referencial)' : ''}.`
    : 'No hay precios registrados para calcular cuál cuesta menos por m².';

  return {
    texto: `Comparación de ${comparados.length} productos`,
    productos: comparados,
    comparacion: {
      menorPrecioId: masEconomico?.id,
      recomendacion,
    },
    accion: ACCIONES.catalogo,
  };
}

const COLORES = [
  { nombre: 'blanco', alias: ['blanco', 'blanca', 'white'] },
  { nombre: 'negro', alias: ['negro', 'negra', 'black'] },
  { nombre: 'gris', alias: ['gris', 'grises', 'grigio', 'gray'] },
  { nombre: 'beige', alias: ['beige', 'arena', 'hueso'] },
  { nombre: 'marrón', alias: ['marron', 'cafe', 'chocolate', 'nogal', 'caramelo'] },
  { nombre: 'azul', alias: ['azul', 'celeste', 'cobalto', 'marino'] },
  { nombre: 'verde', alias: ['verde', 'salvia', 'oliva'] },
  { nombre: 'rojo', alias: ['rojo', 'roja', 'terracota', 'ladrillo'] },
  { nombre: 'rosa', alias: ['rosa', 'rosado', 'rosada', 'morado', 'morada'] },
];

const ACABADOS = [
  { nombre: 'Brillante', alias: ['brillante'] },
  { nombre: 'Satinado', alias: ['satinado'] },
  { nombre: 'Mate', alias: ['mate'] },
  { nombre: 'Rústico', alias: ['rustico'] },
  { nombre: 'Relieve 3D', alias: ['relieve', '3d'] },
];

function extraerPrecioMaximo(consulta) {
  const coincidencia = consulta.match(/(?:s\/\s*)?(\d+(?:[.,]\d+)?)\s*(?:soles?\s*)?(?:por\s*m(?:2|²)|\/\s*m(?:2|²)|m(?:2|²))/i);
  if (!coincidencia) return null;
  const precio = Number(coincidencia[1].replace(',', '.'));
  return Number.isFinite(precio) && precio > 0 ? precio : null;
}

function criteriosDeBusqueda(texto, consulta) {
  const tipo = coincideTermino(texto, 'pared') ? 'pared'
    : (coincideTermino(texto, 'piso') || coincideTermino(texto, 'suelo')) ? 'piso'
      : null;
  const acabado = ACABADOS.find((opcion) => opcion.alias.some((alias) => coincideTermino(texto, alias)))?.nombre || null;
  const colores = COLORES.filter((color) => color.alias.some((alias) => coincideTermino(texto, alias)));
  const precioMaximoM2 = extraerPrecioMaximo(consulta);
  return { tipo, acabado, colores, precioMaximoM2 };
}

function esBusquedaGuiada(texto, criterios) {
  const quiereOpciones = [
    'buscar', 'busco', 'busca', 'buscame', 'recomendar', 'recomienda', 'recomiendame',
    'sugerir', 'sugiere', 'sugiereme', 'encontrar', 'encuentra', 'encuentrame', 'opciones', 'necesito',
  ]
    .some((termino) => coincideTermino(texto, termino));
  return quiereOpciones && (criterios.tipo || criterios.acabado || criterios.colores.length || criterios.precioMaximoM2);
}

function responderBusquedaGuiada(texto, criterios, materiales) {
  const resultados = materiales.filter((material) => {
    if (criterios.tipo && material.tipo !== criterios.tipo) return false;
    if (criterios.acabado && normalizar(material.acabado || '') !== normalizar(criterios.acabado)) return false;
    if (criterios.colores.length && !criterios.colores.every((color) => (
      color.alias.some((alias) => coincideTermino(normalizar(material.nombre || ''), alias))
    ))) return false;
    if (criterios.precioMaximoM2 !== null) {
      return Number(material.precioCaja) > 0 && precioM2(material) <= criterios.precioMaximoM2;
    }
    return true;
  }).sort((a, b) => {
    const precioA = Number(a.precioCaja) > 0 ? precioM2(a) : Number.POSITIVE_INFINITY;
    const precioB = Number(b.precioCaja) > 0 ? precioM2(b) : Number.POSITIVE_INFINITY;
    return precioA - precioB || a.nombre.localeCompare(b.nombre, 'es');
  });

  if (!resultados.length) {
    return {
      texto: 'No encontré productos que cumplan todos esos criterios. Prueba quitando el color o subiendo el límite de precio.',
      accion: ACCIONES.catalogo,
    };
  }

  const opciones = resultados.slice(0, 3);
  const resumen = opciones.map((material) => {
    const precio = Number(material.precioCaja) > 0
      ? `${MONEDA} ${precioM2(material).toFixed(2)}/m²${material.origen === 'generado' ? ' (referencial)' : ''}`
      : 'sin precio registrado';
    return `• ${material.nombre}: ${precio}, ${material.acabado || 'acabado no indicado'}.`;
  });
  const criteriosTexto = [
    criterios.tipo,
    criterios.acabado,
    ...criterios.colores.map((color) => color.nombre),
    criterios.precioMaximoM2 !== null ? `hasta ${MONEDA} ${criterios.precioMaximoM2.toFixed(2)}/m²` : null,
  ].filter(Boolean).join(', ');

  return {
    texto: `Encontré ${resultados.length} opción(es)${criteriosTexto ? ` para ${criteriosTexto}` : ''}:\n${resumen.join('\n')}`,
    productos: opciones,
    accion: ACCIONES.catalogo,
  };
}

function extraerDimensionesCuarto(consulta) {
  const patron = /(\d+(?:[.,]\d+)?)\s*(centimetros?|cm|metros?|m)?\s*(?:x|×|\*|por)\s*(\d+(?:[.,]\d+)?)\s*(centimetros?|cm|metros?|m)?/gi;
  const dimensiones = [...consulta.matchAll(patron)];
  if (!dimensiones.length) return null;

  const indiceAmbiente = consulta.search(/cuarto|habitaci[oó]n|ambiente/i);
  const despuesDelAmbiente = indiceAmbiente >= 0
    ? dimensiones.find((dimension) => dimension.index > indiceAmbiente)
    : null;
  const [coincidencia] = despuesDelAmbiente ? [despuesDelAmbiente] : dimensiones.slice(-1);
  const [, anchoTexto, unidadAncho, largoTexto, unidadLargo] = coincidencia;
  const unidadComun = unidadLargo || unidadAncho || 'm';
  const convertir = (valor, unidad) => (
    Number(valor.replace(',', '.')) / (/^c/i.test(unidad || unidadComun) ? 100 : 1)
  );
  const ancho = convertir(anchoTexto, unidadAncho);
  const largo = convertir(largoTexto, unidadLargo);
  if (![ancho, largo].every((valor) => Number.isFinite(valor) && valor > 0 && valor <= 100)) return null;
  return {
    ancho,
    largo,
    valorAncho: Number(anchoTexto.replace(',', '.')),
    valorLargo: Number(largoTexto.replace(',', '.')),
    unidadAncho,
    unidadLargo,
  };
}

function parecenMedidasDePieza(dimensiones, material) {
  if (!material?.pieza) return false;
  const unidadComun = dimensiones.unidadAncho || dimensiones.unidadLargo || 'cm';
  const aCm = (valor, unidad) => valor * (/^(m|metro)/i.test(unidad || unidadComun) ? 100 : 1);
  const ancho = aCm(dimensiones.valorAncho, dimensiones.unidadAncho);
  const largo = aCm(dimensiones.valorLargo, dimensiones.unidadLargo);
  const { ancho: piezaAncho, largo: piezaLargo } = material.pieza;
  return (
    (Math.abs(ancho - piezaAncho) <= 1 && Math.abs(largo - piezaLargo) <= 1)
    || (Math.abs(ancho - piezaLargo) <= 1 && Math.abs(largo - piezaAncho) <= 1)
  );
}

function esSolicitudEstimacion(texto, dimensiones, coincidencia) {
  const consultaCantidad = [
    'cuantas cajas', 'cuantas piezas', 'cuanto material', 'cantidad', 'costo',
    'cuanto cuesta', 'cuanto costaria', 'precio total', 'presupuesto', 'necesito',
  ].some((termino) => coincideTermino(texto, termino));
  if (!consultaCantidad) return false;

  const accionCompra = [
    'necesito', 'calcular', 'calculo', 'estimar', 'estimacion', 'comprar',
    'para cubrir', 'para revestir', 'me alcanza', 'cuanto costaria',
  ].some((termino) => coincideTermino(texto, termino));
  const ambiente = ['cuarto', 'habitacion', 'ambiente', 'superficie']
    .some((termino) => coincideTermino(texto, termino));
  const contexto = ['piso', 'suelo', 'pared', 'revestimiento']
    .some((termino) => coincideTermino(texto, termino));
  if (dimensiones) {
    return ambiente || (
      accionCompra
      && Math.max(dimensiones.ancho, dimensiones.largo) <= 30
      && !parecenMedidasDePieza(dimensiones, coincidencia.material)
    );
  }
  return accionCompra && (contexto || coincidencia.material || coincidencia.ambiguos.length > 0);
}

function formatearNumero(valor, decimales = 2) {
  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

function responderEstimacion(texto, dimensiones, materiales, contexto = {}) {
  const coincidencia = buscarMaterial(texto, materiales);
  if (coincidencia.ambiguos.length) {
    return {
      texto: `No pude elegir un material porque hay varias coincidencias: ${coincidencia.ambiguos.map((material) => material.nombre).join(', ')}. Escribe el nombre completo.`,
      accion: ACCIONES.catalogo,
    };
  }

  const pidePared = ['pared', 'paredes', 'revestimiento', 'enchape'].some((termino) => coincideTermino(texto, termino));
  const material = coincidencia.material || (pidePared ? contexto.pared : contexto.piso);
  if (!material) {
    return {
      texto: 'Para estimar cajas, dime qué producto quieres usar o selecciónalo primero en el modelo 3D.',
      accion: ACCIONES.modelo,
    };
  }

  const roomActual = contexto.room || { ancho: 3.5, largo: 4.5, alto: 2.6 };
  const room = {
    ...roomActual,
    ...(dimensiones ? { ancho: dimensiones.ancho, largo: dimensiones.largo } : {}),
    alto: roomActual.alto || 2.6,
  };
  const esPared = material.tipo === 'pared';
  const revestidas = esPared
    ? (contexto.revestidas || { fondo: true, izquierda: true, derecha: true, frente: true })
    : { fondo: false, izquierda: false, derecha: false, frente: false };
  const informe = calcularInforme({
    room,
    piso: esPared ? null : material,
    pared: esPared ? material : null,
    revestidas,
    zocalo: contexto.zocalo || { cm: 10 },
    enchape: contexto.enchape || { completo: true, m: room.alto },
    aberturas: esPared ? (contexto.aberturas || []) : [],
    calc: contexto.calc || { margen: 5, reutilizar: true, girar: false },
    junta: contexto.junta || { mm: 3 },
  });
  const superficie = informe.superficies.find((item) => item.mat.id === material.id);
  if (!superficie) {
    return {
      texto: 'No hay paredes habilitadas para revestir en la configuración actual. Actívalas en «Costos» para estimar las cajas.',
      accion: ACCIONES.costos,
    };
  }

  const area = `${formatearNumero(room.ancho)} × ${formatearNumero(room.largo)} m`;
  const lineas = [
    `Estimación para ${esPared ? 'las paredes revestidas' : 'el piso'} con ${material.nombre} en un cuarto de ${area}:`,
    `Área a cubrir: ${formatearNumero(superficie.areaNetaM2)} m².`,
    `Cantidad estimada: ${formatearNumero(superficie.piezasGrilla, 0)} piezas más margen (${formatearNumero(superficie.piezasConMargen, 0)} en total), equivalentes a ${formatearNumero(superficie.cajas, 0)} cajas.`,
    Number(material.precioCaja) > 0
      ? `Costo estimado de las cajas: ${MONEDA} ${formatearNumero(superficie.costo)}.`
      : 'Este producto no tiene precio registrado, así que no puedo calcular el costo.',
    esPared
      ? `Para las paredes usé la altura, el enchape y las paredes habilitadas actualmente en el modelo.`
      : `El cálculo usa el margen y el grosor de junta configurados en el proyecto.`,
    'Es una estimación de material; no incluye adhesivo, instalación ni transporte.',
  ];

  return {
    texto: lineas.join('\n'),
    producto: material,
    accion: ACCIONES.costos,
  };
}

export function responderAsistente(consulta, materiales = [], cargandoCatalogo = false, contexto = {}) {
  const texto = normalizar(consulta);
  if (!texto) {
    return { texto: 'Escribe una pregunta y te ayudo con el modelo, el catálogo o los costos.' };
  }

  if ([
    'amor', 'amo', 'te amo', 'mi amor', 'te quiero', 'te adoro',
    'me gustas', 'me encantas',
  ].some((expresion) => coincideTermino(texto, expresion))) {
    return { texto: '<#D' };
  }

  if (['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal'].some((saludo) => texto === saludo || (texto.startsWith(`${saludo} `) && texto.length < 32))) {
    return { texto: '¡Hola! Puedes preguntarme cómo usar el modelo 3D, administrar materiales o calcular cantidades y costos.' };
  }

  if (['gracias', 'muchas gracias', 'te agradezco', 'perfecto gracias'].includes(texto)) {
    return { texto: '¡De nada! Cuando quieras, escríbeme otra pregunta sobre el proyecto.' };
  }

  if ([
    'sugerencia de preguntas', 'sugerencias de preguntas', 'sugerencia de pregunta',
    'modelo de preguntas', 'ejemplos de preguntas', 'que preguntas puedo hacer',
    'que puedo preguntarte',
  ].some((termino) => coincideTermino(texto, termino))) {
    return {
      texto: 'Aquí tienes algunas ideas. Toca una pregunta para probarla:',
      sugerenciasAgrupadas: [
        {
          titulo: 'Sobre un producto',
          preguntas: [
            '¿Cuánto cuesta David Lisboa Mix?',
            '¿Cuántas piezas trae cada caja de Anahí Fachaleta Montecarlo?',
            '¿Qué medida tiene Felipe Pepelma Aqua?',
          ],
        },
        {
          titulo: 'Comparar y buscar',
          preguntas: [
            'Compara Bill Toledo con Deysi Piedra Río Color',
            'Recomiéndame un piso mate gris de hasta S/ 50 por m²',
            'Busca paredes brillantes blancas',
          ],
        },
        {
          titulo: 'Calcular cantidades',
          preguntas: [
            '¿Cuántas cajas necesito para un cuarto de 3 × 4 m usando David Lisboa Mix?',
            '¿Cuántas cajas de Anahí Fachaleta Montecarlo necesito para las paredes?',
            '¿Cuánto costaría cubrir un cuarto de 3 × 4 m con David Lisboa Mix?',
          ],
        },
      ],
    };
  }

  if (esPreguntaComparativa(texto)) {
    return responderComparacion(texto, materiales);
  }

  const dimensiones = extraerDimensionesCuarto(consulta);
  const coincidenciaMaterial = buscarMaterial(texto, materiales);
  if (esSolicitudEstimacion(texto, dimensiones, coincidenciaMaterial)) {
    return responderEstimacion(texto, dimensiones, materiales, contexto);
  }

  if (pideDatosDeProducto(texto) && buscarProductosMencionados(texto, materiales).length) {
    return respuestaDatosProducto(texto, materiales, cargandoCatalogo);
  }

  const criterios = criteriosDeBusqueda(texto, consulta);
  if (esBusquedaGuiada(texto, criterios)) {
    return responderBusquedaGuiada(texto, criterios, materiales);
  }

  const nombreExacto = buscarNombreExacto(texto, materiales);
  if (nombreExacto.material || nombreExacto.ambiguos.length) {
    return respuestaDatosProducto(texto, materiales, cargandoCatalogo);
  }

  if (pideDatosDeProducto(texto)) {
    const coincidencia = buscarMaterial(texto, materiales);
    if (coincidencia.material || coincidencia.ambiguos.length) {
      return respuestaDatosProducto(texto, materiales, cargandoCatalogo);
    }
  }

  if (coincide(texto, [
    ['donde', 'guardar', 'guardan', 'almacenamiento', 'almacena', 'persisten', 'sincronizar', 'sincroniza', 'compartir', 'comparten', 'perdi', 'perder'],
    ['material', 'catalogo', 'navegador', 'equipo', 'computadora', 'celular', 'telefono', 'internet', 'cuenta', 'limite', '50'],
  ])) {
    return {
      texto: 'Los materiales propios se guardan en este navegador, no se sincronizan automáticamente entre equipos. El límite es de 50 por navegador; usa «Exportar mis materiales» para respaldarlos.',
      accion: ACCIONES.catalogo,
    };
  }

  if (coincide(texto, [
    ['no tiene precio', 'sin precio', 'falta el precio', 'precio faltante', 'precio no aparece', 'no aparece el precio', 'no se muestra el precio'],
    ['material', 'producto', 'informe', 'caja', 'catalogo', 'total'],
  ])) {
    return {
      texto: 'Si un material no tiene precio, el informe lo indica y no suma ese material al costo total. Puedes agregar el precio en «Catálogo» si es propio o actualizar los datos del proyecto.',
      accion: ACCIONES.catalogo,
    };
  }

  if (coincide(texto, [
    ['cuanto cuesta', 'cuanto costara', 'cuanto me cuesta', 'costo total', 'coste total', 'presupuesto de', 'cuanto vale instalar', 'calcular costo'],
    ['cubrir', 'revestir', 'instalar', 'colocar', 'remodelar', 'terminar', 'cuarto', 'habitacion', 'proyecto'],
  ])) {
    return {
      texto: 'Para estimar el costo de cubrir el cuarto, selecciona los materiales en «Modelo 3D» y abre «Costos». El informe usa las medidas del espacio, las cajas necesarias y los precios registrados.',
      accion: ACCIONES.costos,
    };
  }

  for (const intencion of INTENCIONES) {
    if (coincide(texto, intencion.grupos)) {
      return {
        texto: intencion.texto,
        ...(intencion.ruta ? { accion: ACCIONES[intencion.ruta] } : {}),
      };
    }
  }

  return {
    texto: 'Todavía no tengo una respuesta preparada para esa pregunta. Prueba mencionando qué quieres hacer y con qué parte: modelo 3D, medidas, piso, paredes, juntas, catálogo, materiales, cajas, costos o informe.',
  };
}
