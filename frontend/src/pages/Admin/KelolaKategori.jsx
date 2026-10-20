import { useEffect, useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/categoryService.js';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

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
    if (!isOpen) return;
    fetchCategories();
    setInputNama('');
    setEditingCategory(null);
    setError('');
    setSuccess('');
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
      onCategoryUpdated?.();
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

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setError('');
    setSuccess('');
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      setSuccess(`Kategori "${deletingCategory.nama_kategori}" berhasil dihapus`);
      setDeletingCategory(null);
      fetchCategories();
      onCategoryUpdated?.();
    } catch (err) {
      setError(err.message || 'Gagal menghapus kategori');
      setDeletingCategory(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kelola Kategori Buku</DialogTitle>
          <DialogDescription>
            Tambah, ubah, atau hapus kategori. Kategori yang masih dipakai buku tidak dapat dihapus.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Nama kategori baru..."
            value={inputNama}
            onChange={(e) => setInputNama(e.target.value)}
            required
          />
          <Button type="submit" className="shrink-0">
            {editingCategory ? (
              <>
                <Check className="h-4 w-4" /> Update
              </>
            ) : (
              'Tambah'
            )}
          </Button>
          {editingCategory && (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                setEditingCategory(null);
                setInputNama('');
              }}
            >
              Batal
            </Button>
          )}
        </form>

        <div className="max-h-72 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Total Buku</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Memuat kategori...
                  </TableCell>
                </TableRow>
              ) : categories.length > 0 ? (
                categories.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.nama_kategori}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{k.total_buku || 0} buku</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="Edit kategori"
                          onClick={() => handleStartEdit(k)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Hapus kategori"
                          onClick={() => setDeletingCategory(k)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Belum ada kategori tersedia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ConfirmModal
          isOpen={!!deletingCategory}
          title="Hapus Kategori"
          message={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.nama_kategori}"? Kategori yang memiliki relasi buku tidak dapat dihapus.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCategory(null)}
          confirmText="Ya, Hapus"
        />
      </DialogContent>
    </Dialog>
  );
}
