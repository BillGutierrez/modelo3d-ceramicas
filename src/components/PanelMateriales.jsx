// Panel izquierdo del modelo 3D: elegir material de piso o de pared.
import { useMemo, useState } from 'react';
import Miniatura from './Miniatura.jsx';
import { useStore } from '../store/useStore.js';
import { useMateriales, useCatalogo } from '../store/useCatalogo.js';
import { etiquetaMedida, precioM2 } from '../lib/medidas.js';
import { MONEDA } from '../config.js';

export default function PanelMateriales() {
  const [tipo, setTipo] = useState('piso');
  const [q, setQ] = useState('');
  const materiales = useMateriales();
  const cargando = useCatalogo((s) => s.cargando);
  const pisoId = useStore((s) => s.pisoId);
  const paredId = useStore((s) => s.paredId);
  const setPiso = useStore((s) => s.setPiso);
  const setPared = useStore((s) => s.setPared);
  const elegido = tipo === 'piso' ? pisoId : paredId;

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return materiales.filter((m) => m.tipo === tipo && (!t || m.nombre.toLowerCase().includes(t)));
  }, [materiales, tipo, q]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-plano-200 p-3">
        <div className="mb-3 grid grid-cols-2 rounded-md bg-plano-100 p-1" role="tablist" aria-label="Tipo de material">
          {['piso', 'pared'].map((t) => (
            <button
              key={t} role="tab" aria-selected={tipo === t} onClick={() => setTipo(t)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${tipo === t ? 'bg-white text-cobalto-700 shadow-sm' : 'text-plano-500 hover:text-plano-900'}`}
            >
              {t === 'piso' ? 'Pisos' : 'Paredes'}
            </button>
          ))}
        </div>
        <input className="campo" placeholder={`Buscar ${tipo === 'piso' ? 'piso' : 'pared'} por nombre`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar material" />
        <p className="mt-2 text-xs text-plano-500">{cargando ? 'Cargando…' : `${lista.length} modelos`}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {lista.length === 0 && <p className="py-6 text-center text-sm text-plano-500">No hay materiales con ese nombre.</p>}
        <ul className="grid grid-cols-2 gap-2.5">
          {lista.map((m) => {
            const sel = m.id === elegido;
            return (
              <li key={m.id}>
                <button
                  onClick={() => (tipo === 'piso' ? setPiso(m.id) : setPared(m.id))}
                  aria-pressed={sel}
                  className={`group block w-full overflow-hidden rounded-md border text-left transition-shadow ${sel ? 'border-cobalto-600 ring-2 ring-cobalto-600' : 'border-plano-200 hover:border-plano-300 hover:shadow-sm'}`}
                >
                  <Miniatura material={m} />
                  <div className="p-2">
                    <div className="line-clamp-2 text-[13px] font-medium leading-tight">{m.nombre}</div>
                    <div className="mt-1 text-xs text-plano-500">{etiquetaMedida(m)}</div>
                    {m.precioCaja > 0 && <div className="text-xs text-plano-500">{MONEDA} {precioM2(m).toFixed(0)}/m²</div>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
