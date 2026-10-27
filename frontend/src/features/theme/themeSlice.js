import { createSlice } from "@reduxjs/toolkit";

const THEME_KEY = "hcp_crm_theme";
const stored = localStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const initialState = {
  mode: stored || (prefersDark ? "dark" : "light"),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, state.mode);
    },
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem(THEME_KEY, action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
