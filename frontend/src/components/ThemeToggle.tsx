import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setTheme('light')} className={`p-1 rounded ${theme === 'light' ? 'bg-primary text-primary-foreground' : ''}`}>
        <Sun size={18} />
      </button>
      <button onClick={() => setTheme('system')} className={`p-1 rounded ${theme === 'system' ? 'bg-primary text-primary-foreground' : ''}`}>
        <Monitor size={18} />
      </button>
      <button onClick={() => setTheme('dark')} className={`p-1 rounded ${theme === 'dark' ? 'bg-primary text-primary-foreground' : ''}`}>
        <Moon size={18} />
      </button>
    </div>
  );
};

export default ThemeToggle;