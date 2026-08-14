import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Download, History, Settings, Youtube } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const { resolvedTheme } = useTheme();
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <Youtube className="h-8 w-8 text-red-500" />
        <span className="text-xl font-bold">YT Downloader</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/downloads" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          <Download size={20} /> Downloads
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          <History size={20} /> History
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>
      <div className="p-4 border-t border-border">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Sidebar;