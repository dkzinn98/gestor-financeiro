<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Registre aqui seus comandos de console personalizados.
     */
    protected $commands = [
        \App\Console\Commands\SeedDefaultCategories::class,
    ];

    /**
     * Agendador (opcional).
     */
    protected function schedule(Schedule $schedule): void
    {
        // Ex.: rodar diariamente se quiser reforçar defaults para todos
        // $schedule->command('categories:seed-defaults')->daily();
    }

    /**
     * Bootstrap do kernel de console.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        // require base_path('routes/console.php');
    }
}
