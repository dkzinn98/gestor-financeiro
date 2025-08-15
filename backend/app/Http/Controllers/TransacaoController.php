<?php

namespace App\Http\Controllers;

use App\Models\Transacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Debug: Ver dados originais
            \Log::info('Dados originais recebidos:', $request->all());
            
            $dados = $request->all();
            
            // Mapear campos inglês para português
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
            
            // Remover campos desnecessários
            unset($dados['transaction_date']);
            
            // Adicionar user_id do usuário autenticado
            $dados['user_id'] = Auth::id();
            
            // Debug: Ver dados após mapeamento
            \Log::info('Dados após mapeamento:', $dados);
            
            $transacao = Transacao::create($dados);
            
            return response()->json($transacao, 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar transação:', ['error' => $e->getMessage()]);
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
            
            $dados = $request->all();
            
            // Mapear campos inglês para português
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
            
            // Remover campos desnecessários
            unset($dados['transaction_date']);
            
            $transacao->update($dados);
            
            return response()->json($transacao);
        } catch (\Exception $e) {
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
                'totalIncome' => $receitas,
                'totalExpense' => $despesas,
                'balance' => $saldo
            ]);
        } catch (\Exception $e) {
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
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}