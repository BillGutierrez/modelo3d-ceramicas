import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import { useCatalogo } from './store/useCatalogo.js';

const Modelo3D = lazy(() => import('./pages/Modelo3D.jsx'));
const Catalogo = lazy(() => import('./pages/Catalogo.jsx'));
const Costos = lazy(() => import('./pages/Costos.jsx'));

export default function App() {
  const cargar = useCatalogo((s) => s.cargar);
  useEffect(() => { cargar(); }, [cargar]);
  return (
    <div className="flex h-full flex-col">
      <NavBar />
      <main className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-8 text-sm text-plano-500">Cargando…</div>}>
          <Routes>
            <Route path="/" element={<Modelo3D />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/costos" element={<Costos />} />
            <Route path="*" element={<Modelo3D />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
