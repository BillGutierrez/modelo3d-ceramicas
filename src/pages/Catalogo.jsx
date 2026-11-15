import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Miniatura from '../components/Miniatura.jsx';
import FormMaterial from '../components/FormMaterial.jsx';
import { useCatalogo, useMateriales } from '../store/useCatalogo.js';
import { useStore } from '../store/useStore.js';
import { LISTA_ACABADOS, MONEDA } from '../config.js';
import { areaCajaM2, etiquetaMedida, precioM2 } from '../lib/medidas.js';

const ORIGEN = { generado: 'Colección digital', fabrica: 'Fábrica', usuario: 'Mío' };

export default function Catalogo() {
  const navigate = useNavigate();
  const materiales = useMateriales();
  const cargando = useCatalogo((s) => s.cargando);
  const eliminar = useCatalogo((s) => s.eliminarUsuario);
  const exportar = useCatalogo((s) => s.exportar);
  const importar = useCatalogo((s) => s.importar);
  const setPiso = useStore((s) => s.setPiso);
  const setPared = useStore((s) => s.setPared);
  const pisoId = useStore((s) => s.pisoId);
  const paredId = useStore((s) => s.paredId);

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [origen, setOrigen] = useState('todos');
  const [acabado, setAcabado] = useState('todos');
  const [medida, setMedida] = useState('todas');
  const [maxPrecio, setMaxPrecio] = useState('');
  const [orden, setOrden] = useState('nombre');
  const [form, setForm] = useState(null); // null | 'nuevo' | material
  const [msg, setMsg] = useState('');
  const archivoRef = useRef(null);

  const medidas = useMemo(() => [...new Set(materiales.map(etiquetaMedida))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })), [materiales]);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    const tope = Number(maxPrecio);
    let r = materiales.filter((m) =>
      (tipo === 'todos' || m.tipo === tipo) &&
      (origen === 'todos' || m.origen === origen) &&
      (acabado === 'todos' || m.acabado === acabado) &&
      (medida === 'todas' || etiquetaMedida(m) === medida) &&
      (!maxPrecio || !(tope > 0) || m.precioCaja <= 0 || precioM2(m) <= tope) &&
      (!t || `${m.nombre} ${m.marca || ''}`.toLowerCase().includes(t)));
    const cmp = {
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
      precioAsc: (a, b) => precioM2(a) - precioM2(b),
      precioDesc: (a, b) => precioM2(b) - precioM2(a),
    }[orden];
    return [...r].sort(cmp);
  }, [materiales, q, tipo, origen, acabado, medida, maxPrecio, orden]);

  const usar = (m) => {
    if (m.tipo === 'piso') setPiso(m.id); else setPared(m.id);
    navigate('/');
  };
  const avisar = (t) => { setMsg(t); setTimeout(() => setMsg(''), 4000); };

  const alExportar = async () => {
    const texto = await exportar();
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'mis-materiales.json'; a.click();
    URL.revokeObjectURL(url);
  };
  const alImportar = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try { await importar(await f.text()); avisar('Materiales importados.'); } catch (err) { avisar(`No se pudo importar: ${err.message}`); }
  };
  const alEliminar = async (m) => {
    if (window.confirm(`¿Eliminar "${m.nombre}" del catálogo?`)) await eliminar(m.id);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Catálogo de materiales</h1>
            <p className="mt-1 text-sm text-plano-500">{cargando ? 'Cargando…' : `${lista.length} de ${materiales.length} materiales`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primario" onClick={() => setForm('nuevo')}>Agregar material</button>
            <button className="btn" onClick={alExportar}>Exportar mis materiales</button>
            <button className="btn" onClick={() => archivoRef.current?.click()}>Importar</button>
            <input ref={archivoRef} type="file" accept="application/json" className="sr-only" onChange={alImportar} />
          </div>
        </div>

        <div className="mb-5 grid gap-3 rounded-lg border border-plano-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
          <label className="sm:col-span-2"><span className="etiqueta">Buscar por nombre o marca</span><input className="campo mt-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. mármol, subway, talavera" /></label>
          <label><span className="etiqueta">Tipo</span>
            <select className="campo mt-1" value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="todos">Todos</option><option value="piso">Piso</option><option value="pared">Pared</option></select></label>
          <label><span className="etiqueta">Medida de pieza</span>
            <select className="campo mt-1" value={medida} onChange={(e) => setMedida(e.target.value)}><option value="todas">Todas</option>{medidas.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label><span className="etiqueta">Acabado</span>
            <select className="campo mt-1" value={acabado} onChange={(e) => setAcabado(e.target.value)}><option value="todos">Todos</option>{LISTA_ACABADOS.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label><span className="etiqueta">Origen</span>
            <select className="campo mt-1" value={origen} onChange={(e) => setOrigen(e.target.value)}><option value="todos">Todos</option>{Object.entries(ORIGEN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label><span className="etiqueta">Precio máximo por m² ({MONEDA})</span><input className="campo mt-1" inputMode="decimal" value={maxPrecio} onChange={(e) => setMaxPrecio(e.target.value)} placeholder="Sin límite" /></label>
          <label><span className="etiqueta">Ordenar por</span>
            <select className="campo mt-1" value={orden} onChange={(e) => setOrden(e.target.value)}><option value="nombre">Nombre</option><option value="precioAsc">Precio m²: menor a mayor</option><option value="precioDesc">Precio m²: mayor a menor</option></select></label>
          <div className="flex items-end"><button className="btn w-full" onClick={() => { setQ(''); setTipo('todos'); setOrigen('todos'); setAcabado('todos'); setMedida('todas'); setMaxPrecio(''); }}>Limpiar filtros</button></div>
        </div>

        <p className="mb-4 rounded-md bg-cobalto-50 px-3 py-2 text-sm text-cobalto-700">Los materiales que agregues se guardan solo en este navegador. Usa «Exportar mis materiales» para tener una copia o llevarlos a otro equipo.</p>
        {msg && <p role="status" className="mb-4 rounded-md bg-plano-900 px-3 py-2 text-sm text-white">{msg}</p>}

        {lista.length === 0 && !cargando && <div className="rounded-lg border border-dashed border-plano-300 p-10 text-center text-sm text-plano-500">Ningún material coincide con los filtros.</div>}

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((m) => {
            const enUso = m.id === pisoId || m.id === paredId;
            return (
              <li key={m.id} className="flex flex-col overflow-hidden rounded-lg border border-plano-200 bg-white">
                <Miniatura material={m} size={240} />
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold leading-snug">{m.nombre}</h2>
                    <span className="shrink-0 rounded bg-plano-100 px-1.5 py-0.5 text-xs text-plano-700">{m.tipo === 'piso' ? 'Piso' : 'Pared'}</span>
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                    <dt className="text-plano-500">Pieza</dt><dd>{etiquetaMedida(m)}</dd>
                    <dt className="text-plano-500">Caja</dt><dd>{m.piezasPorCaja} piezas · {areaCajaM2(m).toFixed(2)} m²</dd>
                    <dt className="text-plano-500">Precio</dt><dd>{m.precioCaja > 0 ? `${MONEDA} ${m.precioCaja.toFixed(2)} por caja · ${MONEDA} ${precioM2(m).toFixed(2)}/m²` : 'Sin precio'}</dd>
                    <dt className="text-plano-500">Acabado</dt><dd>{m.acabado}</dd>
                    {m.marca && (<><dt className="text-plano-500">Marca</dt><dd>{m.marca}</dd></>)}
                    <dt className="text-plano-500">Origen</dt><dd>{ORIGEN[m.origen]}</dd>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-2 pt-1">
                    <button className="btn btn-primario flex-1" onClick={() => usar(m)}>{enUso ? 'Ver en 3D (en uso)' : 'Ver en 3D'}</button>
                    {m.origen === 'usuario' && (<>
                      <button className="btn" onClick={() => setForm(m)}>Editar</button>
                      <button className="btn btn-peligro" onClick={() => alEliminar(m)}>Eliminar</button>
                    </>)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {form && <FormMaterial editar={form === 'nuevo' ? null : form} onCerrar={() => setForm(null)} onGuardado={() => avisar('Material guardado en este navegador.')} />}
    </div>
  );
}
