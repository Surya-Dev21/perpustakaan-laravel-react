import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookService } from '../../services/bookService.js';
import { categoryService } from '../../services/categoryService.js';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import '../Admin/style/BookForm.css';

export default function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    isbn: '',
    judul: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: new Date().getFullYear(),
    deskripsi: '',
    kategori_id: '',
    stok: '1',
    cover_id: '',
  });

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setError('Gagal memuat kategori.'));

    if (isEdit) {
      setLoading(true);
      bookService.getBookById(id)
        .then((res) => {
          const b = res.data;
          setForm({
            isbn: b.isbn || '',
            judul: b.judul || '',
            penulis: b.penulis || '',
            penerbit: b.penerbit || '',
            tahun_terbit: b.tahun_terbit || '',
            deskripsi: b.deskripsi || '',
            kategori_id: String(b.kategori_id || ''),
            stok: String(b.stok ?? 0),
            cover_id: b.cover_id || '',
          });
        })
        .catch((err) => setError(err.message || 'Gagal memuat data buku.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi klien
    if (Number(form.stok) < 0) {
      setError('Stok tidak boleh bernilai negatif.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tahun_terbit: Number(form.tahun_terbit),
        stok: Number(form.stok),
        kategori_id: Number(form.kategori_id),
        cover_id: form.cover_id ? Number(form.cover_id) : null,
      };

      if (isEdit) {
        await bookService.updateBook(id, payload);
      } else {
        await bookService.createBook(payload);
      }

      navigate('/admin/buku');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data buku.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="book-form-page">
      <AdminNavbar />

      <main className="book-form-wrapper">
        <div className="book-form-header">
          <div>
            <h1>{isEdit ? 'Ubah Informasi Buku' : 'Tambah Buku Baru'}</h1>
            <p>
              {isEdit
                ? 'Perbarui metadata buku, kuantitas stok, dan kategori.'
                : 'Lengkapi informasi metadata buku ke dalam katalog perpustakaan.'}
            </p>
          </div>
          <button
            type="button"
            className="book-form-cancel"
            onClick={() => navigate('/admin/buku')}
          >
            ← Kembali ke Daftar
          </button>
        </div>

        {error && <div className="book-form-error">{error}</div>}

        {loading ? (
          <div className="book-form-loading">Memuat data buku...</div>
        ) : (
          <form className="book-form-card" onSubmit={handleSubmit}>
            <section className="book-form-section">
              <h2>Metadata Buku</h2>
              <p>Informasi identitas publikasi buku perpustakaan.</p>

              <div className="book-form-grid">
                <div className="book-form-group">
                  <label htmlFor="isbn">Nomor ISBN *</label>
                  <input
                    id="isbn"
                    name="isbn"
                    placeholder="Contoh: 978-602-03-8591-4"
                    value={form.isbn}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="book-form-group">
                  <label htmlFor="judul">Judul Buku *</label>
                  <input
                    id="judul"
                    name="judul"
                    placeholder="Masukkan judul buku lengkap"
                    value={form.judul}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="book-form-group">
                  <label htmlFor="penulis">Nama Penulis *</label>
                  <input
                    id="penulis"
                    name="penulis"
                    placeholder="Contoh: Andrea Hirata"
                    value={form.penulis}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="book-form-group">
                  <label htmlFor="penerbit">Penerbit *</label>
                  <input
                    id="penerbit"
                    name="penerbit"
                    placeholder="Contoh: Gramedia Pustaka Utama"
                    value={form.penerbit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="book-form-group">
                  <label htmlFor="tahun_terbit">Tahun Terbit *</label>
                  <input
                    id="tahun_terbit"
                    name="tahun_terbit"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="Contoh: 2024"
                    value={form.tahun_terbit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="book-form-group">
                  <label htmlFor="kategori_id">Kategori Buku *</label>
                  <select
                    id="kategori_id"
                    name="kategori_id"
                    value={form.kategori_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih kategori buku</option>
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
              <h2>Stok & Sinopsis</h2>
              <p>Kelola jumlah fisik buku yang tersedia dan ringkasan isi buku.</p>

              <div className="book-form-grid">
                <div className="book-form-group">
                  <label htmlFor="stok">Jumlah Stok Fisik *</label>
                  <input
                    id="stok"
                    name="stok"
                    type="number"
                    min="0"
                    placeholder="Jumlah stok eksemplar"
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
                    placeholder="ID Cover gambar (opsional)"
                    value={form.cover_id}
                    onChange={handleChange}
                  />
                </div>

                <div className="book-form-group book-form-full">
                  <label htmlFor="deskripsi">Sinopsis / Ringkasan Buku</label>
                  <textarea
                    id="deskripsi"
                    name="deskripsi"
                    rows="4"
                    placeholder="Tuliskan sinopsis buku secara singkat..."
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
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="book-form-submit"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
