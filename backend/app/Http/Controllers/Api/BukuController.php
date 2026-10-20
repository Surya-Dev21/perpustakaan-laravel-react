<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Buku;
use Illuminate\Http\Request;
use App\Models\Peminjaman;

class BukuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
      public function index(Request $request)
      {
          $query = Buku::with('kategori');

          if ($request->search) {
              $query->where(function ($q) use ($request) {
                  $q->where('judul', 'like', '%' . $request->search . '%')
                    ->orWhere('penulis', 'like', '%' . $request->search . '%');
              });
          }

          $data = $query->orderBy('id', 'desc')->get()->map(function ($b) {
              return [
                  'id'           => $b->id,
                  'isbn'         => $b->isbn,
                  'judul'        => $b->judul,
                  'penulis'      => $b->penulis,
                  'penerbit'     => $b->penerbit,
                  'tahun_terbit' => $b->tahun_terbit,
                  'deskripsi'    => $b->deskripsi,
                  'kategori_id'  => $b->kategori_id,
                  'kategori'     => $b->kategori->nama_kategori,
                  'stok'         => $b->stok,
                  'cover_id'     => $b->cover_id,
              ];
          });

          return response()->json([
              'status'  => 'success',
              'message' => 'Data buku berhasil diambil',
              'data'    => $data,
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
                     'message' => 'Lengkapi data',
                 ], 400);
             }
         }
         if (!is_numeric($request->stok) || $request->stok < 0) {
             return response()->json([
                 'status'  => 'error',
                 'message' => 'Stok tidak valid',
             ], 422);
         }

         if (Buku::where('isbn', $request->isbn)->exists()) {
             return response()->json([
                 'status'  => 'error',
                 'message' => 'ISBN sudah terdaftar',
             ], 409);
         }

         $buku = Buku::create([
             'isbn'         => $request->isbn,
             'judul'        => $request->judul,
             'penulis'      => $request->penulis,
             'penerbit'     => $request->penerbit,
             'tahun_terbit' => $request->tahun_terbit,
             'deskripsi'    => $request->deskripsi,
             'kategori_id'  => $request->kategori_id,
             'stok'         => $request->stok,
             'cover_id'     => $request->cover_id ?: null,
         ]);

         return response()->json([
             'status'  => 'success',
             'message' => 'Buku berhasil ditambahkan',
             'data'    => ['id' => $buku->id, 'judul' => $buku->judul],
         ], 201);
     }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
                     'message' => 'Lengkapi data',
                 ], 400);
             }
         }

         if (!is_numeric($request->stok) || $request->stok < 0) {
             return response()->json([
                 'status'  => 'error',
                 'message' => 'Stok tidak valid',
             ], 422);
         }
         $kembar = Buku::where('isbn', $request->isbn)->where('id', '!=', $id)->exists();
         if ($kembar) {
             return response()->json([
                 'status'  => 'error',
                 'message' => 'ISBN sudah terdaftar',
             ], 409);
         }

         $buku->update([
             'isbn'         => $request->isbn,
             'judul'        => $request->judul,
             'penulis'      => $request->penulis,
             'penerbit'     => $request->penerbit,
             'tahun_terbit' => $request->tahun_terbit,
             'deskripsi'    => $request->deskripsi,
             'kategori_id'  => $request->kategori_id,
             'stok'         => $request->stok,
             'cover_id'     => $request->cover_id ?: null,
         ]);

         return response()->json([
             'status'  => 'success',
             'message' => 'Data buku berhasil diperbarui',
             'data'    => ['id' => $buku->id, 'judul' => $buku->judul, 'stok' => $buku->stok],
         ], 200);
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
