import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../types/lesson';
import type { CoursePageProps } from '../types';
import Navbar from '../components/Navbar';

const CoursePage: React.FC<CoursePageProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedLessons, setGroupedLessons] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Load the CSV file from public directory
        const response = await fetch('/LessonList.csv');
        const text = await response.text();
        
        // Parse CSV to JSON
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        let currentPart = '';
        const parsedLessons: Lesson[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Check if this is a part header (e.g., "Part 1: Foundations")
          if (line.startsWith('Part ')) {
            currentPart = line.replace('Part ', '');
            continue;
          }
          
          // Parse the line, handling quoted fields with commas
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue);
          
          if (values.length === headers.length) {
            const lesson: any = { ...headers.reduce((obj, key, index) => ({
              ...obj,
              [key]: values[index]?.trim()
            }), {}) };
            
            if (currentPart) {
              lesson.part = currentPart;
            }
            
            parsedLessons.push(lesson as Lesson);
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
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
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Xhosa Course</h1>
            <p className="text-gray-600 dark:text-gray-300">Select a lesson to begin learning</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
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
        <div className="space-y-6">
          {Object.entries(groupedLessons).map(([part, partLessons]) => (
            <div key={part} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{part}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partLessons
                  .filter(lesson => 
                    lesson.lesson_details.lesson_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lesson.lesson_details.objective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (lesson.lesson_details.key_vocabulary?.some(vocab => 
                      vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
                    ) || false)
                  )
                  .map(lesson => (
                    <Link
                      key={lesson.lesson_details.lesson_number}
                      to={`/lesson/${lesson.lesson_details.lesson_number}`}
                      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        Lesson {lesson.lesson_details.lesson_number}: {lesson.lesson_details.lesson_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {lesson.lesson_details.objective}
                      </p>
                      {lesson.lesson_details.key_vocabulary && lesson.lesson_details.key_vocabulary.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Key Vocabulary:</p>
                          <div className="flex flex-wrap gap-1">
                            {lesson.lesson_details.key_vocabulary.slice(0, 3).map((vocab, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                                {vocab.word}
                              </span>
                            ))}
                            {lesson.lesson_details.key_vocabulary.length > 3 && (
                              <span className="text-xs text-gray-500">+{lesson.lesson_details.key_vocabulary.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
