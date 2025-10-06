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

    /* ----------------------- LISTAR ----------------------- */
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

    /* ----------------------- CRIAR ------------------------ */
    public function store(Request $request)
    {
        try {
            Log::info('POST /transacoes - payload original', $request->all());

            // (1) Mapear EN → PT *antes* de validar
            $in = $this->mapFrontToBackend($request->all());
            // normalizar tipo para o padrão do banco (MAIÚSCULO)
            if (!empty($in['tipo'])) {
                $in['tipo'] = strtoupper($in['tipo']); // RECEITA | DESPESA
            }
            // força categoria_id numérico
            if (isset($in['categoria_id'])) {
                $in['categoria_id'] = (int) $in['categoria_id'];
            }
            // define data padrão
            if (empty($in['data_transacao'])) {
                $in['data_transacao'] = now()->toDateString();
            }
            // injeta no request para a validação usar os campos corretos
            $request->replace($in);

            // (2) Validar já com campos mapeados
            $validated = $request->validate([
                'descricao'      => ['required','string','max:255'],
                'valor'          => ['required','numeric'],
                'tipo'           => ['required', Rule::in(['RECEITA','DESPESA'])],
                'categoria_id'   => [
                    'required','integer',
                    Rule::exists('categorias','id')->where(function ($q) use ($request) {
                        $q->where('user_id', Auth::id());
                        // garante que a categoria bate com o tipo da transação
                        if ($request->filled('tipo')) {
                            $q->where('tipo', $request->input('tipo'));
                        }
                    }),
                ],
                'data_transacao' => ['nullable','date'],
            ]);

            $dados = array_merge($validated, ['user_id' => Auth::id()]);

            Log::info('POST /transacoes - payload normalizado', $dados);

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

    /* ----------------------- MOSTRAR ---------------------- */
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

    /* ----------------------- ATUALIZAR -------------------- */
    public function update(Request $request, $id)
    {
        try {
            $transacao = Transacao::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$transacao) {
                return response()->json(['message' => 'Transação não encontrada'], 404);
            }

            Log::info('PUT /transacoes/'.$id.' - payload original', $request->all());

            // (1) Mapear EN → PT antes de validar
            $in = $this->mapFrontToBackend($request->all());

            // normalizações
            if (isset($in['tipo'])) {
                $in['tipo'] = strtoupper($in['tipo']); // RECEITA|DESPESA
            }
            if (isset($in['categoria_id'])) {
                $in['categoria_id'] = (int) $in['categoria_id'];
            }
            if (isset($in['data_transacao']) && !$in['data_transacao']) {
                unset($in['data_transacao']); // evita date vazio
            }

            $request->replace($in);

            // tipo a considerar na validação da categoria:
            $tipoParaCategoria = $request->input('tipo') ?: $transacao->tipo;

            // (2) Validar com campos mapeados
            $validated = $request->validate([
                'descricao'      => ['sometimes','string','max:255'],
                'valor'          => ['sometimes','numeric'],
                'tipo'           => ['sometimes', Rule::in(['RECEITA','DESPESA'])],
                'categoria_id'   => [
                    'sometimes','integer',
                    Rule::exists('categorias','id')->where(function ($q) use ($tipoParaCategoria) {
                        $q->where('user_id', Auth::id());
                        if ($tipoParaCategoria) {
                            $q->where('tipo', $tipoParaCategoria);
                        }
                    }),
                ],
                'data_transacao' => ['sometimes','date'],
            ]);

            Log::info('PUT /transacoes/'.$id.' - payload normalizado', $validated);

            $transacao->fill($validated)->save();

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

    /* ----------------------- DELETAR ---------------------- */
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

    /* ----------------------- DASHBOARD -------------------- */
    public function dashboard()
    {
        try {
            $receitas = Transacao::where('user_id', Auth::id())
                ->where('tipo', 'RECEITA')
                ->sum('valor');

            $despesas = Transacao::where('user_id', Auth::id())
                ->where('tipo', 'DESPESA')
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

    /* ----------------------- RECENTES --------------------- */
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

    /* ----------------------- HELPERS ---------------------- */

    /**
     * Converte payload do front (EN) para os campos do backend (PT).
     * Mantém PT se já vier assim.
     */
    private function mapFrontToBackend(array $data): array
    {
        $out = $data;

        if (array_key_exists('description', $data) && !isset($out['descricao'])) {
            $out['descricao'] = $data['description'];
        }
        if (array_key_exists('amount', $data) && !isset($out['valor'])) {
            $out['valor'] = $data['amount'];
        }
        if (array_key_exists('type', $data) && !isset($out['tipo'])) {
            $out['tipo'] = $data['type']; // será upper mais adiante
        }
        if (array_key_exists('category_id', $data) && !isset($out['categoria_id'])) {
            $out['categoria_id'] = $data['category_id'];
        }
        if (array_key_exists('transaction_date', $data) && !isset($out['data_transacao'])) {
            $out['data_transacao'] = $data['transaction_date'];
        }

        return $out;
    }
}
