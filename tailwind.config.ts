import type { Config } from "tailwindcss";
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Cairo',
          ...fontFamily.sans,
        ],
      },
      colors: {
        // Base Colors
        bg: "var(--color-bg)",
        "bg-secondary": "var(--color-bg-secondary)",
        card: "var(--color-card)",
        "card-hover": "var(--color-card-hover)",
        border: "var(--color-border)",
        "border-focus": "var(--color-border-focus)",
        
        // Typography
        heading: "var(--color-heading)",
        text: "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
        
        // Accent Colors
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-light": "var(--color-accent-light)",
        "accent-dark": "var(--color-accent-dark)",
        
        // Status Colors
        success: "var(--color-success)",
        "success-light": "var(--color-success-light)",
        warning: "var(--color-warning)",
        "warning-light": "var(--color-warning-light)",
        error: "var(--color-error)",
        "error-light": "var(--color-error-light)",
        
        // Brand Colors
        loqta: "var(--color-loqta)",
        "loqta-light": "var(--color-loqta-light)",
        "loqta-dark": "var(--color-loqta-dark)",
        
        // Interactive Elements
        "button-primary": "var(--color-button-primary)",
        "button-primary-hover": "var(--color-button-primary-hover)",
        "button-secondary": "var(--color-button-secondary)",
        "button-secondary-hover": "var(--color-button-secondary-hover)",
        "button-text": "var(--color-button-text)",
        "button-text-secondary": "var(--color-button-text-secondary)",
        
        // Shadows
        "shadow-sm": "var(--shadow-sm)",
        "shadow-md": "var(--shadow-md)",
        "shadow-lg": "var(--shadow-lg)",
        "shadow-xl": "var(--shadow-xl)",
        
        // Legacy Support
        bodyC: "var(--color-bg)",
        cardC: "var(--color-card)",
        footerC: "var(--color-border)",
        accentC: "var(--color-accent)",
        listbgC: "var(--color-bg-secondary)",
        secondaryBgC: "var(--color-bg-secondary)",
        muted: "var(--color-text-muted)",
        footerText: "var(--color-text-inverse)",
        buttonBg: "var(--color-button-primary)",
        buttonText: "var(--color-button-text)",
      },
    },
  },
  plugins: [],
};

export default config;
