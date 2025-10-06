<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\TransacaoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('teste', fn () => response()->json(['message' => 'Rota da API funcional! 👨🏻‍💻']));
Route::get('teste-cors', fn () => response()->json(['message' => 'CORS está funcionando!']));

// Rotas públicas (sem autenticação)
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

// Rotas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Auth utilitários
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me',   fn (Request $r) => $r->user());
    Route::get('user', fn (Request $r) => $r->user()); // alias

    // ================= CATEGORIAS =================
    Route::get('categorias',         [CategoriaController::class, 'index']);
    Route::post('categorias',        [CategoriaController::class, 'store']);
    Route::get('categorias/{id}',    [CategoriaController::class, 'show']);
    Route::put('categorias/{id}',    [CategoriaController::class, 'update']);
    Route::delete('categorias/{id}', [CategoriaController::class, 'destroy']);

    // ================= TRANSAÇÕES =================
    Route::get('transacoes',             [TransacaoController::class, 'index']);
    Route::post('transacoes',            [TransacaoController::class, 'store']);
    Route::get('transacoes/dashboard',   [TransacaoController::class, 'dashboard']);
    Route::get('transacoes/recent',      [TransacaoController::class, 'recent']);
    Route::get('transacoes/{id}',        [TransacaoController::class, 'show']);
    Route::put('transacoes/{id}',        [TransacaoController::class, 'update']);
    Route::delete('transacoes/{id}',     [TransacaoController::class, 'destroy']);
});
