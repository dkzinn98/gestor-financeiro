<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ImportSqlSeeder::class,
            CategoriaSeeder::class, // Adicione essa linha
        ]);
    }
}