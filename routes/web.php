<?php

use Illuminate\Support\Facades\Route;

Route::view('/{path?}', 'app')
    ->where('path', '.*')
    ->name('react');


Route::fallback(function () {
    return response()->view('react-500', [], 500);
});