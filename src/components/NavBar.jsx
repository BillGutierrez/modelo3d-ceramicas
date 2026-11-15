import { NavLink } from 'react-router-dom';

const enlaces = [
  { to: '/', texto: 'Modelo 3D', fin: true },
  { to: '/catalogo', texto: 'Catálogo' },
  { to: '/costos', texto: 'Costos' },
];

export default function NavBar() {
  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-plano-200 bg-white px-4">
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="6" fill="#1f4cbd" />
          <path d="M4 4h12v12H4zM16 16h12v12H16z" fill="#f4efe2" />
          <path d="M16 4h12v12H16zM4 16h12v12H4z" fill="#2a5bd7" />
          <circle cx="10" cy="10" r="3" fill="#e3b23c" />
          <circle cx="22" cy="22" r="3" fill="#e3b23c" />
        </svg>
        <span className="hidden text-[15px] font-semibold tracking-tight md:inline">Visualizador de cerámicas</span>
      </div>
      <nav className="flex h-full items-stretch gap-1" aria-label="Principal">
        {enlaces.map((e) => (
          <NavLink
            key={e.to}
            to={e.to}
            end={e.fin}
            className={({ isActive }) =>
              `flex items-center whitespace-nowrap border-b-2 px-2.5 text-sm font-medium sm:px-3 transition-colors ${
                isActive ? 'border-cobalto-600 text-cobalto-700' : 'border-transparent text-plano-500 hover:text-plano-900'
              }`
            }
          >
            {e.texto}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
