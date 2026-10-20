<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Buku;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index()
    {
        $categories = Kategori::withCount('buku')
            ->orderBy('nama_kategori', 'asc')
            ->get()
            ->map(function ($k) {
                return [
                    'id'            => $k->id,
                    'nama_kategori' => $k->nama_kategori,
                    'total_buku'    => $k->buku_count,
                ];
            });

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kategori berhasil diambil',
            'data'    => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $nama = trim($request->input('nama_kategori', ''));

        if (!$nama) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Nama kategori wajib diisi',
            ], 400);
        }

        if (Kategori::where('nama_kategori', $nama)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori dengan nama tersebut sudah ada',
            ], 409);
        }

        $kategori = Kategori::create([
            'nama_kategori' => $nama,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil ditambahkan',
            'data'    => [
                'id'            => $kategori->id,
                'nama_kategori' => $kategori->nama_kategori,
                'total_buku'    => 0,
            ],
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        }

        $nama = trim($request->input('nama_kategori', ''));
        if (!$nama) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Nama kategori wajib diisi',
            ], 400);
        }

        $exists = Kategori::where('nama_kategori', $nama)->where('id', '!=', $id)->exists();
        if ($exists) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori dengan nama tersebut sudah ada',
            ], 409);
        }

        $kategori->update(['nama_kategori' => $nama]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil diperbarui',
            'data'    => [
                'id'            => $kategori->id,
                'nama_kategori' => $kategori->nama_kategori,
            ],
        ]);
    }

    public function destroy(string $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        }

        $adaBuku = Buku::where('kategori_id', $id)->exists();
        if ($adaBuku) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori masih digunakan oleh buku dan tidak dapat dihapus',
            ], 422);
        }

        $kategori->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
