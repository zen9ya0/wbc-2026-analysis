import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Navigation2, Trophy, AlertTriangle, Target, Loader2, AlertCircle } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

interface Team {
    id: string;
    name_zh: string;
    name_ja: string;
    name_en: string;
    group_id: string;
    p_advance?: number;
}

interface MustWinItem {
    team_id: string;
    opponent_id: string;
    group_id: string;
    description: string;
}

interface OtherResultItem {
    winner_id: string;
    loser_id: string;
    group_id: string;
    description: string;
}

interface RouteResponse {
    model_version: string;
    data_version: string;
    generated_at: string;
    team_id: string;
    group_id: string;
    mode: 'best_case' | 'worst_case';
    must_win: MustWinItem[];
    other_results: OtherResultItem[];
    route_probability: number;
    tiebreaker_risk: 'low' | 'medium' | 'high';
    sensitivity: { match: string; importance: string }[];
}

const FLAG_MAP: Record<string, string> = {
    'JPN': '🇯🇵', 'USA': '🇺🇸', 'PUR': '🇵🇷', 'CUB': '🇨🇺', 'CAN': '🇨🇦',
    'MEX': '🇲🇽', 'VEN': '🇻🇪', 'DOM': '🇩🇴', 'KOR': '🇰🇷', 'AUS': '🇦🇺',
    'ITA': '🇮🇹', 'NED': '🇳🇱', 'PAN': '🇵🇦', 'GBR': '🇬🇧', 'CZE': '🇨🇿',
    'ISR': '🇮🇱', 'COL': '🇨🇴', 'BRA': '🇧🇷', 'TPE': '🇹🇼', 'NIC': '🇳🇮'
};

export const Predict = () => {
    const { t, i18n } = useTranslation();
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [route, setRoute] = useState<RouteResponse | null>(null);
    const [routeMode, setRouteMode] = useState<'best_case' | 'worst_case' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

    useEffect(() => {
        const load = async () => {
            const result = await fetchWithFallback<Team[]>(`${apiBase}/v1/teams`, 'teams');
            if (result.data) {
                const data = result.data.sort((a, b) => (b.p_advance ?? 0) - (a.p_advance ?? 0));
                setTeams(data);
                if (data.length && !selectedTeamId) setSelectedTeamId(data[0].id);
            }
            if (result.error) setError(t('predict.api_error'));
            setFromCache(result.fromCache);
            setLastUpdated(result.last_updated);
            setLoadingTeams(false);
        };
        load();
    }, [apiBase]);

    const getTeamName = (team: Team) => {
        if (i18n.language === 'ja') return team.name_ja;
        if (i18n.language === 'en') return team.name_en;
        return team.name_zh;
    };

    const fetchRoute = async (mode: 'best_case' | 'worst_case') => {
        if (!selectedTeamId) return;
        setError(null);
        setLoadingRoute(true);
        setRoute(null);
        setRouteMode(mode);
        try {
            const res = await axios.post<RouteResponse>(`${apiBase}/v1/predict/route`, {
                team_id: selectedTeamId,
                mode,
                n_simulations: 15000,
            });
            setRoute(res.data);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.status === 429
                ? t('predict.rate_limit')
                : t('predict.api_error');
            setError(msg);
        } finally {
            setLoadingRoute(false);
        }
    };

    if (loadingTeams) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-slate-400">
                {t('common.loading')}
            </div>
        );
    }

    const selectedTeam = teams.find((t) => t.id === selectedTeamId);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {fromCache && lastUpdated && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertCircle size={20} />
                    <div>
                        <p className="font-medium">{t('common.cached_notice')}</p>
                        <p className="text-sm opacity-90">{t('common.last_updated')}: {new Date(lastUpdated).toLocaleString()}</p>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t('predict.select_team')}
                    </label>
                    <select
                        value={selectedTeamId}
                        onChange={(e) => { setSelectedTeamId(e.target.value); setRoute(null); setRouteMode(null); }}
                        className="w-full sm:w-72 px-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-brand-navy focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
                    >
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {FLAG_MAP[team.id] || '🚩'} {getTeamName(team)} (Group {team.group_id})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => fetchRoute('best_case')}
                        disabled={loadingRoute || !selectedTeamId}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/25 hover:bg-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loadingRoute && routeMode === 'best_case' ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Target size={20} />
                        )}
                        {t('predict.best_case')}
                    </button>
                    <button
                        onClick={() => fetchRoute('worst_case')}
                        disabled={loadingRoute || !selectedTeamId}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-700 text-white font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loadingRoute && routeMode === 'worst_case' ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Navigation2 size={20} />
                        )}
                        {t('predict.worst_case')}
                    </button>
                </div>
            </div>

            {selectedTeam && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-100"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{FLAG_MAP[selectedTeam.id] || '🚩'}</span>
                        <div>
                            <div className="font-black text-brand-navy text-lg">{getTeamName(selectedTeam)}</div>
                            <div className="text-sm text-slate-500">
                                Group {selectedTeam.group_id} · {t('predict.p_advance')}: {((selectedTeam.p_advance ?? 0) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800"
                >
                    <AlertTriangle size={22} />
                    <span className="font-medium">{error}</span>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {loadingRoute ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-slate-400"
                    >
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="font-medium">{t('predict.computing')}</p>
                    </motion.div>
                ) : route ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Trophy size={16} />
                            <span>
                                {route.mode === 'best_case' ? t('predict.best_case') : t('predict.worst_case')} ·
                                {new Date(route.generated_at).toLocaleString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h3 className="font-bold text-brand-navy mb-2 flex items-center gap-2">
                                    <Target size={18} />
                                    {t('predict.route_probability')}
                                </h3>
                                <p className="text-3xl font-black text-brand-blue">
                                    {(route.route_probability * 100).toFixed(1)}%
                                </p>
                                <p className="text-sm text-slate-500 mt-1">{t('predict.route_prob_hint')}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h3 className="font-bold text-brand-navy mb-2">{t('predict.tiebreaker_risk')}</h3>
                                <span
                                    className={`inline-block px-4 py-2 rounded-xl font-bold text-sm ${
                                        route.tiebreaker_risk === 'low'
                                            ? 'bg-green-100 text-green-800'
                                            : route.tiebreaker_risk === 'medium'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {route.tiebreaker_risk}
                                </span>
                            </div>
                        </div>

                        {route.must_win.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h3 className="font-bold text-brand-navy mb-3">{t('predict.must_win')}</h3>
                                <ul className="space-y-2">
                                    {route.must_win.map((m, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <span>{FLAG_MAP[m.team_id] || '🚩'}</span>
                                            <span className="font-medium">{m.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {route.other_results.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h3 className="font-bold text-brand-navy mb-3">{t('predict.other_results')}</h3>
                                <ul className="space-y-2">
                                    {route.other_results.map((o, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <span>{o.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {route.must_win.length === 0 && route.other_results.length === 0 && (
                            <p className="text-slate-500 italic">{t('predict.no_conditions')}</p>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};
