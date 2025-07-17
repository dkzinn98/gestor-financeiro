<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Lista de domínios permitidos
        $allowedOrigins = [
            'https://gestor-financeiro-dk.vercel.app',
            'http://localhost:4200',
            'http://localhost:8000',
            'http://localhost:3000',
            'http://127.0.0.1:4200',
            'http://127.0.0.1:8000',
            'http://127.0.0.1:3000'
        ];
        
        $origin = $request->header('Origin');
        
        // Se a origem não estiver definida ou não for permitida, use null para não permitir CORS
        $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : null;
        
        // Se for uma requisição OPTIONS (preflight), retorna resposta rápida com cabeçalhos CORS
        if ($request->isMethod('OPTIONS')) {
            $response = new Response('', 200);
            
            if ($allowOrigin) {
                // Define todos os cabeçalhos CORS para resposta preflight
                $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN, Accept, Origin');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
                $response->headers->set('Access-Control-Max-Age', '86400'); // 24 horas
            }
            
            return $response;
        }
        
        // Para requisições não-OPTIONS, continua com o fluxo normal
        $response = $next($request);
        
        // Aplica os cabeçalhos CORS à resposta
        if ($allowOrigin) {
            $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN, Accept, Origin');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            
            // Cache para navegadores
            $response->headers->set('Vary', 'Origin');
        }
        
        return $response;
    }
}