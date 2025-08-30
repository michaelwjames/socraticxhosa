import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { LessonPageProps } from '../types/index';

interface PracticeItem {
  prompt: string;
  answer: string;
}

interface Turn {
  turn_number: number;
  section: string;
  teacher_dialogue?: string;
  student_dialogue?: string;
  justification?: string;
}

interface Lesson {
  lesson_title: string;
  thinking_method_focus: string[];
  objective: string;
  key_vocabulary: Array<{
    word: string;
    meaning: string;
  }>;
  turns: Turn[];
  practice?: PracticeItem[];
}

interface CourseData {
  course_name: string;
  part_name: string;
  lessons_covered: string;
  lessons: Lesson[];
}

const LessonPracticePage: React.FC<LessonPageProps> = () => {
  const { lessonNumber = '1' } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const lesson = useMemo(() => {
    if (!courseData) return null;
    const idx = parseInt(lessonNumber, 10) - 1;
    return courseData.lessons[idx] || null;
  }, [courseData, lessonNumber]);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        // Load consolidated lesson parts (Part 1–6)
        const partFiles = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6'];
        const responses = await Promise.all(
          partFiles.map((f) => fetch(`/data/lesson_data/${f}.json`))
        );
        responses.forEach((res, i) => {
          if (!res.ok) throw new Error(`Failed to load ${partFiles[i]}`);
        });
        const parts: CourseData[] = await Promise.all(responses.map((r) => r.json()));

        const total = parts.reduce((acc, p) => acc + p.lessons.length, 0);
        const combined: CourseData = {
          course_name: parts[0]?.course_name ?? 'Course',
          part_name: parts.map((p) => p.part_name).join(' & '),
          lessons_covered: `1-${total}`,
          lessons: parts.flatMap((p) => p.lessons),
        };
        setCourseData(combined);

        const lessonNum = parseInt(lessonNumber, 10);
        if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > combined.lessons.length) {
          throw new Error('Invalid lesson number');
        }
      } catch (err) {
        console.error('Error loading lesson practice:', err);
        navigate('/course');
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [lessonNumber, navigate]);

  const items: PracticeItem[] = useMemo(() => {
    if (!lesson) return [];
    if (lesson.practice && lesson.practice.length > 0) return lesson.practice;
    // Fallback: derive from turns with student_dialogue
    const derived = (lesson.turns || [])
      .filter(t => t.student_dialogue && t.student_dialogue.trim().length > 0)
      .map<PracticeItem>((t, i) => ({
        prompt: `Say it in isiXhosa (card ${i + 1})`,
        answer: t.student_dialogue!.trim(),
      }));
    return derived;
  }, [lesson]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === Math.max(items.length - 1, 0);

  const goNext = () => {
    if (!isLast) {
      setCurrentIndex(i => i + 1);
      setShowAnswer(false);
    }
  };
  const goPrev = () => {
    if (!isFirst) {
      setCurrentIndex(i => i - 1);
      setShowAnswer(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading practice…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to={`/lesson/${lessonNumber}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">← Back to Lesson</Link>
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">Practice</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">No practice items found for this lesson.</p>
        </div>
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-4 py-8 pt-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={`/lesson/${lessonNumber}`} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lesson
            </Link>
            <span className="text-sm text-gray-600 dark:text-gray-300">Card {currentIndex + 1} of {items.length}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Practice</h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">{lesson.lesson_title.replace(/\*\*/g, '')}</div>

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
                    to={`/lesson/${lessonNumber}`}
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
        </div>
      </div>
    </div>
  );
};

export default LessonPracticePage;
