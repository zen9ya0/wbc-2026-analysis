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

const FLAG_MAP: Record<string, string> = {
    'JPN': '🇯🇵', 'USA': '🇺🇸', 'PUR': '🇵🇷', 'CUB': '🇨🇺', 'CAN': '🇨🇦',
    'MEX': '🇲🇽', 'VEN': '🇻🇪', 'DOM': '🇩🇴', 'KOR': '🇰🇷', 'AUS': '🇦🇺',
    'ITA': '🇮🇹', 'NED': '🇳🇱', 'PAN': '🇵🇦', 'GBR': '🇬🇧', 'CZE': '🇨🇿',
    'ISR': '🇮🇱', 'COL': '🇨🇴', 'BRA': '🇧🇷', 'TPE': '🇹🇼', 'NIC': '🇳🇮'
};

const TEAM_NAME_MAP: Record<string, string> = {
    PUR: 'Puerto Rico', CUB: 'Cuba', CAN: 'Canada', PAN: 'Panama', COL: 'Colombia',
    USA: 'USA', MEX: 'Mexico', ITA: 'Italy', GBR: 'Great Britain', BRA: 'Brazil',
    JPN: 'Japan', AUS: 'Australia', KOR: 'South Korea', CZE: 'Czechia', TPE: 'Chinese Taipei',
    VEN: 'Venezuela', DOM: 'Dominican Republic', NED: 'Netherlands', ISR: 'Israel', NIC: 'Nicaragua'
};

export const Dashboard = () => {
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
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedGroupId(group.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedGroupId(group.id)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-brand-blue/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                        <div className="bg-brand-navy p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">{t(`dashboard.${group.key}`)}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Group {group.id}
                                </span>
                                <ChevronRight size={20} className="opacity-80" />
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
                                        <div
                                            key={teamId}
                                            title={TEAM_NAME_MAP[teamId] ?? teamId}
                                            className="bg-white rounded-lg flex items-center gap-2 border border-slate-200 shadow-sm overflow-hidden hover:border-brand-blue/30 hover:shadow transition-all"
                                        >
                                            <span className="flex items-center justify-center w-9 h-9 bg-slate-50 border-r border-slate-100 text-xl shrink-0" aria-hidden>
                                                {FLAG_MAP[teamId] ?? '🏳️'}
                                            </span>
                                            <span className="font-bold text-slate-800 text-xs uppercase tracking-wide px-2.5 py-1.5">
                                                {teamId}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-brand-blue font-medium mt-3 flex items-center gap-1">
                                    {t('dashboard.view_match_schedule') ?? '查看對戰表'} <ChevronRight size={14} />
                                </p>
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
