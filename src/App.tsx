import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Layers,
    Navigation2,
    BarChart3,
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
import { Predict } from './components/Predict';
import { ModelPage } from './components/ModelPage';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function App() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [langOpen, setLangOpen] = useState(false);
    const [meta, setMeta] = useState<{ model_version: string; data_version: string; generated_at: string } | null>(null);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API_BASE}/v1/meta/status`)
            .then((r) => r.ok ? r.json() : null)
            .then((d) => d && setMeta({ model_version: d.model_version, data_version: d.data_version, generated_at: d.generated_at }))
            .catch(() => {});
    }, []);

    const pathname = location.pathname || '/';
    useEffect(() => {
        if (pathname === '/' || pathname === '') {
            setActiveTab('dashboard');
            setSelectedTeam(null);
        } else if (pathname === '/teams') {
            setActiveTab('teams');
            setSelectedTeam(null);
        } else if (pathname.startsWith('/teams/')) {
            setActiveTab('teams');
            setSelectedTeam(pathname.replace(/^\/teams\/?/, '') || null);
        } else if (pathname.startsWith('/groups')) {
            setActiveTab('groups');
            setSelectedTeam(null);
        } else if (pathname === '/predict') {
            setActiveTab('predict');
            setSelectedTeam(null);
        } else if (pathname === '/model') {
            setActiveTab('model');
            setSelectedTeam(null);
        }
    }, [pathname]);

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'teams', icon: Users, label: t('common.teams') },
        { id: 'groups', icon: Layers, label: t('common.groups') },
        { id: 'predict', icon: Navigation2, label: t('common.predict') },
        { id: 'model', icon: BarChart3, label: t('common.model') },
    ];

    const goToTab = (tabId: string, teamId?: string | null) => {
        setActiveTab(tabId);
        if (tabId === 'teams' && teamId) {
            setSelectedTeam(teamId);
            navigate(`/teams/${teamId}`);
        } else {
            setSelectedTeam(null);
            if (tabId === 'dashboard') navigate('/');
            else navigate(`/${tabId}`);
        }
    };

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
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
                <div className="px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Logo + Title */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-11 h-11 bg-gradient-to-br from-brand-red to-brand-navy rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-red/20 rotate-3 transition-transform hover:rotate-0">
                            W
                        </div>
                        <div>
                            <span className="block font-black text-lg leading-none text-brand-navy">WBC 2026</span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Analytics Pro</span>
                        </div>
                    </div>

                    {/* Nav Items - same routing via setActiveTab */}
                    <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => goToTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === item.id
                                    ? 'bg-white text-brand-blue shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                            >
                                <item.icon size={18} className={activeTab === item.id ? 'text-brand-blue' : ''} />
                                <span>{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Right: Tournament Status + Language + Model */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden sm:flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full" />
                            <span className="text-xs font-bold text-slate-700">Qualifiers Starting</span>
                        </div>
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-blue/30 transition-all active:scale-95 group"
                            >
                                <Globe2 size={16} className="text-slate-400 group-hover:text-brand-blue transition-colors" />
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
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden origin-top-right"
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
                        <div className="hidden sm:flex bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm items-center gap-2" title={meta ? `${meta.data_version} · ${meta.generated_at ? new Date(meta.generated_at).toLocaleString() : ''}` : ''}>
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{meta?.model_version ?? 'v0.1.0'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <header className="px-6 lg:px-10 py-6 flex justify-between items-center bg-slate-50/80 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-brand-navy tracking-tight">
                            {selectedTeam ? t('common.details') : navItems.find(n => n.id === activeTab)?.label}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">World Baseball Classic 2026 Insights Engine</p>
                    </div>
                </header>

                <div className="px-6 lg:px-10 pb-12">
                    <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[700px]">
                        {selectedTeam ? (
                            <TeamDetail teamId={selectedTeam} onBack={() => goToTab('teams')} />
                        ) : activeTab === 'dashboard' ? (
                            <Dashboard onSelectTeam={(id) => goToTab('teams', id)} />
                        ) : activeTab === 'teams' ? (
                            <TeamList onSelect={(id) => goToTab('teams', id)} />
                        ) : activeTab === 'groups' ? (
                            <Groups />
                        ) : activeTab === 'predict' ? (
                            <Predict />
                        ) : activeTab === 'model' ? (
                            <ModelPage />
                        ) : null}
                    </section>
                </div>
            </main>

            {/* Footer: 著作權與資料來源 */}
            <footer className="border-t border-slate-200 bg-white py-6 px-6 lg:px-10 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-600">
                    © {new Date().getFullYear()} 個人 ZENG CHIH YAO 與 AI coding
                </p>
                <p className="mt-2">
                    {t('footer.data_sources') ?? '資料來源'}：{t('footer.data_sources_note') ?? '賽程與隊伍名單以 WBC 官方及專案資料為準'}
                </p>
            </footer>
        </div>
    );
}

export default App;
