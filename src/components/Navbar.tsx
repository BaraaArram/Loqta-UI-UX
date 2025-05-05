"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Menu from "./Menu";
import SearchBar from "./SearchBar";
import NavIcons from "./NavIcons";
import { Store } from "lucide-react"; // Example icon

const Navbar = () => {
  const [theme, setTheme] = useState<string>("autumn");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      localStorage.setItem("theme", "autumn");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    let newTheme = "autumn";
    if (theme === "light") newTheme = "dark";
    else if (theme === "dark") newTheme = "autumn";
    else if (theme === "autumn") newTheme = "calm";
    else newTheme = "light";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-bodyC/60 shadow-md">
        <div className="h-20 px-4 md:px-10 lg:px-20 xl:px-32 2xl:px-64 flex items-center justify-between">
          {/* MOBILE */}
          <div className="flex items-center justify-between w-full md:hidden">
            <Link href="/" className="flex items-center gap-2 text-text">
              <Store size={28} />
              <span className="text-xl font-bold tracking-wider text-heading">
                LOQTA
              </span>
            </Link>
            <Menu />
          </div>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2 text-text">
                <Store size={28} />
                <span className="text-2xl font-semibold tracking-wider text-heading">
                  LOQTA
                </span>
              </Link>
              <nav className="hidden xl:flex gap-6 text-text font-medium">
                <Link
                  href="/"
                  className="hover:text-heading transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  href="/"
                  className="hover:text-heading transition-colors duration-200"
                >
                  Shop
                </Link>
                <Link
                  href="/"
                  className="hover:text-heading transition-colors duration-200"
                >
                  Deals
                </Link>
                <Link
                  href="/"
                  className="hover:text-heading transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  href="/"
                  className="hover:text-heading transition-colors duration-200"
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-6">
              <SearchBar />
              <NavIcons />
              <button
                onClick={toggleTheme}
                className="text-xl p-2 rounded-full border-2 border-text hover:bg-text hover:text-white transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "light" && "☀️"}
                {theme === "dark" && "🌙"}
                {theme === "autumn" && "🍂"}
                {theme === "calm" && "🌊"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-20" />
      <main>{/* Page content here */}</main>
    </>
  );
};

export default Navbar;
