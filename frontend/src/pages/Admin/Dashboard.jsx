import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookMarked, Boxes, Layers, Library, Plus, Repeat2, Tags } from 'lucide-react';
import { bookService } from '../../services/bookService.js';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import KelolaKategori from './KelolaKategori.jsx';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const METRICS = [
  {
    key: 'total_judul_buku',
    label: 'Total Judul Buku',
    sub: 'Katalog judul terdaftar',
    icon: Library,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'total_stok_buku',
    label: 'Total Eksemplar Stok',
    sub: 'Fisik buku keseluruhan',
    icon: Boxes,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'total_buku_dipinjam',
    label: 'Sedang Dipinjam',
    sub: 'Sedang berada di peminjam',
    icon: Repeat2,
    iconClass: 'bg-purple-50 text-purple-600',
  },
  {
    key: 'total_kategori',
    label: 'Total Kategori',
    sub: 'Klasifikasi subjek buku',
    icon: Tags,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'stok_habis',
    label: 'Stok Habis / Kritis',
    sub: 'Perlu penambahan stok fisik',
    icon: AlertTriangle,
    iconClass: 'bg-red-50 text-red-600',
    valueClass: 'text-red-600',
  },
];

const QUICK_NAV = [
  {
    title: 'Kelola Katalog Buku',
    desc: 'Lihat seluruh koleksi buku, atur stok, filter kategori, atau ubah metadata buku.',
    to: '/admin/buku',
    icon: BookMarked,
  },
  {
    title: 'Klasifikasi Kategori',
    desc: 'Tambah kategori baru atau perbarui nama kategori untuk pengelompokan buku yang rapi.',
    category: true,
    icon: Layers,
  },
  {
    title: 'Manajemen Pengguna',
    desc: 'Pantau akun anggota perpustakaan dan atur izin akses pengguna aplikasi.',
    to: '/admin/pengguna',
    icon: Library,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_judul_buku: 0,
    total_stok_buku: 0,
    total_buku_dipinjam: 0,
    total_kategori: 0,
    stok_habis: 0,
    stok_menipis: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await bookService.getDashboardStats();
      setStats(res.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data statistik dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Perpustakaan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ringkasan statistik koleksi buku, sirkulasi peminjaman, dan status persediaan katalog.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/buku/tambah')}>
              <Plus className="h-4 w-4" />
              Tambah Buku
            </Button>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
              <Tags className="h-4 w-4" />
              Kelola Kategori
            </Button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {METRICS.map(({ key, label, sub, icon: Icon, iconClass, valueClass }) => {
            const clickable = key === 'stok_habis';
            return (
              <Card
                key={key}
                onClick={() => clickable && navigate('/admin/buku?status=habis')}
                className={clickable ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md' : ''}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold ${valueClass || ''}`}>
                      {loading ? '…' : stats[key]}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground/80">{sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {QUICK_NAV.map(({ title, desc, to, category, icon: Icon }) => (
            <Card
              key={title}
              onClick={() => (category ? setIsCategoryModalOpen(true) : navigate(to))}
              className="group cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-primary transition-transform group-hover:translate-x-1">→</span>
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <KelolaKategori
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryUpdated={fetchStats}
      />
    </div>
  );
}
