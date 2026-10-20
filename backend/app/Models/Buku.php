<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Buku extends Model
{
    protected $table = 'buku';
    protected $fillable = [
        'isbn', 'judul', 'penulis', 'penerbit', 'tahun_terbit', 'deskripsi', 'cover_id', 'kategori_id', 'stok',
    ];

    protected $appends = ['stok_tersedia', 'status_ketersediaan'];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class, 'buku_id');
    }

    public function getStokTersediaAttribute(): int
    {
        $dipinjam = $this->peminjaman()
            ->whereNull('tgl_pengembalian')
            ->count();

        return max(0, (int) $this->stok - $dipinjam);
    }

    public function getStatusKetersediaanAttribute(): string
    {
        return $this->stok_tersedia > 0 ? 'Tersedia' : 'Habis';
    }
}
