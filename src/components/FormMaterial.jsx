// Formulario para agregar o editar un material propio (se guarda en este navegador).
import { useEffect, useState } from 'react';
import { LISTA_ACABADOS, MAX_MATERIALES_USUARIO } from '../config.js';
import { procesarImagen } from '../lib/imagen.js';
import { useCatalogo } from '../store/useCatalogo.js';

const VACIO = { nombre: '', tipo: 'piso', ancho: '60', largo: '60', cols: '1', filas: '1', piezasPorCaja: '4', precioCaja: '', marca: '', acabado: 'Satinado' };

export default function FormMaterial({ editar, onCerrar, onGuardado }) {
  const guardarUsuario = useCatalogo((s) => s.guardarUsuario);
  const [f, setF] = useState(VACIO);
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (editar) {
      setF({
        nombre: editar.nombre, tipo: editar.tipo, ancho: String(editar.pieza.ancho), largo: String(editar.pieza.largo),
        cols: String(editar.modulo?.cols || 1), filas: String(editar.modulo?.filas || 1),
        piezasPorCaja: String(editar.piezasPorCaja), precioCaja: String(editar.precioCaja || ''), marca: editar.marca || '', acabado: editar.acabado || 'Satinado',
      });
      setVista(editar.imagen);
    }
  }, [editar]);

  useEffect(() => {
    if (!archivo) return undefined;
    const url = URL.createObjectURL(archivo);
    setVista(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const num = (v) => Number(String(v).replace(',', '.'));

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    const ancho = num(f.ancho), largo = num(f.largo), cols = Math.round(num(f.cols)), filas = Math.round(num(f.filas));
    const ppc = Math.round(num(f.piezasPorCaja)), precio = f.precioCaja === '' ? 0 : num(f.precioCaja);
    if (!f.nombre.trim()) return setError('Escribe un nombre para el material.');
    if (!(ancho > 0 && largo > 0)) return setError('El ancho y el largo de la pieza deben ser mayores que 0.');
    if (!(cols >= 1 && filas >= 1)) return setError('Las columnas y filas del diseño deben ser 1 o más.');
    if (!(ppc >= 1)) return setError('Indica cuántas piezas trae cada caja (1 o más).');
    if (!(precio >= 0)) return setError('El precio no puede ser negativo.');
    if (!editar && !archivo) return setError('Sube la imagen del diseño de la pieza.');
    setGuardando(true);
    try {
      const blob = archivo ? (await procesarImagen(archivo)).blob : null;
      const id = await guardarUsuario({
        nombre: f.nombre.trim(), tipo: f.tipo, pieza: { ancho, largo }, modulo: { cols, filas },
        piezasPorCaja: ppc, precioCaja: precio, marca: f.marca.trim(), acabado: f.acabado,
      }, blob, editar?.id);
      onGuardado?.(id);
      onCerrar();
    } catch (err) {
      setError(err.message || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-plano-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-form">
      <form onSubmit={enviar} className="my-6 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-plano-200 px-5 py-4">
          <h2 id="titulo-form" className="text-base font-semibold">{editar ? 'Editar material' : 'Agregar material'}</h2>
          <button type="button" className="btn" onClick={onCerrar}>Cerrar</button>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr]">
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-md border border-plano-200 bg-plano-100">
              {vista ? <img src={vista} alt="Vista previa del diseño" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-3 text-center text-xs text-plano-500">Aquí verás la imagen</div>}
            </div>
            <label className="btn mt-2 w-full cursor-pointer">
              {vista ? 'Cambiar imagen' : 'Subir imagen'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            </label>
            <p className="mt-2 text-xs text-plano-500">Foto de frente, sin perspectiva y sin junta. Se reduce a 1024 px y se guarda en este navegador.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 block"><span className="etiqueta">Nombre</span><input className="campo mt-1" value={f.nombre} onChange={set('nombre')} /></label>
            <label className="block"><span className="etiqueta">Tipo</span>
              <select className="campo mt-1" value={f.tipo} onChange={set('tipo')}><option value="piso">Piso</option><option value="pared">Pared</option></select></label>
            <label className="block"><span className="etiqueta">Acabado</span>
              <select className="campo mt-1" value={f.acabado} onChange={set('acabado')}>{LISTA_ACABADOS.map((a) => <option key={a}>{a}</option>)}</select></label>
            <label className="block"><span className="etiqueta">Ancho de la pieza (cm)</span><input className="campo mt-1" inputMode="decimal" value={f.ancho} onChange={set('ancho')} /></label>
            <label className="block"><span className="etiqueta">Largo de la pieza (cm)</span><input className="campo mt-1" inputMode="decimal" value={f.largo} onChange={set('largo')} /></label>
            <label className="block"><span className="etiqueta">Piezas en la imagen: columnas</span><input className="campo mt-1" inputMode="numeric" value={f.cols} onChange={set('cols')} /></label>
            <label className="block"><span className="etiqueta">Piezas en la imagen: filas</span><input className="campo mt-1" inputMode="numeric" value={f.filas} onChange={set('filas')} /></label>
            <label className="block"><span className="etiqueta">Piezas por caja</span><input className="campo mt-1" inputMode="numeric" value={f.piezasPorCaja} onChange={set('piezasPorCaja')} /></label>
            <label className="block"><span className="etiqueta">Precio por caja</span><input className="campo mt-1" inputMode="decimal" value={f.precioCaja} onChange={set('precioCaja')} /></label>
            <label className="col-span-2 block"><span className="etiqueta">Marca (opcional)</span><input className="campo mt-1" value={f.marca} onChange={set('marca')} /></label>
            <p className="col-span-2 text-xs text-plano-500">Si la imagen muestra varias piezas que forman un dibujo (por ejemplo 2 × 2), indícalo en columnas y filas; el ancho y largo son los de una sola pieza.</p>
          </div>
        </div>
        {error && <p role="alert" className="mx-5 mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <div className="flex items-center justify-between gap-3 border-t border-plano-200 px-5 py-4">
          <span className="text-xs text-plano-500">Máximo {MAX_MATERIALES_USUARIO} materiales propios en este navegador.</span>
          <button className="btn btn-primario" disabled={guardando}>{guardando ? 'Guardando…' : editar ? 'Guardar cambios' : 'Agregar al catálogo'}</button>
        </div>
      </form>
    </div>
  );
}
