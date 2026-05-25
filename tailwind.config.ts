import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#04070f",
          900: "#070d1a",
          800: "#0c1428",
          700: "#111d38",
          600: "#172647",
        },
        accent: {
          blue: "#3b6fd4",
          purple: "#6c4de6",
          glow: "#2d5bcc",
        }
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui"],
        display: ["var(--font-montserrat)", "system-ui"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(59,111,212,0.15) 0%, rgba(108,77,230,0.08) 100%)",
        "hero-gradient": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,111,212,0.3) 0%, transparent 70%)",
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glow-blue": "0 0 40px rgba(59,111,212,0.3)",
        "glow-sm": "0 0 20px rgba(59,111,212,0.2)",
        "card": "0 4px 24px rgba(0,0,0,0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        }
      }
    }
  },
  plugins: [],
};
export default config;
