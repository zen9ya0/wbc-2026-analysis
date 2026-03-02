import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, BarChart, Shield, Zap, Target, AlertCircle } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

interface Player {
    id: number;
    name: string;
    position: string;
    number: number;
    bat_throw?: string | null;
    height_weight?: string | null;
    w_l?: string | null;
    era?: string | null;
    birthplace?: string | null;
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

export const TeamDetail = ({ teamId, onBack }: TeamDetailProps) => {
    const { t, i18n } = useTranslation();
    const [team, setTeam] = useState<TeamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const load = async () => {
            const result = await fetchWithFallback<{ team?: TeamData; players?: Player[] } & Partial<TeamData>>(
                `${apiBase}/v1/teams/${teamId}`,
                `team_${teamId}`,
            );
            const raw = result.data;
            if (raw) {
                const teamInfo = raw.team
                    ? { ...raw.team, players: raw.players ?? [] }
                    : { ...raw, players: raw.players ?? [] };
                if (teamInfo.id) setTeam(teamInfo as TeamData);
            }
            setFromCache(result.fromCache);
            setLastUpdated(result.last_updated ?? (raw && 'generated_at' in raw ? (raw as { generated_at?: string }).generated_at ?? null : null));
            setFetchError(result.error);
            setLoading(false);
        };
        load();
    }, [teamId]);

    if (loading) return <div className="text-center py-20 animate-pulse text-slate-400">{t('common.loading')}</div>;
    if (!team) return <div className="text-center py-20 text-red-400">{t('common.cached_notice')} — {fetchError || 'Team data not found'}</div>;

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
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-brand-navy transition-colors font-bold text-sm mb-6"
            >
                <ArrowLeft size={16} />
                Back to List
            </button>

            {/* 隊伍標題與戰力 */}
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-6xl shadow-sm border border-slate-100">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Roster：全寬、依守位分組，不擠在固定高度盒子裡 */}
            <div className="w-full">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <User size={16} />
                    Roster (by position)
                </h3>
                {team.players.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {POSITION_ORDER.map((groupKey) => {
                            const list = byGroup[groupKey];
                            if (!list.length) return null;
                            return (
                                <div key={groupKey} className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
                                        {POSITION_LABELS[groupKey]}
                                    </div>
                                    <div className="grid gap-2">
                                        {list.map((p) => {
                                            const dash = '—';
                                            const row = (value: string | null | undefined) =>
                                                (value != null && value !== '') ? value : dash;
                                            return (
                                                <div
                                                    key={p.id}
                                                    className="py-3 px-3 rounded-xl bg-white border border-slate-100 hover:border-brand-blue/20 hover:shadow-sm transition-all space-y-1.5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-9 h-9 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-xs shrink-0">
                                                            #{p.number}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-slate-800">{p.name}</div>
                                                            <div className="text-xs text-slate-400 uppercase">{p.position}</div>
                                                        </div>
                                                    </div>
                                                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-2 pl-0">
                                                        <dt className="font-medium text-slate-400">B/T</dt><dd>{row(p.bat_throw)}</dd>
                                                        <dt className="font-medium text-slate-400">H/W</dt><dd>{row(p.height_weight)}</dd>
                                                        <dt className="font-medium text-slate-400">W-L</dt><dd>{row(p.w_l)}</dd>
                                                        <dt className="font-medium text-slate-400">ERA</dt><dd>{row(p.era)}</dd>
                                                        <dt className="font-medium text-slate-400">Birthplace</dt><dd>{row(p.birthplace)}</dd>
                                                    </dl>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 italic">
                        Official roster version coming soon
                    </div>
                )}
                <p className="mt-4 text-xs text-slate-400 italic">
                    *Roster subject to change. See <a href="https://www.mlb.com/world-baseball-classic" target="_blank" rel="noopener noreferrer" className="underline text-brand-blue">MLB.com WBC</a> for official rosters.
                </p>
            </div>
        </motion.div>
    );
};
