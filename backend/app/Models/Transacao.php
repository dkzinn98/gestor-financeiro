<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transacao extends Model
{
    use HasFactory;

    protected $table = 'transacoes';

    protected $fillable = [
        'descricao',
        'valor',
        'tipo',
        'categoria_id',
        'user_id',
        'data_transacao'  // Adicionar esta linha
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_transacao' => 'date'  // Adicionar cast para data
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}