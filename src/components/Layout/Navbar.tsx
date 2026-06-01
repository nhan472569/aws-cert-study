import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
    const { language, setLanguage, theme, setTheme } = useApp();
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 bg-[#232F3E] text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 font-bold text-lg"
                >
                    <span className="text-[#FF9900]">AWS</span>
                    <span className="hidden sm:inline text-sm font-medium text-gray-300">
                        Cert Study
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    {/* Language toggle */}
                    <button
                        onClick={() =>
                            setLanguage(language === 'en' ? 'vi' : 'en')
                        }
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
                        title="Toggle language"
                    >
                        {language === 'en' ? '🇻🇳 VI' : '🇺🇸 EN'}
                    </button>

                    {/* Theme toggle */}
                    <button
                        onClick={() =>
                            setTheme(theme === 'light' ? 'dark' : 'light')
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            {/* Breadcrumb hint */}
            {location.pathname !== '/' && (
                <div className="bg-[#1a2332] px-4 py-1 text-xs text-gray-400 max-w-6xl mx-auto">
                    <Link
                        to="/"
                        className="hover:text-[#FF9900] transition-colors"
                    >
                        Home
                    </Link>
                    {location.pathname.includes('/flashcards') && (
                        <span> / Flashcards</span>
                    )}
                    {location.pathname.includes('/exam') && (
                        <span> / Exam</span>
                    )}
                    {location.pathname.includes('/results') && (
                        <span> / Results</span>
                    )}
                </div>
            )}
        </nav>
    );
}
