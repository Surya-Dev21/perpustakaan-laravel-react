import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookService } from '../../services/bookService.js';
import { categoryService } from '../../services/categoryService.js';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import StockBadge from '../../components/StockBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import BookDetailModal from './BookDetailModal.jsx';
import KelolaKategori from './KelolaKategori.jsx';
import './style/KelolaBuku.css';

export default function KelolaBuku() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);

  // Quick edit stok state
  const [editingStockId, setEditingStockId] = useState(null);
  const [quickStockVal, setQuickStockVal] = useState('');

  // Modals
  const [detailBook, setDetailBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data || []);
    } catch {
      // Ignored
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookService.getBooks({
        search: search.trim(),
        kategori_id: kategoriFilter,
        status: statusFilter,
        page,
        per_page: 10,
      });

      setBooks(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data buku.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch buku dengan debounce pada search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, kategoriFilter, statusFilter, page]);

  // Handle Quick Stock Update
  const handleStartEditStock = (book) => {
    setEditingStockId(book.id);
    setQuickStockVal(book.stok);
  };

  const handleSaveStock = async (bookId) => {
    if (quickStockVal === '' || Number(quickStockVal) < 0) {
      setError('Jumlah stok harus berupa angka positif.');
      return;
    }

    try {
      await bookService.updateStock(bookId, quickStockVal);
      setEditingStockId(null);
      setSuccess('Stok berhasil diperbarui');
      fetchBooks();
    } catch (err) {
      setError(err.message || 'Gagal mengubah stok.');
    }
  };

  // Handle Delete
  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    setError('');
    setSuccess('');
    try {
      await bookService.deleteBook(deletingBook.id);
      setSuccess(`Buku "${deletingBook.judul}" berhasil dihapus.`);
      setDeletingBook(null);
      fetchBooks();
    } catch (err) {
      setError(err.message || 'Gagal menghapus buku.');
      setDeletingBook(null);
    }
  };

  // Handle Detail
  const handleOpenDetail = async (bookId) => {
    try {
      const res = await bookService.getBookById(bookId);
      setDetailBook(res.data);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail buku');
    }
  };

  return (
    <div className="kelola-buku-page">
      <AdminNavbar />

      <main className="kelola-buku-container">
        <header className="kelola-buku-header">
          <div>
            <h1>Kelola Buku Perpustakaan</h1>
            <p>Kelola katalog buku, stok eksemplar, dan pantau status ketersediaan buku secara langsung.</p>
          </div>

          <div className="kelola-buku-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              🏷️ Kelola Kategori
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/admin/buku/tambah')}
            >
              ➕ Tambah Buku
            </button>
          </div>
        </header>

        {error && <div className="alert-box error-box">{error}</div>}
        {success && <div className="alert-box success-box">{success}</div>}

        {/* Filter Bar */}
        <section className="kelola-buku-filter-card">
          <div className="filter-group-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari judul, penulis, penerbit, atau ISBN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-group-dropdowns">
            <select
              value={kategoriFilter}
              onChange={(e) => {
                setKategoriFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="habis">Habis</option>
            </select>
          </div>
        </section>

        {/* Books Table */}
        <section className="kelola-buku-table-card">
          <div className="table-responsive">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Informasi Buku</th>
                  <th>Kategori</th>
                  <th>ISBN</th>
                  <th>Tahun</th>
                  <th>Stok & Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="table-state-cell">
                      <div className="table-loading-spinner" />
                      Memuat daftar buku...
                    </td>
                  </tr>
                ) : books.length > 0 ? (
                  books.map((b) => (
                    <tr key={b.id}>
                      <td className="book-info-cell">
                        <div className="book-title-row">
                          <span className="book-title">{b.judul}</span>
                          <span className="book-author">oleh {b.penulis}</span>
                        </div>
                        <span className="book-publisher">{b.penerbit}</span>
                      </td>

                      <td>
                        <span className="category-pill">{b.kategori}</span>
                      </td>

                      <td>
                        <code className="isbn-code">{b.isbn}</code>
                      </td>

                      <td>{b.tahun_terbit}</td>

                      <td>
                        {editingStockId === b.id ? (
                          <div className="quick-stock-edit">
                            <input
                              type="number"
                              min="0"
                              value={quickStockVal}
                              onChange={(e) => setQuickStockVal(e.target.value)}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="stock-save-btn"
                              onClick={() => handleSaveStock(b.id)}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              className="stock-cancel-btn"
                              onClick={() => setEditingStockId(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="stock-cell-clickable"
                            title="Klik untuk ubah stok cepat"
                            onClick={() => handleStartEditStock(b)}
                          >
                            <StockBadge
                              stokTersedia={b.stok_tersedia}
                              stokTotal={b.stok}
                              status={b.status_ketersediaan}
                            />
                            <span className="stock-edit-hint">✎</span>
                          </div>
                        )}
                      </td>

                      <td className="book-actions-cell">
                        <button
                          type="button"
                          className="btn-action view"
                          title="Lihat Detail"
                          onClick={() => handleOpenDetail(b.id)}
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          className="btn-action edit"
                          title="Edit Informasi Buku"
                          onClick={() => navigate(`/admin/buku/edit/${b.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action delete"
                          title="Hapus Buku"
                          onClick={() => setDeletingBook(b)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-state-cell">
                      <p>Tidak ada buku yang sesuai dengan filter atau pencarian.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Menampilkan halaman {meta.current_page} dari {meta.last_page} (Total {meta.total} buku)
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Sebelumnya
                </button>
                <span className="page-current">{meta.current_page}</span>
                <button
                  type="button"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modal Detail Buku */}
      <BookDetailModal
        book={detailBook}
        isOpen={!!detailBook}
        onClose={() => setDetailBook(null)}
      />

      {/* Modal Kelola Kategori */}
      <KelolaKategori
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryUpdated={() => {
          fetchCategories();
          fetchBooks();
        }}
      />

      {/* Modal Hapus Buku */}
      <ConfirmModal
        isOpen={!!deletingBook}
        title="Konfirmasi Hapus Buku"
        message={`Apakah Anda yakin ingin menghapus buku "${deletingBook?.judul}"? Buku yang sedang memiliki peminjaman aktif tidak dapat dihapus.`}
        onConfirm={handleDeleteBook}
        onCancel={() => setDeletingBook(null)}
        confirmText="Hapus Sekarang"
      />
    </div>
  );
}
