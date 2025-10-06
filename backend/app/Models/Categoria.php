<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';

    protected $fillable = ['nome', 'tipo', 'descricao', 'user_id'];

    // Categoria -> Transações (FK: transacoes.categoria_id)
    public function transacoes()
    {
        return $this->hasMany(Transacao::class, 'categoria_id', 'id');
    }

    // Categoria -> Usuário (FK: categorias.user_id)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Escopo: filtra categorias do usuário.
     * Uso: Categoria::doUsuario()->get();
     *      Categoria::doUsuario($algumId)->get();
     */
    public function scopeDoUsuario(Builder $query, ?int $userId = null): Builder
    {
        return $query->where('user_id', $userId ?? Auth::id());
    }
}
