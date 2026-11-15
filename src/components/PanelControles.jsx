// Panel derecho: medidas del cuarto en tiempo real, vista, juntas, zócalo, pintura y orientación.
import Slider from './Slider.jsx';
import ParedesToggle from './ParedesToggle.jsx';
import { useStore } from '../store/useStore.js';

function Segmentado({ valor, opciones, onChange, etiqueta }) {
  return (
    <div className="grid rounded-md bg-plano-100 p-1" style={{ gridTemplateColumns: `repeat(${opciones.length}, 1fr)` }} role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o.v} aria-pressed={valor === o.v} onClick={() => onChange(o.v)}
          className={`rounded px-2 py-1.5 text-sm font-medium transition-colors ${valor === o.v ? 'bg-white text-cobalto-700 shadow-sm' : 'text-plano-500 hover:text-plano-900'}`}>
          {o.t}
        </button>
      ))}
    </div>
  );
}

function Interruptor({ etiqueta, valor, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm text-plano-700">
      {etiqueta}
      <input type="checkbox" className="h-4 w-4 accent-cobalto-600" checked={valor} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function PanelControles() {
  const s = useStore();
  const { room, setRoom } = s;
  return (
    <div className="h-full overflow-y-auto bg-white">
      <section className="seccion">
        <h3>Medidas del cuarto</h3>
        <Slider etiqueta="Largo" valor={room.largo} min={1} max={12} paso={0.05} unidad="m" decimales={2} onChange={(v) => setRoom({ largo: v })} />
        <Slider etiqueta="Ancho" valor={room.ancho} min={1} max={12} paso={0.05} unidad="m" decimales={2} onChange={(v) => setRoom({ ancho: v })} />
        <Slider etiqueta="Alto" valor={room.alto} min={2} max={4.5} paso={0.05} unidad="m" decimales={2} onChange={(v) => setRoom({ alto: v })} />
      </section>

      <section className="seccion">
        <h3>Vista del cuarto</h3>
        <Segmentado etiqueta="Vista" valor={s.vista} onChange={s.setVista} opciones={[{ v: '2', t: '2 paredes' }, { v: '4', t: '4 paredes' }]} />
        <p className="mt-2 text-xs text-plano-500">
          {s.vista === '2' ? 'Esquina con dos paredes. Gira el cuarto con el mouse o el dedo.' : 'Cuarto completo: las paredes que quedan delante de la cámara se ocultan solas.'}
        </p>
      </section>

      <section className="seccion">
        <h3>Juntas (lechada)</h3>
        <Slider etiqueta="Grosor" valor={s.junta.mm} min={0} max={8} paso={0.5} unidad="mm" onChange={(v) => s.setJunta({ mm: v })} />
        <div className="flex items-center justify-between">
          <span className="text-sm text-plano-700">Color</span>
          <input type="color" value={s.junta.color} onChange={(e) => s.setJunta({ color: e.target.value })} aria-label="Color de la junta" />
        </div>
      </section>

      <section className="seccion">
        <h3>Zócalo y pintura</h3>
        <Slider etiqueta="Alto del zócalo" valor={s.zocalo.cm} min={0} max={20} paso={1} unidad="cm" decimales={0} onChange={(v) => s.setZocalo({ cm: v })} />
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-plano-700">Color del zócalo</span>
          <input type="color" value={s.zocalo.color} onChange={(e) => s.setZocalo({ color: e.target.value })} aria-label="Color del zócalo" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-plano-700">Color de la pintura</span>
          <input type="color" value={s.pintura} onChange={(e) => s.setPintura(e.target.value)} aria-label="Color de la pintura" />
        </div>
      </section>

      <section className="seccion">
        <h3>Cerámica en la pared</h3>
        <Interruptor etiqueta="Hasta el techo" valor={s.enchape.completo} onChange={(v) => s.setEnchape({ completo: v })} />
        {!s.enchape.completo && (
          <div className="mt-2">
            <Slider etiqueta="Altura de la cerámica" valor={Math.min(s.enchape.m, room.alto)} min={0.3} max={room.alto} paso={0.05} unidad="m" decimales={2} onChange={(v) => s.setEnchape({ m: v })} />
            <p className="text-xs text-plano-500">Sobre esa altura la pared va pintada.</p>
          </div>
        )}
        <div className="mt-3 border-t border-plano-200 pt-3">
          <div className="etiqueta mb-2">Paredes con cerámica</div>
          <ParedesToggle />
        </div>
      </section>

      <section className="seccion">
        <h3>Orientación de las piezas</h3>
        <Interruptor etiqueta="Girar piso 90°" valor={s.giroPiso} onChange={s.setGiroPiso} />
        <Interruptor etiqueta="Girar pared 90°" valor={s.giroPared} onChange={s.setGiroPared} />
      </section>
    </div>
  );
}
