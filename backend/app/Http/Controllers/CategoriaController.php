<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Busca apenas as categorias do usuário logado
            $categorias = Categoria::where('user_id', $request->user()->id)->get();
            
            // Registra informação no log
            Log::info('Categorias carregadas com sucesso para usuário ' . $request->user()->id . ': ' . $categorias->count());
            
            // Retorna as categorias como JSON
            return response()->json($categorias, 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao carregar categorias: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Erro ao carregar categorias',
                'error' => $e->getMessage()
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
            // Valida os dados recebidos
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'tipo' => 'required|string|in:despesa,receita'
            ]);
            
            // Adiciona o user_id do usuário logado
            $validated['user_id'] = $request->user()->id;
            
            // Cria a categoria
            $categoria = Categoria::create($validated);
            
            // Registra informação no log
            Log::info('Categoria criada com sucesso para usuário ' . $request->user()->id . ': ' . $categoria->id);
            
            // Retorna a categoria criada
            return response()->json($categoria, 201);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao criar categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Erro ao criar categoria',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        try {
            // Busca a categoria apenas se pertencer ao usuário logado
            $categoria = Categoria::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            // Retorna a categoria
            return response()->json($categoria, 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao buscar categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Categoria não encontrada ou não pertence ao usuário',
                'error' => $e->getMessage()
            ], 404);
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
            // Busca a categoria apenas se pertencer ao usuário logado
            $categoria = Categoria::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            // Valida os dados recebidos
            $validated = $request->validate([
                'nome' => 'string|max:255',
                'descricao' => 'nullable|string',
                'tipo' => 'string|in:despesa,receita'
            ]);
            
            // Atualiza a categoria
            $categoria->update($validated);
            
            // Registra informação no log
            Log::info('Categoria atualizada com sucesso para usuário ' . $request->user()->id . ': ' . $categoria->id);
            
            // Retorna a categoria atualizada
            return response()->json($categoria, 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao atualizar categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Erro ao atualizar categoria ou categoria não pertence ao usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        try {
            // Busca a categoria apenas se pertencer ao usuário logado
            $categoria = Categoria::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            // Exclui a categoria
            $categoria->delete();
            
            // Registra informação no log
            Log::info('Categoria excluída com sucesso para usuário ' . $request->user()->id . ': ' . $id);
            
            // Retorna sucesso
            return response()->json([
                'message' => 'Categoria excluída com sucesso'
            ], 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao excluir categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Erro ao excluir categoria ou categoria não pertence ao usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}