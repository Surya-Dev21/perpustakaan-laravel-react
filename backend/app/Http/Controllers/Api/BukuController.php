<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Buku;
use App\Models\Kategori;
use App\Models\Peminjaman;
use Illuminate\Http\Request;

class BukuController extends Controller
{
    /**
     * Ringkasan statistik untuk Admin Dashboard.
     */
    public function dashboardStats()
    {
        $totalJudul = Buku::count();
        $totalStok = (int) Buku::sum('stok');
        $bukuDipinjam = Peminjaman::whereNull('tgl_pengembalian')->count();
        $totalKategori = Kategori::count();

        // Hitung buku yang stok tersedianya habis atau menipis (<= 2)
        $allBooks = Buku::with('peminjaman')->get();
        $stokHabis = $allBooks->filter(fn($b) => $b->stok_tersedia <= 0)->count();
        $stokMenipis = $allBooks->filter(fn($b) => $b->stok_tersedia > 0 && $b->stok_tersedia <= 2)->count();

        return response()->json([
            'status'  => 'success',
            'message' => 'Statistik dashboard berhasil diambil',
            'data'    => [
                'total_judul_buku'     => $totalJudul,
                'total_stok_buku'      => $totalStok,
                'total_buku_dipinjam'  => $bukuDipinjam,
                'total_kategori'       => $totalKategori,
                'stok_habis'           => $stokHabis,
                'stok_menipis'         => $stokMenipis,
            ],
        ]);
    }

