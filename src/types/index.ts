// Dictionary types
export interface DictionaryEntry {
  id: number;
  xhosa: string;
  english: string;
  notes?: string;
  deck: string;
}

export interface TextEntry {
  id: number;
  title: string;
  text: string;
  translation: string;
  notes?: string;
}

export type GroupedTexts = {
  [key: string]: TextEntry[];
};

// Course & Lesson types
export interface Lesson {
  id: string;
  title: string;
  part: string;
  keyStructures: string[];
  keyVocabulary: string[];
  description: string;
  objective: string;
  file: string;
}

export interface LessonTurn {
  turn: string;
  speaker: string;
  dialogue: string;
  thinkingMethods: string[];
  justifications: string[];
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

// Component props
export interface DarkModeProps {
  isDarkMode: boolean;
  onToggleDarkMode?: () => void;
}

export interface NavbarProps extends DarkModeProps {}

export interface DictionaryPageProps extends DarkModeProps {}

export interface CoursePageProps extends DarkModeProps {}

export interface LessonPageProps extends DarkModeProps {}
