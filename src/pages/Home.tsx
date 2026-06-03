import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllCertMeta, getCertFlashcards } from '../utils/certLoader';

const certs = getAllCertMeta();

export default function Home() {
    const { language, getExamHistory, getFlashcardProgress } = useApp();

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 bg-[#FF9900]/10 text-[#FF9900] px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <span>⚡</span>
                    <span>
                        {language === 'en'
                            ? 'AWS Certification Study'
                            : 'Ôn thi Chứng chỉ AWS'}
                    </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'en'
                        ? 'Master AWS Certifications'
                        : 'Chinh phục Chứng chỉ AWS'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    {language === 'en'
                        ? 'Study with flashcards and practice exams following the official AWS exam format.'
                        : 'Học với flashcard và làm bài thi thử theo đúng format kỳ thi AWS chính thức.'}
                </p>
            </div>

            {/* Certification cards */}
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {certs.map((cert) => {
                    const history = getExamHistory(cert.id);
                    const progress = getFlashcardProgress(cert.id);
                    const flashcards = getCertFlashcards(cert.id);
                    const bestScore =
                        history.length > 0
                            ? Math.max(...history.map((r) => r.scaledScore))
                            : null;
                    const passCount = history.filter((r) => r.passed).length;

                    return (
                        <div
                            key={cert.id}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-[#232F3E] p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="inline-block bg-[#FF9900] text-white text-xs font-bold px-2 py-0.5 rounded mb-2">
                                            {cert.code}
                                        </span>
                                        <h2 className="text-white font-bold text-lg leading-tight">
                                            {cert.name}
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {cert.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Cert info */}
                                <div className="flex gap-4 mt-3 text-xs text-gray-300">
                                    <span>⏱ {cert.duration} min</span>
                                    <span>
                                        📋 {cert.totalQuestions} questions
                                    </span>
                                    <span>
                                        🎯 Pass: {cert.passingScore}/1000
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="p-5">
                                <div className="grid grid-cols-3 gap-3 mb-5">
                                    <StatCard
                                        label={
                                            language === 'en'
                                                ? 'Flashcards'
                                                : 'Flashcard'
                                        }
                                        value={`${progress.seen.length}/${flashcards.length}`}
                                        sub={
                                            language === 'en'
                                                ? 'Seen'
                                                : 'Đã xem'
                                        }
                                        color="blue"
                                    />
                                    <StatCard
                                        label={
                                            language === 'en'
                                                ? 'Mastered'
                                                : 'Đã thuộc'
                                        }
                                        value={String(progress.mastered.length)}
                                        sub={
                                            language === 'en' ? 'Cards' : 'Thẻ'
                                        }
                                        color="green"
                                    />
                                    <StatCard
                                        label={
                                            language === 'en'
                                                ? 'Best Score'
                                                : 'Điểm cao nhất'
                                        }
                                        value={
                                            bestScore !== null
                                                ? String(bestScore)
                                                : '—'
                                        }
                                        sub={
                                            bestScore !== null
                                                ? bestScore >= 700
                                                    ? '✅ Pass'
                                                    : '❌ Fail'
                                                : language === 'en'
                                                  ? 'No attempts'
                                                  : 'Chưa thi'
                                        }
                                        color="orange"
                                    />
                                </div>

                                {/* Exam history summary */}
                                {history.length > 0 && (
                                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                        {language === 'en'
                                            ? `${history.length} attempts · ${passCount} passed`
                                            : `${history.length} lần thi · ${passCount} lần đạt`}
                                    </div>
                                )}

                                {/* Domains */}
                                <div className="mb-5 space-y-1.5">
                                    {cert.domains.map((d) => (
                                        <div
                                            key={d.id}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-[#FF9900]/10 text-[#FF9900] flex items-center justify-center font-bold flex-shrink-0">
                                                {d.id}
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">
                                                {language === 'en'
                                                    ? d.name
                                                    : d.nameVi}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 font-medium">
                                                {d.weight}%
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTAs */}
                                <div className="flex gap-3">
                                    <Link
                                        to={`/cert/${cert.id}/flashcards`}
                                        className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                                    >
                                        {language === 'en'
                                            ? '📚 Flashcards'
                                            : '📚 Flashcard'}
                                    </Link>
                                    <Link
                                        to={`/cert/${cert.id}/exam`}
                                        className="flex-1 text-center py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#e88900] text-white text-sm font-semibold transition-colors"
                                    >
                                        {language === 'en'
                                            ? '📝 Practice Exam'
                                            : '📝 Thi thử'}
                                    </Link>
                                </div>

                                {history.length > 0 && (
                                    <Link
                                        to={`/cert/${cert.id}/history`}
                                        className="block text-center mt-2 text-xs text-gray-400 hover:text-[#FF9900] transition-colors"
                                    >
                                        {language === 'en'
                                            ? 'View exam history →'
                                            : 'Xem lịch sử thi →'}
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer info */}
            <p className="text-center text-xs text-gray-400 pb-4">
                {language === 'en'
                    ? 'Study data is stored locally in your browser. No account needed.'
                    : 'Dữ liệu học được lưu cục bộ trên trình duyệt của bạn. Không cần tài khoản.'}
            </p>
        </div>
    );
}

function StatCard({
    label,
    value,
    sub,
    color,
}: {
    label: string;
    value: string;
    sub: string;
    color: 'blue' | 'green' | 'orange';
}) {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
        orange: 'bg-orange-50 dark:bg-orange-950/30 text-[#FF9900]',
    };

    return (
        <div className={`rounded-xl p-3 text-center ${colors[color]}`}>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{label}</div>
            <div className="text-xs opacity-60 mt-0.5">{sub}</div>
        </div>
    );
}
