import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { bookService } from '../../services/bookService.js';
import { categoryService } from '../../services/categoryService.js';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const EMPTY_FORM = {
  isbn: '',
  judul: '',
  penulis: '',
  penerbit: '',
  tahun_terbit: new Date().getFullYear(),
  deskripsi: '',
  kategori_id: '',
  stok: '1',
  cover_id: '',
};

export default function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setError('Gagal memuat kategori.'));

    if (!isEdit) return;
    setLoading(true);
    bookService
      .getBookById(id)
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
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(form.stok) < 0) {
      setError('Stok tidak boleh bernilai negatif.');
      return;
    }
    if (!form.kategori_id) {
      setError('Kategori buku wajib dipilih.');
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
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Ubah Informasi Buku' : 'Tambah Buku Baru'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? 'Perbarui metadata buku, kuantitas stok, dan kategori.'
                : 'Lengkapi informasi metadata buku ke dalam katalog perpustakaan.'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/buku')}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">Memuat data buku...</CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadata Buku</CardTitle>
                <CardDescription>Informasi identitas publikasi buku perpustakaan.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="isbn">Nomor ISBN *</Label>
                  <Input
                    id="isbn"
                    name="isbn"
                    placeholder="Contoh: 978-602-03-8591-4"
                    value={form.isbn}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="judul">Judul Buku *</Label>
                  <Input
                    id="judul"
                    name="judul"
                    placeholder="Masukkan judul buku lengkap"
                    value={form.judul}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="penulis">Nama Penulis *</Label>
                  <Input
                    id="penulis"
                    name="penulis"
                    placeholder="Contoh: Andrea Hirata"
                    value={form.penulis}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="penerbit">Penerbit *</Label>
                  <Input
                    id="penerbit"
                    name="penerbit"
                    placeholder="Contoh: Gramedia Pustaka Utama"
                    value={form.penerbit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tahun_terbit">Tahun Terbit *</Label>
                  <Input
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

                <div className="space-y-1.5">
                  <Label htmlFor="kategori_id">Kategori Buku *</Label>
                  <Select
                    value={form.kategori_id}
                    onValueChange={(v) => setForm({ ...form, kategori_id: v })}
                  >
                    <SelectTrigger id="kategori_id">
                      <SelectValue placeholder="Pilih kategori buku" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((k) => (
                        <SelectItem key={k.id} value={String(k.id)}>
                          {k.nama_kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stok & Sinopsis</CardTitle>
                <CardDescription>Kelola jumlah fisik buku yang tersedia dan ringkasan isi buku.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="stok">Jumlah Stok Fisik *</Label>
                  <Input
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

                <div className="space-y-1.5">
                  <Label htmlFor="cover_id">Cover ID (Opsional)</Label>
                  <Input
                    id="cover_id"
                    name="cover_id"
                    type="number"
                    placeholder="ID Cover gambar (opsional)"
                    value={form.cover_id}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="deskripsi">Sinopsis / Ringkasan Buku</Label>
                  <Textarea
                    id="deskripsi"
                    name="deskripsi"
                    rows={4}
                    placeholder="Tuliskan sinopsis buku secara singkat..."
                    value={form.deskripsi}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/buku')} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4" />
                {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
