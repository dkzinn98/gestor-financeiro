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
    public function index()
    {
        try {
            // Busca todas as categorias
            $categorias = Categoria::all();
            
            // Registra informação no log
            Log::info('Categorias carregadas com sucesso: ' . $categorias->count());
            
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
            
            // Cria a categoria
            $categoria = Categoria::create($validated);
            
            // Registra informação no log
            Log::info('Categoria criada com sucesso: ' . $categoria->id);
            
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
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            // Busca a categoria
            $categoria = Categoria::findOrFail($id);
            
            // Retorna a categoria
            return response()->json($categoria, 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao buscar categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Categoria não encontrada',
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
            // Busca a categoria
            $categoria = Categoria::findOrFail($id);
            
            // Valida os dados recebidos
            $validated = $request->validate([
                'nome' => 'string|max:255',
                'descricao' => 'nullable|string',
                'tipo' => 'string|in:despesa,receita'
            ]);
            
            // Atualiza a categoria
            $categoria->update($validated);
            
            // Registra informação no log
            Log::info('Categoria atualizada com sucesso: ' . $categoria->id);
            
            // Retorna a categoria atualizada
            return response()->json($categoria, 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao atualizar categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Erro ao atualizar categoria',
                'error' => $e->getMessage()
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
            // Busca a categoria
            $categoria = Categoria::findOrFail($id);
            
            // Exclui a categoria
            $categoria->delete();
            
            // Registra informação no log
            Log::info('Categoria excluída com sucesso: ' . $id);
            
            // Retorna sucesso
            return response()->json([
                'message' => 'Categoria excluída com sucesso'
            ], 200);
        } catch (\Exception $e) {
            // Registra erro no log
            Log::error('Erro ao excluir categoria: ' . $e->getMessage());
            
            // Retorna erro
            return response()->json([
                'message' => 'Erro ao excluir categoria',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}