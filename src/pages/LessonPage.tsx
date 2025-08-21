import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LessonPageProps } from '../types';

interface Turn {
  turn_number: number;
  section: string;
  teacher_dialogue: string;
  student_dialogue?: string;
  justification: string;
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
}

interface CourseData {
  course_name: string;
  part_name: string;
  lessons_covered: string;
  lessons: Lesson[];
}

const LessonPage: React.FC<LessonPageProps> = () => {
  const { lessonNumber = '1' } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  
  const lesson = courseData?.lessons[parseInt(lessonNumber, 10) - 1];

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        // Load Foundations (1–10), Part 2 (11–25), Part 3 (26–30), Part 3 (31–35), Part 4 (36–40), Part 4 (41–45), and Part 4 (46–50) and merge them
        const [foundRes, part2Res, part3Res, part3bRes, part4Res, part4bRes, part4cRes] = await Promise.all([
          fetch('/data/foundation_lessons.json'),
          fetch('/data/part2_lessons_11_25.json'),
          fetch('/data/part3_lessons_26_30.json'),
          fetch('/data/part3_lessons_31_35.json'),
          fetch('/data/part4_lessons_36_40.json'),
          fetch('/data/part4_lessons_41_45.json'),
          fetch('/data/part4_lessons_46_50.json')
        ]);
        if (!foundRes.ok) {
          throw new Error('Failed to load Foundations');
        }
        if (!part2Res.ok) {
          throw new Error('Failed to load Part 2');
        }
        if (!part3Res.ok) {
          throw new Error('Failed to load Part 3');
        }
        if (!part3bRes.ok) {
          throw new Error('Failed to load Part 3 (31–35)');
        }
        if (!part4Res.ok) {
          throw new Error('Failed to load Part 4 (36–40)');
        }
        if (!part4bRes.ok) {
          throw new Error('Failed to load Part 4 (41–45)');
        }
        if (!part4cRes.ok) {
          throw new Error('Failed to load Part 4 (46–50)');
        }
        const foundations: CourseData = await foundRes.json();
        const part2: CourseData = await part2Res.json();
        const part3: CourseData = await part3Res.json();
        const part3b: CourseData = await part3bRes.json();
        const part4: CourseData = await part4Res.json();
        const part4b: CourseData = await part4bRes.json();
        const part4c: CourseData = await part4cRes.json();

        const combined: CourseData = {
          course_name: foundations.course_name,
          part_name: `${foundations.part_name} & ${part2.part_name} & ${part3.part_name} & ${part3b.part_name} & ${part4.part_name} & ${part4b.part_name} & ${part4c.part_name}`,
          lessons_covered: '1-50',
          lessons: [...foundations.lessons, ...part2.lessons, ...part3.lessons, ...part3b.lessons, ...part4.lessons, ...part4b.lessons, ...part4c.lessons],
        };
        setCourseData(combined);
        
        // Validate lesson number
        const lessonNum = parseInt(lessonNumber, 10);
        if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > combined.lessons.length) {
          throw new Error('Invalid lesson number');
        }
      } catch (error) {
        console.error('Error loading lesson:', error);
        // Redirect to course page if lesson is not found
        navigate('/course');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonNumber, navigate]);

  useEffect(() => {
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }
  }, []);

  const updateFontSize = (newSize: number) => {
    const size = Math.min(Math.max(12, newSize), 24); // Limit font size between 12px and 24px
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
  };

  const startLesson = () => {
    setStarted(true);
  };

  const nextTurn = () => {
    if (lesson?.turns && currentTurn < lesson.turns.length - 1) {
      setCurrentTurn(prev => prev + 1);
    } else {
      // Lesson completed
      // You could add a completion state or redirect
    }
  };

  const prevTurn = () => {
    if (currentTurn > 0) {
      setCurrentTurn(prev => prev - 1);
    }
  };
  
  const currentTurnData = lesson?.turns?.[currentTurn];
  const isFirstTurn = currentTurn === 0;
  const isLastTurn = lesson?.turns ? currentTurn === lesson.turns.length - 1 : true;
  const showPracticeButton = Array.isArray((lesson as any)?.practice) && ((lesson as any)?.practice?.length ?? 0) > 0;

  const increaseFontSize = () => updateFontSize(fontSize + 1);
  const decreaseFontSize = () => updateFontSize(fontSize - 1);
  const resetFontSize = () => updateFontSize(16);

  if (loading || !courseData || !lesson) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ fontSize: `${fontSize}px` }}>
      <div className="w-full px-4 py-8 pt-20">
        {/* Header with navigation and controls */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/course" 
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Course
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={decreaseFontSize}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              title="Decrease font size"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 12H4" 
                />
              </svg>
            </button>
            <button 
              onClick={resetFontSize}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white text-sm"
              title="Reset font size"
            >
              A
            </button>
            <button 
              onClick={increaseFontSize}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              title="Increase font size"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
            </button>
          </div>
        </div>

        {!started ? (
          // Start screen
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {lesson.lesson_title.replace(/\*\*/g, '')}
            </h1>
            <div className="prose dark:prose-invert max-w-none text-lg text-gray-600 dark:text-gray-300 mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {lesson.objective}
              </ReactMarkdown>
            </div>
            
            {lesson.key_vocabulary && lesson.key_vocabulary.length > 0 && (
              <div className="mb-8 max-w-xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Key Vocabulary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lesson.key_vocabulary.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
                    >
                      <div className="font-medium text-indigo-600 dark:text-indigo-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.word}
                      </ReactMarkdown>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.meaning}
                      </ReactMarkdown>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={startLesson}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Begin Lesson
            </button>
          </div>
        ) : (
          // Lesson content
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Turn {currentTurn + 1} of {lesson?.turns?.length || 0}
                  </span>
                  {currentTurnData?.section && (
                    <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                      {currentTurnData.section}
                    </span>
                  )}
                </div>
                
                {/* Teacher Dialogue */}
                {currentTurnData?.teacher_dialogue && (
                  <div className="prose dark:prose-invert max-w-none mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100">
                    <div className="font-medium text-gray-600 dark:text-gray-300 text-sm mb-1">Teacher:</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentTurnData.teacher_dialogue}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {/* Student Dialogue */}
                {currentTurnData?.student_dialogue && (
                  <div className="prose dark:prose-invert max-w-none mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <div className="font-medium text-indigo-600 dark:text-indigo-300 text-sm mb-1">You:</div>
                    <div className="text-gray-800 dark:text-gray-200">
                      {currentTurnData.student_dialogue}
                    </div>
                  </div>
                )}
                
                {/* Removed Thinking Method and Justification sections as per user request */}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button 
                  onClick={prevTurn}
                  disabled={isFirstTurn}
                  className={`px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center ${isFirstTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 19l-7-7 7-7" 
                    />
                  </svg>
                  Previous
                </button>
                
                {!isLastTurn ? (
                  <button 
                    onClick={nextTurn}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors flex items-center"
                  >
                    Next
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {showPracticeButton && (
                      <Link
                        to={`/lesson/${lessonNumber}/practice`}
                        className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                      >
                        Practice
                      </Link>
                    )}
                    <Link
                      to="/course"
                      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors flex items-center"
                    >
                      Complete Lesson
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 ml-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
