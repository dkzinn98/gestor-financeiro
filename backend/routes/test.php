<?php

use Illuminate\Support\Facades\Route;

Route::post('test-csrf', function () {
    return response()->json(['message' => 'CSRF bypass test successful']);
});