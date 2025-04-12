'use client';

import { useEffect } from 'react';

// Extend Window interface
declare global {
  interface Window {
    toggleDarkMode?: () => void;
  }
}

export default function ThemeScript() {
  useEffect(() => {
    // Add a global function to toggle theme from the console
    window.toggleDarkMode = () => {
      const html = document.documentElement;
      const hasClass = html.classList.contains('dark');
      
      if (hasClass) {
        html.classList.remove('dark');
        console.log('Dark mode removed');
      } else {
        html.classList.add('dark');
        console.log('Dark mode added');
      }
    };

    // Log the current state
    console.log('ThemeScript loaded');
    console.log('Dark mode is currently:', document.documentElement.classList.contains('dark'));
    console.log('You can toggle dark mode by calling window.toggleDarkMode() in the console');
    
    return () => {
      // Clean up
      window.toggleDarkMode = undefined;
    };
  }, []);

  return null;
} 