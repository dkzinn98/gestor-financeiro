<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
   {
       Schema::create('transacoes', function (Blueprint $table) {
           $table->id();
           $table->string('descricao');
           $table->decimal('valor', 10, 2);
           $table->enum('tipo', ['receita', 'despesa']);
           $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
           $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
           $table->timestamps();
       });
   }

   public function down(): void
   {
       Schema::dropIfExists('transacoes');
   }
};
