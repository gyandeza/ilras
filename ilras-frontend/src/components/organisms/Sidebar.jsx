import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dasbor', icon: 'grid', end: true },
  { to: '/peta', label: 'Peta', icon: 'map', end: true },
  { to: '/perbandingan', label: 'Perbandingan Kecamatan', icon: 'compare', end: true },
];

const DISABLED_ITEMS_2 = [{ label: 'Laporan', badge: 'Segera' }];
const ADMIN_ITEMS = [{ label: 'Administrasi', badge: 'Admin' }];

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    map: <><path d="M9 20l-5.5-2V4L9 6m0 14l6-2m-6 2V6m6 12l5.5 2V6L15 4m0 14V4m0 0L9 6" /></>,
    compare: <><path d="M8 3v18M16 3v18M3 8h5M16 8h5M3 16h5M16 16h5" /></>,
    sim: <><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6M9 8h6M17 12h6" /></>,
    report: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>,
    admin: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" strokeLinecap="round" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{paths[name]}</svg>;
}

export default function Sidebar({ simulationEnabled, simulationHref }) {
  return (
    <nav className="sidebar" aria-label="Navigasi utama">
      <div className="sidebar__brand">
        <div className="sidebar__ring-mini" aria-hidden="true" />
        <div>
          <div className="sidebar__brand-text">ILRAS</div>
          <div className="sidebar__brand-sub">READINESS PLATFORM</div>
        </div>
      </div>

      <div className="sidebar__section">UTAMA</div>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
        >
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
      {simulationEnabled ? (
        <NavLink to={simulationHref} className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}>
          <Icon name="sim" />
          Simulasi Skenario
        </NavLink>
      ) : (
        <div className="sidebar__item sidebar__item--disabled" title="Pilih kecamatan terlebih dahulu">
          <Icon name="sim" />
          Simulasi Skenario
        </div>
      )}

      {DISABLED_ITEMS_2.map((item) => (
        <div key={item.label} className="sidebar__item sidebar__item--disabled" title="Belum tersedia di prototipe ini">
          <Icon name="report" />
          {item.label}
          <span className="sidebar__badge">{item.badge}</span>
        </div>
      ))}

      <div className="sidebar__section">TRANSPARANSI</div>
      <NavLink to="/metodologi" className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}>
        <Icon name="info" />
        Metodologi Skoring
      </NavLink>

      <div className="sidebar__section">SISTEM</div>
      {ADMIN_ITEMS.map((item) => (
        <div key={item.label} className="sidebar__item sidebar__item--disabled" title="Khusus peran Administrator">
          <Icon name="admin" />
          {item.label}
          <span className="sidebar__badge">{item.badge}</span>
        </div>
      ))}

      <div className="sidebar__foot">ILRAS v0.1 (Sprint 10) · Data ilustratif</div>
    </nav>
  );
}
