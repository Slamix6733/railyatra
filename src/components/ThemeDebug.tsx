'use client';

import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export default function ThemeDebug() {
  const { theme, toggleTheme } = useTheme();
  const [hasDarkClass, setHasDarkClass] = useState(false);
  const [bodyBgColor, setBodyBgColor] = useState('');
  const [htmlBgColor, setHtmlBgColor] = useState('');
  
  useEffect(() => {
    setHasDarkClass(document.documentElement.classList.contains('dark'));
    
    // Check computed styles
    if (typeof window !== 'undefined') {
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      setBodyBgColor(bodyStyle.backgroundColor);
      setHtmlBgColor(htmlStyle.backgroundColor);
    }
  }, [theme]);

  const forceToggle = () => {
    document.documentElement.classList.toggle('dark');
    const newHasDark = document.documentElement.classList.contains('dark');
    setHasDarkClass(newHasDark);
    
    // Update the localStorage
    localStorage.setItem('theme', newHasDark ? 'dark' : 'light');
    
    // Force refresh computed styles
    const bodyStyle = window.getComputedStyle(document.body);
    const htmlStyle = window.getComputedStyle(document.documentElement);
    setBodyBgColor(bodyStyle.backgroundColor);
    setHtmlBgColor(htmlStyle.backgroundColor);
    
    alert('Manually toggled dark class on HTML element: ' + 
          (newHasDark ? 'Added' : 'Removed'));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-xs">
      <p className="font-mono text-gray-800 dark:text-gray-200">
        Current theme: <strong>{theme}</strong>
      </p>
      <p className="font-mono text-gray-800 dark:text-gray-200 mt-1">
        Has dark class: <strong>{hasDarkClass ? 'Yes' : 'No'}</strong>
      </p>
      <p className="font-mono text-gray-800 dark:text-gray-200 mt-1">
        HTML background: <strong>{htmlBgColor}</strong>
      </p>
      <p className="font-mono text-gray-800 dark:text-gray-200 mt-1">
        Body background: <strong>{bodyBgColor}</strong>
      </p>
      <button 
        onClick={toggleTheme}
        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
      >
        Toggle theme
      </button>
      <button 
        onClick={forceToggle}
        className="mt-2 ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs"
      >
        Force toggle
      </button>
    </div>
  );
} 