import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ExamSession } from '../types';
import { getCertMeta, getCertQuestions } from '../utils/certLoader';
import { shuffleArray } from '../utils/examScoring';

type Mode = 'config' | 'exam';

export default function ExamPage() {
    const { certId } = useParams<{ certId: string }>();
    const { language } = useApp();
    const navigate = useNavigate();

    const allQuestions = getCertQuestions(certId!);
    const certMeta = getCertMeta(certId!);

    const [mode, setMode] = useState<Mode>('config');
    const [questionCount, setQuestionCount] = useState(65);
    const [session, setSession] = useState<ExamSession | null>(null);

    if (!certMeta) {
        return (
            <div className="text-center py-20 text-gray-400">
                {language === 'en'
                    ? 'Certification not found.'
                    : 'Không tìm thấy chứng chỉ.'}
            </div>
        );
    }

    const startExam = () => {
        const shuffled = shuffleArray(allQuestions);
        const selected = shuffled.slice(0, questionCount);
        const newSession: ExamSession = {
            certId: certId!,
            questions: selected,
            answers: {},
            flagged: [],
            startTime: Date.now(),
            totalDuration:
                questionCount === 65
                    ? 90 * 60
                    : questionCount <= 20
                      ? 30 * 60
                      : 45 * 60,
        };
        setSession(newSession);
        setMode('exam');
    };

    if (mode === 'config') {
        return (
            <ExamConfig
                language={language}
                certMeta={certMeta}
                questionCount={questionCount}
                setQuestionCount={setQuestionCount}
                onStart={startExam}
            />
        );
    }

    if (mode === 'exam' && session) {
        return (
            <ExamRoom
                session={session}
                language={language}
                onSubmit={(answers, elapsed) => {
                    navigate(`/cert/${certId}/results`, {
                        state: {
                            questions: session.questions,
                            answers,
                            durationSeconds: elapsed,
                            certId,
                        },
                    });
                }}
                onUpdate={(updated) => setSession(updated)}
            />
        );
    }

    return null;
}

