import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Question } from '../types';
import { getCertMeta } from '../utils/certLoader';
import { buildExamResult, domainPerformanceLabel } from '../utils/examScoring';

export default function ResultsPage() {
    const { certId } = useParams<{ certId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { language, addExamResult } = useApp();

    const certMeta = getCertMeta(certId!);

    const state = location.state as {
        questions: Question[];
        answers: Record<string, string[]>;
        durationSeconds: number;
        certId: string;
    } | null;

    const result = state
        ? buildExamResult(
              state.certId,
              state.questions,
              state.answers,
              state.durationSeconds,
          )
        : null;

    useEffect(() => {
        if (!state) navigate('/');
    }, []);

    // Save once using a ref pattern via useEffect with mount guard
    useEffect(() => {
        if (result) addExamResult(result);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!state || !certMeta || !result) return null;

    const passed = result.passed;
    const domainMap = Object.fromEntries(
        certMeta.domains.map((d) => [d.id, { name: d.name, nameVi: d.nameVi }]),
    );

    const minutes = Math.floor(result.durationSeconds / 60);
    const seconds = result.durationSeconds % 60;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Score Hero */}
            <div
                className={`rounded-2xl p-8 text-center ${passed ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400' : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400'}`}
            >
                <div
                    className={`text-7xl font-black mb-2 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                    {result.scaledScore}
                </div>
                <div
                    className={`text-2xl font-bold mb-3 ${passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                >
                    {passed
                        ? language === 'en'
                            ? '🎉 PASS'
                            : '🎉 ĐẠT'
                        : language === 'en'
                          ? '❌ FAIL'
                          : '❌ CHƯA ĐẠT'}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {language === 'en'
                        ? `Passing score: 700 · Scale: 100–1000 · ${result.rawCorrect}/${result.rawTotal} scored correct`
                        : `Điểm đạt: 700 · Thang điểm: 100–1000 · ${result.rawCorrect}/${result.rawTotal} câu chấm điểm đúng`}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                    {language === 'en'
                        ? `Time used: ${minutes}m ${seconds}s`
                        : `Thời gian: ${minutes}m ${seconds}s`}
                </p>
            </div>

            {/* Domain Breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {language === 'en'
                        ? '📊 Domain Performance'
                        : '📊 Phân tích theo Domain'}
                </h2>
                <div className="space-y-4">
                    {result.domainScores.map((ds) => {
                        const pct =
                            ds.total > 0
                                ? Math.round((ds.correct / ds.total) * 100)
                                : 0;
                        const label = domainPerformanceLabel(
                            ds.correct,
                            ds.total,
                        );
                        const domainInfo = domainMap[ds.domainId];
                        return (
                            <div key={ds.domainId}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        D{ds.domainId}:{' '}
                                        {language === 'en'
                                            ? domainInfo?.name
                                            : domainInfo?.nameVi}
                                    </span>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">
                                            {ds.correct}/{ds.total}
                                        </span>
                                        <span
                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                label === 'Strong' ||
                                                label === 'Tốt'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : label === 'Adequate' ||
                                                        label === 'Đạt'
                                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                        >
                                            {language === 'en'
                                                ? label
                                                : label === 'Strong'
                                                  ? 'Tốt'
                                                  : label === 'Adequate'
                                                    ? 'Đạt'
                                                    : 'Cần cải thiện'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            pct >= 70
                                                ? 'bg-green-500'
                                                : pct >= 50
                                                  ? 'bg-yellow-500'
                                                  : 'bg-red-500'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Answer Review */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {language === 'en'
                        ? '🔍 Answer Review'
                        : '🔍 Xem lại đáp án'}
                </h2>
                <div className="space-y-4">
                    {state.questions.map((q, idx) => {
                        const selected = state.answers[q.id] ?? [];
                        const correctSet = new Set(q.correctAnswers);
                        const isCorrect =
                            q.correctAnswers.length === selected.length &&
                            selected.every((s) => correctSet.has(s));
                        return (
                            <div
                                key={q.id}
                                className={`rounded-xl border-2 p-4 ${
                                    isCorrect
                                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                                        : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                                }`}
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    <span
                                        className={`flex-shrink-0 text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {isCorrect ? '✓' : '✗'} Q{idx + 1}
                                    </span>
                                    <div>
                                        <p className="text-gray-900 dark:text-white text-sm font-medium leading-snug">
                                            {q.question.en}
                                        </p>
                                        {language === 'vi' && (
                                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                                {q.question.vi}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-6 space-y-1 text-xs">
                                    {q.options.map((opt) => {
                                        const isCorrectOpt = correctSet.has(
                                            opt.id,
                                        );
                                        const isSelectedOpt = selected.includes(
                                            opt.id,
                                        );
                                        return (
                                            <div
                                                key={opt.id}
                                                className={`flex items-center gap-2 px-2 py-1 rounded ${
                                                    isCorrectOpt
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                        : isSelectedOpt
                                                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 line-through'
                                                          : 'text-gray-500'
                                                }`}
                                            >
                                                <span className="font-bold">
                                                    {opt.id}.
                                                </span>
                                                <span>{opt.en}</span>
                                                {isCorrectOpt && (
                                                    <span className="ml-auto">
                                                        ✓
                                                    </span>
                                                )}
                                                {!isCorrectOpt &&
                                                    isSelectedOpt && (
                                                        <span className="ml-auto">
                                                            ✗
                                                        </span>
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                <div className="ml-6 mt-2 p-2 bg-white/60 dark:bg-gray-800/60 rounded text-xs text-gray-600 dark:text-gray-400 italic">
                                    💡 {q.explanation.en}
                                    {language === 'vi' && (
                                        <p className="mt-0.5 not-italic">
                                            {q.explanation.vi}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 pb-8">
                <Link
                    to={`/cert/${certId}/history`}
                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    {language === 'en' ? '📈 View History' : '📈 Lịch sử thi'}
                </Link>
                <Link
                    to={`/cert/${certId}/exam`}
                    className="flex-1 py-3 rounded-xl bg-[#FF9900] hover:bg-[#e88900] text-white font-bold text-center transition-colors"
                >
                    {language === 'en' ? '🔄 Retake Exam' : '🔄 Thi lại'}
                </Link>
            </div>
        </div>
    );
}
