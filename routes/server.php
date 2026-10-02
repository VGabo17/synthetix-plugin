<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Extensions\SynthetixPlugins\PluginController;

Route::post('/plugins/install', [PluginController::class, 'install']);
