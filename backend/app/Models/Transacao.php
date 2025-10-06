<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class Transacao extends Model
{
    use HasFactory;

    protected $table = 'transacoes';

    protected $fillable = [
        'descricao',
        'valor',
        'tipo',           // 'receita' | 'despesa'
        'categoria_id',
        'user_id',
        'data_transacao',
    ];

    protected $casts = [
        'valor'          => 'decimal:2',
        'data_transacao' => 'date', // usa Y-m-d por padrão
    ];

    /** Relacionamentos */
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /** ===== Escopos úteis ===== */

    /** Filtra pelas transações do usuário */
    public function scopeDoUsuario(Builder $query, ?int $userId = null): Builder
    {
        return $query->where('user_id', $userId ?? auth()->id());
    }

    /** Filtra por tipo: 'receita' ou 'despesa' */
    public function scopeDoTipo(Builder $query, ?string $tipo): Builder
    {
        return $tipo ? $query->where('tipo', $tipo) : $query;
    }

    /** Filtra por período (datas inclusive) */
    public function scopeEntreDatas(Builder $query, ?string $inicio, ?string $fim): Builder
    {
        if ($inicio) {
            $query->whereDate('data_transacao', '>=', Carbon::parse($inicio)->toDateString());
        }
        if ($fim) {
            $query->whereDate('data_transacao', '<=', Carbon::parse($fim)->toDateString());
        }
        return $query;
    }
}
