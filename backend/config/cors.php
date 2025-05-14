<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*'],  // Todas as rotas

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],  // Métodos HTTP permitidos

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],  // Padrões de URL (regex)

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-TOKEN'],  // Cabeçalhos permitidos

    'exposed_headers' => [],  // Cabeçalhos expostos

    'max_age' => 3600,  // 1 hora de cache para preflight

    'supports_credentials' => true,  // Necessário para autenticação com cookies/sessões

];