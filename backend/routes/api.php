<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log; // ← para logs
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
Route::get('teste-cors', function () {
    return response()->json(['message' => 'CORS está funcionando!']);
});

// Rotas públicas (sem autenticação)
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

// Grupo de rotas protegidas por autenticação (Sanctum - Bearer)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('logout', [AuthController::class, 'logout']);

    // Perfil atual
    Route::get('me', fn (Request $request) => $request->user());
    Route::get('user', fn (Request $request) => $request->user()); // alias

    // ============== CATEGORIAS - CRUD ==============
    Route::get('categorias',         [CategoriaController::class, 'index']);
    Route::post('categorias',        [CategoriaController::class, 'store']);
    Route::get('categorias/{id}',    [CategoriaController::class, 'show']);
    Route::put('categorias/{id}',    [CategoriaController::class, 'update']);
    Route::delete('categorias/{id}', [CategoriaController::class, 'destroy']);

    // ============== TRANSAÇÕES (versão simplificada) ==============

    // Listar todas as transações do usuário
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

    // Dashboard / resumo
    Route::get('transacoes/dashboard', function (Request $request) {
        try {
            $receitas = \App\Models\Transacao::where('user_id', $request->user()->id)
                ->where('tipo', 'receita')
                ->sum('valor');

            $despesas = \App\Models\Transacao::where('user_id', $request->user()->id)
                ->where('tipo', 'despesa')
                ->sum('valor');

            return response()->json([
                'totalIncome'  => (float) $receitas,
                'totalExpense' => (float) $despesas,
                'balance'      => (float) ($receitas - $despesas),
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
            // validação leve (ajuste se quiser mais rígida)
            $validated = $request->validate([
                'description'       => 'required|string|max:255',
                'amount'            => 'required|numeric',
                'type'              => 'required|in:receita,despesa',
                'category_id'       => 'nullable|integer|exists:categorias,id',
                'transaction_date'  => 'nullable|date', // ← opcional
            ]);

            $dados = $validated;

            // MAPEAMENTO INGLÊS → PT
            if (isset($dados['description']))      { $dados['descricao']       = $dados['description']; unset($dados['description']); }
            if (isset($dados['amount']))           { $dados['valor']           = $dados['amount'];      unset($dados['amount']); }
            if (isset($dados['type']))             { $dados['tipo']            = $dados['type'];        unset($dados['type']); }
            if (isset($dados['category_id']))      { $dados['categoria_id']    = $dados['category_id']; unset($dados['category_id']); }
            if (isset($dados['transaction_date'])) { $dados['data_transacao']  = $dados['transaction_date']; unset($dados['transaction_date']); }

            // default (se não vier data)
            if (empty($dados['data_transacao'])) {
                $dados['data_transacao'] = now()->toDateString();
            }

            $dados['user_id'] = $request->user()->id;

            Log::info('Criando transação', $dados);

            $transacao = \App\Models\Transacao::create($dados);

            return response()->json($transacao, 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json(['message' => 'Dados inválidos', 'errors' => $ve->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Erro ao criar transação', ['error' => $e->getMessage()]);
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

            // aceita tanto PT quanto EN
            $dados = $request->all();
            if (isset($dados['description']))      { $dados['descricao']       = $dados['description']; unset($dados['description']); }
            if (isset($dados['amount']))           { $dados['valor']           = $dados['amount'];      unset($dados['amount']); }
            if (isset($dados['type']))             { $dados['tipo']            = $dados['type'];        unset($dados['type']); }
            if (isset($dados['category_id']))      { $dados['categoria_id']    = $dados['category_id']; unset($dados['category_id']); }
            if (isset($dados['transaction_date'])) { $dados['data_transacao']  = $dados['transaction_date']; unset($dados['transaction_date']); }

            $transacao->update($dados);

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