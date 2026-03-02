import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

interface Team {
    id: string;
    name_zh: string;
    name_ja: string;
    name_en: string;
    strength_pitching: number;
    strength_batting: number;
    p_advance?: number;
}

const FLAG_MAP: Record<string, string> = {
    'JPN': '🇯🇵', 'USA': '🇺🇸', 'PUR': '🇵🇷', 'CUB': '🇨🇺', 'CAN': '🇨🇦',
    'MEX': '🇲🇽', 'VEN': '🇻🇪', 'DOM': '🇩🇴', 'KOR': '🇰🇷', 'AUS': '🇦🇺',
    'ITA': '🇮🇹', 'NED': '🇳🇱', 'PAN': '🇵🇦', 'GBR': '🇬🇧', 'CZE': '🇨🇿',
    'ISR': '🇮🇱', 'Q1': '🏳️', 'Q2': '🏳️', 'Q3': '🏳️', 'Q4': '🏳️'
};

interface TeamListProps {
    onSelect: (teamId: string) => void;
}

export const TeamList = ({ onSelect }: TeamListProps) => {
    const { t, i18n } = useTranslation();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const load = async () => {
            const result = await fetchWithFallback<Team[]>(`${apiBase}/v1/teams`, 'teams');
            if (result.data) {
                const sorted = result.data.map((team) => ({
                    ...team,
                    p_advance: team.p_advance ?? (team.strength_pitching + team.strength_batting) / 2,
                })).sort((a, b) => (b.p_advance ?? 0) - (a.p_advance ?? 0));
                setTeams(sorted);
            }
            setFromCache(result.fromCache);
            setLastUpdated(result.last_updated);
            setFetchError(result.error);
            setLoading(false);
        };
        load();
    }, []);

    const getTeamName = (team: Team) => {
        if (i18n.language === 'ja') return team.name_ja;
        if (i18n.language === 'en') return team.name_en;
        return team.name_zh;
    };

    if (loading) return <div className="text-center py-20 text-slate-400">{t('common.loading')}</div>;
    if (!teams.length && fetchError) {
        return (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-amber-800">
                <p className="font-medium">{t('common.cached_notice')}</p>
                <p className="text-sm mt-1">{fetchError}</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {fromCache && fetchError && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertCircle size={20} />
                    <div>
                        <p className="font-medium">{t('common.cached_notice')}</p>
                        {lastUpdated && (
                            <p className="text-sm opacity-90">{t('common.last_updated')}: {new Date(lastUpdated).toLocaleString()}</p>
                        )}
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 gap-4">
                {teams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect(team.id)}
                        className="flex items-center gap-6 p-5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 hover:shadow-sm cursor-pointer active:scale-98"
                    >
                        <div className="text-4xl w-12 text-center">{FLAG_MAP[team.id] || '🚩'}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-lg text-brand-navy">{getTeamName(team)}</span>
                                <span className="text-brand-red font-black text-xl">
                                    {((team.p_advance || 0) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(team.p_advance || 0) * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${(team.p_advance || 0) > 0.8 ? 'from-brand-blue to-brand-red' : 'from-slate-300 to-brand-blue'
                                        }`}
                                ></motion.div>
                            </div>
                        </div>
                        <div className="text-right min-w-[120px] bg-slate-50 p-2 rounded-xl border border-slate-100 group-hover:bg-white transiton-colors">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('teams.strength')}</div>
                            <div className="text-lg font-black text-brand-navy">
                                {((team.strength_pitching + team.strength_batting) * 50).toFixed(1)}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
