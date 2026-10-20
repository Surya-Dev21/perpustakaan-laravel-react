import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../../services/bookService.js';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import KelolaKategori from './KelolaKategori.jsx';
import './style/Dashboard.css';

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
    <div className="admin-dashboard-page">
      <AdminNavbar />

      <main className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <div>
            <h1>Dashboard Perpustakaan</h1>
            <p>Ringkasan statistik koleksi buku, sirkulasi peminjaman, dan status persediaan katalog.</p>
          </div>

          <div className="admin-dashboard-quick-actions">
            <button
              type="button"
              className="dash-action-btn primary"
              onClick={() => navigate('/admin/buku/tambah')}
            >
              ➕ Tambah Buku Baru
            </button>
            <button
              type="button"
              className="dash-action-btn secondary"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              🏷️ Kelola Kategori
            </button>
          </div>
        </header>

        {error && <div className="dashboard-alert-error">{error}</div>}

        {/* Metric Cards */}
        <section className="dashboard-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon blue">📚</div>
            <div className="metric-info">
              <span className="metric-label">Total Judul Buku</span>
              <strong className="metric-value">
                {loading ? '...' : stats.total_judul_buku}
              </strong>
              <span className="metric-sub">Katalog judul terdaftar</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon green">📦</div>
            <div className="metric-info">
              <span className="metric-label">Total Eksemplar Stok</span>
              <strong className="metric-value">
                {loading ? '...' : stats.total_stok_buku}
              </strong>
              <span className="metric-sub">Fisik buku keseluruhan</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon purple">🔄</div>
            <div className="metric-info">
              <span className="metric-label">Sedang Dipinjam</span>
              <strong className="metric-value">
                {loading ? '...' : stats.total_buku_dipinjam}
              </strong>
              <span className="metric-sub">Sedang berada di peminjam</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon amber">🏷️</div>
            <div className="metric-info">
              <span className="metric-label">Total Kategori</span>
              <strong className="metric-value">
                {loading ? '...' : stats.total_kategori}
              </strong>
              <span className="metric-sub">Klasifikasi subjek buku</span>
            </div>
          </div>

          <div className="metric-card clickable" onClick={() => navigate('/admin/buku?status=habis')}>
            <div className="metric-icon red">⚠️</div>
            <div className="metric-info">
              <span className="metric-label">Stok Habis / Kritis</span>
              <strong className="metric-value text-red">
                {loading ? '...' : stats.stok_habis}
              </strong>
              <span className="metric-sub">Perlu penambahan stok fisik</span>
            </div>
          </div>
        </section>

        {/* Quick Navigation Cards */}
        <section className="dashboard-quick-nav-grid">
          <div className="quick-nav-card" onClick={() => navigate('/admin/buku')}>
            <div className="quick-nav-header">
              <h3>Kelola Katalog Buku</h3>
              <span>→</span>
            </div>
            <p>Lihat seluruh koleksi buku, atur stok, filter kategori, atau ubah metadata buku.</p>
          </div>

          <div className="quick-nav-card" onClick={() => setIsCategoryModalOpen(true)}>
            <div className="quick-nav-header">
              <h3>Klasifikasi Kategori</h3>
              <span>→</span>
            </div>
            <p>Tambah kategori baru atau perbarui nama kategori untuk pengelompokan buku yang rapi.</p>
          </div>

          <div className="quick-nav-card" onClick={() => navigate('/admin/pengguna')}>
            <div className="quick-nav-header">
              <h3>Manajemen Pengguna</h3>
              <span>→</span>
            </div>
            <p>Pantau akun anggota perpustakaan dan atur izin akses pengguna aplikasi.</p>
          </div>
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
