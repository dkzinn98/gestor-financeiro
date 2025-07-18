<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
|
*/

// Rota padrão do Laravel
Route::get('/', function () {
    return view('welcome');
});

// Rota de login nomeada (para resolver o erro "Route [login] not defined")
Route::get('/login', function () {
    return response()->json([
        'message' => 'Please login via POST to /api/login',
        'login_url' => '/api/login'
    ], 401);
})->name('login');

// Remova as rotas de autenticação daqui e deixe apenas a rota padrão
// Todas as rotas de autenticação devem estar no arquivo api.php