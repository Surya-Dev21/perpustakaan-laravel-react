import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { cn } from '../../lib/utils';

function Field({ label, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function BookDetailModal({ book, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('info');
  const isAvailable = (book?.status_ketersediaan || 'Tersedia') === 'Tersedia';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setActiveTab('info');
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        {book && (
          <>
            <DialogHeader>
              <Badge variant="secondary" className="w-fit uppercase">
                {book.kategori || 'Umum'}
              </Badge>
              <DialogTitle className="pr-8">{book.judul}</DialogTitle>
              <DialogDescription>
                Oleh <span className="font-semibold text-foreground">{book.penulis}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4 border-b">
              {[
                { id: 'info', label: 'Informasi Buku' },
                { id: 'pinjam', label: `Status Peminjaman (${book.peminjaman_aktif?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    '-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'info' ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="ISBN">{book.isbn}</Field>
                <Field label="Penerbit">{book.penerbit}</Field>
                <Field label="Tahun Terbit">{book.tahun_terbit}</Field>
                <Field label="Stok Fisik Total">{book.stok} eksemplar</Field>
                <Field label="Stok Tersedia">
                  <span className="text-emerald-600">{book.stok_tersedia ?? book.stok} eksemplar</span>
                </Field>
                <Field label="Status Ketersediaan">
                  <Badge variant={isAvailable ? 'success' : 'destructive'}>
                    {book.status_ketersediaan || 'Tersedia'}
                  </Badge>
                </Field>
                <Field label="Sinopsis / Deskripsi" className="col-span-2">
                  <p className="rounded-lg border bg-muted/40 p-3 text-sm font-normal leading-relaxed text-muted-foreground">
                    {book.deskripsi || 'Tidak ada sinopsis atau deskripsi untuk buku ini.'}
                  </p>
                </Field>
              </div>
            ) : (
              <div className="rounded-lg border">
                {book.peminjaman_aktif?.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2">Peminjam</th>
                        <th className="px-4 py-2">Tanggal Pinjam</th>
                        <th className="px-4 py-2">Batas Kembali</th>
                      </tr>
                    </thead>
                    <tbody>
                      {book.peminjaman_aktif.map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-4 py-2">{p.user_nama}</td>
                          <td className="px-4 py-2">{p.tgl_peminjaman}</td>
                          <td className="px-4 py-2">{p.batas_peminjaman}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    Tidak ada peminjaman aktif saat ini. Seluruh stok fisik tersedia di rak perpustakaan.
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button onClick={onClose}>Tutup</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
