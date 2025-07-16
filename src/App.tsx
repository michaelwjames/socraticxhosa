import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DictionaryPage from './pages/DictionaryPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';

function App() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' ? true : false;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Navbar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<DictionaryPage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
            <Route path="/course" element={<CoursePage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
            <Route path="/lesson/:lessonNumber" element={<LessonPage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
