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
            $dados = $request->all();
            $dados['user_id'] = Auth::id();
            
            $transacao = Transacao::create($dados);
            
            return response()->json($transacao, 201);
        } catch (\Exception $e) {
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
            
            $transacao->update($request->all());
            
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