import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, ChevronRight } from 'lucide-react';
import { GroupSchedule } from './GroupSchedule';

const groups = [
    { id: 'A', key: 'group_a', stadiumKey: 'stadium_a', teams: ['PUR', 'CUB', 'CAN', 'PAN', 'COL'] },
    { id: 'B', key: 'group_b', stadiumKey: 'stadium_b', teams: ['USA', 'MEX', 'ITA', 'GBR', 'BRA'] },
    { id: 'C', key: 'group_c', stadiumKey: 'stadium_c', teams: ['JPN', 'AUS', 'KOR', 'CZE', 'TPE'] },
    { id: 'D', key: 'group_d', stadiumKey: 'stadium_d', teams: ['VEN', 'DOM', 'NED', 'ISR', 'NIC'] },
];

// ISO 3166-1 alpha-2 for FlagCDN (https://flagcdn.com)
const TEAM_ID_TO_ISO2: Record<string, string> = {
    PUR: 'pr', CUB: 'cu', CAN: 'ca', PAN: 'pa', COL: 'co',
    USA: 'us', MEX: 'mx', ITA: 'it', GBR: 'gb', BRA: 'br',
    JPN: 'jp', AUS: 'au', KOR: 'kr', CZE: 'cz', TPE: 'tw',
    VEN: 've', DOM: 'do', NED: 'nl', ISR: 'il', NIC: 'ni',
};

const FLAG_MAP: Record<string, string> = {
    'JPN': '🇯🇵', 'USA': '🇺🇸', 'PUR': '🇵🇷', 'CUB': '🇨🇺', 'CAN': '🇨🇦',
    'MEX': '🇲🇽', 'VEN': '🇻🇪', 'DOM': '🇩🇴', 'KOR': '🇰🇷', 'AUS': '🇦🇺',
    'ITA': '🇮🇹', 'NED': '🇳🇱', 'PAN': '🇵🇦', 'GBR': '🇬🇧', 'CZE': '🇨🇿',
    'ISR': '🇮🇱', 'COL': '🇨🇴', 'BRA': '🇧🇷', 'TPE': '🇹🇼', 'NIC': '🇳🇮'
};

function getFlagSrc(teamId: string): string | null {
    const iso2 = TEAM_ID_TO_ISO2[teamId];
    return iso2 ? `https://flagcdn.com/w80/${iso2}.png` : null;
}

const TEAM_NAME_MAP: Record<string, string> = {
    PUR: 'Puerto Rico', CUB: 'Cuba', CAN: 'Canada', PAN: 'Panama', COL: 'Colombia',
    USA: 'USA', MEX: 'Mexico', ITA: 'Italy', GBR: 'Great Britain', BRA: 'Brazil',
    JPN: 'Japan', AUS: 'Australia', KOR: 'South Korea', CZE: 'Czechia', TPE: 'Chinese Taipei',
    VEN: 'Venezuela', DOM: 'Dominican Republic', NED: 'Netherlands', ISR: 'Israel', NIC: 'Nicaragua'
};

interface DashboardProps {
    /** 點擊隊伍標籤時切換到「隊伍」並顯示該隊詳情 */
    onSelectTeam?: (teamId: string) => void;
}

export const Dashboard = ({ onSelectTeam }: DashboardProps) => {
    const { t } = useTranslation();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    if (selectedGroupId) {
        const group = groups.find(g => g.id === selectedGroupId);
        return (
            <GroupSchedule
                groupId={selectedGroupId}
                groupLabel={group ? t(`dashboard.${group.key}`) : `Group ${selectedGroupId}`}
                onBack={() => setSelectedGroupId(null)}
            />
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group, idx) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-200 transition-all"
                    >
                        <div className="bg-brand-navy p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{t(`dashboard.${group.key}`)}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Group {group.id}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <MapPin size={14} className="text-brand-red" />
                                    <span className="font-semibold">{t('dashboard.location')}:</span>
                                    <span>{t(`dashboard.${group.stadiumKey}`)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Calendar size={14} className="text-brand-red" />
                                    <span className="font-semibold">{t('dashboard.schedule')}:</span>
                                    <span>{t('dashboard.dates')}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Trophy size={12} />
                                    Participating Teams
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {group.teams.map(teamId => (
                                        <button
                                            key={teamId}
                                            type="button"
                                            title={TEAM_NAME_MAP[teamId] ?? teamId}
                                            onClick={() => onSelectTeam?.(teamId)}
                                            className="bg-white rounded-xl flex items-center gap-2.5 border border-slate-200 shadow-sm overflow-hidden hover:border-brand-blue/30 hover:shadow transition-all min-w-0 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                                        >
                                            <span className="flex items-center justify-center w-12 h-9 bg-slate-50 border-r border-slate-100 shrink-0 overflow-hidden">
                                                {getFlagSrc(teamId) ? (
                                                    <img src={getFlagSrc(teamId)!} alt="" className="w-full h-full object-cover" width={48} height={36} />
                                                ) : (
                                                    <span className="text-xl" aria-hidden>{FLAG_MAP[teamId] ?? '🏳️'}</span>
                                                )}
                                            </span>
                                            <span className="font-bold text-slate-800 text-xs uppercase tracking-wide py-2 pr-3">
                                                {teamId}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className="text-xs text-brand-blue font-medium mt-3 flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded"
                                >
                                    {t('dashboard.view_match_schedule') ?? '查看對戰表'} <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-brand-blue/5 rounded-2xl p-6 border border-brand-blue/10">
                <h4 className="font-bold text-brand-navy mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-red rounded-full"></span>
                    Quick Tip
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                    The top two teams from each group will advance to the Quarterfinals.
                    Switch to the <strong>Teams</strong> tab to see detailed advancement probabilities calculated by our Monte Carlo simulation engine.
                </p>
            </div>
        </div>
    );
};
