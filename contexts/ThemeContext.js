'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Default to dark
  const [mounted, setMounted] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('moai-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme class to document root
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('moai-theme', newTheme);
  };

  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('moai-theme', 'light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('moai-theme', 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