function ExamConfig({
    language,
    certMeta,
    questionCount,
    setQuestionCount,
    onStart,
}: {
    language: 'en' | 'vi';
    certMeta: import('../types').CertMeta | null;
    questionCount: number;
    setQuestionCount: (n: number) => void;
    onStart: () => void;
}) {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const presets = [
        {
            label:
                language === 'en'
                    ? 'Quick (20Q · 30min)'
                    : 'Nhanh (20 câu · 30 phút)',
            value: 20,
        },
        {
            label:
                language === 'en'
                    ? 'Practice (40Q · 45min)'
                    : 'Luyện tập (40 câu · 45 phút)',
            value: 40,
        },
        {
            label:
                language === 'en'
                    ? 'Full Exam (65Q · 90min)'
                    : 'Thi đầy đủ (65 câu · 90 phút)',
            value: 65,
        },
    ];

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="text-sm text-gray-500 hover:text-[#FF9900]"
                >
                    ← {language === 'en' ? 'Back' : 'Quay lại'}
                </Link>
            </div>
            {isOffline && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                                {language === 'en'
                                    ? 'You are offline'
                                    : 'Bạn đang offline'}
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                {language === 'en'
                                    ? 'You can still take the exam using cached questions, but your results may not sync until you are back online.'
                                    : 'Bạn vẫn có thể làm bài thi với các câu hỏi đã lưu, nhưng kết quả có thể không đồng bộ cho đến khi bạn online trở lại.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {language === 'en' ? '📝 Practice Exam' : '📝 Thi thử'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {language === 'en'
                            ? `${certMeta?.code} · Scaled score 100–1000 · Pass: ${certMeta?.passingScore}`
                            : `${certMeta?.code} · Thang điểm 100–1000 · Đạt: ${certMeta?.passingScore}`}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {language === 'en' ? 'Exam Mode' : 'Chế độ thi'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {presets.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setQuestionCount(p.value)}
                                className={`text-sm py-3 px-2 rounded-xl border text-center transition-colors ${
                                    questionCount === p.value
                                        ? 'bg-[#FF9900] border-[#FF9900] text-white font-semibold'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#FF9900]'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        📌{' '}
                        {language === 'en'
                            ? 'Multiple-choice & multiple-response questions'
                            : 'Câu hỏi chọn 1 và chọn nhiều đáp án'}
                    </p>
                    <p>
                        ⚖️{' '}
                        {language === 'en'
                            ? 'Multiple-response: ALL correct answers required for full credit'
                            : 'Chọn nhiều: cần chọn ĐÚNG TẤT CẢ đáp án mới tính điểm'}
                    </p>
                    <p>
                        🏁{' '}
                        {language === 'en'
                            ? 'Flag questions to review before submitting'
                            : 'Đánh dấu câu hỏi để xem lại trước khi nộp'}
                    </p>
                    <p>
                        📊{' '}
                        {language === 'en'
                            ? 'Results include per-domain performance breakdown'
                            : 'Kết quả bao gồm phân tích từng domain'}
                    </p>
                </div>

                <button
                    onClick={onStart}
                    className="w-full py-3 rounded-xl bg-[#FF9900] hover:bg-[#e88900] text-white font-bold text-lg transition-colors"
                >
                    {language === 'en' ? '🚀 Start Exam' : '🚀 Bắt đầu thi'}
                </button>
            </div>
        </div>
    );
}

function ExamRoom({
    session,
    language,
    onSubmit,
    onUpdate,
}: {
    session: ExamSession;
    language: 'en' | 'vi';
    onSubmit: (answers: Record<string, string[]>, elapsed: number) => void;
    onUpdate: (s: ExamSession) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [showNavigator, setShowNavigator] = useState(false);
    const [submitConfirm, setSubmitConfirm] = useState(false);

    // Timer
    useState(() => {
        const interval = setInterval(() => {
            setElapsed((e) => {
                if (e >= session.totalDuration) {
                    clearInterval(interval);
                    onSubmit(session.answers, e);
                }
                return e + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    });

    const remaining = session.totalDuration - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const isWarning = remaining <= 300; // 5 min

    const q = session.questions[currentIndex];
    const selectedAnswers = session.answers[q.id] ?? [];
    const isFlagged = session.flagged.includes(q.id);

    const handleSelect = (optId: string) => {
        const current = session.answers[q.id] ?? [];
        let next: string[];
        if (q.type === 'multiple-choice') {
            next = [optId];
        } else {
            next = current.includes(optId)
                ? current.filter((id) => id !== optId)
                : [...current, optId];
        }
        onUpdate({ ...session, answers: { ...session.answers, [q.id]: next } });
    };

    const toggleFlag = () => {
        const flagged = isFlagged
            ? session.flagged.filter((id) => id !== q.id)
            : [...session.flagged, q.id];
        onUpdate({ ...session, flagged });
    };

    const answeredCount = Object.keys(session.answers).filter(
        (id) => session.answers[id].length > 0,
    ).length;
    const totalQ = session.questions.length;

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Top bar */}
            <div className="flex items-center justify-between bg-[#232F3E] text-white rounded-xl px-4 py-3">
                <div className="text-sm">
                    <span className="text-gray-400">
                        {language === 'en' ? 'Q' : 'Câu'}{' '}
                    </span>
                    <span className="font-bold">{currentIndex + 1}</span>
                    <span className="text-gray-400"> / {totalQ}</span>
                </div>

                <div
                    className={`font-mono text-xl font-bold ${isWarning ? 'text-red-400 animate-pulse' : 'text-[#FF9900]'}`}
                >
                    {String(minutes).padStart(2, '0')}:
                    {String(seconds).padStart(2, '0')}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowNavigator((s) => !s)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {language === 'en' ? 'Navigator' : 'Bản đồ'}
                    </button>
                    <button
                        onClick={() => setSubmitConfirm(true)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#FF9900] hover:bg-[#e88900] font-semibold transition-colors"
                    >
                        {language === 'en' ? 'Submit' : 'Nộp bài'}
                    </button>
                </div>
            </div>

            {/* Question Navigator */}
            {showNavigator && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {language === 'en'
                            ? `Question Navigator · ${answeredCount}/${totalQ} answered`
                            : `Bản đồ câu hỏi · ${answeredCount}/${totalQ} đã trả lời`}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {session.questions.map((question, idx) => {
                            const ans = session.answers[question.id] ?? [];
                            const flagged = session.flagged.includes(
                                question.id,
                            );
                            const isAnswered = ans.length > 0;
                            const isCurrent = idx === currentIndex;
                            return (
                                <button
                                    key={question.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                        isCurrent
                                            ? 'bg-[#FF9900] text-white ring-2 ring-[#FF9900] ring-offset-1'
                                            : flagged
                                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-400'
                                              : isAnswered
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-400">
                        <span>
                            <span className="inline-block w-3 h-3 rounded bg-green-200 mr-1" />{' '}
                            {language === 'en' ? 'Answered' : 'Đã trả lời'}
                        </span>
                        <span>
                            <span className="inline-block w-3 h-3 rounded bg-yellow-200 mr-1" />{' '}
                            {language === 'en' ? 'Flagged' : 'Đã đánh dấu'}
                        </span>
                        <span>
                            <span className="inline-block w-3 h-3 rounded bg-gray-200 mr-1" />{' '}
                            {language === 'en' ? 'Unanswered' : 'Chưa trả lời'}
                        </span>
                    </div>
                </div>
            )}

            {/* Question card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                {/* Meta */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#FF9900]/10 text-[#FF9900] font-semibold px-2 py-0.5 rounded">
                            Domain {q.domain}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                            {q.type === 'multiple-response'
                                ? language === 'en'
                                    ? 'Multiple Response'
                                    : 'Chọn nhiều'
                                : language === 'en'
                                  ? 'Multiple Choice'
                                  : 'Chọn 1'}
                        </span>
                        {!q.scored && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                                {language === 'en'
                                    ? 'Unscored'
                                    : 'Không chấm điểm'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={toggleFlag}
                        className={`text-lg transition-colors ${isFlagged ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                        title={
                            language === 'en'
                                ? 'Flag for review'
                                : 'Đánh dấu xem lại'
                        }
                    >
                        🚩
                    </button>
                </div>

                {/* Question text */}
                <div>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg leading-relaxed">
                        {q.question.en}
                    </p>
                    {language === 'vi' && (
                        <p className="text-gray-500 dark:text-gray-400 text-base mt-1 leading-relaxed">
                            {q.question.vi}
                        </p>
                    )}
                    {q.type === 'multiple-response' && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                            ✦{' '}
                            {language === 'en'
                                ? `Select ${q.correctAnswers.length} answers`
                                : `Chọn ${q.correctAnswers.length} đáp án`}
                        </p>
                    )}
                </div>

                {/* Options */}
                <div className="space-y-2">
                    {q.options.map((opt) => {
                        const isSelected = selectedAnswers.includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelect(opt.id)}
                                className={`w-full text-left rounded-xl border-2 p-3.5 transition-all ${
                                    isSelected
                                        ? 'border-[#FF9900] bg-[#FF9900]/5 dark:bg-[#FF9900]/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                                            isSelected
                                                ? 'border-[#FF9900] bg-[#FF9900] text-white'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-500'
                                        }`}
                                    >
                                        {opt.id}
                                    </span>
                                    <div>
                                        <p className="text-gray-900 dark:text-white text-sm font-medium">
                                            {opt.en}
                                        </p>
                                        {language === 'vi' &&
                                            opt.vi !== opt.en && (
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                                    {opt.vi}
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                    ← {language === 'en' ? 'Previous' : 'Trước'}
                </button>
                <button
                    onClick={() =>
                        setCurrentIndex((i) => Math.min(totalQ - 1, i + 1))
                    }
                    disabled={currentIndex === totalQ - 1}
                    className="flex-1 py-3 rounded-xl bg-[#FF9900] hover:bg-[#e88900] text-white disabled:opacity-30 transition-colors font-medium"
                >
                    {language === 'en' ? 'Next' : 'Tiếp theo'} →
                </button>
            </div>

            {/* Submit confirmation modal */}
            {submitConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {language === 'en'
                                ? 'Submit Exam?'
                                : 'Nộp bài thi?'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            {language === 'en'
                                ? `${answeredCount}/${totalQ} questions answered`
                                : `${answeredCount}/${totalQ} câu đã trả lời`}
                        </p>
                        {answeredCount < totalQ && (
                            <p className="text-yellow-600 dark:text-yellow-400 text-sm mb-4">
                                ⚠️{' '}
                                {language === 'en'
                                    ? `${totalQ - answeredCount} unanswered questions will be counted as wrong.`
                                    : `${totalQ - answeredCount} câu chưa trả lời sẽ tính là sai.`}
                            </p>
                        )}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setSubmitConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                            >
                                {language === 'en' ? 'Cancel' : 'Hủy'}
                            </button>
                            <button
                                onClick={() =>
                                    onSubmit(session.answers, elapsed)
                                }
                                className="flex-1 py-2.5 rounded-xl bg-[#FF9900] text-white font-bold"
                            >
                                {language === 'en' ? 'Submit' : 'Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
