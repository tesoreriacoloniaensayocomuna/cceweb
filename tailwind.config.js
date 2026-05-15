import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-error": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-variant": "#e1e3e4",
        "primary": "#003e6f",
        "on-tertiary-fixed-variant": "#564500",
        "on-surface-variant": "#414750",
        "on-secondary-container": "#007435",
        "primary-fixed": "#d3e4ff",
        "on-tertiary-fixed": "#231b00",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#001c38",
        "inverse-on-surface": "#f0f1f2",
        "secondary-fixed": "#91f9a5",
        "on-surface": "#191c1d",
        "on-secondary-fixed-variant": "#005323",
        "error-container": "#ffdad6",
        "on-background": "#191c1d",
        "on-primary-fixed-variant": "#004881",
        "secondary-fixed-dim": "#75dc8b",
        "tertiary-fixed": "#ffe07c",
        "on-error-container": "#93000a",
        "on-tertiary": "#ffffff",
        "secondary": "#006d31",
        "on-secondary": "#ffffff",
        "surface-container": "#edeeef",
        "tertiary-fixed-dim": "#ecc200",
        "outline-variant": "#c1c7d2",
        "on-tertiary-container": "#4d3e00",
        "on-secondary-fixed": "#00210a",
        "error": "#ba1a1a",
        "tertiary": "#725c00",
        "primary-fixed-dim": "#a2c9ff",
        "surface": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "primary-container": "#005596",
        "tertiary-container": "#cca800",
        "background": "#f8f9fa",
        "inverse-surface": "#2e3132",
        "on-primary-container": "#a4caff",
        "secondary-container": "#91f9a5",
        "outline": "#727781",
        "on-primary": "#ffffff",
        "surface-tint": "#1b60a2",
        "surface-container-highest": "#e1e3e4",
        "inverse-primary": "#a2c9ff",
        "surface-container-high": "#e7e8e9",
        "surface-bright": "#f8f9fa"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "xs": "4px",
        "xxl": "48px",
        "xl": "32px",
        "sm": "8px",
        "margin": "32px",
        "base": "8px",
        "gutter": "24px",
        "md": "16px",
        "lg": "24px",
        "container-max": "1280px"
      },
      fontFamily: {
        "h1": ["Public Sans"],
        "body-lg": ["Public Sans"],
        "label-md": ["Public Sans"],
        "body-md": ["Public Sans"],
        "h3": ["Public Sans"],
        "caption": ["Public Sans"],
        "h2": ["Public Sans"]
      },
      fontSize: {
        "h1": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
        "label-sm": ["14px", {"lineHeight": "20px", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "h3": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "caption": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
        "h2": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700"}]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
};
