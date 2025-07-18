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

// Rotas de categoria - publicamente acessíveis
Route::get('categorias', [CategoriaController::class, 'index'])
     ->name('api.categorias.index');

// Grupo de rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {
    // Rotas de autenticação que requerem login
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    // Rota para obter usuário atual
    Route::get('user', function (Request $request) {
        return $request->user();
    });

    // ROTAS DE TRANSAÇÕES - VERSÃO SIMPLIFICADA QUE FUNCIONA
    
    // Listar todas as transações
    Route::get('transacoes', function (Request $request) {
        try {
            $transacoes = \App\Models\Transacao::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($transacoes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Dashboard/resumo
    Route::get('transacoes/dashboard', function (Request $request) {
        try {
            $receitas = \App\Models\Transacao::where('user_id', $request->user()->id)
                ->where('tipo', 'receita')
                ->sum('valor');
            
            $despesas = \App\Models\Transacao::where('user_id', $request->user()->id)
                ->where('tipo', 'despesa')
                ->sum('valor');
            
            return response()->json([
                'totalIncome' => (float) $receitas,
                'totalExpense' => (float) $despesas,
                'balance' => (float) ($receitas - $despesas)
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Transações recentes
    Route::get('transacoes/recent', function (Request $request) {
        try {
            $transacoes = \App\Models\Transacao::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
            return response()->json($transacoes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Criar transação
    Route::post('transacoes', function (Request $request) {
        try {
            $dados = $request->all();
            $dados['user_id'] = $request->user()->id;
            
            $transacao = \App\Models\Transacao::create($dados);
            
            return response()->json($transacao, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Mostrar transação específica
    Route::get('transacoes/{id}', function (Request $request, $id) {
        try {
            $transacao = \App\Models\Transacao::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->first();
                
            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }
            
            return response()->json($transacao);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Atualizar transação
    Route::put('transacoes/{id}', function (Request $request, $id) {
        try {
            $transacao = \App\Models\Transacao::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->first();
                
            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }
            
            $transacao->update($request->all());
            
            return response()->json($transacao);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Deletar transação
    Route::delete('transacoes/{id}', function (Request $request, $id) {
        try {
            $transacao = \App\Models\Transacao::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->first();
                
            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }
            
            $transacao->delete();
            
            return response()->json(['message' => 'Transação deletada com sucesso']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});