<?php

namespace App\Console\Commands;

use App\Models\Buku;
use App\Models\Kategori;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ImportBuku extends Command
{
    protected $signature = 'books:import {jumlah=10 : Jumlah buku per kategori}';

    protected $description = 'Impor data buku dari Open Library ke tabel buku';

    public function handle()
    {
        $peta = [
            'Fiksi'     => 'fiction',
            'Sejarah'   => 'history',
            'Sains'     => 'science',
            'Teknologi' => 'programming',
            'Biografi'  => 'biography',
        ];

        $jumlah = (int) $this->argument('jumlah');
        $total = 0;

        foreach ($peta as $namaKategori => $subjek) {
            $kategori = Kategori::where('nama_kategori', $namaKategori)->first();
            if (!$kategori) {
                $this->warn("Kategori $namaKategori tidak ada, dilewati");
                continue;
            }

            $res = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'PerpustakaanKampus/1.0'])
                ->get('https://openlibrary.org/search.json', [
                    'q'      => 'subject:' . $subjek,
                    'limit'  => $jumlah * 3,
                    'fields' => 'title,author_name,publisher,first_publish_year,isbn,cover_i',
                ]);

            if (!$res->successful()) {
                $this->error("Gagal mengambil data untuk $namaKategori");
                continue;
            }

            $simpan = 0;

            foreach ($res->json('docs', []) as $doc) {
                if ($simpan >= $jumlah) {
                    break;
                }

                $isbn = $doc['isbn'][0] ?? null;

                if (
                    !$isbn ||
                    empty($doc['title']) ||
                    empty($doc['author_name']) ||
                    empty($doc['first_publish_year'])
                ) {
                    continue;
                }

                if (Buku::where('isbn', $isbn)->exists()) {
                    continue;
                }

                Buku::create([
                    'isbn'         => $isbn,
                    'judul'        => Str::limit($doc['title'], 250, ''),
                    'penulis'      => Str::limit($doc['author_name'][0], 250, ''),
                    'penerbit'     => Str::limit($doc['publisher'][0] ?? 'Tidak diketahui', 250, ''),
                    'tahun_terbit' => $doc['first_publish_year'],
                    'deskripsi'    => null,
                    'kategori_id'  => $kategori->id,
                    'stok'         => rand(1, 5),
                    'cover_id'     => $doc['cover_i'] ?? null,
                ]);

                $simpan++;
            }

            $this->info("$namaKategori: $simpan buku");
            $total += $simpan;
        }

        $this->info("Selesai, total $total buku diimpor.");
    }
}
