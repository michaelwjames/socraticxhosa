import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CoursePageProps } from '../types';

interface Lesson {
  [key: string]: string | undefined;
  'Lesson Number': string;
  'Lesson Title': string;
  'Objective': string;
  'Key Vocabulary'?: string;
  'part'?: string;
}

const CoursePage: React.FC<CoursePageProps> = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedLessons, setGroupedLessons] = useState<Record<string, Lesson[]>>({});

  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Load the CSV file from the old directory
        const response = await fetch('/old/LessonList.csv');
        const text = await response.text();
        
        // Parse CSV to JSON
        const lines = text.split('\n').filter(line => line.trim() !== '');
        let currentPart = '';
        const parsedLessons: any[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) continue;
          
          // Check if this is a part header (e.g., "Part 1: Foundations")
          if (line.startsWith('Part ')) {
            currentPart = line.split(':')[0].trim();
            continue;
          }
          
          // Check if this is a lesson line (starts with "Lesson" or quoted "Lesson)
          if (line.startsWith('"Lesson') || line.startsWith('Lesson')) {
            // Remove surrounding quotes if present
            if (line.startsWith('"') && line.endsWith('"')) {
              line = line.substring(1, line.length - 1);
            }
            
            // Handle the case where the line might be split across multiple lines
            let fullLine = line;
            while (i < lines.length - 1 && (fullLine.split('"').length - 1) % 2 !== 0) {
              // If we have an odd number of quotes, the line is split
              i++;
              fullLine += '\n' + lines[i].trim();
              // Remove any trailing quote if the line was split in the middle of a quoted field
              if (fullLine.endsWith('"')) {
                fullLine = fullLine.substring(0, fullLine.length - 1);
              }
            }
            
            // Parse the lesson line which has format: "Lesson X: Title,Structures,Vocabulary"
            const match = fullLine.match(/^Lesson (\d+):\s*([^,]+),(.*?),(.*)$/i);
            
            if (match) {
              const lessonNumber = match[1].trim();
              const lessonTitle = match[2].trim();
              const structures = match[3].trim();
              const vocabulary = match[4] ? match[4].trim() : '';
              
              if (lessonNumber && lessonTitle) {
                parsedLessons.push({
                  'Lesson Number': lessonNumber,
                  'Lesson Title': lessonTitle,
                  'Objective': structures,
                  'Key Vocabulary': vocabulary,
                  'part': currentPart
                });
              }
            } else {
              console.warn('Failed to parse lesson line:', fullLine);
            }
          }
        }
        
        // Group lessons by part
        const grouped = parsedLessons.reduce((acc, lesson) => {
          const part = lesson.part || 'Other';
          if (!acc[part]) {
            acc[part] = [];
          }
          acc[part].push(lesson);
          return acc;
        }, {} as Record<string, any[]>);
        
        setGroupedLessons(grouped);
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLessons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Xhosa Course</h1>
          <p className="text-gray-600 dark:text-gray-300">Select a lesson to begin learning</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search lessons..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-10">
          {Object.entries(groupedLessons).map(([part, partLessons]) => {
            const filteredLessons = partLessons.filter(lesson => {
              if (!lesson) return false;
              const searchLower = searchTerm.toLowerCase();
              const title = lesson['Lesson Title'] || '';
              const objective = lesson['Objective'] || '';
              const vocab = lesson['Key Vocabulary'] || '';
              
              return (
                title.toLowerCase().includes(searchLower) ||
                objective.toLowerCase().includes(searchLower) ||
                vocab.toLowerCase().includes(searchLower)
              );
            });

            if (filteredLessons.length === 0) return null;

            return (
              <div key={part} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{part}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLessons.map((lesson, index) => (
                    <Link
                      key={`${part}-${index}`}
                      to={`/lesson/${lesson['Lesson Number']}`}
                      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        Lesson {lesson['Lesson Number']}: {lesson['Lesson Title']}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {lesson['Objective']}
                      </p>
                      {lesson['Key Vocabulary'] && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Key Vocabulary:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {lesson['Key Vocabulary']}
                          </p>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
