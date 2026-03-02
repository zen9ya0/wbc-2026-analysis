import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    Layers,
    BarChart3,
    Navigation2,
    Globe2
} from 'lucide-react';

const languages = [
    { code: 'zh', name: '繁體中文' },
    { code: 'ja', name: '日本語' },
    { code: 'en', name: 'English' },
];

import { TeamList } from './components/TeamList';

function App() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('dashboard');

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'teams', icon: Users, label: t('common.teams') },
        { id: 'groups', icon: Layers, label: t('common.groups') },
        { id: 'predict', icon: Navigation2, label: t('common.predict') },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        W
                    </div>
                    <span className="font-bold text-lg tracking-tight">WBC 2026 Analysis</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-brand-blue/10 text-brand-blue font-semibold'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Language Switcher */}
                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                        <Globe2 size={16} />
                        <span className="text-sm font-medium">{t('common.language')}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => i18n.changeLanguage(lang.code)}
                                className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${i18n.language === lang.code
                                    ? 'bg-slate-100 text-brand-navy font-bold'
                                    : 'text-slate-500 hover:text-brand-navy'
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-brand-navy capitalize">{activeTab}</h1>
                        <p className="text-slate-500 mt-1">World Baseball Classic 2026 Predictive Insights</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-slate-600">MODEL LIVE: v0.1.0</span>
                        </div>
                    </div>
                </header>

                <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[600px]">
                    {activeTab === 'dashboard' || activeTab === 'teams' ? (
                        <TeamList />
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[500px]">
                            <div className="text-center">
                                <BarChart3 size={64} className="mx-auto text-slate-200 mb-4" />
                                <h2 className="text-xl font-bold text-slate-400">Content for {activeTab} coming soon...</h2>
                                <p className="text-slate-400">Integrating Monte Carlo simulation results.</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
