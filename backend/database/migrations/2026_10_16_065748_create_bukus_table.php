<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
      Schema::create('buku', function (Blueprint $table) {
          $table->id();
          $table->string('isbn')->unique();
          $table->string('judul');
          $table->string('penulis');
          $table->string('penerbit');
          $table->integer('tahun_terbit');
          $table->text('deskripsi')->nullable();
          $table->integer('cover_id')->nullable();
          $table->foreignId('kategori_id')->constrained('kategori');
          $table->unsignedInteger('stok')->default(0);
          $table->timestamps();
      });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bukus');
    }
};
