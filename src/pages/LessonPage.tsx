import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import type { LessonDetail, LessonPageProps } from '../types';

const LessonPage: React.FC<LessonPageProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const { lessonNumber = '1' } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        // Load the lesson data from the JSON file
        const response = await fetch(`/Lesson%20Data/lesson${lessonNumber}.json`);
        if (!response.ok) {
          throw new Error('Lesson not found');
        }
        const data = await response.json();
        setLesson(data);
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
    if (lesson?.lesson_details.turns && currentTurn < lesson.lesson_details.turns.length - 1) {
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

  const increaseFontSize = () => updateFontSize(fontSize + 1);
  const decreaseFontSize = () => updateFontSize(fontSize - 1);
  const resetFontSize = () => updateFontSize(16);

  if (loading || !lesson) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Navbar isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const currentTurnData = lesson?.lesson_details.turns?.[currentTurn];
  const isFirstTurn = currentTurn === 0;
  const isLastTurn = lesson?.lesson_details.turns ? currentTurn === lesson.lesson_details.turns.length - 1 : true;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`} style={{ fontSize: `${fontSize}px` }}>
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      
      <div className="container mx-auto px-4 py-8">
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
              {lesson.lesson_details.lesson_title.replace(/\*\*/g, '')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {lesson.lesson_details.objective}
            </p>
            
            {lesson.lesson_details.key_vocabulary && lesson.lesson_details.key_vocabulary.length > 0 && (
              <div className="mb-8 max-w-xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Key Vocabulary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lesson.lesson_details.key_vocabulary.map((item: { word: string; meaning: string }, index: number) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
                    >
                      <div className="font-medium text-indigo-600 dark:text-indigo-400">{item.word}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{item.meaning}</div>
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
                    Turn {currentTurn + 1} of {lesson?.lesson_details?.turns?.length || 0}
                  </span>
                  {currentTurnData?.section && (
                    <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                      {currentTurnData.section}
                    </span>
                  )}
                </div>
                
                {currentTurnData?.teacher_dialogue && (
                  <div 
                    className="prose dark:prose-invert max-w-none mb-6"
                    dangerouslySetInnerHTML={{ 
                      __html: currentTurnData.teacher_dialogue.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }}
                  />
                )}
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Thinking Method:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.lesson_details.thinking_method_focus?.map((method: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Why this approach works:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentTurnData?.justification || 'No justification provided.'}
                    </p>
                  </div>
                </div>
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
