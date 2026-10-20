import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, Pencil, Plus, Search, Tags, Trash2, X } from 'lucide-react';
import { bookService } from '../../services/bookService.js';
import { categoryService } from '../../services/categoryService.js';
import AdminNavbar from '../../components/AdminNavbar.jsx';
import StockBadge from '../../components/StockBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import BookDetailModal from './BookDetailModal.jsx';
import KelolaKategori from './KelolaKategori.jsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export default function KelolaBuku() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);

  const [editingStockId, setEditingStockId] = useState(null);
  const [quickStockVal, setQuickStockVal] = useState('');

  const [detailBook, setDetailBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data || []);
    } catch {
      // Diamkan: kategori hanya pelengkap filter
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookService.getBooks({
        search: search.trim(),
        kategori_id: kategoriFilter === 'all' ? '' : kategoriFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        page,
        per_page: 10,
      });

      setBooks(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data buku.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [search, kategoriFilter, statusFilter, page]);

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

  const handleOpenDetail = async (bookId) => {
    try {
      const res = await bookService.getBookById(bookId);
      setDetailBook(res.data);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail buku');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Kelola Buku Perpustakaan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola katalog buku, stok eksemplar, dan pantau status ketersediaan buku secara langsung.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
              <Tags className="h-4 w-4" />
              Kelola Kategori
            </Button>
            <Button onClick={() => navigate('/admin/buku/tambah')}>
              <Plus className="h-4 w-4" />
              Tambah Buku
            </Button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 pr-9"
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
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Select
              value={kategoriFilter}
              onValueChange={(v) => {
                setKategoriFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || 'all'}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="tersedia">Tersedia</SelectItem>
                <SelectItem value="habis">Habis</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Informasi Buku</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead>Stok & Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Memuat daftar buku...
                  </TableCell>
                </TableRow>
              ) : books.length > 0 ? (
                books.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="max-w-[320px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{b.judul}</span>
                        <span className="text-xs text-muted-foreground">oleh {b.penulis}</span>
                        <span className="text-xs text-muted-foreground/70">{b.penerbit}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">{b.kategori}</Badge>
                    </TableCell>

                    <TableCell>
                      <code className="rounded border bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                        {b.isbn}
                      </code>
                    </TableCell>

                    <TableCell>{b.tahun_terbit}</TableCell>

                    <TableCell>
                      {editingStockId === b.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={quickStockVal}
                            onChange={(e) => setQuickStockVal(e.target.value)}
                            className="h-8 w-16"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            className="h-7 w-7 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleSaveStock(b.id)}
                            title="Simpan stok"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => setEditingStockId(null)}
                            title="Batal"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          title="Klik untuk ubah stok cepat"
                          onClick={() => {
                            setEditingStockId(b.id);
                            setQuickStockVal(b.stok);
                          }}
                          className="group flex items-center gap-2 rounded-md px-2 py-1 text-left transition hover:bg-muted"
                        >
                          <StockBadge
                            stokTersedia={b.stok_tersedia}
                            stokTotal={b.stok}
                            status={b.status_ketersediaan}
                          />
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleOpenDetail(b.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/buku/edit/${b.id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingBook(b)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Tidak ada buku yang sesuai dengan filter atau pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {meta.last_page > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
              <span>
                Halaman {meta.current_page} dari {meta.last_page} · Total {meta.total} buku
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                <span className="px-1 font-semibold text-primary">{meta.current_page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      <BookDetailModal book={detailBook} isOpen={!!detailBook} onClose={() => setDetailBook(null)} />

      <KelolaKategori
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryUpdated={() => {
          fetchCategories();
          fetchBooks();
        }}
      />

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
