export interface Lesson {
  Lesson: string;
  'Key Structures Learned': string;
  'Key Vocabulary Introduced': string;
  part?: string; // Added for grouping lessons by part
}

export interface LessonDetail {
  course_name: string;
  part_name: string;
  lessons_covered: string;
  lesson_details: {
    lesson_number: number;
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
  };
}
