import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

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

export const TeamList = () => {
    const { t, i18n } = useTranslation();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
            try {
                const res = await axios.get(`${apiBase}/v1/teams`);
                // Add fake machine-learning-derived probability if not present
                const data = res.data.map((team: Team) => ({
                    ...team,
                    p_advance: team.p_advance || (team.strength_pitching + team.strength_batting) / 2
                })).sort((a: Team, b: Team) => (b.p_advance || 0) - (a.p_advance || 0));

                setTeams(data);
            } catch (err) {
                console.error("Failed to fetch teams", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const getTeamName = (team: Team) => {
        if (i18n.language === 'ja') return team.name_ja;
        if (i18n.language === 'en') return team.name_en;
        return team.name_zh;
    };

    if (loading) return <div className="text-center py-20 text-slate-400">{t('common.loading')}</div>;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4">
                {teams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-6 p-5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
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
                        <div className="text-right min-w-[120px] bg-slate-50 p-2 rounded-xl border border-slate-100">
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
