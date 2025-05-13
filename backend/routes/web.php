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

// Remova as rotas de autenticação daqui e deixe apenas a rota padrão
// Todas as rotas de autenticação devem estar no arquivo api.php