import { NavLink, useNavigate } from 'react-router-dom';
import './style/Navbar.css';

const MENU = [
  { to: '/katalog', label: 'Katalog Buku' },
  { to: '/dipinjam', label: 'Buku Dipinjam' },
  { to: '/riwayatPeminjaman', label: 'Riwayat Peminjaman' },
];

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        {MENU.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
            }
          >
            {m.label}
          </NavLink>
        ))}
      </div>

      <button type="button" className="navbar-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}