<?php

namespace App\Support;

use App\Models\Categoria;

class EnsureDefaultCategories
{
    public const DEFAULTS = [
        ['nome' => 'RECEITA', 'tipo' => 'receita', 'descricao' => 'Categoria padrão de receitas'],
        ['nome' => 'DESPESA', 'tipo' => 'despesa', 'descricao' => 'Categoria padrão de despesas'],
    ];

    public static function forUser(int $userId): void
    {
        foreach (self::DEFAULTS as $def) {
            Categoria::firstOrCreate(
                ['user_id' => $userId, 'nome' => $def['nome']],
                ['tipo' => $def['tipo'], 'descricao' => $def['descricao']]
            );
        }
    }
}
