// Configuración general de la aplicación
export const MONEDA = 'S/';
export const MAX_MATERIALES_USUARIO = 50;
export const TEXTURA_MAX_PX = 1024; // lado máximo del lienzo de cada textura
export const IMAGEN_SUBIDA_MAX_PX = 1024;

// Acabados -> propiedades de brillo (PBR)
export const ACABADOS = {
  Brillante: { rugosidad: 0.14, env: 1.0 },
  Satinado: { rugosidad: 0.38, env: 0.7 },
  Mate: { rugosidad: 0.7, env: 0.45 },
  'Relieve 3D': { rugosidad: 0.7, env: 0.45 },
  'Rústico': { rugosidad: 0.88, env: 0.3 },
};
export const LISTA_ACABADOS = Object.keys(ACABADOS);
