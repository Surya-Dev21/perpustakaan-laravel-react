<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peminjaman extends Model
{
   protected $table = 'peminjaman';
   protected $fillable = [
       'user_id', 'buku_id', 'tgl_peminjaman',
       'batas_peminjaman', 'tgl_pengembalian',
   ];
   
   public function user()
   {
       return $this->belongsTo(User::class);
   }
   
   public function buku()
   {
       return $this->belongsTo(Buku::class, 'buku_id');
   }
}
