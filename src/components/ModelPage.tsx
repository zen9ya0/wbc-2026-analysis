import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, RefreshCw } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

export interface MetaStatus {
    model_version: string;
    data_version: string;
    generated_at: string;
}

export function ModelPage() {
    const { t } = useTranslation();
    const [meta, setMeta] = useState<MetaStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const load = async () => {
            const result = await fetchWithFallback<MetaStatus>(`${apiBase}/v1/meta/status`, 'meta');
            if (result.data) setMeta(result.data);
            if (result.error) setError(result.error);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="animate-spin w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-3 text-brand-navy">
                <BarChart3 size={32} />
                <h2 className="text-2xl font-black">{t('model.title') ?? 'Model & Data Version'}</h2>
            </div>
            {error && !meta && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
                    <p>{error}</p>
                </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('model.model_version') ?? 'Model version'}
                        </dt>
                        <dd className="mt-1 font-mono font-bold text-brand-navy">
                            {meta?.model_version ?? '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('model.data_version') ?? 'Data version'}
                        </dt>
                        <dd className="mt-1 font-mono font-bold text-brand-navy">
                            {meta?.data_version ?? '—'}
                        </dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('model.generated_at') ?? 'Last updated (UTC)'}
                        </dt>
                        <dd className="mt-1 font-mono text-slate-700">
                            {meta?.generated_at
                                ? new Date(meta.generated_at).toLocaleString(undefined, { timeZone: 'UTC' })
                                : '—'}
                        </dd>
                    </div>
                </dl>
            </div>
            <p className="text-slate-600 text-sm">
                {t('model.description') ??
                    'Probabilities and routes are from a Monte Carlo simulation. This page shows the version and data timestamp returned by the API.'}
            </p>
        </div>
    );
}
