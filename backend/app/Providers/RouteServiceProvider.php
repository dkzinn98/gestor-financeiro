<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    protected $namespace = 'App\Http\Controllers'; // Namespace do seu controller

    public const HOME = '/home'; // Caminho padrão

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            $this->mapApiRoutes();
            $this->mapWebRoutes();
            $this->mapTestRoutes(); // Mantemos a rota de teste também
        });
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting()
    {
        // Se precisar configurar rate limiting, faça aqui
    }

    /**
     * Define as rotas da API
     */
    protected function mapApiRoutes()
    {
        Route::middleware('api')
            ->prefix('api')
            ->namespace($this->namespace)
            // Desabilita a verificação CSRF para todas as rotas da API
            ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
            ->group(base_path('routes/api.php'));
    }

    /**
     * Define as rotas web
     */
    protected function mapWebRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/web.php'));
    }

    /**
     * Define as rotas de teste sem verificação CSRF
     */
    protected function mapTestRoutes()
    {
        // Verifica se o arquivo test.php existe antes de tentar carregá-lo
        if (file_exists(base_path('routes/test.php'))) {
            Route::middleware('api')
                ->prefix('test')
                ->namespace($this->namespace)
                ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
                ->group(base_path('routes/test.php'));
        }
    }
}