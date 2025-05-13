<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Construtor para aplicar middleware auth:sanctum apenas nas rotas que precisam
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['logout']);
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        Log::info('Tentativa de login recebida', ['email' => $request->email]);
        
        try {
            // Validação dos dados de entrada
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Tentativa de autenticação
            if (Auth::attempt($request->only('email', 'password'))) {
                // Autenticação bem-sucedida
                $user = Auth::user();
                // Revoga tokens anteriores para manter apenas um token ativo por usuário
                $user->tokens()->delete();
                // Cria um novo token
                $token = $user->createToken('auth_token')->plainTextToken;

                Log::info('Login bem-sucedido', ['user_id' => $user->id]);
                
                return response()->json([
                    'message' => 'Login realizado com sucesso!',
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => $user,
                ], 200);
            }

            // Autenticação falhou
            Log::warning('Falha no login - credenciais inválidas', ['email' => $request->email]);
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        } catch (ValidationException $e) {
            // Captura erros de validação
            Log::warning('Falha no login - validação', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Captura outros erros
            Log::error('Erro no login', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao realizar login: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle a registration request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Log completo da requisição para depuração
        Log::info('Requisição de registro recebida', [
            'headers' => $request->headers->all(),
            'data' => $request->except(['password', 'password_confirmation'])
        ]);
        
        try {
            // Validação dos dados de entrada para o registro
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',  // Mantido 6 caracteres para facilitar testes
            ]);

            if ($validator->fails()) {
                Log::warning('Validação falhou no registro', ['errors' => $validator->errors()->toArray()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Cria um novo usuário
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Cria um token de autenticação para o novo usuário
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Usuário registrado com sucesso', ['user_id' => $user->id]);
            
            return response()->json([
                'message' => 'Usuário registrado com sucesso!',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 201);
        } catch (ValidationException $e) {
            Log::warning('Falha no registro - validação', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Erro no registro', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao registrar usuário: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle a logout request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Logs para o logout
            Log::info('Requisição de logout recebida', ['user_id' => $request->user()->id]);
            
            // Revoga o token do usuário atual
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => 'Logout realizado com sucesso!'], 200);
        } catch (\Exception $e) {
            Log::error('Erro no logout', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao fazer logout: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        try {
            return response()->json($request->user());
        } catch (\Exception $e) {
            Log::error('Erro ao obter usuário autenticado', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao obter usuário: ' . $e->getMessage()], 500);
        }
    }
}