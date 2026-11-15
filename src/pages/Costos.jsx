import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Slider from '../components/Slider.jsx';
import ParedesToggle from '../components/ParedesToggle.jsx';
import { NOMBRE_PARED, PAREDES, useStore } from '../store/useStore.js';
import { useMaterial } from '../store/useCatalogo.js';
import { calcularInforme } from '../lib/calculos.js';
import { areaCajaM2, etiquetaMedida } from '../lib/medidas.js';
import { MONEDA } from '../config.js';

const fmt = (n, d = 2) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: d, maximumFractionDigits: d });
const dinero = (n) => `${MONEDA} ${fmt(n)}`;

function Fila({ k, v, fuerte }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-plano-100 py-1.5 text-sm ${fuerte ? 'font-semibold' : ''}`}>
      <dt className="text-plano-700">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function BloqueSuperficie({ r }) {
  const m = r.mat;
  return (
    <section className="report-surface rounded-lg border border-plano-200 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{r.nombre}: {m.nombre}</h3>
        <span className="text-xs text-plano-500">Pieza {etiquetaMedida(m)} · caja de {m.piezasPorCaja} ({fmt(areaCajaM2(m))} m²)</span>
      </div>
      <dl>
        <Fila k="Área a cubrir (sin puertas ni ventanas)" v={`${fmt(r.areaNetaM2)} m²`} />
        {r.areaAberturasM2 > 0 && <Fila k="Descontado por puertas y ventanas" v={`${fmt(r.areaAberturasM2)} m²`} />}
        <Fila k="Piezas necesarias (con cortes)" v={fmt(r.piezasGrilla, 0)} />
        <Fila k={`Con margen de seguridad`} v={fmt(r.piezasConMargen, 0)} />
        <Fila k="Cajas a comprar" v={fmt(r.cajas, 0)} fuerte />
        <Fila k={`Piezas sobrantes en cajas`} v={fmt(r.sobrantesEnCaja, 0)} />
        <Fila k={`Precio por caja`} v={m.precioCaja > 0 ? dinero(m.precioCaja) : 'Sin precio'} />
        <Fila k="Costo" v={dinero(r.costo)} fuerte />
      </dl>
      <div className="mt-3 rounded-md bg-plano-50 p-3 text-sm">
        <div className="mb-1 font-medium">Desperdicio</div>
        <dl>
          <Fila k="Por cortes de borde" v={`${fmt(r.desperdicioCorteM2)} m²`} />
          <Fila k="Por margen y piezas sobrantes de caja" v={`${fmt(r.excedenteM2)} m²`} />
          <Fila k="Total" v={`${fmt(r.desperdicioTotalM2)} m² (${fmt(r.desperdicioPct, 1)} % de lo comprado)`} fuerte />
        </dl>
      </div>
      {r.nota && <p className="mt-2 text-xs text-plano-500">{r.nota}</p>}
      {r.tipoSuperficie === 'piso' && r.detalle && (
        <p className="mt-2 text-xs text-plano-500">
          Colocación: {r.detalle.completas} piezas enteras y {r.detalle.piezasCortadas} cortadas
          {r.detalle.girada ? ' (piezas giradas 90°, usan menos material)' : ''}.
        </p>
      )}
      {r.tipoSuperficie === 'pared' && Array.isArray(r.detalle) && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-plano-200 text-left text-plano-500"><th className="py-1 pr-2 font-medium">Pared</th><th className="pr-2 font-medium">Estado</th><th className="pr-2 text-right font-medium">Piezas</th></tr></thead>
            <tbody>
              {r.detalle.map((d) => (
                <tr key={d.pared} className="border-b border-plano-100">
                  <td className="py-1 pr-2">{NOMBRE_PARED[d.pared]}</td>
                  <td className="pr-2">{d.revestida ? 'Con cerámica' : 'Pintada'}</td>
                  <td className="pr-2 text-right">{d.revestida ? fmt(d.total, 0) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Costos() {
  const s = useStore();
  const piso = useMaterial(s.pisoId);
  const pared = useMaterial(s.paredId);

  const informe = useMemo(() => calcularInforme({
    room: s.room, piso, pared, revestidas: s.revestidas, zocalo: s.zocalo, enchape: s.enchape,
    aberturas: s.aberturas, calc: s.calc, junta: s.junta,
  }), [s.room, piso, pared, s.revestidas, s.zocalo, s.enchape, s.aberturas, s.calc, s.junta]);

  const sinPrecio = informe.superficies.filter((x) => !(x.mat.precioCaja > 0));
  const hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="costos-pagina h-full overflow-y-auto">
      <div className="costos-layout mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ---- Controles (no se imprimen) ---- */}
        <aside className="no-print space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-plano-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold">Cálculo</h2>
            <Slider etiqueta="Margen de seguridad" valor={s.calc.margen} min={0} max={20} paso={1} unidad="%" decimales={0} onChange={(v) => s.setCalc({ margen: v })} />
            <Slider etiqueta="Grosor de junta" valor={s.junta.mm} min={0} max={8} paso={0.5} unidad="mm" onChange={(v) => s.setJunta({ mm: v })} />
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-plano-700">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-cobalto-600" checked={s.calc.reutilizar} onChange={(e) => s.setCalc({ reutilizar: e.target.checked })} />
              <span>Reutilizar los recortes<br /><span className="text-xs text-plano-500">Desmarca si el diseño no permite aprovechar sobrantes.</span></span>
            </label>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-plano-700">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-cobalto-600" checked={s.calc.girar} onChange={(e) => s.setCalc({ girar: e.target.checked })} />
              <span>Permitir girar las piezas 90°<br /><span className="text-xs text-plano-500">Solo para diseños lisos o que se ven igual girados.</span></span>
            </label>
          </div>

          <div className="rounded-lg border border-plano-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold">Paredes con cerámica</h2>
            <ParedesToggle />
          </div>

          <div className="rounded-lg border border-plano-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Puertas y ventanas</h2>
              <div className="flex gap-1.5">
                <button className="btn px-2 py-1 text-xs" onClick={() => s.agregarAbertura('puerta')}>+ Puerta</button>
                <button className="btn px-2 py-1 text-xs" onClick={() => s.agregarAbertura('ventana')}>+ Ventana</button>
              </div>
            </div>
            {s.aberturas.length === 0 && <p className="text-xs text-plano-500">Sin puertas ni ventanas. Agrégalas para descontar piezas en las paredes.</p>}
            <ul className="space-y-3">
              {s.aberturas.map((a) => (
                <li key={a.id} className="rounded-md border border-plano-200 p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium capitalize">{a.tipo}</span>
                    <select className="campo !w-auto py-1" value={a.pared} onChange={(e) => s.editarAbertura(a.id, { pared: e.target.value })} aria-label="Pared">
                      {PAREDES.map((p) => <option key={p} value={p}>{NOMBRE_PARED[p]}</option>)}
                    </select>
                    <button className="btn btn-peligro px-2 py-1 text-xs" onClick={() => s.quitarAbertura(a.id)}>Quitar</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[['ancho', 'Ancho (m)'], ['alto', 'Alto (m)'], ['alzado', 'Altura desde el piso (m)'], ['cantidad', 'Cantidad']].map(([k, et]) => (
                      <label key={k}><span className="etiqueta">{et}</span>
                        <input className="campo mt-1 py-1" type="number" min={k === 'cantidad' ? 1 : 0} step={k === 'cantidad' ? 1 : 0.05} value={a[k]}
                          onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) s.editarAbertura(a.id, { [k]: k === 'cantidad' ? Math.max(1, Math.round(v)) : v }); }} />
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-plano-500">Las puertas y ventanas descuentan piezas en el cálculo; no se dibujan en el modelo 3D.</p>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primario flex-1" onClick={() => window.print()}>Imprimir o guardar PDF</button>
            <Link className="btn" to="/">Editar en 3D</Link>
          </div>
          <p className="text-xs text-plano-500">
            En el diálogo de impresión, elige «Guardar como PDF», papel A4 y desactiva encabezados y pies del navegador.
          </p>
        </aside>

        {/* ---- Informe ---- */}
        <article className="hoja rounded-lg border border-plano-200 bg-white p-6 shadow-sm">
          <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-plano-200 pb-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cobalto-700">Visualizador de cerámicas</p>
              <h1 className="text-xl font-semibold tracking-tight">Informe de materiales y costos</h1>
            </div>
            <time className="text-sm text-plano-500">{hoy}</time>
          </header>

          {sinPrecio.length > 0 && (
            <p className="report-warning mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {sinPrecio.map((x) => x.mat.nombre).join(', ')} no tiene precio y su costo no está incluido en el total. Agrégalo en <Link className="underline" to="/catalogo">Catálogo</Link> o en <code>public/texturas/datos.csv</code>.
            </p>
          )}

          <div className={`report-meta mb-5 grid gap-5 md:grid-cols-[1fr_1fr] ${s.captura ? '' : 'report-room-full'}`}>
            <section className="report-room">
              <h2 className="mb-2 text-sm font-semibold">Cuarto</h2>
              <dl>
                <Fila k="Largo" v={`${fmt(s.room.largo)} m`} />
                <Fila k="Ancho" v={`${fmt(s.room.ancho)} m`} />
                <Fila k="Alto" v={`${fmt(s.room.alto)} m`} />
                <Fila k="Área del piso" v={`${fmt(informe.areaPisoM2)} m²`} />
                <Fila k="Perímetro" v={`${fmt(informe.perimetroM)} m`} />
                <Fila k="Junta" v={`${fmt(s.junta.mm, 1)} mm`} />
              </dl>
            </section>
            {s.captura ? (
              <section className="report-visual">
                <h2 className="mb-2 text-sm font-semibold">Vista del diseño</h2>
                <img src={s.captura} alt="Vista 3D guardada del cuarto" className="report-capture w-full rounded-md border border-plano-200" />
              </section>
            ) : (
              <section className="no-print">
                <h2 className="mb-2 text-sm font-semibold">Vista del diseño</h2>
                <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-plano-300 p-3 text-center text-sm text-plano-500">Aún no hay una vista guardada. Usa «Guardar vista» en el Modelo 3D para incluirla aquí.</div>
              </section>
            )}
          </div>

          <section className="report-summary mb-5 break-inside-avoid rounded-lg bg-cobalto-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-cobalto-700">Resumen general</h2>
            <dl>
              <Fila k="Costo total de cerámicas" v={<span className="text-lg font-semibold">{dinero(informe.total)}</span>} />
              <Fila k="Desperdicio total" v={`${fmt(informe.desperdicioM2)} m² (${fmt(informe.desperdicioPct, 1)} %)`} />
              <Fila k="Zócalo pintado" v={`${fmt(informe.zocaloLineal)} m lineales`} />
              <Fila k="Área de pared a pintar (referencial)" v={`${fmt(informe.areaPintura)} m²`} />
            </dl>
          </section>

          <div className="space-y-4">
            {informe.superficies.map((r) => <BloqueSuperficie key={r.nombre} r={r} />)}
            {informe.superficies.length === 0 && <p className="text-sm text-plano-500">Elige un piso o una pared en el Modelo 3D para ver el cálculo.</p>}
          </div>

          <footer className="report-method mt-5 space-y-1 text-xs text-plano-500">
            <p>Método: se cuentan las piezas enteras que caben por fila y columna (considerando la junta) y las piezas de borde que hay que cortar. Con «reutilizar recortes», el sobrante de una pieza cortada se usa en la siguiente fila (descontando 3 mm por corte). El margen de seguridad se aplica al total de piezas y luego se redondea a cajas completas.</p>
            <p>Puertas y ventanas descuentan solo piezas enteras (estimación conservadora). Los diseños en espiga y hexagonales se estiman por área con un porcentaje propio de corte. Es una estimación de referencia: el maestro de obra puede ajustarla según el corte real.</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
