<?php

namespace App\Http\Controllers;

use App\Models\Transacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TransacaoController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        try {
            $transacoes = Transacao::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($transacoes);
        } catch (\Exception $e) {
            Log::error('Erro ao listar transações', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Payload original (store)', $request->all());

            // Aceita tanto EN quanto PT na validação
            $validated = $request->validate([
                // EN
                'description'      => 'required_without:descricao|string|max:255',
                'amount'           => 'required_without:valor|numeric',
                'type'             => ['required_without:tipo', Rule::in(['receita', 'despesa'])],
                'category_id'      => [
                    'nullable',
                    Rule::exists('categorias', 'id')->where(function ($q) {
                        $q->where('user_id', Auth::id());
                    }),
                ],
                'transaction_date' => 'nullable|date',

                // PT
                'descricao'        => 'required_without:description|string|max:255',
                'valor'            => 'required_without:amount|numeric',
                'tipo'             => ['required_without:type', Rule::in(['receita', 'despesa'])],
                'categoria_id'     => [
                    'nullable',
                    Rule::exists('categorias', 'id')->where(function ($q) {
                        $q->where('user_id', Auth::id());
                    }),
                ],
                'data_transacao'   => 'nullable|date',
            ]);

            // Normaliza EN → PT
            $dados = $validated;

            if (isset($dados['description'])) {
                $dados['descricao'] = $dados['description'];
                unset($dados['description']);
            }
            if (isset($dados['amount'])) {
                $dados['valor'] = $dados['amount'];
                unset($dados['amount']);
            }
            if (isset($dados['type'])) {
                $dados['tipo'] = $dados['type'];
                unset($dados['type']);
            }
            if (isset($dados['category_id'])) {
                $dados['categoria_id'] = $dados['category_id'];
                unset($dados['category_id']);
            }
            if (isset($dados['transaction_date'])) {
                $dados['data_transacao'] = $dados['transaction_date'];
                unset($dados['transaction_date']);
            }

            // Defaults
            $dados['user_id'] = Auth::id();
            if (empty($dados['data_transacao'])) {
                $dados['data_transacao'] = now()->toDateString();
            }

            Log::info('Payload normalizado (store)', $dados);

            $transacao = Transacao::create($dados);

            return response()->json($transacao, 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors'  => $ve->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erro ao criar transação', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $transacao = Transacao::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }

            return response()->json($transacao);
        } catch (\Exception $e) {
            Log::error('Erro ao exibir transação', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $transacao = Transacao::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }

            Log::info('Payload original (update)', ['id' => $id, 'payload' => $request->all()]);

            $validated = $request->validate([
                // EN
                'description'      => 'sometimes|string|max:255',
                'amount'           => 'sometimes|numeric',
                'type'             => ['sometimes', Rule::in(['receita', 'despesa'])],
                'category_id'      => [
                    'nullable',
                    Rule::exists('categorias', 'id')->where(function ($q) {
                        $q->where('user_id', Auth::id());
                    }),
                ],
                'transaction_date' => 'nullable|date',

                // PT
                'descricao'        => 'sometimes|string|max:255',
                'valor'            => 'sometimes|numeric',
                'tipo'             => ['sometimes', Rule::in(['receita', 'despesa'])],
                'categoria_id'     => [
                    'nullable',
                    Rule::exists('categorias', 'id')->where(function ($q) {
                        $q->where('user_id', Auth::id());
                    }),
                ],
                'data_transacao'   => 'nullable|date',
            ]);

            $dados = $validated;

            if (isset($dados['description'])) {
                $dados['descricao'] = $dados['description'];
                unset($dados['description']);
            }
            if (isset($dados['amount'])) {
                $dados['valor'] = $dados['amount'];
                unset($dados['amount']);
            }
            if (isset($dados['type'])) {
                $dados['tipo'] = $dados['type'];
                unset($dados['type']);
            }
            if (isset($dados['category_id'])) {
                $dados['categoria_id'] = $dados['category_id'];
                unset($dados['category_id']);
            }
            if (isset($dados['transaction_date'])) {
                $dados['data_transacao'] = $dados['transaction_date'];
                unset($dados['transaction_date']);
            }

            Log::info('Payload normalizado (update)', ['id' => $id, 'dados' => $dados]);

            $transacao->update($dados);

            return response()->json($transacao);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors'  => $ve->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar transação', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $transacao = Transacao::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }

            $transacao->delete();

            return response()->json(['message' => 'Transação deletada'], 200);
        } catch (\Exception $e) {
            Log::error('Erro ao deletar transação', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function dashboard()
    {
        try {
            $receitas = Transacao::where('user_id', Auth::id())
                ->where('tipo', 'receita')
                ->sum('valor');

            $despesas = Transacao::where('user_id', Auth::id())
                ->where('tipo', 'despesa')
                ->sum('valor');

            $saldo = $receitas - $despesas;

            return response()->json([
                'totalIncome'  => (float) $receitas,
                'totalExpense' => (float) $despesas,
                'balance'      => (float) $saldo,
            ]);
        } catch (\Exception $e) {
            Log::error('Erro no dashboard', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function recent()
    {
        try {
            $transacoes = Transacao::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json($transacoes);
        } catch (\Exception $e) {
            Log::error('Erro ao listar transações recentes', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
