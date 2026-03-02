import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, RefreshCw } from 'lucide-react';
import { fetchWithFallback } from '../api/cache';

const TEAM_ID_TO_ISO2: Record<string, string> = {
    PUR: 'pr', CUB: 'cu', CAN: 'ca', PAN: 'pa', COL: 'co',
    USA: 'us', MEX: 'mx', ITA: 'it', GBR: 'gb', BRA: 'br',
    JPN: 'jp', AUS: 'au', KOR: 'kr', CZE: 'cz', TPE: 'tw',
    VEN: 've', DOM: 'do', NED: 'nl', ISR: 'il', NIC: 'ni',
};

function getFlagSrc(teamId: string): string | null {
    const iso2 = TEAM_ID_TO_ISO2[teamId];
    return iso2 ? `https://flagcdn.com/w80/${iso2}.png` : null;
}

const FLAG_MAP: Record<string, string> = {
    'JPN': '🇯🇵', 'USA': '🇺🇸', 'PUR': '🇵🇷', 'CUB': '🇨🇺', 'CAN': '🇨🇦',
    'MEX': '🇲🇽', 'VEN': '🇻🇪', 'DOM': '🇩🇴', 'KOR': '🇰🇷', 'AUS': '🇦🇺',
    'ITA': '🇮🇹', 'NED': '🇳🇱', 'PAN': '🇵🇦', 'GBR': '🇬🇧', 'CZE': '🇨🇿',
    'ISR': '🇮🇱', 'COL': '🇨🇴', 'BRA': '🇧🇷', 'TPE': '🇹🇼', 'NIC': '🇳🇮'
};

export interface ScheduleMatch {
    team_a_id: string;
    team_b_id: string;
    score_a: number | null;
    score_b: number | null;
    status: string;
    scheduled_date?: string; // YYYY-MM-DD 比賽日期
}

export interface GroupScheduleResponse {
    model_version: string;
    data_version: string;
    generated_at: string;
    group_id: string;
    matches: ScheduleMatch[];
}

const POLL_INTERVAL_MS = 30_000; // 30s auto-refresh for 賽後結果

interface GroupScheduleProps {
    groupId: string;
    groupLabel: string;
    onBack: () => void;
}

export const GroupSchedule = ({ groupId, groupLabel, onBack }: GroupScheduleProps) => {
    const { t } = useTranslation();
    const [schedule, setSchedule] = useState<GroupScheduleResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = useCallback(async () => {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const result = await fetchWithFallback<GroupScheduleResponse>(
            `${apiBase}/v1/groups/${groupId}/schedule`,
            `schedule_${groupId}`
        );
        if (result.data) setSchedule(result.data);
        setLastUpdated(result.last_updated ?? null);
        setError(result.error);
        setLoading(false);
    }, [groupId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    useEffect(() => {
        const timer = setInterval(fetchSchedule, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchSchedule]);

    if (loading && !schedule) {
        return (
            <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
        );
    }

    if (error && !schedule) {
        return (
            <div className="space-y-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-navy font-medium"
                >
                    <ArrowLeft size={18} /> {t('common.back') ?? 'Back'}
                </button>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    const matches = schedule?.matches ?? [];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-navy font-bold transition-colors"
                >
                    <ArrowLeft size={20} /> {t('common.back') ?? 'Back'}
                </button>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-slate-400">
                            {t('dashboard.last_updated') ?? 'Last updated'}: {new Date(lastUpdated).toLocaleString()}
                        </span>
                    )}
                    <button
                        onClick={() => { setLoading(true); fetchSchedule(); }}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        title={t('dashboard.refresh') ?? 'Refresh'}
                    >
                        <RefreshCw size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="bg-brand-navy rounded-2xl p-4 text-white flex items-center gap-3">
                <Calendar size={24} />
                <div>
                    <h2 className="text-xl font-bold">{groupLabel} – {t('dashboard.match_schedule') ?? '對戰表'}</h2>
                    <p className="text-white/80 text-sm">{t('dashboard.auto_update_hint') ?? '對戰表每 30 秒自動更新'}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-sm">
                                {t('dashboard.match') ?? '對戰'}
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-sm">
                                {t('dashboard.date') ?? '比賽日期'}
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-sm text-center">
                                {t('dashboard.score') ?? '比分'}
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-sm">
                                {t('dashboard.status') ?? '狀態'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((m, i) => (
                            <motion.tr
                                key={`${m.team_a_id}-${m.team_b_id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-7 shrink-0 rounded overflow-hidden bg-slate-100">
                                            {getFlagSrc(m.team_a_id) ? (
                                                <img src={getFlagSrc(m.team_a_id)!} alt="" className="w-full h-full object-cover" width={40} height={28} />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full text-lg">{FLAG_MAP[m.team_a_id] ?? '🏳️'}</span>
                                            )}
                                        </span>
                                        <span className="font-bold text-slate-800">{m.team_a_id}</span>
                                        <span className="text-slate-300 font-medium">vs</span>
                                        <span className="w-10 h-7 shrink-0 rounded overflow-hidden bg-slate-100">
                                            {getFlagSrc(m.team_b_id) ? (
                                                <img src={getFlagSrc(m.team_b_id)!} alt="" className="w-full h-full object-cover" width={40} height={28} />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full text-lg">{FLAG_MAP[m.team_b_id] ?? '🏳️'}</span>
                                            )}
                                        </span>
                                        <span className="font-bold text-slate-800">{m.team_b_id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                    {m.scheduled_date
                                        ? new Date(m.scheduled_date + 'Z').toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', year: 'numeric' })
                                        : '–'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {m.status === 'final' && m.score_a != null && m.score_b != null ? (
                                        <span className="font-black text-lg text-brand-navy">
                                            {m.score_a} – {m.score_b}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300">–</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                        m.status === 'final'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {m.status === 'final'
                                            ? (t('dashboard.final') ?? '已結束')
                                            : (t('dashboard.scheduled') ?? '未開賽')}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
