
import { useLocation, useNavigate } from 'react-router-dom';
import './/style/DetailBuku.css';

export default function DetailBuku() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const book = state?.book;

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="book-detail-empty">
          <div className="book-detail-empty-icon">!</div>
          <h2>Data Buku Tidak Ditemukan</h2>
          <p>Silakan kembali ke katalog untuk memilih buku.</p>
          <button
            className="book-back-button"
            onClick={() => navigate('/katalog')}
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail-header">
        <button
          className="book-back-button"
          onClick={() => navigate('/katalog')}
        >
          <span>←</span> Kembali ke Katalog
        </button>
      </div>

      <main className="book-detail-card">
        <div className="book-detail-title-section">
          <span className="book-detail-label">
            {book.kategori || 'Tanpa kategori'}
          </span>

          <h1>{book.judul}</h1>

          <p className="book-detail-author">
            Oleh {book.penulis || 'Penulis tidak diketahui'}
          </p>
        </div>

        <div className="book-detail-status">
          <span
            className={`book-detail-status-badge ${
              book.stok > 0
                ? 'book-detail-available'
                : 'book-detail-unavailable'
            }`}
          >
            <span className="book-detail-status-dot"></span>
            {book.stok > 0 ? 'Tersedia' : 'Tidak tersedia'}
          </span>

          <span className="book-detail-stock">
            Stok: {book.stok}
          </span>
        </div>

        <section className="book-detail-section">
          <h2>Informasi Buku</h2>

          <div className="book-detail-table-wrapper">
            <table className="book-detail-table">
              <tbody>
                <tr>
                  <th>Penulis</th>
                  <td>{book.penulis || '-'}</td>
                </tr>
                <tr>
                  <th>Penerbit</th>
                  <td>{book.penerbit || '-'}</td>
                </tr>
                <tr>
                  <th>Tahun Terbit</th>
                  <td>{book.tahun_terbit || '-'}</td>
                </tr>
                <tr>
                  <th>Kategori</th>
                  <td>{book.kategori || '-'}</td>
                </tr>
                <tr>
                  <th>ISBN</th>
                  <td>{book.isbn || '-'}</td>
                </tr>
                <tr>
                  <th>Stok Buku</th>
                  <td>{book.stok ?? 0} buku</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="book-detail-section">
          <h2>Deskripsi Buku</h2>
          <p className="book-detail-description">
            {book.deskripsi || 'Belum ada deskripsi untuk buku ini.'}
          </p>
        </section>

        <div
          className={`book-detail-notice ${
            book.stok > 0
              ? 'book-detail-notice-available'
              : 'book-detail-notice-unavailable'
          }`}
        >
          <strong>
            {book.stok > 0
              ? 'Buku tersedia'
              : 'Buku sedang tidak tersedia'}
          </strong>
          <p>
            {book.stok > 0
              ? 'Buku ini tersedia untuk dipinjam di perpustakaan.'
              : 'Saat ini tidak ada stok buku yang tersedia untuk dipinjam.'}
          </p>
        </div>
      </main>
    </div>
  );
}
