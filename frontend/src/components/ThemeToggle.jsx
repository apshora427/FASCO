import { useTheme } from "./ThemeProvider";
import { LuSun, LuMoon } from "react-icons/lu";

// Figma designs are light-only for now; the toggle is kept so dark mode can be
// wired up later without changing the provider stack.
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-white cursor-pointer shadow-lg">
      {theme === "dark" ? <LuSun size={20} /> : <LuMoon size={20} />}
    </button>
  );
};

export default ThemeToggle;
