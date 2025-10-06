<?php

// app/Console/Commands/SeedDefaultCategories.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Support\EnsureDefaultCategories;

class SeedDefaultCategories extends Command
{
    protected $signature = 'categories:seed-defaults';
    protected $description = 'Garante categorias padrão RECEITA/DESPESA para todos os usuários';

    public function handle()
    {
        $this->info('Garantindo categorias padrão...');
        $bar = $this->output->createProgressBar(User::count());
        $bar->start();

        User::chunk(200, function ($users) use ($bar) {
            foreach ($users as $u) {
                EnsureDefaultCategories::forUser($u->id);
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info('Concluído!');
        return Command::SUCCESS;
    }
}
