import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CoursePageProps } from '../types/index';

interface Lesson {
  lesson_title: string;
  thinking_method_focus: string[];
  objective: string;
  key_vocabulary: Array<{
    word: string;
    meaning: string;
  }>;
  turns: Array<{
    turn_number: number;
    section: string;
    teacher_dialogue: string;
    justification: string;
  }>;
}

interface CourseData {
  course_name: string;
  part_name: string;
  lessons_covered: string;
  lessons: Lesson[];
}

interface Section {
  part_name: string;
  lessons: Lesson[];
  startIndex: number; // zero-based index in global list
}

const CoursePage: React.FC<CoursePageProps> = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Load new consolidated lesson parts (Part 1–6) and compute sections dynamically
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

        let runningIndex = 0;
        const sectionsComputed: Section[] = parts.map((p) => {
          const section: Section = {
            part_name: p.part_name,
            lessons: p.lessons,
            startIndex: runningIndex,
          };
          runningIndex += p.lessons.length;
          return section;
        });

        setSections(sectionsComputed);
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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Filter lessons per section based on search term
  const filteredSections = sections.map(section => ({
    ...section,
    lessons: section.lessons.filter(lesson =>
      lesson.lesson_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.thinking_method_focus.some(focus => focus.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(section => section.lessons.length > 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-7">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Xhosa Course</h1>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search lessons..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 bg-white dark:text-white text-black"
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

        {/* Lessons List grouped by Part */}
        <div className="space-y-10">
          {filteredSections.map(section => (
            <div key={section.part_name} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.part_name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.lessons.map((lesson, idx) => {
                  const lessonNumber = section.startIndex + idx + 1;
                  return (
                    <Link
                      key={lessonNumber}
                      to={`/lesson/${lessonNumber}`}
                      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        {lesson.lesson_title.replace(/\*\*/g, '')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {lesson.objective}
                      </p>
                      {lesson.key_vocabulary && lesson.key_vocabulary.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Key Vocabulary:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {lesson.key_vocabulary.map(v => v.word).join(', ')}
                          </p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
