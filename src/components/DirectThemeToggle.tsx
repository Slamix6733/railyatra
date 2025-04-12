'use client';

import { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function DirectThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Initialize based on the current class
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(hasDarkClass);
    console.log('DirectThemeToggle mounted, isDark:', hasDarkClass);
  }, []);

  useEffect(() => {
    // Add event listener for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDark(hasDarkClass);
          console.log('Dark mode class changed:', hasDarkClass);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Update the HTML element class directly
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    console.log('Theme toggled directly, new state:', newIsDark ? 'dark' : 'light');
    console.log('HTML class list:', document.documentElement.className);
    console.log('Body class list:', document.body.className);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <FaSun className="h-5 w-5 text-yellow-300" />
      ) : (
        <FaMoon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
} 