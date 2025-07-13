// themeSlice.ts: Redux slice for theme state and actions.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'autumn' | 'calm' | 'bazaar' | 'vintage';

interface ThemeState {
  theme: Theme;
  hydrated: boolean;
}

// Helper to get theme from localStorage (safe for SSR)
function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && ['light','dark','autumn','calm','bazaar','vintage'].includes(stored)) return stored;
  }
  return 'bazaar';
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
  hydrated: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
        document.body.className = `theme-${action.payload}`;
      }
    },
    // Optionally, a hydrateTheme action for SSR/first mount
    hydrateTheme(state) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored && ['light','dark','autumn','calm','bazaar','vintage'].includes(stored)) {
          state.theme = stored;
          document.documentElement.setAttribute('data-theme', stored);
          document.body.className = `theme-${stored}`;
        }
      }
      state.hydrated = true;
    }
  },
});

export const { setTheme, hydrateTheme } = themeSlice.actions;
export default themeSlice.reducer; 