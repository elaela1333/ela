import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available themes
export type ThemeName = 'light' | 'dark' | 'current';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isCurrentThemeDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'current',
  setTheme: () => {},
  isCurrentThemeDark: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get theme from localStorage or use default
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    return (savedTheme && ['light', 'dark', 'current'].includes(savedTheme)) 
      ? savedTheme 
      : 'current';
  });

  // Determine if the current theme is dark (for dynamic calculations)
  const isCurrentThemeDark = theme === 'dark' || theme === 'current';

  // Update theme and save to localStorage
  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme classes to document
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-current');
    
    // Add selected theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // For light/dark mode preference
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isCurrentThemeDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
