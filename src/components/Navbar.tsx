import { Link } from 'react-router-dom';
import type { NavbarProps } from '../types';

const Navbar = ({ isDarkMode, onToggleDarkMode }: NavbarProps) => {
  return (
    <nav className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center space-x 8">
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Socratic Xhosa
        </Link>
        <ul className="hidden md:flex space-x-6 ml-10">
          <li>
          <Link
              to="/course"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Course
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Dictionary
            </Link>
          </li>
          <li>
            <Link
              to="/texts"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Texts
            </Link>
          </li>
        </ul>
      </div>
      <button
        onClick={onToggleDarkMode}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </nav>
  );
};

export default Navbar;
