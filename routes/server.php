<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Extensions\SynthetixPlugins\PluginController;

Route::post('/plugins/install', [PluginController::class, 'install']);
