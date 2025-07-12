import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'autumn' | 'calm' | 'bazaar';

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: (typeof window !== 'undefined' && (localStorage.getItem('theme') as Theme)) || 'bazaar',
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
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer; 