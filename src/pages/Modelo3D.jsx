import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import Cuarto from '../components/Cuarto.jsx';
import PanelMateriales from '../components/PanelMateriales.jsx';
import PanelControles from '../components/PanelControles.jsx';
import { useStore } from '../store/useStore.js';
import { useMaterial } from '../store/useCatalogo.js';
import { etiquetaMedida } from '../lib/medidas.js';

export default function Modelo3D() {
  const ctx = useRef(null);
  const [aviso, setAviso] = useState('');
  const room = useRef(useStore.getState().room).current;
  const setCaptura = useStore((s) => s.setCaptura);
  const piso = useMaterial(useStore((s) => s.pisoId));
  const pared = useMaterial(useStore((s) => s.paredId));

  const d = (room.ancho + room.largo) * 0.55;
  // en pantallas angostas la cámara se aleja para que el cuarto quepa
  const aspecto = (typeof window !== 'undefined' ? window.innerWidth : 1200) / (typeof window !== 'undefined' && window.innerWidth < 1024 ? window.innerHeight * 0.62 : window.innerHeight);
  const k = aspecto < 1.3 ? Math.min(2.4, 1.3 / aspecto) : 1;
  const camara = { position: [(d + 1) * k, room.alto * 1.2 * k + 1.2, (d + 1.6) * k], fov: 42, near: 0.05, far: 200 };

  const capturar = () => {
    if (!ctx.current) return;
    const { gl, scene, camera } = ctx.current;
    gl.render(scene, camera);
    setCaptura(gl.domElement.toDataURL('image/jpeg', 0.9));
    setAviso('Vista guardada. Aparecerá en el informe de costos.');
    setTimeout(() => setAviso(''), 3500);
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_300px] lg:grid-rows-1">
      <div className="relative order-1 h-[62vh] bg-[radial-gradient(ellipse_at_50%_35%,#ffffff,#dfe5ec)] lg:order-2 lg:h-auto">
        <Canvas
          frameloop="demand" dpr={[1, 2]} camera={camara}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
          onCreated={(s) => { ctx.current = s; }}
        >
          <Suspense fallback={null}>
            <Cuarto />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] space-y-1 lg:bottom-auto lg:top-3 lg:max-w-[60%]">
          <div className="pointer-events-auto rounded-md bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
            <div><span className="text-plano-500">Piso: </span><span className="font-medium">{piso ? `${piso.nombre} · ${etiquetaMedida(piso)}` : '—'}</span></div>
            <div><span className="text-plano-500">Pared: </span><span className="font-medium">{pared ? `${pared.nombre} · ${etiquetaMedida(pared)}` : '—'}</span></div>
          </div>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <button className="btn" onClick={capturar}>Guardar vista</button>
          <Link className="btn btn-primario" to="/costos">Ver costos</Link>
        </div>
        {aviso && <div role="status" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-plano-900 px-3 py-2 text-sm text-white shadow">{aviso}</div>}
      </div>

      <aside className="order-2 min-h-0 border-t border-plano-200 lg:order-1 lg:border-r lg:border-t-0 max-lg:h-[70vh]"><PanelMateriales /></aside>
      <aside className="order-3 min-h-0 border-t border-plano-200 lg:border-l lg:border-t-0"><PanelControles /></aside>
    </div>
  );
}
