import { createSlice } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';
function initialTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
const themeSlice = createSlice({
  name: 'theme', initialState: initialTheme,
  reducers: { toggleTheme: (state) => state === 'light' ? 'dark' : 'light' },
});
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
