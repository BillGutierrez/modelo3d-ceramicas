// Miniatura del material: muestra el patrón repetido (con juntas) en un <canvas>.
import { useEffect, useMemo, useRef, useState } from 'react';
import { dibujarMiniatura } from '../lib/texturas/render.js';

export default function Miniatura({ material, size = 160, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const m = useMemo(() => (material.miniatura ? { ...material, imagen: material.miniatura } : material), [material]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return undefined; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setVisible(true); io.disconnect(); } }, { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) return;
    let vivo = true;
    dibujarMiniatura(ref.current, m).catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, [visible, m]);

  return (
    <canvas
      ref={ref} width={size} height={size}
      className={`block aspect-square w-full bg-plano-100 ${className}`}
      role="img" aria-label={`Vista previa de ${material.nombre}`}
      title={error ? 'No se pudo cargar la imagen' : undefined}
    />
  );
}
