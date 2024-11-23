/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}", // Garanta que seus arquivos Angular sejam analisados
    ],
    theme: {
      extend: {
        colors: {
          dark: "#1E1730", // Adicionando a cor "dark" para fundo
          light: "#ffffff", // Adicionando a cor "light" para texto
          accent: "#ec6d1c", // Cor laranja para detalhes
        },
      },
    },
    plugins: [],
  };
  