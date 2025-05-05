import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};

export default config;
