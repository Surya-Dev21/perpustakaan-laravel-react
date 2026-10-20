import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import '../Admin/style/KelolaBuku.css';

const API = 'http://localhost:8000/api';

export default function KelolaBuku() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadBooks = async () => {
    try {
      const res = await fetch(`${API}/books`, {
        headers: { Accept: 'application/json' },
      });

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
    const loadData = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          fetch(`${API}/books`, {
            headers: { Accept: 'application/json' },
          }),
          fetch(`${API}/categories`, {
            headers: { Accept: 'application/json' },
          }),
        ]);

        const booksData = await booksRes.json();
        const categoriesData = await categoriesRes.json();

        if (!booksRes.ok) {
          throw new Error(
            booksData.message || 'Gagal mengambil data buku.'
          );
        }

        if (!categoriesRes.ok) {
          throw new Error(
            categoriesData.message || 'Gagal mengambil data kategori.'
          );
        }

        setBooks(booksData.data || []);
        setCategories(categoriesData.data || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Tidak bisa terhubung ke server.');
      }
    };

    loadData();
  }, []);

  const handleEdit = (book) => {
    setError('');
    setEditingId(book.id);

    setEditForm({
      isbn: book.isbn ?? '',
      judul: book.judul ?? '',
      penulis: book.penulis ?? '',
      penerbit: book.penerbit ?? '',
      tahun_terbit: book.tahun_terbit ?? '',
      kategori_id: String(book.kategori_id ?? ''),
      stok: book.stok ?? 0,
      deskripsi: book.deskripsi ?? '',
      cover_id: book.cover_id ?? '',
    });
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setError('');

    try {
      const res = await fetch(`${API}/books/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          cover_id: editForm.cover_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message ||
            (data.errors
              ? Object.values(data.errors).flat().join(', ')
              : 'Gagal memperbarui data buku.')
        );
        return;
      }

      setEditingId(null);
      await loadBooks();
    } catch {
      setError('Tidak bisa terhubung ke server.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      return;
    }

    setError('');

    try {
      const res = await fetch(`${API}/books/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Gagal menghapus data buku.');
        return;
      }

      if (editingId === id) {
        setEditingId(null);
      }

      await loadBooks();
    } catch {
      setError('Tidak bisa terhubung ke server.');
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="books-page">
        <div className="books-header">
          <div>
            <h1>Kelola Buku</h1>
            <p>Kelola informasi dan data buku perpustakaan.</p>
          </div>

          <button
            className="books-add-button"
            onClick={() => navigate('/admin/buku/tambah')}
          >
            <span>+</span> Tambah Buku
          </button>
        </div>

        {error && <div className="books-error">{error}</div>}

        <div className="books-content">
          <div className="books-content-header">
            <div>
              <h2>Daftar Buku</h2>
              <p>Jumlah buku: {books.length}</p>
            </div>
          </div>

          <div className="books-table-wrapper">
            <table className="books-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>ISBN</th>
                  <th>Judul Buku</th>
                  <th>Penulis</th>
                  <th>Penerbit</th>
                  <th>Tahun</th>
                  <th>Kategori</th>
                  <th>Stok</th>
                  <th>Opsi</th>
                </tr>
              </thead>

              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="books-empty">
                      Belum ada data buku.
                    </td>
                  </tr>
                ) : (
                  books.map((book, index) =>
                    book.id === editingId ? (
                      <tr key={book.id} className="books-edit-row">
                        <td>{index + 1}</td>
                        <td>
                          <input
                            className="books-edit-input"
                            name="isbn"
                            value={editForm.isbn}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <input
                            className="books-edit-input"
                            name="judul"
                            value={editForm.judul}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <input
                            className="books-edit-input"
                            name="penulis"
                            value={editForm.penulis}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <input
                            className="books-edit-input"
                            name="penerbit"
                            value={editForm.penerbit}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <input
                            className="books-edit-input"
                            name="tahun_terbit"
                            type="number"
                            value={editForm.tahun_terbit}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <select
                            className="books-edit-input"
                            name="kategori_id"
                            value={editForm.kategori_id}
                            onChange={handleChange}
                          >
                            <option value="">Pilih kategori</option>
                            {categories.map((category) => (
                              <option
                                key={category.id}
                                value={category.id}
                              >
                                {category.nama_kategori}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            className="books-edit-input"
                            name="stok"
                            type="number"
                            min="0"
                            value={editForm.stok}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <div className="books-actions">
                            <button
                              className="books-save-button"
                              onClick={handleSave}
                            >
                              Simpan
                            </button>
                            <button
                              className="books-cancel-button"
                              onClick={() => setEditingId(null)}
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={book.id}>
                        <td>{index + 1}</td>
                        <td>{book.isbn}</td>
                        <td className="books-title">{book.judul}</td>
                        <td>{book.penulis}</td>
                        <td>{book.penerbit}</td>
                        <td>{book.tahun_terbit}</td>
                        <td>
                          <span className="books-category">
                            {book.kategori}
                          </span>
                        </td>
                        <td>{book.stok}</td>
                        <td>
                          <div className="books-actions">
                            <button
                              className="books-edit-button"
                              onClick={() => handleEdit(book)}
                            >
                              Edit
                            </button>
                            <button
                              className="books-delete-button"
                              onClick={() => handleDelete(book.id)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}