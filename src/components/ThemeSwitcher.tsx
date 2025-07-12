"use client";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setTheme } from '@/features/theme/themeSlice';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { FaLeaf, FaPalette, FaStore } from 'react-icons/fa';
import { useState } from 'react';

const themes = [
  { 
    value: "light", 
    label: "Light", 
    icon: <SunIcon className="h-5 w-5" />,
    description: "Clean and modern light theme",
    color: "bg-yellow-100 text-yellow-800"
  },
  { 
    value: "dark", 
    label: "Dark", 
    icon: <MoonIcon className="h-5 w-5" />,
    description: "Sophisticated dark theme",
    color: "bg-slate-800 text-slate-200"
  },
  { 
    value: "autumn", 
    label: "Autumn", 
    icon: <FaLeaf className="h-5 w-5" />,
    description: "Warm and cozy autumn theme",
    color: "bg-orange-100 text-orange-800"
  },
  { 
    value: "calm", 
    label: "Calm", 
    icon: <FaPalette className="h-5 w-5" />,
    description: "Serene and peaceful blue theme",
    color: "bg-blue-100 text-blue-800"
  },
  { 
    value: "bazaar", 
    label: "Bazaar", 
    icon: <FaStore className="h-5 w-5" />,
    description: "Vibrant and energetic purple theme",
    color: "bg-purple-100 text-purple-800"
  },
];

export default function ThemeSwitcher() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const handleThemeChange = (newTheme: string) => {
    dispatch(setTheme(newTheme as any));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Quick Switch Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 bg-accent text-text-inverse hover:bg-accent-hover shadow-md hover:shadow-lg transform hover:scale-105"
        aria-label="Theme switcher"
        title="Change theme"
        type="button"
      >
        {currentTheme.icon}
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-sm font-semibold text-heading mb-2 px-2">Choose Theme</div>
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  theme === themeOption.value 
                    ? 'bg-accent-light text-accent border border-accent' 
                    : 'text-text hover:text-heading'
                }`}
                aria-label={`Switch to ${themeOption.label} theme`}
              >
                <div className={`p-2 rounded-full ${themeOption.color} transition-colors duration-200`}>
                  {themeOption.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-text-muted">{themeOption.description}</div>
                </div>
                {theme === themeOption.value && (
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 