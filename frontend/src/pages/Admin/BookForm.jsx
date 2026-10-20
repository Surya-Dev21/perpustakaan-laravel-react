
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Admin/style/BookForm.css';

const API = 'http://localhost:8000/api';

export default function BookForm() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    isbn: '',
    judul: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    deskripsi: '',
    kategori_id: '',
    stok: '',
    cover_id: '',
  });

  useEffect(() => {
    fetch(`${API}/categories`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil kategori');
        return res.json();
      })
      .then((data) => setCategories(data.data || []))
      .catch(() => setError('Tidak bisa mengambil data kategori.'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...form,
          cover_id: form.cover_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message ||
          (data.errors
            ? Object.values(data.errors).flat().join(', ')
            : 'Gagal menyimpan data buku.')
        );
        return;
      }

      navigate('/admin/buku');
    } catch {
      setError('Tidak bisa terhubung ke server.');
    }
  };

  return (
    <div className="book-form-page">
      <div className="book-form-header">
        <div>
          <h1>Tambah Buku</h1>
          <p>Tambahkan informasi buku ke dalam katalog perpustakaan.</p>
        </div>
      </div>

      <form className="book-form-card" onSubmit={handleSubmit}>
        {error && <div className="book-form-error">{error}</div>}

        <section className="book-form-section">
          <h2>Informasi Buku</h2>
          <p>Masukkan informasi dasar buku yang akan ditambahkan.</p>

          <div className="book-form-grid">
            <div className="book-form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                id="isbn"
                name="isbn"
                placeholder="Masukkan ISBN"
                value={form.isbn}
                onChange={handleChange}
                required
              />
            </div>

            <div className="book-form-group">
              <label htmlFor="judul">Judul Buku</label>
              <input
                id="judul"
                name="judul"
                placeholder="Masukkan judul buku"
                value={form.judul}
                onChange={handleChange}
                required
              />
            </div>

            <div className="book-form-group">
              <label htmlFor="penulis">Penulis</label>
              <input
                id="penulis"
                name="penulis"
                placeholder="Nama penulis"
                value={form.penulis}
                onChange={handleChange}
                required
              />
            </div>

            <div className="book-form-group">
              <label htmlFor="penerbit">Penerbit</label>
              <input
                id="penerbit"
                name="penerbit"
                placeholder="Nama penerbit"
                value={form.penerbit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="book-form-group">
              <label htmlFor="tahun_terbit">Tahun Terbit</label>
              <input
                id="tahun_terbit"
                name="tahun_terbit"
                type="number"
                placeholder="Contoh: 2024"
                value={form.tahun_terbit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="book-form-group">
              <label htmlFor="kategori_id">Kategori</label>
              <select
                id="kategori_id"
                name="kategori_id"
                value={form.kategori_id}
                onChange={handleChange}
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="book-form-section">
          <h2>Informasi Tambahan</h2>
          <p>Lengkapi stok dan informasi pendukung jika tersedia.</p>

          <div className="book-form-grid">
            <div className="book-form-group">
              <label htmlFor="stok">Stok Buku</label>
              <input
                id="stok"
                name="stok"
                type="number"
                min="0"
                placeholder="Jumlah stok"
                value={form.stok}
                onChange={handleChange}
                required
              />
            </div>

            <div className="book-form-group">
              <label htmlFor="cover_id">Cover ID (Opsional)</label>
              <input
                id="cover_id"
                name="cover_id"
                type="number"
                placeholder="Masukkan Cover ID"
                value={form.cover_id}
                onChange={handleChange}
              />
            </div>

            <div className="book-form-group book-form-full">
              <label htmlFor="deskripsi">Deskripsi (Opsional)</label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows="4"
                placeholder="Tuliskan deskripsi singkat buku"
                value={form.deskripsi}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <div className="book-form-actions">
          <button
            type="button"
            className="book-form-cancel"
            onClick={() => navigate('/admin/buku')}
          >
            Batal
          </button>
          <button type="submit" className="book-form-submit">
            Simpan Buku
          </button>
        </div>
      </form>
    </div>
  );
}
