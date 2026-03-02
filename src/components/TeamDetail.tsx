import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, BarChart, Shield, Zap, Target } from 'lucide-react';

interface Player {
    id: number;
    name: string;
    position: string;
    number: number;
}

interface TeamDetailProps {
    teamId: string;
    onBack: () => void;
}

interface TeamData {
    id: string;
    name_zh: string;
    name_en: string;
    name_ja: string;
    group_id: string;
    strength: {
        pitching: number;
        batting: number;
        defense: number;
        baserunning: number;
        uncertainty: number;
    };
    players: Player[];
}

import { useEffect, useState } from 'react';
import axios from 'axios';

export const TeamDetail = ({ teamId, onBack }: TeamDetailProps) => {
    const { i18n } = useTranslation();
    const [team, setTeam] = useState<TeamData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
            try {
                const res = await axios.get(`${apiBase}/v1/teams/${teamId}`);
                setTeam(res.data);
            } catch (err) {
                console.error("Failed to fetch team detail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [teamId]);

    if (loading) return <div className="text-center py-20 animate-pulse text-slate-400">Loading analysis...</div>;
    if (!team) return <div className="text-center py-20 text-red-400">Team data not found</div>;

    const getTeamName = () => {
        if (i18n.language === 'ja') return team.name_ja;
        if (i18n.language === 'en') return team.name_en;
        return team.name_zh;
    };

    const strengthMetrics = [
        { key: 'pitching', icon: Target, label: 'Pitching', color: 'bg-blue-500' },
        { key: 'batting', icon: Zap, label: 'Batting', color: 'bg-red-500' },
        { key: 'defense', icon: Shield, label: 'Defense', color: 'bg-green-500' },
        { key: 'baserunning', icon: BarChart, label: 'Baserunning', color: 'bg-orange-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-brand-navy transition-colors font-bold text-sm mb-6"
            >
                <ArrowLeft size={16} />
                Back to List
            </button>

            <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Left Side: Stats and Radar-ish view */}
                <div className="flex-1 space-y-8 w-full">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-6xl shadow-sm border border-slate-100">
                            {/* In a real app we'd map flag emojis here too */}
                            🚩
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-brand-navy">{getTeamName()}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-black uppercase tracking-widest">
                                    Group {team.group_id}
                                </span>
                                <span className="text-slate-400 text-sm font-medium">Full Roster & Performance Analysis</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {strengthMetrics.map((m) => (
                            <div key={m.key} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-brand-blue/20 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-xl bg-white shadow-sm text-slate-400 group-hover:text-brand-navy transition-colors`}>
                                        <m.icon size={20} />
                                    </div>
                                    <span className="text-xl font-black text-brand-navy">
                                        {(team.strength[m.key as keyof typeof team.strength] * 100).toFixed(0)}
                                    </span>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${team.strength[m.key as keyof typeof team.strength] * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full ${m.color}`}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Roster */}
                <div className="w-full md:w-[400px]">
                    <div className="bg-brand-navy rounded-[40px] p-8 text-white shadow-2xl shadow-brand-navy/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 opacity-60">
                            <User size={16} />
                            Key Roster (Analysts Pick)
                        </h3>

                        <div className="space-y-4">
                            {team.players.length > 0 ? (
                                team.players.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm text-white/40">
                                                #{p.number}
                                            </div>
                                            <div>
                                                <div className="font-bold">{p.name}</div>
                                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{p.position}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-30 italic text-sm">
                                    Official roster version coming soon
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] text-white/20 italic text-center">
                                *Data verified by Analyst 2026.03.02.01
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
