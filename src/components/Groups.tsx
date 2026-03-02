import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layers, Info, AlertCircle } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

interface GroupTeam {
    team_id: string;
    name_zh: string;
    name_ja: string;
    name_en: string;
    p_advance: number;
    expected_wins: number;
}

interface GroupResponse {
    model_version: string;
    data_version: string;
    generated_at: string;
    group_id: string;
    teams: GroupTeam[];
    rank_distribution: { team_id: string; rank: number; probability: number }[];
    matches_remaining: { team_a_id: string; team_b_id: string }[];
}

const FLAG_MAP: Record<string, string> = {
    'JPN': '🇯🇵', 'USA': '🇺🇸', 'PUR': '🇵🇷', 'CUB': '🇨🇺', 'CAN': '🇨🇦',
    'MEX': '🇲🇽', 'VEN': '🇻🇪', 'DOM': '🇩🇴', 'KOR': '🇰🇷', 'AUS': '🇦🇺',
    'ITA': '🇮🇹', 'NED': '🇳🇱', 'PAN': '🇵🇦', 'GBR': '🇬🇧', 'CZE': '🇨🇿',
    'ISR': '🇮🇱', 'Q1': '🏳️', 'Q2': '🏳️', 'Q3': '🏳️', 'Q4': '🏳️'
};

export const Groups = () => {
    const { t, i18n } = useTranslation();
    const [selectedGroup, setSelectedGroup] = useState('A');
    const [groupData, setGroupData] = useState<GroupResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const load = async () => {
            setLoading(true);
            const result = await fetchWithFallback<GroupResponse>(
                `${apiBase}/v1/groups/${selectedGroup}`,
                `group_${selectedGroup}`
            );
            if (result.data) setGroupData(result.data);
            setFromCache(result.fromCache);
            setLastUpdated(result.last_updated);
            setFetchError(result.error);
            setLoading(false);
        };
        load();
    }, [selectedGroup]);

    const groupTeams = groupData?.teams
        ? [...groupData.teams].sort((a, b) => b.p_advance - a.p_advance)
        : [];

    const getTeamName = (team: GroupTeam) => {
        if (i18n.language === 'ja') return team.name_ja;
        if (i18n.language === 'en') return team.name_en;
        return team.name_zh;
    };

    if (loading && !groupData) return <div className="text-center py-20 text-slate-400">{t('common.loading')}</div>;
    if (!groupData && fetchError) {
        return (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-amber-800">
                <p className="font-medium">{t('common.cached_notice')}</p>
                <p className="text-sm mt-1">{fetchError}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {fromCache && fetchError && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertCircle size={20} />
                    <div>
                        <p className="font-medium">{t('common.cached_notice')}</p>
                        {lastUpdated && <p className="text-sm opacity-90">{t('common.last_updated')}: {new Date(lastUpdated).toLocaleString()}</p>}
                    </div>
                </div>
            )}
            {/* Group Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto">
                {['A', 'B', 'C', 'D'].map(id => (
                    <button
                        key={id}
                        onClick={() => setSelectedGroup(id)}
                        className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedGroup === id
                            ? 'bg-white text-brand-navy shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Group {id}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Standings Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-xl text-brand-navy flex items-center gap-3">
                            <Layers className="text-brand-red" size={24} />
                            Predicted Standings
                        </h3>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">W-L</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Adv. Prob</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupTeams.map((team, index) => (
                                    <motion.tr
                                        key={team.team_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${index < 2 ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-400'}`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{FLAG_MAP[team.team_id]}</span>
                                                <span className="font-bold text-brand-navy">{getTeamName(team)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-400">
                                            — / {team.expected_wins.toFixed(1)} exp
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-black ${index < 2 ? 'text-brand-red' : 'text-slate-400'}`}>
                                                {(team.p_advance * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    <div className="bg-brand-navy rounded-[32px] p-8 text-white shadow-xl shadow-brand-navy/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 opacity-60">
                            <Info size={16} />
                            Simulation Logic
                        </h4>
                        <p className="text-sm leading-relaxed font-medium opacity-90">
                            Rankings are derived from Monte Carlo iterations based on current team strength indices.
                        </p>
                        {groupData && (
                            <div className="mt-6 pt-6 border-t border-white/20">
                                <p className="text-xs font-bold tracking-wide opacity-80">
                                    Matches remaining: {groupData.matches_remaining.length}
                                </p>
                            </div>
                        )}
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 bg-brand-red rounded-full"></div>
                                <span className="text-xs font-bold tracking-wide">TQB Tiebreaker Enabled</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 bg-brand-red rounded-full"></div>
                                <span className="text-xs font-bold tracking-wide">Stadium Factors Included</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Advancement Line</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500">Qualification Target</span>
                                <span className="text-brand-navy">Top 2 Teams</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-2/5 bg-brand-blue rounded-full"></div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">
                                *Teams highlighted in blue currently hold a statistically significant advantage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
