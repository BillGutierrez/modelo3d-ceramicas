// Estado compartido entre las 3 páginas: lo elegido en el modelo 3D llega directo a Costos.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PAREDES = ['fondo', 'izquierda', 'derecha', 'frente'];
export const NOMBRE_PARED = { fondo: 'Fondo', izquierda: 'Izquierda', derecha: 'Derecha', frente: 'Frente' };

export const useStore = create(
  persist(
    (set) => ({
      room: { ancho: 3.5, largo: 4.5, alto: 2.6 }, // metros
      vista: '2', // '2' = 2 paredes (esquina), '4' = 4 paredes con corte automático
      pisoId: 'g-hidraulico-piso-hidraulico-azul-cobalto',
      paredId: 'g-subway-pared-subway-blanco',
      junta: { mm: 3, color: '#d9d5cd' },
      zocalo: { cm: 10, color: '#f1eee8' },
      pintura: '#ece6da',
      enchape: { completo: true, m: 1.2 },
      giroPiso: false,
      giroPared: false,
      revestidas: { fondo: true, izquierda: true, derecha: true, frente: true },
      calc: { margen: 5, reutilizar: true, girar: false },
      aberturas: [], // {id, tipo, pared, ancho, alto, alzado, cantidad}
      captura: null,

      setRoom: (p) => set((s) => ({ room: { ...s.room, ...p } })),
      setVista: (vista) => set({ vista }),
      setPiso: (pisoId) => set({ pisoId }),
      setPared: (paredId) => set({ paredId }),
      setJunta: (p) => set((s) => ({ junta: { ...s.junta, ...p } })),
      setZocalo: (p) => set((s) => ({ zocalo: { ...s.zocalo, ...p } })),
      setPintura: (pintura) => set({ pintura }),
      setEnchape: (p) => set((s) => ({ enchape: { ...s.enchape, ...p } })),
      setGiroPiso: (giroPiso) => set({ giroPiso }),
      setGiroPared: (giroPared) => set({ giroPared }),
      setRevestida: (pared, v) => set((s) => ({ revestidas: { ...s.revestidas, [pared]: v } })),
      setCalc: (p) => set((s) => ({ calc: { ...s.calc, ...p } })),
      setCaptura: (captura) => set({ captura }),
      agregarAbertura: (tipo) => set((s) => ({
        aberturas: [...s.aberturas, {
          id: `ab-${Date.now().toString(36)}`, tipo, pared: 'frente',
          ancho: tipo === 'puerta' ? 0.9 : 1.2, alto: tipo === 'puerta' ? 2.1 : 1.0,
          alzado: tipo === 'puerta' ? 0 : 1.0, cantidad: 1,
        }],
      })),
      editarAbertura: (id, p) => set((s) => ({ aberturas: s.aberturas.map((a) => (a.id === id ? { ...a, ...p } : a)) })),
      quitarAbertura: (id) => set((s) => ({ aberturas: s.aberturas.filter((a) => a.id !== id) })),
    }),
    {
      name: 'modelo3d-config-v1',
      partialize: (s) => {
        const { captura, ...resto } = s;
        return Object.fromEntries(Object.entries(resto).filter(([, v]) => typeof v !== 'function'));
      },
    },
  ),
);