    /**
     * Display a listing of the resource with search, filter, and sorting.
     */
    public function index(Request $request)
    {
        $query = Buku::with('kategori');

        // Pencarian (Search judul, penulis, isbn, penerbit)
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('penulis', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('penerbit', 'like', "%{$search}%");
            });
        }

        // Filter Kategori
        if ($request->filled('kategori_id') && $request->kategori_id !== 'all') {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Sorting
        $sortBy = in_array($request->sort_by, ['judul', 'tahun_terbit', 'stok', 'id']) ? $request->sort_by : 'id';
        $order = strtolower($request->order) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $order);

        $books = $query->get()->map(function ($b) {
            return [
                'id'                  => $b->id,
                'isbn'                => $b->isbn,
                'judul'               => $b->judul,
                'penulis'             => $b->penulis,
                'penerbit'            => $b->penerbit,
                'tahun_terbit'        => $b->tahun_terbit,
                'deskripsi'           => $b->deskripsi,
                'kategori_id'         => $b->kategori_id,
                'kategori'            => $b->kategori?->nama_kategori ?? '-',
                'stok'                => (int) $b->stok,
                'stok_tersedia'       => $b->stok_tersedia,
                'status_ketersediaan' => $b->status_ketersediaan,
                'cover_id'            => $b->cover_id,
            ];
        });

        // Filter Status Ketersediaan (Tersedia / Habis)
        if ($request->filled('status') && $request->status !== 'all') {
            $statusTarget = strtolower($request->status);
            $books = $books->filter(function ($b) use ($statusTarget) {
                return strtolower($b['status_ketersediaan']) === $statusTarget;
            })->values();
        }

        // Optional Pagination
        $perPage = (int) $request->input('per_page', 0);
        if ($perPage > 0) {
            $page = max(1, (int) $request->input('page', 1));
            $total = $books->count();
            $paginated = $books->slice(($page - 1) * $perPage, $perPage)->values();

            return response()->json([
                'status'  => 'success',
                'message' => 'Data buku berhasil diambil',
                'data'    => $paginated,
                'meta'    => [
                    'current_page' => $page,
                    'per_page'     => $perPage,
                    'total'        => $total,
                    'last_page'    => (int) ceil($total / $perPage),
                ],
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Data buku berhasil diambil',
            'data'    => $books,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $wajib = ['isbn', 'judul', 'penulis', 'penerbit', 'tahun_terbit', 'kategori_id', 'stok'];
        foreach ($wajib as $field) {
            $nilai = $request->input($field);
            if ($nilai === null || $nilai === '') {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Field {$field} wajib diisi",
                ], 400);
            }
        }

        if (!is_numeric($request->stok) || (int) $request->stok < 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Stok buku tidak boleh kurang dari 0',
            ], 422);
        }

        if (Buku::where('isbn', $request->isbn)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'ISBN sudah terdaftar pada buku lain',
            ], 409);
        }

        $buku = Buku::create([
            'isbn'         => trim($request->isbn),
            'judul'        => trim($request->judul),
            'penulis'      => trim($request->penulis),
            'penerbit'     => trim($request->penerbit),
            'tahun_terbit' => (int) $request->tahun_terbit,
            'deskripsi'    => $request->deskripsi,
            'kategori_id'  => (int) $request->kategori_id,
            'stok'         => (int) $request->stok,
            'cover_id'     => $request->cover_id ?: null,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Buku berhasil ditambahkan',
            'data'    => [
                'id'                  => $buku->id,
                'judul'               => $buku->judul,
                'stok'                => $buku->stok,
                'stok_tersedia'       => $buku->stok_tersedia,
                'status_ketersediaan' => $buku->status_ketersediaan,
            ],
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $buku = Buku::with(['kategori', 'peminjaman.user'])->find($id);

        if (!$buku) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Buku tidak ditemukan',
            ], 404);
        }

        $peminjamanAktif = $buku->peminjaman
            ->whereNull('tgl_pengembalian')
            ->map(function ($p) {
                return [
                    'id'               => $p->id,
                    'user_nama'        => $p->user?->username ?? 'User',
                    'tgl_peminjaman'   => $p->tgl_peminjaman,
                    'batas_peminjaman' => $p->batas_peminjaman,
                ];
            })->values();

        return response()->json([
            'status'  => 'success',
            'message' => 'Detail buku berhasil diambil',
            'data'    => [
                'id'                  => $buku->id,
                'isbn'                => $buku->isbn,
                'judul'               => $buku->judul,
                'penulis'             => $buku->penulis,
                'penerbit'            => $buku->penerbit,
                'tahun_terbit'        => $buku->tahun_terbit,
                'deskripsi'           => $buku->deskripsi,
                'kategori_id'         => $buku->kategori_id,
                'kategori'            => $buku->kategori?->nama_kategori ?? '-',
                'stok'                => (int) $buku->stok,
                'stok_tersedia'       => $buku->stok_tersedia,
                'status_ketersediaan' => $buku->status_ketersediaan,
                'cover_id'            => $buku->cover_id,
                'peminjaman_aktif'    => $peminjamanAktif,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Buku tidak ditemukan',
            ], 404);
        }

        $wajib = ['isbn', 'judul', 'penulis', 'penerbit', 'tahun_terbit', 'kategori_id', 'stok'];
        foreach ($wajib as $field) {
            $nilai = $request->input($field);
            if ($nilai === null || $nilai === '') {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Field {$field} wajib diisi",
                ], 400);
            }
        }

        if (!is_numeric($request->stok) || (int) $request->stok < 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Stok buku tidak boleh kurang dari 0',
            ], 422);
        }

        $kembar = Buku::where('isbn', $request->isbn)->where('id', '!=', $id)->exists();
        if ($kembar) {
            return response()->json([
                'status'  => 'error',
                'message' => 'ISBN sudah digunakan pada buku lain',
            ], 409);
        }

        $buku->update([
            'isbn'         => trim($request->isbn),
            'judul'        => trim($request->judul),
            'penulis'      => trim($request->penulis),
            'penerbit'     => trim($request->penerbit),
            'tahun_terbit' => (int) $request->tahun_terbit,
            'deskripsi'    => $request->deskripsi,
            'kategori_id'  => (int) $request->kategori_id,
            'stok'         => (int) $request->stok,
            'cover_id'     => $request->cover_id ?: null,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data buku berhasil diperbarui',
            'data'    => [
                'id'                  => $buku->id,
                'judul'               => $buku->judul,
                'stok'                => $buku->stok,
                'stok_tersedia'       => $buku->stok_tersedia,
                'status_ketersediaan' => $buku->status_ketersediaan,
            ],
        ], 200);
    }

    /**
     * Update stock quickly.
     */
    public function updateStock(Request $request, string $id)
    {
        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Buku tidak ditemukan',
            ], 404);
        }

        if (!is_numeric($request->stok) || (int) $request->stok < 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jumlah stok tidak valid',
            ], 422);
        }

        $buku->update(['stok' => (int) $request->stok]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Stok buku berhasil diperbarui',
            'data'    => [
                'id'                  => $buku->id,
                'stok'                => $buku->stok,
                'stok_tersedia'       => $buku->stok_tersedia,
                'status_ketersediaan' => $buku->status_ketersediaan,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Buku tidak ditemukan',
            ], 404);
        }

        $aktif = Peminjaman::where('buku_id', $id)
            ->whereNull('tgl_pengembalian')
            ->exists();

        if ($aktif) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Buku sedang dipinjam dan tidak dapat dihapus',
            ], 409);
        }

        if (Peminjaman::where('buku_id', $id)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Buku memiliki riwayat peminjaman dan tidak dapat dihapus',
            ], 409);
        }

        $buku->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Buku berhasil dihapus',
        ], 200);
    }
}
