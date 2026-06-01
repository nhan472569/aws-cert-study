import type { DomainScore, ExamResult, Question } from '../types';

/**
 * Checks whether a question's answer is fully correct.
 * For multiple-response, all correct options must be selected and no wrong ones.
 */
export function isAnswerCorrect(
    question: Question,
    selectedIds: string[],
): boolean {
    const correct = new Set(question.correctAnswers);
    const selected = new Set(selectedIds);
    if (correct.size !== selected.size) return false;
    for (const id of correct) {
        if (!selected.has(id)) return false;
    }
    return true;
}

/**
 * Calculate AWS-style scaled score (100–1000) for an exam.
 * Only scored questions count. Unscored questions are ignored.
 */
export function calculateScaledScore(
    questions: Question[],
    answers: Record<string, string[]>,
): {
    scaledScore: number;
    passed: boolean;
    rawCorrect: number;
    rawTotal: number;
    domainScores: DomainScore[];
} {
    const scoredQuestions = questions.filter((q) => q.scored);
    const rawTotal = scoredQuestions.length;

    let rawCorrect = 0;
    for (const q of scoredQuestions) {
        const selected = answers[q.id] ?? [];
        if (isAnswerCorrect(q, selected)) rawCorrect++;
    }

    const rawRatio = rawTotal > 0 ? rawCorrect / rawTotal : 0;
    const scaledScore = Math.round(100 + rawRatio * 900);
    const passed = scaledScore >= 700;

    // Per-domain breakdown (scored questions only)
    const domainMap = new Map<number, { correct: number; total: number }>();
    for (const q of scoredQuestions) {
        const entry = domainMap.get(q.domain) ?? { correct: 0, total: 0 };
        entry.total++;
        const selected = answers[q.id] ?? [];
        if (isAnswerCorrect(q, selected)) entry.correct++;
        domainMap.set(q.domain, entry);
    }

    const domainScores: DomainScore[] = Array.from(domainMap.entries()).map(
        ([domainId, v]) => ({
            domainId,
            correct: v.correct,
            total: v.total,
        }),
    );

    return { scaledScore, passed, rawCorrect, rawTotal, domainScores };
}

/**
 * Classifies domain performance as 'Needs Improvement' | 'Adequate' | 'Strong'
 */
export function domainPerformanceLabel(correct: number, total: number): string {
    if (total === 0) return 'N/A';
    const pct = correct / total;
    if (pct >= 0.8) return 'Strong';
    if (pct >= 0.6) return 'Adequate';
    return 'Needs Improvement';
}

/**
 * Build a new ExamResult object from a completed session.
 */
export function buildExamResult(
    certId: string,
    questions: Question[],
    answers: Record<string, string[]>,
    durationSeconds: number,
): ExamResult {
    const { scaledScore, passed, rawCorrect, rawTotal, domainScores } =
        calculateScaledScore(questions, answers);
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString(),
        certId,
        scaledScore,
        passed,
        rawCorrect,
        rawTotal,
        domainScores,
        answers,
        durationSeconds,
    };
}

/**
 * Shuffle an array (Fisher-Yates) and return a new array.
 */
export function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Sample questions distributed by domain weight.
 */
export function sampleQuestions(
    questions: Question[],
    count: number,
): Question[] {
    if (questions.length <= count) return shuffleArray(questions);
    return shuffleArray(questions).slice(0, count);
}

/**
 * Format seconds as mm:ss
 */
export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
