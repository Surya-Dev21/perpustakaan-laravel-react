<?php

namespace Database\Seeders;

use App\Models\Buku;
use App\Models\Kategori;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategoriMap = Kategori::pluck('id', 'nama_kategori')->toArray();

        // Pastikan ada kategori
        if (empty($kategoriMap)) {
            foreach (['Fiksi', 'Sejarah', 'Sains', 'Teknologi', 'Biografi'] as $nama) {
                $k = Kategori::create(['nama_kategori' => $nama]);
                $kategoriMap[$nama] = $k->id;
            }
        }

        $books = [
            [
                'isbn' => '978-602-03-8591-4',
                'judul' => 'Clean Code: Panduan Praktis Pemrograman Berkelanjutan',
                'penulis' => 'Robert C. Martin',
                'penerbit' => 'Prentice Hall',
                'tahun_terbit' => 2020,
                'deskripsi' => 'Buku legendaris tentang prinsip, pola, dan praktik menulis kode yang mudah dipelihara dan bersih.',
                'kategori_id' => $kategoriMap['Teknologi'] ?? 1,
                'stok' => 8,
            ],
            [
                'isbn' => '978-602-06-3317-6',
                'judul' => 'Laskar Pelangi',
                'penulis' => 'Andrea Hirata',
                'penerbit' => 'Bentang Pustaka',
                'tahun_terbit' => 2018,
                'deskripsi' => 'Kisah inspiratif tentang sepuluh anak Belitong yang berjuang mengejar pendidikan di tengah keterbatasan.',
                'kategori_id' => $kategoriMap['Fiksi'] ?? 1,
                'stok' => 5,
            ],
            [
                'isbn' => '978-602-424-694-5',
                'judul' => 'Sapiens: Riwayat Singkat Umat Manusia',
                'penulis' => 'Yuval Noah Harari',
                'penerbit' => 'Kepustakaan Populer Gramedia',
                'tahun_terbit' => 2019,
                'deskripsi' => 'Eksplorasi mendalam evolusi manusia purba hingga menjadi penguasa planet bumi.',
                'kategori_id' => $kategoriMap['Sejarah'] ?? 1,
                'stok' => 4,
            ],
            [
                'isbn' => '978-013-235-088-4',
                'judul' => 'The Pragmatic Programmer',
                'penulis' => 'Andrew Hunt & David Thomas',
                'penerbit' => 'Addison-Wesley',
                'tahun_terbit' => 2019,
                'deskripsi' => 'Wawasan filosofis dan praktis seputar pengembangan perangkat lunak modern.',
                'kategori_id' => $kategoriMap['Teknologi'] ?? 1,
                'stok' => 0, // Sengaja stok habis untuk pengujian status ketersediaan
            ],
            [
                'isbn' => '978-602-03-3160-7',
                'judul' => 'Bumi Manusia',
                'penulis' => 'Pramoedya Ananta Toer',
                'penerbit' => 'Lentera Dipantara',
                'tahun_terbit' => 2015,
                'deskripsi' => 'Novel pertama dari Tetralogi Buru yang merekam pergulatan kebangsaan dan cinta di masa kolonial.',
                'kategori_id' => $kategoriMap['Fiksi'] ?? 1,
                'stok' => 2, // Stok menipis
            ],
            [
                'isbn' => '978-602-03-2478-4',
                'judul' => 'Cosmos',
                'penulis' => 'Carl Sagan',
                'penerbit' => 'Gramedia Pustaka Utama',
                'tahun_terbit' => 2016,
                'deskripsi' => 'Perjalanan puitis dan sains mengarungi misteri alam semesta dan pencarian tempat manusia di dalamnya.',
                'kategori_id' => $kategoriMap['Sains'] ?? 1,
                'stok' => 6,
            ],
            [
                'isbn' => '978-602-03-1811-0',
                'judul' => 'Steve Jobs: Biografi Resmi',
                'penulis' => 'Walter Isaacson',
                'penerbit' => 'Simon & Schuster',
                'tahun_terbit' => 2014,
                'deskripsi' => 'Catatan kehidupan, visi inovasi, dan kepemimpinan pendiri Apple yang visioner.',
                'kategori_id' => $kategoriMap['Biografi'] ?? 1,
                'stok' => 3,
            ],
        ];

        foreach ($books as $b) {
            Buku::updateOrCreate(['isbn' => $b['isbn']], $b);
        }
    }
}
