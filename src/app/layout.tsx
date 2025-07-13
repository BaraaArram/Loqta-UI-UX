// RootLayout: Sets up the global HTML structure, theme initialization, and hydration guard.
"use client";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Inline theme script for instant theme on first paint
  const themeInitScript = `
    try {
      var theme = localStorage.getItem('theme') || 'bazaar';
      if(['light','dark','autumn','calm','bazaar'].includes(theme)) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = 'theme-' + theme;
      }
    } catch(e) {}
  `;

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <html lang="en" dir="ltr">
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl font-bold animate-pulse">Loading...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" dir="ltr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
