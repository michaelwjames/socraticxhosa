import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LessonPageProps } from '../types/index';

interface PracticeItem {
  prompt: string;
  answer: string;
}

interface LessonKVItem {
  word: string;
  meaning: string;
}

interface LessonRaw {
  lesson_title: string;
  thinking_method_focus: string[];
  objective: string;
  key_vocabulary?: LessonKVItem[];
}

interface PartData {
  course_name: string;
  part_name: string;
  lessons_covered: string; // e.g. "1-10"
  lessons: LessonRaw[];
}

type Mode = 'lesson' | 'part' | 'course';

const partFiles = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6'];

const CourseVocabPage: React.FC<LessonPageProps> = () => {
  const [parts, setParts] = useState<PartData[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<Mode>('lesson');
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(1);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0); // 0-based

  const combinedLessons = useMemo(() => {
    if (!parts) return [] as LessonRaw[];
    return parts.flatMap((p) => p.lessons);
  }, [parts]);

  useEffect(() => {
    const loadAllParts = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all(
          partFiles.map((f) => fetch(`/data/lesson_data/${f}.json`))
        );
        responses.forEach((res, i) => {
          if (!res.ok) throw new Error(`Failed to load ${partFiles[i]}`);
        });
        const data: PartData[] = await Promise.all(responses.map((r) => r.json()));
        setParts(data);
        // Initialize selections
        const firstWithLessons = data.findIndex((p) => (p.lessons?.length ?? 0) > 0);
        setSelectedPartIndex(firstWithLessons >= 0 ? firstWithLessons : 0);
        setSelectedLessonNumber(1);
      } catch (e) {
        console.error('Error loading course vocab data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAllParts();
  }, []);

  // Build practice items based on mode/selection
  const items: PracticeItem[] = useMemo(() => {
    if (!parts || parts.length === 0) return [];

    const toPracticeItems = (kv: LessonKVItem[], fromLabel?: string): PracticeItem[] =>
      kv
        .filter((k) => k.word && k.meaning)
        .map((k) => ({
          prompt: `“${k.meaning}”` + (fromLabel ? '' : ''),
          answer: k.word.trim(),
        }));

    if (mode === 'lesson') {
      if (selectedLessonNumber < 1 || selectedLessonNumber > combinedLessons.length) return [];
      const lesson = combinedLessons[selectedLessonNumber - 1];
      const kv = lesson?.key_vocabulary ?? [];
      return toPracticeItems(kv);
    }

    if (mode === 'part') {
      const part = parts[selectedPartIndex];
      if (!part) return [];
      const allKV = part.lessons.flatMap((l) => l.key_vocabulary ?? []);
      return toPracticeItems(allKV, part.part_name);
    }

    // Entire course
    const allKV = parts.flatMap((p) => p.lessons.flatMap((l) => l.key_vocabulary ?? []));
    return toPracticeItems(allKV, 'Entire Course');
  }, [parts, combinedLessons, mode, selectedLessonNumber, selectedPartIndex]);

  // Reset card index and answer when items change
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [mode, selectedLessonNumber, selectedPartIndex]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === Math.max(items.length - 1, 0);

  const goNext = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
    }
  };
  const goPrev = () => {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
      setShowAnswer(false);
    }
  };

  // Helpers to display lesson selector labels
  const lessonOptions = useMemo(() => {
    return combinedLessons.map((l, idx) => {
      const n = idx + 1;
      const title = l.lesson_title?.replace(/\*\*/g, '').trim() || `Lesson ${n}`;
      return { value: n, label: `${n}. ${title}` };
    });
  }, [combinedLessons]);

  const partOptions = useMemo(() => {
    return (parts ?? []).map((p, idx) => ({ value: idx, label: `${idx + 1}. ${p.part_name}` }));
  }, [parts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading vocabulary…</p>
      </div>
    );
  }

  if (!parts) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/course" className="text-indigo-600 dark:text-indigo-400 hover:underline">← Back to Course</Link>
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">Course Vocabulary</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Unable to load course data.</p>
        </div>
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-4 py-8 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/course" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Course
            </Link>
            <span className="text-sm text-gray-600 dark:text-gray-300">{items.length > 0 ? `Card ${currentIndex + 1} of ${items.length}` : 'No cards'}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Vocabulary Practice</h1>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setMode('lesson')}
                    className={`px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 ${mode === 'lesson' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} rounded-l-md`}
                  >
                    By Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('part')}
                    className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 dark:border-gray-700 ${mode === 'part' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  >
                    By Part
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('course')}
                    className={`px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 ${mode === 'course' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} rounded-r-md`}
                  >
                    Entire Course
                  </button>
                </div>
              </div>

              {mode === 'lesson' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Lesson</label>
                  <select
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100"
                    value={selectedLessonNumber}
                    onChange={(e) => setSelectedLessonNumber(parseInt(e.target.value, 10))}
                  >
                    {lessonOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {mode === 'part' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Part</label>
                  <select
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100"
                    value={selectedPartIndex}
                    onChange={(e) => setSelectedPartIndex(parseInt(e.target.value, 10))}
                  >
                    {partOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Practice Card */}
          {items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300">No key vocabulary found for the current selection.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                {mode === 'lesson' && (
                  <div className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {combinedLessons[selectedLessonNumber - 1]?.lesson_title?.replace(/\*\*/g, '')}
                  </div>
                )}
                {mode === 'part' && (
                  <div className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {(parts?.[selectedPartIndex]?.part_name) ?? ''}
                  </div>
                )}

                <div className="min-h-40 md:min-h-48 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30 flex items-center justify-center text-center">
                  {!showAnswer ? (
                    <div>
                      <div className="text-gray-900 dark:text-gray-100 text-lg">{current.prompt}</div>
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                      >
                        Check Answer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-900 dark:text-gray-100 text-2xl font-semibold">{current.answer}</div>
                      <button
                        onClick={() => setShowAnswer(false)}
                        className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                      >
                        Show Prompt
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={goPrev}
                  disabled={isFirst}
                  className={`px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center ${isFirst ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7m-7 7h18" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {isLast ? (
                    <Link
                      to={mode === 'lesson' ? `/lesson/${selectedLessonNumber}` : '/course'}
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      Finish Practice
                    </Link>
                  ) : (
                    <button
                      onClick={goNext}
                      className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseVocabPage;
