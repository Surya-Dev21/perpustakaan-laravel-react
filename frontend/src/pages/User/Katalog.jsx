import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UserNavbar.jsx';
import './style/Katalog.css';

const API = 'http://localhost:8000/api';

export default function Katalog() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');

  const loadBooks = async (q = '') => {
    try {
      const res = await fetch(
        `${API}/books?search=${encodeURIComponent(q)}`,
        {
          headers: { Accept: 'application/json' },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengambil data buku.');
      }

      setBooks(data.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Tidak bisa terhubung ke server.');
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks(keyword);
  };

  return (
    <>
      <Navbar />

      <div className="catalog-page">
        <header className="catalog-header">
          <div>
            <h1>Katalog Buku</h1>
            <p>Temukan buku yang ingin Anda baca.</p>
          </div>
        </header>

        <section className="catalog-search-section">
          <form className="catalog-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Cari judul atau penulis buku..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button type="submit" className="catalog-search-button">
              Cari Buku
            </button>
          </form>
        </section>

        {error && <div className="catalog-error">{error}</div>}

        {!error && books.length === 0 && (
          <div className="catalog-empty">
            <h3>Buku tidak ditemukan</h3>
            <p>Coba gunakan kata kunci pencarian yang berbeda.</p>
          </div>
        )}

        {!error && books.length > 0 && (
          <section className="catalog-section">
            <div className="catalog-section-header">
              <h2>Daftar Buku</h2>
              <span>{books.length} buku</span>
            </div>

            <div className="catalog-grid">
              {books.map((b) => (
                <article className="catalog-card" key={b.id}>
                  <div className="catalog-card-content">
                    <div className="catalog-cover">
                      {b.cover_id && (
                        <img
                          className="catalog-cover-img"
                          src={`https://covers.openlibrary.org/b/id/${b.cover_id}-M.jpg?default=false`}
                          alt={b.judul}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div
                        className="catalog-cover-empty"
                        style={{ display: b.cover_id ? 'none' : 'flex' }}
                      >
                        Tidak ada cover
                      </div>
                    </div>

                    <span className="catalog-category">
                      {b.kategori || 'Tanpa kategori'}
                    </span>

                    <h3 className="catalog-book-title">{b.judul}</h3>

                    <p className="catalog-author">
                      {b.penulis || 'Penulis tidak diketahui'}
                    </p>

                    <p className="catalog-publisher">
                      {b.penerbit || 'Penerbit tidak diketahui'}
                    </p>
                  </div>

                  <div className="catalog-card-footer">
                    <span
                      className={`catalog-stock ${
                        b.stok > 0
                          ? 'catalog-stock-available'
                          : 'catalog-stock-unavailable'
                      }`}
                    >
                      <span className="catalog-stock-dot"></span>
                      {b.stok > 0 ? 'Tersedia' : 'Tidak tersedia'}
                    </span>

                    <span className="catalog-stock-count">
                      Stok: {b.stok}
                    </span>
                  </div>

                  <div className="catalog-card-actions">
                    <button
                      type="button"
                      className="catalog-detail-button"
                      onClick={() =>
                        navigate(`/buku/${b.id}`, { state: { book: b } })
                      }
                    >
                      Detail
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}