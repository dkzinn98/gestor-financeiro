<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transacao extends Model
{
    use HasFactory;

    /**
     * Nome da tabela associada ao modelo.
     *
     * @var string
     */
    protected $table = 'transacoes'; // Especifica o nome correto da tabela

    /**
     * Indica se o modelo deve registrar automaticamente os timestamps.
     *
     * @var bool
     */
    public $timestamps = false; // Adiciona esta linha para desabilitar os timestamps

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'descricao',
        'valor',
        'tipo',
        'categoria_id',
        'user_id',
        'data_transacao'
    ];

    /**
     * Get the categoria that owns the transacao.
     */
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    /**
     * Get the user that owns the transacao.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}