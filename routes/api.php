<?php

use App\Http\Controllers\CityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/map', [CityController::class, 'map']);
Route::post('/city', [CityController::class, 'city']);
Route::post('/weather', [CityController::class, 'weather']);
Route::post('/weather_translate', [CityController::class, 'weather_translate']);
