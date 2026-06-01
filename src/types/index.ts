export interface Domain {
    id: number;
    name: string;
    nameVi: string;
    weight: number;
}

export interface CertMeta {
    id: string;
    name: string;
    code: string;
    description: string;
    passingScore: number;
    totalQuestions: number;
    scoredQuestions: number;
    unscoredQuestions: number;
    duration: number; // minutes
    domains: Domain[];
}

export interface BilingualText {
    en: string;
    vi: string;
}

export interface Flashcard {
    id: string;
    domain: number;
    front: BilingualText;
    back: BilingualText;
    tags: string[];
}

export interface QuestionOption {
    id: string;
    en: string;
    vi: string;
}

export type QuestionType = 'multiple-choice' | 'multiple-response';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
    id: string;
    domain: number;
    type: QuestionType;
    difficulty: Difficulty;
    scored: boolean;
    question: BilingualText;
    options: QuestionOption[];
    correctAnswers: string[];
    explanation: BilingualText;
}

export interface FlashcardProgress {
    seen: string[]; // flashcard ids seen
    mastered: string[]; // flashcard ids marked as mastered
}

export interface DomainScore {
    domainId: number;
    correct: number;
    total: number;
}

export interface ExamResult {
    id: string;
    date: string;
    certId: string;
    scaledScore: number;
    passed: boolean;
    rawCorrect: number;
    rawTotal: number;
    domainScores: DomainScore[];
    answers: Record<string, string[]>; // questionId -> selected option ids
    durationSeconds: number;
}

export interface ExamSession {
    certId: string;
    questions: Question[];
    answers: Record<string, string[]>;
    flagged: string[];
    startTime: number;
    totalDuration: number; // seconds
}

export type Language = 'en' | 'vi';
export type Theme = 'light' | 'dark';

export interface AppSettings {
    language: Language;
    theme: Theme;
}
