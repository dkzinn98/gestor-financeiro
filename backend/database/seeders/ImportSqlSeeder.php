<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportSqlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ajustar o caminho para a pasta correta
        $sqlPath = 'C:/Users/adaptzera/Documents/desafio uiTec/banco/script.sql';
        
        if (!file_exists($sqlPath)) {
            $this->command->error("Arquivo SQL não encontrado em: $sqlPath");
            return;
        }
        
        $sql = file_get_contents($sqlPath);
        
        // Executar o script SQL diretamente
        DB::unprepared($sql);
        
        $this->command->info('Script SQL executado com sucesso!');
    }
}