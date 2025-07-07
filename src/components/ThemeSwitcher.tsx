"use client";
import { useTheme } from "@/contexts/ThemeContext";
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { FaLeaf, FaPalette, FaStore } from 'react-icons/fa';

const themes = [
  { value: "light", label: "Light", icon: <SunIcon className="h-5 w-5" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="h-5 w-5" /> },
  { value: "autumn", label: "Autumn", icon: <FaLeaf className="h-5 w-5" /> },
  { value: "calm", label: "Calm", icon: <FaPalette className="h-5 w-5" /> },
  { value: "bazaar", label: "Bazaar", icon: <FaStore className="h-5 w-5" /> },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const currentIdx = themes.findIndex(t => t.value === theme);
  const nextIdx = (currentIdx + 1) % themes.length;
  const current = themes[currentIdx] || themes[0];
  const next = themes[nextIdx] || themes[0];

  return (
    <button
      onClick={() => setTheme(next.value as any)}
      className={`p-1 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accentC/50 bg-accentC text-cardC`}
      aria-label={`Switch to ${next.label} theme`}
      title={`Switch to ${next.label} theme`}
      type="button"
    >
      {current.icon}
    </button>
  );
} 