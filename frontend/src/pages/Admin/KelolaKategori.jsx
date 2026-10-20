import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService.js';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import './style/KelolaKategori.css';

export default function KelolaKategori({ isOpen, onClose, onCategoryUpdated }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [inputNama, setInputNama] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setInputNama('');
      setEditingCategory(null);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputNama.trim()) return;

    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, inputNama.trim());
        setSuccess('Kategori berhasil diperbarui');
      } else {
        await categoryService.createCategory(inputNama.trim());
        setSuccess('Kategori baru berhasil ditambahkan');
      }
      setInputNama('');
      setEditingCategory(null);
      fetchCategories();
      if (onCategoryUpdated) onCategoryUpdated();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  const handleStartEdit = (kat) => {
    setEditingCategory(kat);
    setInputNama(kat.nama_kategori);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setInputNama('');
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setError('');
    setSuccess('');
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      setSuccess(`Kategori "${deletingCategory.nama_kategori}" berhasil dihapus`);
      setDeletingCategory(null);
      fetchCategories();
      if (onCategoryUpdated) onCategoryUpdated();
    } catch (err) {
      setError(err.message || 'Gagal menghapus kategori');
      setDeletingCategory(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="category-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="category-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="category-modal-header">
          <h3>Kelola Kategori Buku</h3>
          <button className="category-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="category-alert error">{error}</div>}
        {success && <div className="category-alert success">{success}</div>}

        <form className="category-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nama kategori baru..."
            value={inputNama}
            onChange={(e) => setInputNama(e.target.value)}
            required
          />
          <button type="submit" className="category-btn-submit">
            {editingCategory ? 'Update' : 'Tambah'}
          </button>
          {editingCategory && (
            <button type="button" className="category-btn-cancel" onClick={handleCancelEdit}>
              Batal
            </button>
          )}
        </form>

        <div className="category-list-wrapper">
          {loading ? (
            <p className="category-loading">Memuat kategori...</p>
          ) : (
            <table className="category-table">
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Total Buku</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((k) => (
                    <tr key={k.id}>
                      <td className="category-name">{k.nama_kategori}</td>
                      <td>
                        <span className="category-book-count">{k.total_buku || 0} buku</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="action-btn edit"
                          onClick={() => handleStartEdit(k)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          onClick={() => setDeletingCategory(k)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                      Belum ada kategori tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <ConfirmModal
          isOpen={!!deletingCategory}
          title="Hapus Kategori"
          message={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.nama_kategori}"? Kategori yang memiliki relasi buku tidak dapat dihapus.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCategory(null)}
          confirmText="Ya, Hapus"
        />
      </div>
    </div>
  );
}
