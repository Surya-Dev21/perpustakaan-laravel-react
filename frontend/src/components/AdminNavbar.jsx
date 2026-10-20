import { NavLink, useNavigate } from 'react-router-dom';
import './style/AdminNavbar.css';

const MENU = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/buku', label: 'Kelola Buku' },
  { to: '/admin/pengguna', label: 'Kelola Pengguna' },
  { to: '/admin/peminjaman', label: 'Kelola Peminjaman' },
  { to: '/admin/pengembalian', label: 'Kelola Pengembalian' },
  { to: '/admin/riwayat', label: 'Riwayat Transaksi' },
];

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand" onClick={() => navigate('/admin/dashboard')}>
        <span className="brand-logo">📚</span>
        <span className="brand-text">Admin Perpus</span>
      </div>

      <div className="admin-navbar-links">
        {MENU.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              isActive
                ? 'admin-navbar-link admin-navbar-link-active'
                : 'admin-navbar-link'
            }
          >
            {m.label}
          </NavLink>
        ))}
      </div>

      <button
        type="button"
        className="admin-navbar-logout"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  );
}