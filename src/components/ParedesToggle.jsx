import { NOMBRE_PARED, PAREDES, useStore } from '../store/useStore.js';

export default function ParedesToggle() {
  const revestidas = useStore((s) => s.revestidas);
  const setRevestida = useStore((s) => s.setRevestida);
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      {PAREDES.map((p) => (
        <label key={p} className="flex cursor-pointer items-center gap-2 text-sm text-plano-700">
          <input type="checkbox" className="h-4 w-4 accent-cobalto-600" checked={revestidas[p]} onChange={(e) => setRevestida(p, e.target.checked)} />
          {NOMBRE_PARED[p]}
        </label>
      ))}
    </div>
  );
}
