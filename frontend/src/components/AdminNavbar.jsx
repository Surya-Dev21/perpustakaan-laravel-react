import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

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
    <nav className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background/95 px-6 py-2.5 backdrop-blur">
      <button
        type="button"
        onClick={() => navigate('/admin/dashboard')}
        className="flex items-center gap-2 whitespace-nowrap font-semibold"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">Admin Perpus</span>
      </button>

      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {MENU.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            {m.label}
          </NavLink>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={handleLogout} className="shrink-0">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </nav>
  );
}
