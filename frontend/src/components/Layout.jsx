import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ClipboardList, FilePlus2, LayoutDashboard, ListChecks, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/solicitacoes', label: 'Solicitações', icon: ListChecks, end: true },
  { to: '/solicitacoes/nova', label: 'Nova Solicitação', icon: FilePlus2, end: true },
];

function getPageInfo(pathname) {
  if (pathname === '/') return { title: 'Dashboard', trail: [] };
  const list = { label: 'Solicitações', to: '/solicitacoes' };
  if (pathname === '/solicitacoes') return { title: 'Solicitações', trail: [] };
  if (pathname === '/solicitacoes/nova') return { title: 'Nova solicitação', trail: [list] };
  const editMatch = pathname.match(/^\/solicitacoes\/(\d+)\/editar$/);
  if (editMatch) {
    return {
      title: `Editar solicitação #${editMatch[1]}`,
      trail: [list, { label: `Solicitação #${editMatch[1]}`, to: `/solicitacoes/${editMatch[1]}` }],
    };
  }
  const id = pathname.split('/').pop();
  return { title: `Solicitação #${id}`, trail: [list] };
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { title, trail } = getPageInfo(pathname);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand__mark"><ClipboardList size={20} /></span>
          <span className="brand__name">Central de Solicitações</span>
        </Link>
        <nav className="nav" aria-label="Navegação principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav__link">
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}

      <div className="main">
        <header className="header">
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Início</Link>
              {trail.map((item) => (
                <span key={item.to}>/ <Link to={item.to}>{item.label}</Link></span>
              ))}
              <span>/ {title}</span>
            </nav>
            <h1 className="header__title">{title}</h1>
          </div>
          <span className="env-pill">Ambiente local</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
