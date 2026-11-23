import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { responderAsistente } from '../lib/asistenteRespuestas.js';
import { MONEDA } from '../config.js';
import { areaCajaM2, etiquetaMedida, precioM2 } from '../lib/medidas.js';
import { useCatalogo, useMateriales } from '../store/useCatalogo.js';
import { useStore } from '../store/useStore.js';

const Miniatura = lazy(() => import('./Miniatura.jsx'));

const PREGUNTAS_RAPIDAS = [
  '¿Cómo cambio el piso o la pared?',
  '¿Cómo cambio las medidas del cuarto?',
  '¿Cómo agrego o edito un material?',
  '¿Cuántas cajas necesito?',
  '¿Cómo guardo o imprimo mi diseño?',
  '¿Qué preguntas puedo hacer?',
];

function IconoLia({ className = '' }) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/25 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-[72%] w-[72%]" fill="none">
        <path d="M24 5v5M24 38v5M5 24h5M38 24h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 14h20v20H14z" fill="white" fillOpacity=".16" stroke="white" strokeWidth="2" />
        <path d="M19 19h10v10H19z" fill="#F5C45E" stroke="white" strokeWidth="1.5" />
        <circle cx="34" cy="14" r="3" fill="#F5C45E" />
      </svg>
    </span>
  );
}

function IconoEnviar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 3-7.2 18-3.5-7.3L3 10.2 21 3Z" />
      <path d="M10.3 13.7 15 9" />
    </svg>
  );
}

function CorazonesAscendentes() {
  const colores = ['#e11d48', '#fb7185', '#f43f5e', '#ec4899'];

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 24 }, (_, indice) => {
        const desviacion = ((indice % 5) - 2) * 12;
        return (
          <svg
            key={indice}
            viewBox="0 0 24 24"
            className="corazon-ascendente absolute bottom-[-2rem] drop-shadow-sm"
            style={{
              left: `${(indice * 41 + 4) % 92}%`,
              width: `${18 + (indice % 4) * 7}px`,
              height: `${18 + (indice % 4) * 7}px`,
              color: colores[indice % colores.length],
              animationDelay: `${(indice % 10) * 100}ms`,
              animationDuration: `${3400 + (indice % 4) * 250}ms`,
              '--corazon-desvio': `${desviacion}px`,
            }}
          >
            <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.5L12 21.35Z" fill="currentColor" />
          </svg>
        );
      })}
    </div>
  );
}

