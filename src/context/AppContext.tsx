import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { ExamResult, FlashcardProgress, Language, Theme } from '../types';

interface AppContextType {
    language: Language;
    setLanguage: (l: Language) => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
    getFlashcardProgress: (certId: string) => FlashcardProgress;
    setFlashcardProgress: (certId: string, p: FlashcardProgress) => void;
    getExamHistory: (certId: string) => ExamResult[];
    addExamResult: (result: ExamResult) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useLocalStorage<Language>(
        'aws-study:settings:language',
        'vi',
    );
    const [theme, setTheme] = useLocalStorage<Theme>(
        'aws-study:settings:theme',
        'light',
    );
    const [flashcardProgressMap, setFlashcardProgressMap] = useLocalStorage<
        Record<string, FlashcardProgress>
    >('aws-study:progress:flashcards', {});
    const [examHistoryMap, setExamHistoryMap] = useLocalStorage<
        Record<string, ExamResult[]>
    >('aws-study:progress:exams', {});

    const getFlashcardProgress = (certId: string): FlashcardProgress =>
        flashcardProgressMap[certId] ?? { seen: [], mastered: [] };

    const setFlashcardProgress = (certId: string, p: FlashcardProgress) => {
        setFlashcardProgressMap((prev) => ({ ...prev, [certId]: p }));
    };

    const getExamHistory = (certId: string): ExamResult[] =>
        examHistoryMap[certId] ?? [];

    const addExamResult = (result: ExamResult) => {
        setExamHistoryMap((prev) => ({
            ...prev,
            [result.certId]: [...(prev[result.certId] ?? []), result],
        }));
    };

    // Apply theme class to document root
    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <AppContext.Provider
            value={{
                language,
                setLanguage,
                theme,
                setTheme,
                getFlashcardProgress,
                setFlashcardProgress,
                getExamHistory,
                addExamResult,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
