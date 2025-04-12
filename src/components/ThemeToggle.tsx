'use client';

import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none border border-gray-200 dark:border-gray-600 shadow-sm"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <FaMoon className="h-5 w-5 text-gray-700" />
      ) : (
        <FaSun className="h-5 w-5 text-yellow-300" />
      )}
    </button>
  );
} 