export default function AsistenteAyuda() {
  const navigate = useNavigate();
  const materiales = useMateriales();
  const cargandoCatalogo = useCatalogo((estado) => estado.cargando);
  const modelo = useStore();
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [corazonesId, setCorazonesId] = useState(0);
  const [mensajes, setMensajes] = useState([
    {
      id: 0,
      rol: 'asistente',
      texto: '¡Hola! Soy Lia, tu guía para explorar el modelo 3D, los materiales y sus costos. ¿Por dónde empezamos?',
      sugerencias: PREGUNTAS_RAPIDAS,
    },
  ]);
  const siguienteId = useRef(1);
  const entradaRef = useRef(null);
  const finalRef = useRef(null);

  useEffect(() => {
    if (abierto) entradaRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (abierto && mensajes.length > 1) {
      finalRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [abierto, mensajes]);

  useEffect(() => {
    if (!corazonesId) return undefined;
    const temporizador = setTimeout(() => setCorazonesId(0), 5200);
    return () => clearTimeout(temporizador);
  }, [corazonesId]);

  const enviar = (texto = consulta) => {
    const pregunta = texto.trim();
    if (!pregunta) return;

    const contexto = {
      piso: materiales.find((material) => material.id === modelo.pisoId),
      pared: materiales.find((material) => material.id === modelo.paredId),
      room: modelo.room,
      revestidas: modelo.revestidas,
      zocalo: modelo.zocalo,
      enchape: modelo.enchape,
      aberturas: modelo.aberturas,
      calc: modelo.calc,
      junta: modelo.junta,
    };
    const respuesta = responderAsistente(pregunta, materiales, cargandoCatalogo, contexto);
    if (respuesta.texto === '<#D') setCorazonesId((actual) => actual + 1);
    setMensajes((actuales) => [
      ...actuales,
      { id: siguienteId.current++, rol: 'usuario', texto: pregunta },
      { id: siguienteId.current++, rol: 'asistente', ...respuesta },
    ]);
    setConsulta('');
  };

  const alEnviar = (evento) => {
    evento.preventDefault();
    enviar();
  };

  return (
    <>
      <div className="no-print fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 max-sm:bottom-3 max-sm:right-3">
      {abierto && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="asistente-titulo"
          className="flex h-[min(43rem,calc(100vh-7.5rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.5rem] border border-plano-200 bg-white shadow-[0_24px_70px_rgba(22,32,43,0.22)]"
        >
          <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-cobalto-700 to-cobalto-600 px-5 pb-5 pt-4 text-white">
            <div className="pointer-events-none absolute -right-8 -top-14 h-40 w-40 rounded-full border border-white/10 bg-white/5" />
            <div className="pointer-events-none absolute right-20 top-10 h-16 w-16 rounded-full bg-white/5" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <IconoLia className="h-12 w-12" />
                <div className="min-w-0">
                  <h2 id="asistente-titulo" className="text-lg font-semibold leading-tight tracking-tight">Lia</h2>
                  <p className="mt-0.5 truncate text-xs text-white/80">Asistente Visualizador de cerámicas</p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-white/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(110,231,183,0.16)]" />
                    Disponible ahora
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Cerrar chat con Lia"
                title="Cerrar chat"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="m5 5 10 10M15 5 5 15" />
                </svg>
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-300/90" />
          </header>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-plano-50/80 via-white to-white px-4 py-5" aria-live="polite">
            {mensajes.map((mensaje) => {
              const esUsuario = mensaje.rol === 'usuario';
              return (
                <div key={mensaje.id} className={`flex gap-2.5 ${esUsuario ? 'items-end justify-end' : 'items-start justify-start'}`}>
                  {!esUsuario && <IconoLia className="mb-1 h-8 w-8 rounded-xl bg-cobalto-100 ring-0 [&_svg_path]:stroke-cobalto-700" />}
                  <div className={`flex max-w-[88%] flex-col ${esUsuario ? 'items-end' : 'items-start'}`}>
                    {!esUsuario && <span className="mb-1 ml-1 text-[11px] font-semibold tracking-wide text-plano-500">Lia</span>}
                    <div className={`rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${esUsuario ? 'rounded-br-md bg-cobalto-600 text-white' : 'rounded-bl-md border border-plano-100 bg-white text-plano-900'}`}>
                      <p className="whitespace-pre-wrap">{mensaje.texto}</p>
                      {mensaje.sugerenciasAgrupadas && (
                        <div className="mt-3 space-y-2.5">
                          {mensaje.sugerenciasAgrupadas.map((grupo, indice) => (
                            <section key={grupo.titulo} className="overflow-hidden rounded-xl border border-plano-200 bg-white">
                              <h3 className="flex items-center gap-2 border-b border-plano-100 bg-plano-50 px-3 py-2 text-[11px] font-semibold text-plano-800">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cobalto-100 text-[10px] font-bold text-cobalto-700">
                                  {indice + 1}
                                </span>
                                {grupo.titulo}
                              </h3>
                              <div className="space-y-1.5 p-2">
                                {grupo.preguntas.map((pregunta) => (
                                  <button
                                    key={pregunta}
                                    type="button"
                                    className="group flex w-full items-start justify-between gap-2 rounded-lg border border-plano-100 bg-white px-2.5 py-2.5 text-left text-[11px] leading-snug text-plano-700 transition hover:border-cobalto-200 hover:bg-cobalto-50 hover:text-cobalto-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalto-500"
                                    onClick={() => enviar(pregunta)}
                                  >
                                    <span>{pregunta}</span>
                                    <svg viewBox="0 0 20 20" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cobalto-600 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M4 10h12m-5-5 5 5-5 5" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      )}
                      {mensaje.producto && (
                        <div className="mt-3 w-44 overflow-hidden rounded-xl border border-plano-200 bg-plano-50 p-1">
                          <Suspense fallback={<div className="aspect-square animate-pulse rounded-lg bg-plano-200" role="img" aria-label="Cargando imagen del producto" />}>
                            <Miniatura material={mensaje.producto} size={176} className="rounded-lg" />
                          </Suspense>
                        </div>
                      )}
                      {mensaje.productos?.length > 0 && (
                        <div className="mt-3 grid w-full grid-cols-2 gap-2">
                          {mensaje.productos.map((material) => (
                            <article
                              key={material.id}
                              className={`min-w-0 overflow-hidden rounded-xl border bg-white p-2 ${
                                mensaje.comparacion?.menorPrecioId === material.id
                                  ? 'border-emerald-300 ring-1 ring-emerald-100'
                                  : 'border-plano-200'
                              }`}
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-plano-100">
                                <Suspense fallback={<div className="h-full w-full animate-pulse bg-plano-200" role="img" aria-label="Cargando imagen del producto" />}>
                                  <Miniatura material={material} size={144} className="rounded-lg" />
                                </Suspense>
                              </div>
                              <h3 className="mt-2 min-h-8 break-words text-xs font-semibold leading-snug text-plano-900" title={material.nombre}>{material.nombre}</h3>
                              {mensaje.comparacion ? (
                                <dl className="mt-2 space-y-1.5 border-t border-plano-100 pt-2 text-[10px] leading-snug">
                                  <div className="flex justify-between gap-1.5">
                                    <dt className="shrink-0 text-plano-500">Medida</dt>
                                    <dd className="text-right font-medium text-plano-800">{etiquetaMedida(material)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-1.5">
                                    <dt className="shrink-0 text-plano-500">Por caja</dt>
                                    <dd className="text-right font-medium text-plano-800">{material.piezasPorCaja} piezas · {areaCajaM2(material).toFixed(2)} m²</dd>
                                  </div>
                                  <div className="flex justify-between gap-1.5">
                                    <dt className="shrink-0 text-plano-500">Acabado</dt>
                                    <dd className="text-right font-medium text-plano-800">{material.acabado || 'No indicado'}</dd>
                                  </div>
                                  <div className="border-t border-plano-100 pt-1.5">
                                    <dt className="text-plano-500">Precio por caja</dt>
                                    <dd className="mt-0.5 font-semibold text-plano-900">
                                      {Number(material.precioCaja) > 0
                                        ? `${MONEDA} ${Number(material.precioCaja).toFixed(2)}`
                                        : 'Sin precio'}
                                    </dd>
                                    {Number(material.precioCaja) > 0 && (
                                      <dd className="mt-0.5 font-semibold text-cobalto-700">
                                        {MONEDA} {precioM2(material).toFixed(2)}/m²
                                      </dd>
                                    )}
                                  </div>
                                </dl>
                              ) : (
                                <p className="mt-1 text-[10px] leading-relaxed text-plano-500">
                                  {material.piezasPorCaja} piezas/caja
                                  {Number(material.precioCaja) > 0
                                    ? ` · ${MONEDA} ${Number(material.precioCaja).toFixed(2)}/caja · ${MONEDA} ${precioM2(material).toFixed(2)}/m²`
                                    : ' · Sin precio'}
                                </p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                      {mensaje.comparacion && (
                        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium leading-relaxed text-emerald-800">
                          {mensaje.comparacion.recomendacion}
                        </p>
                      )}
                      {mensaje.accion && (
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-cobalto-50 px-3.5 py-2 text-xs font-semibold text-cobalto-700 transition hover:bg-cobalto-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalto-500"
                          onClick={() => navigate(mensaje.accion.ruta)}
                        >
                          {mensaje.accion.texto}
                          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 10h12m-5-5 5 5-5 5" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {mensaje.sugerencias && (
                      <div className="mt-3 grid w-full gap-2">
                        {mensaje.sugerencias.map((sugerencia) => (
                          <button
                            key={sugerencia}
                            type="button"
                            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-plano-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-plano-700 shadow-sm transition hover:border-cobalto-300 hover:bg-cobalto-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalto-500"
                            onClick={() => enviar(sugerencia)}
                          >
                            <span>{sugerencia}</span>
                            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-cobalto-600 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 10h12m-5-5 5 5-5 5" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={finalRef} />
          </div>

          <div className="shrink-0 border-t border-plano-200 bg-white px-4 pb-3 pt-3">
            <form onSubmit={alEnviar} className="flex items-center gap-2 rounded-2xl border border-plano-200 bg-plano-50 p-1.5 pl-4 transition focus-within:border-cobalto-500 focus-within:ring-2 focus-within:ring-cobalto-500/15">
              <input
                ref={entradaRef}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-plano-900 outline-none placeholder:text-plano-500 focus:ring-0"
                value={consulta}
                onChange={(evento) => setConsulta(evento.target.value)}
                placeholder="Escribe tu consulta..."
                aria-label="Escribe tu consulta"
                maxLength={500}
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cobalto-600 text-white shadow-sm transition hover:bg-cobalto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalto-500 focus-visible:ring-offset-2 disabled:opacity-50"
                aria-label="Enviar consulta"
                disabled={!consulta.trim()}
              >
                <IconoEnviar />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-plano-500">Guía para tu proyecto de remodelación</p>
          </div>
        </section>
      )}

      {!abierto && <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="group flex items-center gap-3 rounded-full border border-white/30 bg-cobalto-600 px-4 py-3 text-white shadow-[0_10px_30px_rgba(31,76,189,0.32)] transition duration-200 hover:-translate-y-0.5 hover:bg-cobalto-700 hover:shadow-[0_14px_34px_rgba(31,76,189,0.38)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cobalto-500/30"
        aria-expanded={abierto}
        aria-label="Abrir chat con Lia"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 3v-3.1A1.5 1.5 0 0 1 3 12.5z" />
            <path d="M6.5 7.5h7M6.5 10.5h5" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-cobalto-600 bg-amber-300" />
        </span>
        <span className="pr-1 text-left">
          <span className="block text-sm font-semibold leading-tight">Chatea con Lia</span>
          <span className="mt-0.5 block text-[10px] leading-tight text-white/75">Estoy aquí para ayudarte</span>
        </span>
      </button>}
      </div>
      {corazonesId > 0 && <CorazonesAscendentes key={corazonesId} />}
    </>
  );
}
