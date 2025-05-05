"use client";

import { useEffect } from "react";

const themes = ["light", "dark", "autumn", "calm"];

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || themes[2]; // Default to "autumn"
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return <>{children}</>;
}
