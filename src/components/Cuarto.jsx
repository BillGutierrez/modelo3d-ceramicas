// El cuarto: piso + paredes. Vista "2" = esquina (2 paredes). Vista "4" = 4 paredes;
// las paredes de adelante desaparecen solas porque los planos solo se ven por su cara interior.
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import Superficie, { Lisa } from './Superficie.jsx';
import { useStore } from '../store/useStore.js';
import { useMaterial } from '../store/useCatalogo.js';
import { useDebounced } from '../lib/useDebounced.js';

function Pared({ id, largo, alto, position, rotY, side, material, revestida, juntaDeb, giro }) {
  const zocalo = useStore((s) => s.zocalo);
  const pintura = useStore((s) => s.pintura);
  const enchape = useStore((s) => s.enchape);
  const z = Math.min(zocalo.cm / 100, alto - 0.02);
  const he = enchape.completo ? alto : Math.min(Math.max(enchape.m, z + 0.05), alto);
  const tramos = [];
  if (z > 0.001) tramos.push({ y0: 0, y1: z, tipo: 'zocalo' });
  if (revestida && material) {
    tramos.push({ y0: z, y1: he, tipo: 'ceramica' });
    if (he < alto - 0.001) tramos.push({ y0: he, y1: alto, tipo: 'pintura' });
  } else {
    tramos.push({ y0: z, y1: alto, tipo: 'pintura' });
  }
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {tramos.map((t) => {
        const h = t.y1 - t.y0;
        const pos = [0, (t.y0 + t.y1) / 2, 0];
        if (t.tipo === 'ceramica') {
          return <Superficie key={`${id}-c`} material={material} ancho={largo} alto={h} position={pos} side={side} giro={giro} junta={juntaDeb} />;
        }
        return <Lisa key={`${id}-${t.tipo}`} ancho={largo} alto={h} position={pos} side={side} color={t.tipo === 'zocalo' ? zocalo.color : pintura} />;
      })}
    </group>
  );
}

function Aristas({ ancho, alto, largo }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(ancho, alto, largo)), [ancho, alto, largo]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <lineSegments geometry={geo} position={[0, alto / 2, 0]}>
      <lineBasicMaterial color="#8892a0" />
    </lineSegments>
  );
}

function Controles({ alto }) {
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [alto, invalidate]);
  return <OrbitControls makeDefault enableDamping dampingFactor={0.12} target={[0, alto * 0.4, 0]} minDistance={1.2} maxDistance={40} maxPolarAngle={Math.PI / 2 - 0.03} />;
}

export default function Cuarto() {
  const room = useStore((s) => s.room);
  const vista = useStore((s) => s.vista);
  const junta = useStore((s) => s.junta);
  const revestidas = useStore((s) => s.revestidas);
  const giroPiso = useStore((s) => s.giroPiso);
  const giroPared = useStore((s) => s.giroPared);
  const piso = useMaterial(useStore((s) => s.pisoId));
  const pared = useMaterial(useStore((s) => s.paredId));
  const juntaDeb = useDebounced(junta, 150);
  const { ancho: A, largo: L, alto: H } = room;

  const dos = vista === '2';
  const side = dos ? THREE.DoubleSide : THREE.FrontSide;
  const paredes = [
    { id: 'fondo', largo: A, position: [0, 0, -L / 2], rotY: 0, visible: true },
    { id: 'izquierda', largo: L, position: [-A / 2, 0, 0], rotY: Math.PI / 2, visible: true },
    { id: 'derecha', largo: L, position: [A / 2, 0, 0], rotY: -Math.PI / 2, visible: !dos },
    { id: 'frente', largo: A, position: [0, 0, L / 2], rotY: Math.PI, visible: !dos },
  ];

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-7, 2.5, 2]} rotation-y={Math.PI / 2} scale={[9, 4, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[7, 2.5, -2]} rotation-y={-Math.PI / 2} scale={[9, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 2.5, 8]} rotation-y={Math.PI} scale={[10, 4, 1]} />
      </Environment>
      <hemisphereLight args={["#ffffff", "#d6d0c4", 0.75]} />
      <directionalLight position={[A, H * 2.2, L]} intensity={1.35} />

      {piso
        ? <Superficie material={piso} ancho={A} alto={L} rotation={[-Math.PI / 2, 0, 0]} side={THREE.FrontSide} giro={giroPiso} junta={juntaDeb} />
        : <Lisa ancho={A} alto={L} rotation={[-Math.PI / 2, 0, 0]} color="#bdb8ae" />}

      {paredes.filter((p) => p.visible).map((p) => (
        <Pared key={p.id} id={p.id} largo={p.largo} alto={H} position={p.position} rotY={p.rotY} side={side}
          material={pared} revestida={revestidas[p.id]} juntaDeb={juntaDeb} giro={giroPared} />
      ))}

      <Aristas ancho={A} alto={H} largo={L} />
      <Controles alto={H} />
    </>
  );
}
