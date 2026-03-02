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

    // 依守位分組，對齊 WBC 官方 (P / C / IF / OF)
    const POSITION_ORDER = ['P', 'C', 'IF', 'OF'] as const;
    const POSITION_LABELS: Record<string, string> = { P: 'Pitchers', C: 'Catchers', IF: 'Infielders', OF: 'Outfielders' };
    const getPositionGroup = (pos: string): string => {
        const u = pos.toUpperCase();
        if (u.startsWith('P')) return 'P';
        if (u.startsWith('C')) return 'C';
        if (u.includes('IF') || u.startsWith('I')) return 'IF';
        if (u.includes('OF') || u.startsWith('O')) return 'OF';
        if (u.includes('D')) return 'IF'; // DH/IF -> IF
        return 'IF';
    };
    const byGroup = POSITION_ORDER.reduce((acc, g) => {
        acc[g] = team.players.filter((p) => getPositionGroup(p.position) === g);
        return acc;
    }, {} as Record<string, Player[]>);

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

                {/* Right Side: Roster（依守位分組，對齊 WBC 官方） */}
                <div className="w-full md:w-[360px] shrink-0">
                    <div className="bg-brand-navy rounded-[32px] p-6 text-white shadow-2xl shadow-brand-navy/20 relative overflow-hidden max-h-[min(70vh,720px)] flex flex-col">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-60 shrink-0">
                            <User size={14} />
                            Roster (by position)
                        </h3>

                        <div className="overflow-y-auto space-y-5 pr-1 -mr-1">
                            {team.players.length > 0 ? (
                                POSITION_ORDER.map((groupKey) => {
                                    const list = byGroup[groupKey];
                                    if (!list.length) return null;
                                    return (
                                        <div key={groupKey} className="space-y-1.5">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/50 sticky top-0 bg-brand-navy/95 py-1">
                                                {POSITION_LABELS[groupKey]}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                                {list.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px] text-white/60 shrink-0">
                                                            #{p.number}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-sm truncate">{p.name}</div>
                                                            <div className="text-[9px] text-white/40 uppercase">{p.position}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 opacity-30 italic text-sm">
                                    Official roster version coming soon
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 shrink-0">
                            <p className="text-[9px] text-white/20 italic text-center">
                                *Roster subject to change. See <a href="https://www.mlb.com/world-baseball-classic" target="_blank" rel="noopener noreferrer" className="underline">MLB.com WBC</a> for official rosters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
