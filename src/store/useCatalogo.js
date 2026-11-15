// Catálogo = generados por código + imágenes de fábrica (carpetas) + materiales del usuario (IndexedDB).
import { useMemo } from 'react';
import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { CATALOGO_GENERADO } from '../lib/texturas/catalogoGenerado.js';
import { MAX_MATERIALES_USUARIO } from '../config.js';
import { blobADataUrl, dataUrlABlob } from '../lib/imagen.js';

const BASE = import.meta.env.BASE_URL;
const CLAVE_IDB = 'materiales-usuario-v1';

async function leerUsuario() {
  try { return (await idbGet(CLAVE_IDB)) || []; } catch { return []; }
}
const aMaterial = (r) => ({ ...r, origen: 'usuario', imagen: URL.createObjectURL(r.blob) });
const sinUrl = ({ imagen, origen, ...r }) => r;

export const useCatalogo = create((set, get) => ({
  fabrica: [],
  usuario: [],
  registros: [],
  cargando: true,
  error: null,

  async cargar() {
    if (!get().cargando && get().registros.length) return;
    const [fabrica, registros] = await Promise.all([
      fetch(`${BASE}catalogo-imagenes.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      leerUsuario(),
    ]);
    set({
      fabrica: fabrica.map((m) => ({ ...m, origen: 'fabrica', imagen: `${BASE}${m.imagen}`, miniatura: m.miniatura ? `${BASE}${m.miniatura}` : null })),
      registros,
      usuario: registros.map(aMaterial),
      cargando: false,
    });
  },

  async guardarUsuario(datos, blob, idExistente) {
    const { registros } = get();
    if (!idExistente && registros.length >= MAX_MATERIALES_USUARIO) {
      throw new Error(`Límite de ${MAX_MATERIALES_USUARIO} materiales propios alcanzado. Elimina alguno para agregar otro.`);
    }
    const id = idExistente || `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const previo = registros.find((r) => r.id === id);
    const registro = { ...datos, id, blob: blob || previo?.blob };
    const nuevos = previo ? registros.map((r) => (r.id === id ? registro : r)) : [...registros, registro];
    await idbSet(CLAVE_IDB, nuevos);
    get().usuario.forEach((m) => URL.revokeObjectURL(m.imagen));
    set({ registros: nuevos, usuario: nuevos.map(aMaterial) });
    return id;
  },

  async eliminarUsuario(id) {
    const nuevos = get().registros.filter((r) => r.id !== id);
    await idbSet(CLAVE_IDB, nuevos);
    get().usuario.forEach((m) => URL.revokeObjectURL(m.imagen));
    set({ registros: nuevos, usuario: nuevos.map(aMaterial) });
  },

  async exportar() {
    const salida = [];
    for (const r of get().registros) salida.push({ ...sinUrl(r), blob: undefined, imagenDataUrl: await blobADataUrl(r.blob) });
    return JSON.stringify({ version: 1, materiales: salida });
  },

  async importar(texto) {
    const datos = JSON.parse(texto);
    if (!Array.isArray(datos.materiales)) throw new Error('El archivo no tiene el formato esperado.');
    let registros = [...get().registros];
    for (const m of datos.materiales) {
      const { imagenDataUrl, ...resto } = m;
      const blob = await dataUrlABlob(imagenDataUrl);
      const reg = { ...resto, blob };
      const i = registros.findIndex((r) => r.id === reg.id);
      if (i >= 0) registros[i] = reg; else registros.push(reg);
    }
    registros = registros.slice(0, MAX_MATERIALES_USUARIO);
    await idbSet(CLAVE_IDB, registros);
    get().usuario.forEach((m) => URL.revokeObjectURL(m.imagen));
    set({ registros, usuario: registros.map(aMaterial) });
  },
}));

export function useMateriales() {
  const fabrica = useCatalogo((s) => s.fabrica);
  const usuario = useCatalogo((s) => s.usuario);
  return useMemo(() => [...CATALOGO_GENERADO, ...fabrica, ...usuario], [fabrica, usuario]);
}

export function useMaterial(id) {
  const todos = useMateriales();
  return useMemo(() => todos.find((m) => m.id === id) || null, [todos, id]);
}
