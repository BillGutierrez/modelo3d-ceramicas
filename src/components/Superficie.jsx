// Plano texturizado con fundido (crossfade) entre el material anterior y el nuevo.
// Se usa un MeshStandardMaterial al que se le inyecta una segunda textura y un factor de mezcla.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { obtenerTextura, TEXTURA_BLANCA } from '../lib/texturas3d.js';
import { claveMaterial } from '../lib/texturas/render.js';
import { ACABADOS } from '../config.js';

const suavizar = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const DURACION_FUNDIDO = 0.8; // segundos

export default function Superficie({ material, ancho, alto, position = [0, 0, 0], rotation = [0, 0, 0], side = THREE.FrontSide, giro = false, junta }) {
  const { gl, invalidate } = useThree();
  const aniso = Math.min(16, gl.capabilities.getMaxAnisotropy());
  const est = useRef({ A: null, modA: null, swapA: 0, B: null, modB: null, swapB: 0, mix: 1, id: null });
  const props = useRef({});
  props.current = { ancho, alto, giro, acabado: material?.acabado };

  const uniforms = useMemo(() => ({
    uMapB: { value: TEXTURA_BLANCA },
    uMix: { value: 1 },
    uRepA: { value: new THREE.Vector2(1, 1) },
    uRepB: { value: new THREE.Vector2(1, 1) },
    uSwapA: { value: 0 },
    uSwapB: { value: 0 },
  }), []);

  const mat3 = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: TEXTURA_BLANCA, roughness: 0.5, metalness: 0, envMapIntensity: 0.6 });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
uniform sampler2D uMapB;
uniform float uMix;
uniform vec2 uRepA;
uniform vec2 uRepB;
uniform float uSwapA;
uniform float uSwapB;`)
        .replace('#include <map_fragment>', `
vec2 uvA = mix(vMapUv, vMapUv.yx, uSwapA) * uRepA;
vec2 uvB = mix(vMapUv, vMapUv.yx, uSwapB) * uRepB;
vec4 texA = texture2D(map, uvA);
vec4 texB = texture2D(uMapB, uvB);
diffuseColor *= mix(texB, texA, uMix);`);
    };
    m.customProgramCacheKey = () => 'ceramica-fundido-v1';
    return m;
  }, [uniforms]);

  useEffect(() => () => mat3.dispose(), [mat3]);
  useEffect(() => { mat3.side = side; mat3.needsUpdate = true; invalidate(); }, [side, mat3, invalidate]);

  const clave = material ? claveMaterial(material) : '';
  useEffect(() => {
    if (!material) return undefined;
    let cancelado = false;
    obtenerTextura(material, junta, aniso).then(({ tex, modulo }) => {
      if (cancelado) return;
      const s = est.current;
      if (s.id !== material.id) {
        // material distinto: lo anterior queda debajo y se desvanece
        if (s.A) { s.B = s.A; s.modB = s.modA; s.swapB = s.swapA; }
        else { s.B = TEXTURA_BLANCA; s.modB = { ancho: 100, largo: 100 }; s.swapB = 0; }
        uniforms.uMapB.value = s.B;
        uniforms.uSwapB.value = s.swapB;
        s.mix = 0;
        uniforms.uMix.value = 0;
      }
      s.A = tex; s.modA = modulo; s.id = material.id;
      mat3.map = tex;
      invalidate();
    }).catch((err) => console.error(err));
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, junta.mm, junta.color, aniso]);

  useEffect(() => { invalidate(); }, [ancho, alto, giro, invalidate]);

  useFrame((_, dt) => {
    const s = est.current, p = props.current;
    const poner = (vec, mod, swap) => {
      if (!mod) { vec.set(1, 1); return; }
      const w = p.ancho * 100, h = p.alto * 100;
      if (swap) vec.set(h / mod.ancho, w / mod.largo); else vec.set(w / mod.ancho, h / mod.largo);
    };
    s.swapA = p.giro ? 1 : 0;
    uniforms.uSwapA.value = s.swapA;
    poner(uniforms.uRepA.value, s.modA, s.swapA);
    poner(uniforms.uRepB.value, s.modB, s.swapB);
    let sigue = false;
    if (s.mix < 1) {
      s.mix = Math.min(1, s.mix + dt / DURACION_FUNDIDO);
      uniforms.uMix.value = suavizar(s.mix);
      sigue = true;
    }
    const ac = ACABADOS[p.acabado] || ACABADOS.Satinado;
    const k = Math.min(1, dt * 8);
    if (Math.abs(mat3.roughness - ac.rugosidad) > 0.003 || Math.abs(mat3.envMapIntensity - ac.env) > 0.003) {
      mat3.roughness += (ac.rugosidad - mat3.roughness) * k;
      mat3.envMapIntensity += (ac.env - mat3.envMapIntensity) * k;
      sigue = true;
    }
    if (sigue) invalidate();
  });

  return (
    <mesh position={position} rotation={rotation} material={mat3}>
      <planeGeometry args={[ancho, alto]} />
    </mesh>
  );
}

// Superficie pintada (zócalo, pintura, o sin material elegido)
export function Lisa({ ancho, alto, color, position = [0, 0, 0], rotation = [0, 0, 0], side = THREE.FrontSide, rugosidad = 0.9 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[ancho, alto]} />
      <meshStandardMaterial color={color} roughness={rugosidad} metalness={0} side={side} envMapIntensity={0.35} />
    </mesh>
  );
}
