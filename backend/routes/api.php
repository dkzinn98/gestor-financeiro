<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransacaoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui é onde você pode registrar rotas de API para sua aplicação.
|
*/

// Rota para testar a API
Route::get('teste', function () {
    return response()->json(['message' => 'Rota da API funcional! 👨🏻‍💻']);
});

// Rota de teste para CORS
Route::get('teste-cors', function() {
    return response()->json(['message' => 'CORS está funcionando!']);
});

// Rotas públicas (sem autenticação)
Route::post('register', [AuthController::class, 'register'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
Route::post('login', [AuthController::class, 'login'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Grupo de rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {
    // Rotas de autenticação que requerem login
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    // Rota para obter usuário atual
    Route::get('user', function (Request $request) {
        return $request->user();
    });

    // IMPORTANTE: Rotas específicas ANTES do apiResource
    Route::get('transacoes/dashboard', [TransacaoController::class, 'summary']);
    Route::get('transacoes/recent', [TransacaoController::class, 'recent']);
    
    // Rota de recursos para transações (CRUD completo)
    Route::apiResource('transacoes', TransacaoController::class);
    
    // Adicione aqui outras rotas que requerem autenticação
});

// Rotas de categoria - publicamente acessíveis
Route::get('categorias', [CategoriaController::class, 'index']);

// Se precisar de operações de CRUD completas para categorias, descomente:
// Route::apiResource('categorias', CategoriaController::class);