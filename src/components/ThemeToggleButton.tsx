import { IconSun, IconMoon } from "@tabler/icons-react";
import { useState, useEffect } from "react";

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState("light");

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-customised") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
  }, []);

  const handleThemeChange = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    const newTheme = isDark ? "dark" : "light";
    localStorage.setItem("theme-customised", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleThemeChange}
      className="flex bg-white dark:bg-transparent items-center gap-2 cursor-pointer rounded-full border dark:hover:text-green-400 shadow-md p-2 text-neutral-500 transition-colors"
      aria-label="Toggle light/dark theme"
      title="Toggle light/dark theme"
    >
      {theme === "dark" ? (
        <IconSun size={24} className="dark:hover:text-green-400" />
      ) : (
        <IconMoon size={24} className="text-black" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
