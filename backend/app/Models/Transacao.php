<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transacao extends Model
{
    use HasFactory;

    // Especifica o nome da tabela correta (a que foi criada na migração)
    protected $table = 'transacaos';

    // Campos preenchíveis em massa
    protected $fillable = [
        'descricao',
        'valor',
        'tipo',
        'categoria_id',
        'data_transacao',
        'user_id'
    ];

    // Conversão de tipos
    protected $casts = [
        'valor' => 'float',
        'data_transacao' => 'date',
    ];

    // Relação com a categoria
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    // Relação com o usuário
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}