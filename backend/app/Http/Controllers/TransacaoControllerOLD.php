<?php

namespace App\Http\Controllers;

use App\Models\Transacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransacaoController extends Controller
{
    /**
     * Construtor para aplicar middleware de autenticação
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Retorna apenas as transações do usuário logado, com a categoria associada
            $transacoes = Transacao::with('categoria')
                ->where('user_id', Auth::id())
                ->orderBy('data_transacao', 'desc')
                ->get();
            
            return response()->json($transacoes);
        } catch (\Exception $e) {
            Log::error('Erro ao listar transações', [
                'user_id' => Auth::id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao listar transações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Validação dos dados de entrada
            $validator = Validator::make($request->all(), [
                'descricao' => 'required|string|max:255',
                'valor' => 'required|numeric',
                'tipo' => 'required|string|in:receita,despesa',
                'categoria_id' => 'required|exists:categorias,id',
                'data_transacao' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            // Prepara os dados da transação
            $dados = $request->all();
            // Adiciona o ID do usuário logado
            $dados['user_id'] = Auth::id();
            
            // Log dos dados antes de salvar
            Log::info('Dados para criação de transação:', $dados);
            
            // Cria a transação
            $transacao = Transacao::create($dados);
            
            Log::info('Transação criada com sucesso', [
                'user_id' => Auth::id(),
                'transacao_id' => $transacao->id,
                'transacao' => $transacao->toArray() // Log da transação completa
            ]);
            
            return response()->json($transacao, 201);
        } catch (\Exception $e) {
            Log::error('Erro ao criar transação', [
                'user_id' => Auth::id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao criar transação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            Log::info('Buscando transação por ID', [
                'user_id' => Auth::id(),
                'transacao_id' => $id
            ]);
            
            // Busca a transação do usuário logado
            $transacao = Transacao::with('categoria')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->first();
                
            if (!$transacao) {
                Log::warning('Transação não encontrada', [
                    'user_id' => Auth::id(),
                    'transacao_id' => $id
                ]);
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }
            
            Log::info('Transação encontrada', [
                'transacao' => $transacao->toArray()
            ]);
            
            return response()->json($transacao);
        } catch (\Exception $e) {
            Log::error('Erro ao buscar transação', [
                'user_id' => Auth::id(),
                'transacao_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao buscar transação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Validação dos dados de entrada
            $validator = Validator::make($request->all(), [
                'descricao' => 'sometimes|required|string|max:255',
                'valor' => 'sometimes|required|numeric',
                'tipo' => 'sometimes|required|string|in:receita,despesa',
                'categoria_id' => 'sometimes|required|exists:categorias,id',
                'data_transacao' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            // Busca a transação do usuário logado
            $transacao = Transacao::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();
                
            if (!$transacao) {
                Log::warning('Transação não encontrada para atualização', [
                    'user_id' => Auth::id(),
                    'transacao_id' => $id
                ]);
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }
            
            // Log dos dados antes da atualização
            Log::info('Dados para atualização de transação:', [
                'transacao_id' => $id,
                'dados_antigos' => $transacao->toArray(),
                'dados_novos' => $request->all()
            ]);
            
            // Atualiza a transação
            $transacao->update($request->all());
            
            Log::info('Transação atualizada com sucesso', [
                'user_id' => Auth::id(),
                'transacao_id' => $transacao->id,
                'transacao' => $transacao->toArray() // Log da transação completa
            ]);
            
            return response()->json($transacao);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar transação', [
                'user_id' => Auth::id(),
                'transacao_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao atualizar transação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            Log::info('Tentativa de exclusão de transação', [
                'user_id' => Auth::id(),
                'transacao_id' => $id
            ]);
            
            // Busca a transação do usuário logado
            $transacao = Transacao::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();
                
            if (!$transacao) {
                Log::warning('Transação não encontrada para exclusão', [
                    'user_id' => Auth::id(),
                    'transacao_id' => $id
                ]);
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }
            
            // Log da transação antes de excluir
            Log::info('Transação a ser excluída', [
                'transacao' => $transacao->toArray()
            ]);
            
            // Exclui a transação
            $transacao->delete();
            
            Log::info('Transação excluída com sucesso', [
                'user_id' => Auth::id(),
                'transacao_id' => $id
            ]);
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Erro ao excluir transação', [
                'user_id' => Auth::id(),
                'transacao_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao excluir transação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retorna um resumo financeiro do usuário logado
     * * @return \Illuminate\Http\JsonResponse
     */
    public function summary()
    {
        try {
            // Calcula o total de receitas
            $totalIncome = Transacao::where('user_id', Auth::id())
                ->where('tipo', 'receita')
                ->sum('valor');
            
            // Calcula o total de despesas
            $totalExpense = Transacao::where('user_id', Auth::id())
                ->where('tipo', 'despesa')
                ->sum('valor');
            
            // Adiciona logs para depuração
            Log::info('Valores para cálculo do balanço', [
                'user_id' => Auth::id(),
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
            ]);
            
            // Calcula o saldo
            $balance = $totalIncome - $totalExpense;
            
            $result = [
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
                'balance' => $balance
            ];
            
            Log::info('Resumo financeiro gerado', $result);
            
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar resumo financeiro', [
                'user_id' => Auth::id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao gerar resumo financeiro: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Retorna as transações mais recentes do usuário logado
     * * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recent(Request $request)
    {
        try {
            $limit = $request->query('limit', 5); // Padrão: 5 transações
            
            Log::info('Buscando transações recentes', [
                'user_id' => Auth::id(),
                'limit' => $limit
            ]);
            
            // Busca as transações mais recentes
            $transacoes = Transacao::with('categoria')
                ->where('user_id', Auth::id())
                ->orderBy('data_transacao', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();
                
            // Log das transações antes de processar
            Log::info('Transações recentes encontradas', [
                'count' => $transacoes->count(),
                'transacoes' => $transacoes->toArray()
            ]);
                
            // Adiciona o nome da categoria diretamente no objeto transação
            $transacoes->each(function ($transacao) {
                if ($transacao->categoria) {
                    $transacao->category_name = $transacao->categoria->nome;
                }
                
                // Garantir que o valor seja numérico
                if (is_string($transacao->valor)) {
                    $transacao->valor = (float)$transacao->valor;
                }
                
                // Campos adicionais para compatibilidade com frontend
                $transacao->description = $transacao->descricao;
                $transacao->amount = $transacao->valor;
                $transacao->type = $transacao->tipo;
                $transacao->transaction_date = $transacao->data_transacao;
            });
            
            // Log final das transações após processamento
            Log::info('Transações recentes processadas para retorno', [
                'transacoes' => $transacoes->toArray()
            ]);
            
            return response()->json($transacoes);
        } catch (\Exception $e) {
            Log::error('Erro ao buscar transações recentes', [
                'user_id' => Auth::id(),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao buscar transações recentes: ' . $e->getMessage()
            ], 500);
        }
    }
}