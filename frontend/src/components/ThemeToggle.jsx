import { LuSun, LuMoon } from "react-icons/lu"
import { useTheme } from "./ThemeProvider"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="fixed left-5 bottom-5 z-[300] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-[#121212] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#f3f4f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff706b] dark:border-white/15 dark:bg-[#1f1f1f] dark:text-[#f3f4f6] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] dark:hover:bg-[#2a2a2a] sm:left-6 sm:bottom-6">
      {isDark ? <LuSun size={20} /> : <LuMoon size={20} />}
    </button>
  )
}

export default ThemeToggle
