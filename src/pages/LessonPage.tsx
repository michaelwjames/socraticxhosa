import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LessonPageProps } from '../types/index';

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
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  const lesson = courseData?.lessons[parseInt(lessonNumber, 10) - 1];

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        // Load consolidated parts (Part 1–6) and merge
        const partFiles = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6'];
        const responses = await Promise.all(
          partFiles.map((f) => fetch(`/data/lesson_data/${f}.json`))
        );
        responses.forEach((res, i) => {
          if (!res.ok) {
            throw new Error(`Failed to load ${partFiles[i]}`);
          }
        });
        const parts: CourseData[] = await Promise.all(responses.map((r) => r.json()));

        const totalLessons = parts.reduce((sum, p) => sum + p.lessons.length, 0);
        const combined: CourseData = {
          course_name: parts[0]?.course_name ?? 'Course',
          part_name: parts.map((p) => p.part_name).join(' & '),
          lessons_covered: `1-${totalLessons}`,
          lessons: parts.flatMap((p) => p.lessons),
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-5">
        {/* Header with minimal padding */}
        <div className="flex justify-end items-center">
          {/* Empty - kebab menu removed */}
        </div>
        
        {/* Navigation buttons with minimal spacing */}
        {started && (
          <div className="flex justify-between items-center mt-1 mb-1">
            <button 
              onClick={prevTurn}
              disabled={isFirstTurn}
              className={`p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center ${isFirstTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="ml-1">Previous</span>
            </button>
            
            <div className="relative">
              <button 
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              >
                Settings
              </button>
              <div className={`absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${showSettingsMenu ? 'block' : 'hidden'}`}>
                <div className="py-1">
                  <button onClick={decreaseFontSize} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Decrease Text Size
                  </button>
                  <button onClick={resetFontSize} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Reset Text Size
                  </button>
                  <button onClick={increaseFontSize} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Increase Text Size
                  </button>
                  <Link to="/course" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Return to Course
                  </Link>
                </div>
              </div>
            </div>
            
            {!isLastTurn ? (
              <button 
                onClick={nextTurn}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
              >
                <span className="mr-1">Next</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="invisible">
                <button className="p-2 opacity-0 pointer-events-none">Next</button>
              </div>
            )}
          </div>
        )}
        
        {/* Lesson content */}
        <div className="w-full max-w-3xl mx-auto">
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
                        <div className="font-medium text-gray-600 dark:text-gray-300">
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
            <div>
              {/* Lesson content */}
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
                  
                  {/* Completion buttons at final turn */}
                  {isLastTurn && (
                    <div className="flex justify-between mt-8">
                      {showPracticeButton && (
                        <button
                          onClick={() => navigate(`/lesson/${lessonNumber}/practice`)}
                          className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                        >
                          Practice
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/course')}
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
                      </button>
                    </div>
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

export default LessonPage;
