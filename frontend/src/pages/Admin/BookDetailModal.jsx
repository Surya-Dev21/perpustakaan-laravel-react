import { useState } from 'react';
import './style/BookDetailModal.css';

export default function BookDetailModal({ book, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('info');

  if (!isOpen || !book) return null;

  return (
    <div className="book-detail-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="book-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="book-detail-header">
          <div>
            <span className="book-detail-category-tag">{book.kategori || 'Umum'}</span>
            <h2>{book.judul}</h2>
            <p className="book-detail-author">Oleh <strong>{book.penulis}</strong></p>
          </div>
          <button className="book-detail-close-btn" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="book-detail-tabs">
          <button
            className={`book-detail-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informasi Buku
          </button>
          <button
            className={`book-detail-tab ${activeTab === 'pinjam' ? 'active' : ''}`}
            onClick={() => setActiveTab('pinjam')}
          >
            Status Peminjaman ({book.peminjaman_aktif?.length || 0})
          </button>
        </div>

        <div className="book-detail-body">
          {activeTab === 'info' && (
            <div className="book-detail-grid">
              <div className="book-detail-item">
                <span className="label">ISBN</span>
                <span className="value">{book.isbn}</span>
              </div>
              <div className="book-detail-item">
                <span className="label">Penerbit</span>
                <span className="value">{book.penerbit}</span>
              </div>
              <div className="book-detail-item">
                <span className="label">Tahun Terbit</span>
                <span className="value">{book.tahun_terbit}</span>
              </div>
              <div className="book-detail-item">
                <span className="label">Stok Fisik Total</span>
                <span className="value font-bold">{book.stok} eksemplar</span>
              </div>
              <div className="book-detail-item">
                <span className="label">Stok Tersedia</span>
                <span className="value font-bold text-success">{book.stok_tersedia ?? book.stok} eksemplar</span>
              </div>
              <div className="book-detail-item">
                <span className="label">Status Ketersediaan</span>
                <span className={`status-pill ${book.status_ketersediaan === 'Tersedia' ? 'available' : 'empty'}`}>
                  {book.status_ketersediaan || 'Tersedia'}
                </span>
              </div>
              <div className="book-detail-item full-width">
                <span className="label">Sinopsis / Deskripsi</span>
                <p className="book-detail-synopsis">
                  {book.deskripsi || 'Tidak ada sinopsis atau deskripsi untuk buku ini.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pinjam' && (
            <div className="book-detail-loans">
              {book.peminjaman_aktif && book.peminjaman_aktif.length > 0 ? (
                <div className="book-loan-table-wrapper">
                  <table className="book-loan-table">
                    <thead>
                      <tr>
                        <th>Peminjam</th>
                        <th>Tanggal Pinjam</th>
                        <th>Batas Kembali</th>
                      </tr>
                    </thead>
                    <tbody>
                      {book.peminjaman_aktif.map((p) => (
                        <tr key={p.id}>
                          <td>{p.user_nama}</td>
                          <td>{p.tgl_peminjaman}</td>
                          <td>{p.batas_peminjaman}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="book-loan-empty">
                  <p>Tidak ada peminjaman aktif saat ini untuk buku ini. Seluruh stok fisik tersedia di rak perpustakaan.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="book-detail-footer">
          <button type="button" className="book-detail-btn-close" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
