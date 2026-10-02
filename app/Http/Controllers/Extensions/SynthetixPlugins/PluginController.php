<?php

namespace App\Http\Controllers\Extensions\SynthetixPlugins;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\Http;

class PluginController extends Controller
{
    public function install(Request $request, Server $server)
    {
        $request->validate([
            'project_id' => 'required|string',
        ]);

        $projectId = $request->input('project_id');

        $res = Http::get("https://api.modrinth.com/v2/project/{$projectId}/version");
        if ($res->failed()) {
            return response()->json(['error' => 'No se pudo conectar con Modrinth'], 400);
        }

        $versions = $res->json();
        $primaryFile = $versions[0]['files'][0] ?? null;

        if (!$primaryFile) {
            return response()->json(['error' => 'Archivo .jar no encontrado'], 400);
        }

        $fileName = $primaryFile['filename'];

        return response()->json([
            'success' => true,
            'message' => "Plugin {$fileName} procesado con éxito."
        ]);
    }
}
