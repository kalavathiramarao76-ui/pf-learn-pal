module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3498db",
        secondary: "#f1c40f",
        dark: "#2f343a",
        light: "#f9f9f9",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.dark"),
            a: {
              textDecoration: "none",
              color: theme("colors.primary"),
            },
            "a:hover": {
              color: theme("colors.secondary"),
            },
          },
        },
      }),
    },
  },
  plugins: [],
  darkMode: "class",
};