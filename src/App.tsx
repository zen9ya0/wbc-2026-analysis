import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Layers,
    BarChart3,
    Navigation2,
    Globe2,
    ChevronDown
} from 'lucide-react';

const languages = [
    { code: 'zh', name: '繁體中文' },
    { code: 'ja', name: '日本語' },
    { code: 'en', name: 'English' },
];

import { TeamList } from './components/TeamList';
import { Dashboard } from './components/Dashboard';
import { Groups } from './components/Groups';
import { TeamDetail } from './components/TeamDetail';

function App() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'teams', icon: Users, label: t('common.teams') },
        { id: 'groups', icon: Layers, label: t('common.groups') },
        { id: 'predict', icon: Navigation2, label: t('common.predict') },
    ];

    // Reset selected team when changing tabs
    useEffect(() => {
        setSelectedTeam(null);
    }, [activeTab]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
                <div className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-red to-brand-navy rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-red/20 rotate-3 transition-transform hover:rotate-0">
                        W
                    </div>
                    <div>
                        <span className="block font-black text-xl leading-none text-brand-navy">WBC 2026</span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analytics Pro</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                ? 'bg-brand-blue/10 text-brand-blue shadow-sm'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            <item.icon size={22} className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'text-brand-blue' : ''}`} />
                            <span className="font-bold text-[15px]">{item.label}</span>
                            {activeTab === item.id && (
                                <div className="ml-auto w-1.5 h-1.5 bg-brand-blue rounded-full"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-8 mt-auto">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Tournament Status</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-700">Qualifiers Starting</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <header className="px-10 py-8 flex justify-between items-center sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md border-b border-transparent transition-colors duration-300">
                    <div>
                        <h1 className="text-3xl font-black text-brand-navy tracking-tight">
                            {selectedTeam ? t('common.details') : navItems.find(n => n.id === activeTab)?.label}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">World Baseball Classic 2026 Insights Engine</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Language Selector Dropdown */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-blue/30 transition-all active:scale-95 group"
                            >
                                <Globe2 size={18} className="text-slate-400 group-hover:text-brand-blue transition-colors" />
                                <span className="text-sm font-bold text-slate-700">{currentLang.name}</span>
                                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {langOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden origin-top-right backdrop-blur-sm bg-white/95"
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    i18n.changeLanguage(lang.code);
                                                    setLangOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${i18n.language === lang.code
                                                    ? 'bg-brand-blue/5 text-brand-blue'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-navy'
                                                    }`}
                                            >
                                                {lang.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-white px-6 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">MODEL LIVE: v0.1.0</span>
                        </div>
                    </div>
                </header>

                <div className="px-10 pb-12">
                    <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[700px]">
                        {selectedTeam ? (
                            <TeamDetail teamId={selectedTeam} onBack={() => setSelectedTeam(null)} />
                        ) : activeTab === 'dashboard' ? (
                            <Dashboard />
                        ) : activeTab === 'teams' ? (
                            <TeamList onSelect={(id) => setSelectedTeam(id)} />
                        ) : activeTab === 'groups' ? (
                            <Groups />
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[500px]">
                                <div className="text-center max-w-sm">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <BarChart3 size={40} className="text-slate-200" />
                                    </div>
                                    <h2 className="text-2xl font-black text-brand-navy mb-3">
                                        {t('common.predict')} Coming Soon
                                    </h2>
                                    <p className="text-slate-400 font-medium leading-relaxed italic">
                                        "Integrating Monte Carlo simulation results to provide the ultimate advancement route optimizer."
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default App;
