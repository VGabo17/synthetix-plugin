<?php

namespace Pterodactyl\Http\Controllers\Extensions\SynthetixPlugins;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Server;

class PluginController extends Controller
{
    public function install(Request $request, string $serverUuid)
    {
        $request->validate(['project_id' => 'required|string']);

        $server = Server::where('uuid', $serverUuid)->firstOrFail();
        $projectId = $request->input('project_id');

        $response = Http::get("https://api.modrinth.com/v2/project/{$projectId}/version");
        if ($response->failed()) {
            return response()->json(['error' => 'No se pudo conectar con Modrinth'], 500);
        }

        $versions = $response->json();
        $latestVersion = $versions[0] ?? null;

        if (!$latestVersion || empty($latestVersion['files'])) {
            return response()->json(['error' => 'No hay archivos disponibles'], 404);
        }

        $fileData = $latestVersion['files'][0];
        $fileUrl = $fileData['url'];
        $fileName = $fileData['filename'];

        $jarContent = Http::get($fileUrl)->body();

        $serverPath = "/var/lib/pterodactyl/volumes/{$server->uuid}/plugins/{$fileName}";

        if (!is_dir(dirname($serverPath))) {
            mkdir(dirname($serverPath), 0755, true);
        }

        file_put_contents($serverPath, $jarContent);

        return response()->json(['success' => true]);
    }
}
