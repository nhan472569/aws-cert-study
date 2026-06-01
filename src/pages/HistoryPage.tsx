import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import certMeta from '../data/certifications/aif-c01/meta.json';
import type { ExamResult } from '../types';

export default function HistoryPage() {
    const { certId } = useParams<{ certId: string }>();
    const { language, getExamHistory } = useApp();

    const history: ExamResult[] = getExamHistory(certId!)
        .slice()
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

    const passCount = history.filter((r) => r.passed).length;
    const bestScore =
        history.length > 0 ? Math.max(...history.map((r) => r.scaledScore)) : 0;
    const avgScore =
        history.length > 0
            ? Math.round(
                  history.reduce((s, r) => s + r.scaledScore, 0) /
                      history.length,
              )
            : 0;

    // Weakest domain across all history
    const domainTotals: Record<number, { correct: number; total: number }> = {};
    history.forEach((result) => {
        result.domainScores.forEach((ds) => {
            if (!domainTotals[ds.domainId])
                domainTotals[ds.domainId] = { correct: 0, total: 0 };
            domainTotals[ds.domainId].correct += ds.correct;
            domainTotals[ds.domainId].total += ds.total;
        });
    });
    const domainPcts = Object.entries(domainTotals).map(
        ([id, { correct, total }]) => ({
            id: Number(id),
            pct: total > 0 ? correct / total : 1,
        }),
    );
    const weakest = domainPcts.sort((a, b) => a.pct - b.pct)[0];
    const weakestDomain = weakest
        ? certMeta.domains.find((d) => d.id === weakest.id)
        : null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="text-sm text-gray-500 hover:text-[#FF9900] transition-colors"
                >
                    ← {language === 'en' ? 'Back' : 'Quay lại'}
                </Link>
                <h1 className="font-bold text-gray-900 dark:text-white text-lg">
                    {language === 'en' ? 'Exam History' : 'Lịch sử thi'} ·{' '}
                    {certMeta.code}
                </h1>
                <div />
            </div>

            {/* Stats overview */}
            {history.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        {
                            label:
                                language === 'en' ? 'Attempts' : 'Số lần thi',
                            value: history.length,
                        },
                        {
                            label:
                                language === 'en' ? 'Pass Rate' : 'Tỉ lệ đạt',
                            value: `${Math.round((passCount / history.length) * 100)}%`,
                        },
                        {
                            label:
                                language === 'en'
                                    ? 'Best Score'
                                    : 'Điểm cao nhất',
                            value: bestScore,
                        },
                        {
                            label: language === 'en' ? 'Avg Score' : 'Điểm TB',
                            value: avgScore,
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center"
                        >
                            <div className="text-2xl font-black text-[#FF9900]">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart: score over time */}
            {history.length > 1 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'en'
                            ? '📈 Score Trend'
                            : '📈 Xu hướng điểm số'}
                    </h2>
                    <ScoreChart results={[...history].reverse()} />
                </div>
            )}

            {/* Weakest domain */}
            {weakestDomain && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                        ⚠️{' '}
                        {language === 'en'
                            ? 'Weakest Domain: '
                            : 'Domain yếu nhất: '}
                    </span>
                    <span className="text-amber-700 dark:text-amber-300">
                        D{weakestDomain.id}:{' '}
                        {language === 'en'
                            ? weakestDomain.name
                            : weakestDomain.nameVi}{' '}
                        ({Math.round((weakest?.pct ?? 0) * 100)}%)
                    </span>
                </div>
            )}

            {/* History list */}
            {history.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📝</p>
                    <p className="font-medium">
                        {language === 'en'
                            ? 'No exam history yet.'
                            : 'Chưa có lịch sử thi.'}
                    </p>
                    <Link
                        to={`/cert/${certId}/exam`}
                        className="mt-4 inline-block px-5 py-2.5 bg-[#FF9900] text-white rounded-xl font-semibold text-sm hover:bg-[#e88900] transition-colors"
                    >
                        {language === 'en'
                            ? 'Take your first exam →'
                            : 'Thi thử ngay →'}
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {language === 'en'
                            ? 'All Attempts'
                            : 'Tất cả các lần thi'}
                    </h2>
                    {history.map((result, idx) => {
                        const date = new Date(result.date);
                        const m = Math.floor(result.durationSeconds / 60);
                        const s = result.durationSeconds % 60;
                        return (
                            <div
                                key={result.id}
                                className={`bg-white dark:bg-gray-900 rounded-xl border-2 p-4 ${
                                    result.passed
                                        ? 'border-green-200 dark:border-green-800'
                                        : 'border-red-200 dark:border-red-800'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xl font-black ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                            >
                                                {result.scaledScore}
                                            </span>
                                            <span
                                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    result.passed
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {result.passed
                                                    ? language === 'en'
                                                        ? 'PASS'
                                                        : 'ĐẠT'
                                                    : language === 'en'
                                                      ? 'FAIL'
                                                      : 'CHƯA ĐẠT'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {result.rawCorrect}/
                                            {result.rawTotal}{' '}
                                            {language === 'en'
                                                ? 'correct'
                                                : 'đúng'}{' '}
                                            · {m}m {s}s
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">
                                            #{history.length - idx}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {date.toLocaleDateString(
                                                language === 'en'
                                                    ? 'en-US'
                                                    : 'vi-VN',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {date.toLocaleTimeString(
                                                language === 'en'
                                                    ? 'en-US'
                                                    : 'vi-VN',
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Mini domain bar */}
                                <div className="mt-3 flex gap-1">
                                    {result.domainScores.map((ds) => {
                                        const pct =
                                            ds.total > 0
                                                ? (ds.correct / ds.total) * 100
                                                : 0;
                                        return (
                                            <div
                                                key={ds.domainId}
                                                className="flex-1"
                                                title={`D${ds.domainId}: ${Math.round(pct)}%`}
                                            >
                                                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800">
                                                    <div
                                                        className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-center text-gray-400 text-[10px] mt-0.5">
                                                    D{ds.domainId}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex gap-3 pb-8">
                <Link
                    to={`/cert/${certId}/exam`}
                    className="flex-1 py-3 rounded-xl bg-[#FF9900] hover:bg-[#e88900] text-white font-bold text-center transition-colors"
                >
                    {language === 'en' ? '📝 Take New Exam' : '📝 Thi thử mới'}
                </Link>
            </div>
        </div>
    );
}

function ScoreChart({ results }: { results: ExamResult[] }) {
    const max = 1000;
    const height = 120;
    const width = 400;
    const padX = 30;
    const padY = 10;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const points = results.map((r, i) => {
        const x =
            padX +
            (results.length === 1
                ? chartW / 2
                : (i / (results.length - 1)) * chartW);
        const y = padY + chartH - (r.scaledScore / max) * chartH;
        return { x, y, score: r.scaledScore, passed: r.passed };
    });

    const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
    const passY = padY + chartH - (700 / max) * chartH;

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ minWidth: '280px' }}
            >
                {/* Pass line */}
                <line
                    x1={padX}
                    y1={passY}
                    x2={width - padX}
                    y2={passY}
                    stroke="#FF9900"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.6"
                />
                <text
                    x={padX - 4}
                    y={passY + 4}
                    fontSize="8"
                    fill="#FF9900"
                    textAnchor="end"
                >
                    700
                </text>

                {/* Line */}
                <polyline
                    points={polyline}
                    fill="none"
                    stroke="#FF9900"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Dots */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill={p.passed ? '#22c55e' : '#ef4444'}
                            stroke="white"
                            strokeWidth="1.5"
                        />
                        <text
                            x={p.x}
                            y={p.y - 8}
                            fontSize="9"
                            fill={p.passed ? '#22c55e' : '#ef4444'}
                            textAnchor="middle"
                        >
                            {p.score}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
