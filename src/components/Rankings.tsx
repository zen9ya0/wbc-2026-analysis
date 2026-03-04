import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Trophy, AlertCircle } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

const PLACEHOLDER = '--';

interface SemifinalSlot {
    slot: number;
    team_id: string | null;
    name_zh: string | null;
    name_ja: string | null;
    name_en: string | null;
}

interface StandingRow {
    rank: string;
    team_id: string;
    name_zh: string;
    name_ja: string;
    name_en: string;
    wins: number;
    losses: number;
}

interface GroupStanding {
    group_id: string;
    standings: StandingRow[];
}

interface RankingsResponse {
    model_version: string;
    data_version: string;
    generated_at: string;
    semifinal_slots: SemifinalSlot[];
    group_standings: GroupStanding[];
}

export const Rankings = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState<RankingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const load = async () => {
            setLoading(true);
            const result = await fetchWithFallback<RankingsResponse>(
                `${apiBase}/v1/rankings`,
                'rankings'
            );
            if (result.data) setData(result.data);
            setFromCache(result.fromCache);
            setLastUpdated(result.last_updated);
            setFetchError(result.error);
            setLoading(false);
        };
        load();
    }, []);

    const getTeamName = (slot: SemifinalSlot) => {
        if (slot.team_id == null) return PLACEHOLDER;
        if (i18n.language === 'ja' && slot.name_ja) return slot.name_ja;
        if (i18n.language === 'en' && slot.name_en) return slot.name_en;
        return slot.name_zh || slot.name_en || slot.name_ja || PLACEHOLDER;
    };

    const getStandingName = (row: StandingRow) => {
        if (i18n.language === 'ja') return row.name_ja;
        if (i18n.language === 'en') return row.name_en;
        return row.name_zh;
    };

    if (loading && !data) {
        return <div className="text-center py-20 text-slate-400">{t('common.loading')}</div>;
    }
    if (!data && fetchError) {
        return (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-amber-800">
                <p className="font-medium">{t('common.cached_notice')}</p>
                <p className="text-sm mt-1">{fetchError}</p>
            </div>
        );
    }
    if (!data) return null;

    return (
        <div className="space-y-10">
            {fromCache && fetchError && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertCircle size={20} />
                    <div>
                        <p className="font-medium">{t('common.cached_notice')}</p>
                        {lastUpdated && (
                            <p className="text-sm opacity-90">
                                {t('common.last_updated')}: {new Date(lastUpdated).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* 四強爭霸 */}
            <section>
                <h2 className="flex items-center gap-2 text-xl font-black text-brand-navy mb-4">
                    <Trophy className="text-amber-500" size={24} />
                    {t('rankings.semifinal_title')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.semifinal_slots.map((slot, idx) => (
                        <motion.div
                            key={slot.slot}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-center min-h-[88px] flex flex-col justify-center"
                        >
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {t('rankings.slot')} {slot.slot}
                            </span>
                            <span className="mt-1 font-bold text-slate-700">
                                {getTeamName(slot)}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 分組排名 */}
            <section>
                <h2 className="text-xl font-black text-brand-navy mb-4">
                    {t('rankings.group_standings_title')}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                    {t('rankings.standings_hint')}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {data.group_standings.map((gs) => (
                        <motion.div
                            key={gs.group_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                        >
                            <div className="bg-brand-navy px-4 py-3 text-white font-bold">
                                {t('rankings.group')} {gs.group_id}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80">
                                            <th className="text-left py-3 px-4 font-bold text-slate-600 w-14">
                                                {t('rankings.rank')}
                                            </th>
                                            <th className="text-left py-3 px-4 font-bold text-slate-600">
                                                {t('rankings.team')}
                                            </th>
                                            <th className="text-center py-3 px-4 font-bold text-slate-600 w-16">
                                                W
                                            </th>
                                            <th className="text-center py-3 px-4 font-bold text-slate-600 w-16">
                                                L
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gs.standings.map((row) => (
                                            <tr
                                                key={row.team_id}
                                                className="border-b border-slate-50 hover:bg-slate-50/50"
                                            >
                                                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                    {row.rank}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-slate-800">
                                                    {getStandingName(row)}
                                                </td>
                                                <td className="py-3 px-4 text-center text-slate-600">
                                                    {row.wins}
                                                </td>
                                                <td className="py-3 px-4 text-center text-slate-600">
                                                    {row.losses}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};
