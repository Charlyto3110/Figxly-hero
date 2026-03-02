import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-haze text-ink"><header className="max-w-6xl mx-auto px-6 py-4 flex justify-between"><Link to="/" className="font-bold text-2xl">Figxly</Link><nav className="flex gap-4 text-sm"><Link to="/explorar">Explorar</Link><Link to="/perfil">Perfil</Link><Link to="/panel-tecnico">Panel técnico</Link><Link to="/admin">Admin</Link><Link to="/ayuda">Ayuda</Link></nav></header><main className="max-w-6xl mx-auto px-6 pb-10">{children}</main><footer className="max-w-6xl mx-auto px-6 py-8 text-slateInk">Figxly MVP</footer></div>;
}
