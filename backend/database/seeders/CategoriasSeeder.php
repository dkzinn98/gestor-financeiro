<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriasSeeder extends Seeder
{
    public function run()
    {
        // Categorias de receita
        Categoria::create(['nome' => 'Salário', 'tipo' => 'receita']);
        Categoria::create(['nome' => 'Investimentos', 'tipo' => 'receita']);
        Categoria::create(['nome' => 'Freelance', 'tipo' => 'receita']);
        Categoria::create(['nome' => 'Outros', 'tipo' => 'receita']);
        
        // Categorias de despesa
        Categoria::create(['nome' => 'Alimentação', 'tipo' => 'despesa']);
        Categoria::create(['nome' => 'Moradia', 'tipo' => 'despesa']);
        Categoria::create(['nome' => 'Transporte', 'tipo' => 'despesa']);
        Categoria::create(['nome' => 'Saúde', 'tipo' => 'despesa']);
        Categoria::create(['nome' => 'Educação', 'tipo' => 'despesa']);
        Categoria::create(['nome' => 'Lazer', 'tipo' => 'despesa']);
        Categoria::create(['nome' => 'Outros', 'tipo' => 'despesa']);
    }
}