import React, { useState } from 'react';
import { ServerContext } from '@/state/server';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import Spinner from '@/components/elements/Spinner';
import http from '@/api/http';

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data?.uuid);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [installingId, setInstallingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&facets=[[["project_type:plugin"]]]`);
            const data = await res.json();
            setResults(data.hits || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = (projectId: string, projectName: string) => {
        setInstallingId(projectId);
        setMessage('');

        http.post(`/api/client/servers/${uuid}/plugins/install`, { project_id: projectId })
            .then(() => {
                setMessage(`¡${projectName} se instaló correctamente!`);
            })
            .catch(() => {
                setMessage(`Error al instalar ${projectName}.`);
            })
            .finally(() => setInstallingId(null));
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-lg text-neutral-100">
            <h2 className="text-2xl font-bold mb-2">Instalador de Plugins</h2>
            <p className="text-neutral-400 mb-6">Busca y añade plugins de Modrinth con un solo clic.</p>

            {message && <div className="mb-4 p-3 bg-neutral-800 rounded text-green-400">{message}</div>}

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <Input 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="Ej. WorldEdit, LuckPerms..." 
                />
                <Button type="submit">Buscar</Button>
            </form>

            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="grid gap-4">
                    {results.map(plugin => (
                        <div key={plugin.project_id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                            <div className="flex items-center gap-4">
                                {plugin.icon_url && <img src={plugin.icon_url} alt="" className="w-12 h-12 rounded" />}
                                <div>
                                    <h3 className="font-bold">{plugin.title}</h3>
                                    <p className="text-sm text-neutral-400 line-clamp-1">{plugin.description}</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handleInstall(plugin.project_id, plugin.title)}
                                disabled={installingId === plugin.project_id}
                            >
                                {installingId === plugin.project_id ? <Spinner size="small" /> : 'Instalar'}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
