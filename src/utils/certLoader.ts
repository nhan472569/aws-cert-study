import type { CertMeta, Flashcard, Question } from '../types';

// Import all certification data files using Vite's glob import
const metaFiles = import.meta.glob<{ default: CertMeta }>(
    '/src/data/certifications/*/meta.json',
    { eager: true },
);

const flashcardFiles = import.meta.glob<{ default: Flashcard[] }>(
    '/src/data/certifications/*/flashcards.json',
    { eager: true },
);

const questionFiles = import.meta.glob<{ default: Question[] }>(
    '/src/data/certifications/*/questions.json',
    { eager: true },
);

/**
 * Get metadata for a specific certification
 */
export function getCertMeta(certId: string): CertMeta | null {
    const path = `/src/data/certifications/${certId}/meta.json`;
    return metaFiles[path]?.default ?? null;
}

/**
 * Get all available certifications
 */
export function getAllCertMeta(): CertMeta[] {
    return Object.values(metaFiles).map((m) => m.default);
}

/**
 * Get flashcards for a specific certification
 */
export function getCertFlashcards(certId: string): Flashcard[] {
    const path = `/src/data/certifications/${certId}/flashcards.json`;
    return flashcardFiles[path]?.default ?? [];
}

/**
 * Get exam questions for a specific certification
 */
export function getCertQuestions(certId: string): Question[] {
    const path = `/src/data/certifications/${certId}/questions.json`;
    return questionFiles[path]?.default ?? [];
}
