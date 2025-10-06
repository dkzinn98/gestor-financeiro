<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Comandos de console registrados manualmente (opcional).
     * Observação: como também fazemos $this->load(__DIR__.'/Commands'),
     * os comandos dentro de app/Console/Commands serão descobertos automaticamente.
     */
    protected $commands = [
        \App\Console\Commands\SeedDefaultCategories::class,
    ];

    /**
     * Defina a agenda de comandos (opcional).
     */
    protected function schedule(Schedule $schedule): void
    {
        // Exemplo: reforçar categorias padrão diariamente (se desejar)
        // $schedule->command('categories:seed-defaults')->daily();
    }

    /**
     * Registra os comandos do aplicativo.
     */
    protected function commands(): void
    {
        // Carrega todos os comandos em app/Console/Commands
        $this->load(__DIR__ . '/Commands');

        // Mantém a rota de console padrão do Laravel
        require base_path('routes/console.php');
    }
}
