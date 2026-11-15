// Control deslizante con valor editable
export default function Slider({ etiqueta, valor, min, max, paso = 0.1, unidad = '', decimales = 1, onChange }) {
  const poner = (v) => {
    const n = Number(v);
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
  };
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm text-plano-700">{etiqueta}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            className="w-[4.5rem] rounded border border-plano-300 bg-white px-2 py-1 text-right text-sm focus:border-cobalto-500 focus:outline-none focus:ring-2 focus:ring-cobalto-500/25"
            value={Number(valor.toFixed(decimales))}
            min={min} max={max} step={paso}
            onChange={(e) => poner(e.target.value)}
            aria-label={`${etiqueta} (${unidad})`}
          />
          <span className="w-6 text-xs text-plano-500">{unidad}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={paso} value={valor} onChange={(e) => poner(e.target.value)} aria-label={etiqueta} />
    </div>
  );
}
