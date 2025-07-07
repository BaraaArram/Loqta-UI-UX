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
        bodyC: "var(--color-body)",
        cardC: "var(--color-card)",
        footerC: "var(--color-footer)",
        accentC: "var(--color-accent)",
        listbgC: "var(--color-listbg)",
        secondaryBgC: "var(--color-bg-secondary)",
        heading: "var(--color-heading)",
        text: "var(--color-text)",
        muted: "var(--color-muted)", // ← NEW
        loqta: "var(--color-loqta)", // ← NEW
        footerText: "var(--color-footer-text)",
        buttonBg: "var(--color-button-bg)",
        buttonText: "var(--color-button-text)",

        sliderText: "var(--color-text-on-slider)",
        // Sliders
        slider1From: "var(--color-slider_1_From)",
        slider1To: "var(--color-slider_1_to)",
        slider2From: "var(--color-slider_2_From)",
        slider2To: "var(--color-slider_2_to)",
        slider3From: "var(--color-slider_3_From)",
        slider3To: "var(--color-slider_3_to)",

        bazaar: {
          light: '#f8f5f2',
          DEFAULT: '#e0b973',
          dark: '#a67c52',
          accent: '#d7263d',
          accent2: '#1b1b1e',
        },
        autumn: {
          light: '#fff8e1',
          DEFAULT: '#ffb300',
          dark: '#ff6f00',
        },
        calm: {
          light: '#e0f7fa',
          DEFAULT: '#00bcd4',
          dark: '#00838f',
        },
      },
    },
  },
  plugins: [],
};

export default config;
