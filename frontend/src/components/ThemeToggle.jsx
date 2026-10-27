import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/theme/themeSlice";

export default function ThemeToggle() {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  return (
    <button
      className="btn btn-ghost"
      style={{ padding: "8px", borderRadius: "999px" }}
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle color theme"
      title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
