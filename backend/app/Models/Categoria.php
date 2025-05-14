<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    // Especificar o nome da tabela explicitamente (opcional, mas recomendado para consistência)
    protected $table = 'categorias';

    // Campos preenchíveis em massa
    protected $fillable = ['nome', 'tipo'];

    // Relação com transações - importante para garantir que o Eloquent saiba como relacionar as duas tabelas
    public function transacoes()
    {
        // Usando o nome correto da tabela 'transacaos'
        return $this->hasMany(Transacao::class);
    }
}