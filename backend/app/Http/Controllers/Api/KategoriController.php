<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;

class KategoriController extends Controller
{
    public function index()
    {
        return response()->json([
            'status'  => 'success',
            'message' => 'Data kategori berhasil diambil',
            'data'    => Kategori::select('id', 'nama_kategori')->get(),
        ]);
    }
}
