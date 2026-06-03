import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Flashcard } from '../types';
import { getCertFlashcards, getCertMeta } from '../utils/certLoader';
import { shuffleArray } from '../utils/examScoring';

export default function FlashcardPage() {
    const { certId } = useParams<{ certId: string }>();
    const { language, getFlashcardProgress, setFlashcardProgress } = useApp();

    const allFlashcards = getCertFlashcards(certId!);
    const certMeta = getCertMeta(certId!);
    const progress = getFlashcardProgress(certId!);

    const [selectedDomain, setSelectedDomain] = useState<number | 'all'>('all');
    const [shuffled, setShuffled] = useState(false);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [showBothLangs, setShowBothLangs] = useState(true);

    // Build card list
    useEffect(() => {
        let filtered =
            selectedDomain === 'all'
                ? allFlashcards
                : allFlashcards.filter((c) => c.domain === selectedDomain);
        if (shuffled) filtered = shuffleArray(filtered);
        setCards(filtered);
        setCurrentIndex(0);
        setFlipped(false);
    }, [selectedDomain, shuffled]);

    const currentCard = cards[currentIndex];

    const goNext = useCallback(() => {
        setFlipped(false);
        setTimeout(
            () => setCurrentIndex((i) => Math.min(i + 1, cards.length - 1)),
            flipped ? 200 : 0,
        );
    }, [cards.length, flipped]);

    const goPrev = useCallback(() => {
        setFlipped(false);
        setTimeout(
            () => setCurrentIndex((i) => Math.max(i - 1, 0)),
            flipped ? 200 : 0,
        );
    }, [flipped]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goNext, goPrev]);

    // Mark seen
    useEffect(() => {
        if (!currentCard) return;
        if (!progress.seen.includes(currentCard.id)) {
            setFlashcardProgress(certId!, {
                ...progress,
                seen: [...progress.seen, currentCard.id],
            });
        }
    }, [currentCard?.id]);

    const toggleMastered = () => {
        if (!currentCard) return;
        const isMastered = progress.mastered.includes(currentCard.id);
        setFlashcardProgress(certId!, {
            ...progress,
            mastered: isMastered
                ? progress.mastered.filter((id) => id !== currentCard.id)
                : [...progress.mastered, currentCard.id],
        });
    };

    if (!certMeta) {
        return (
            <div className="text-center py-20 text-gray-400">
                {language === 'en'
                    ? 'Certification not found.'
                    : 'Không tìm thấy chứng chỉ.'}
            </div>
        );
    }

    if (!cards.length) {
        return (
            <div className="text-center py-20 text-gray-400">
                {language === 'en'
                    ? 'No flashcards found.'
                    : 'Không tìm thấy flashcard.'}
            </div>
        );
    }

    const isMastered = currentCard
        ? progress.mastered.includes(currentCard.id)
        : false;
    const seenCount = cards.filter((c) => progress.seen.includes(c.id)).length;

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF9900] transition-colors"
                >
                    ← {language === 'en' ? 'Back' : 'Quay lại'}
                </Link>
                <h1 className="font-bold text-gray-900 dark:text-white text-lg">
                    {language === 'en' ? 'Flashcards' : 'Flashcard'} ·{' '}
                    {certMeta.code}
                </h1>
                <div className="text-sm text-gray-400">
                    {currentIndex + 1} / {cards.length}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                    className="bg-[#FF9900] h-2 rounded-full transition-all"
                    style={{ width: `${(seenCount / cards.length) * 100}%` }}
                />
            </div>
            <p className="text-xs text-gray-400 text-center">
                {language === 'en'
                    ? `${seenCount} seen · ${progress.mastered.length} mastered`
                    : `${seenCount} đã xem · ${progress.mastered.length} đã thuộc`}
            </p>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
                {/* Domain filter */}
                <select
                    value={selectedDomain}
                    onChange={(e) =>
                        setSelectedDomain(
                            e.target.value === 'all'
                                ? 'all'
                                : Number(e.target.value),
                        )
                    }
                    className="text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5"
                >
                    <option value="all">
                        {language === 'en' ? 'All Domains' : 'Tất cả Domain'}
                    </option>
                    {certMeta.domains.map((d) => (
                        <option key={d.id} value={d.id}>
                            D{d.id}:{' '}
                            {language === 'en'
                                ? d.name.substring(0, 20)
                                : d.nameVi.substring(0, 20)}
                            …
                        </option>
                    ))}
                </select>

                <div className="flex gap-2">
                    {/* Shuffle */}
                    <button
                        onClick={() => setShuffled((s) => !s)}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                            shuffled
                                ? 'bg-[#FF9900] border-[#FF9900] text-white'
                                : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#FF9900]'
                        }`}
                    >
                        🔀 {language === 'en' ? 'Shuffle' : 'Xáo bài'}
                    </button>

                    {/* Bilingual */}
                    <button
                        onClick={() => setShowBothLangs((s) => !s)}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                            showBothLangs
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        🌐 {language === 'en' ? 'Bilingual' : 'Song ngữ'}
                    </button>
                </div>
            </div>

            {/* Flashcard */}
            <div
                className="flashcard-container cursor-pointer select-none"
                style={{ height: '320px' }}
                onClick={() => setFlipped((f) => !f)}
            >
                <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
                    {/* Front */}
                    <div className="flashcard-face bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center shadow-sm">
                        <div className="text-xs font-semibold text-[#FF9900] mb-3 uppercase tracking-wide">
                            {language === 'en' ? 'Question' : 'Câu hỏi'} ·
                            Domain {currentCard?.domain}
                        </div>
                        {showBothLangs ? (
                            <div className="text-center space-y-2">
                                <p className="text-gray-900 dark:text-white font-semibold text-lg leading-snug">
                                    {currentCard?.front.en}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-base">
                                    {currentCard?.front.vi}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-900 dark:text-white font-semibold text-lg text-center leading-snug">
                                {currentCard?.front[language]}
                            </p>
                        )}
                        <p className="text-xs text-gray-400 mt-4">
                            {language === 'en'
                                ? 'Click or press Space to flip'
                                : 'Nhấp hoặc nhấn Space để lật'}
                        </p>
                    </div>

                    {/* Back */}
                    <div className="flashcard-face flashcard-back bg-[#232F3E] rounded-2xl border-2 border-[#FF9900]/40 p-6 flex flex-col items-center justify-center shadow-sm">
                        <div className="text-xs font-semibold text-[#FF9900] mb-3 uppercase tracking-wide">
                            {language === 'en' ? 'Answer' : 'Đáp án'}
                        </div>
                        {showBothLangs ? (
                            <div className="text-center space-y-2">
                                <p className="text-white font-medium text-base leading-relaxed">
                                    {currentCard?.back.en}
                                </p>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {currentCard?.back.vi}
                                </p>
                            </div>
                        ) : (
                            <p className="text-white font-medium text-base text-center leading-relaxed">
                                {currentCard?.back[language]}
                            </p>
                        )}
                        {/* Tags */}
                        {currentCard?.tags && (
                            <div className="flex flex-wrap gap-1 mt-3 justify-center">
                                {currentCard.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                    ← {language === 'en' ? 'Prev' : 'Trước'}
                </button>

                <button
                    onClick={toggleMastered}
                    className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                        isMastered
                            ? 'bg-green-500 text-white'
                            : 'border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-500'
                    }`}
                >
                    {isMastered ? '✅ ' : '○ '}
                    {language === 'en' ? 'Mastered' : 'Đã thuộc'}
                </button>

                <button
                    onClick={goNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex-1 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#e88900] text-white disabled:opacity-30 transition-colors font-medium"
                >
                    {language === 'en' ? 'Next' : 'Tiếp'} →
                </button>
            </div>

            <p className="text-center text-xs text-gray-400">
                {language === 'en'
                    ? '← → arrow keys · Space to flip'
                    : 'Phím ← → di chuyển · Space để lật'}
            </p>
        </div>
    );
}
