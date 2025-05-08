/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Garante que o Tailwind analise todos seus componentes
  ],
  theme: {
    extend: {}, // Aqui você pode adicionar customizações se quiser no futuro
  },
  plugins: [], // Plugins como forms ou typography podem ser adicionados aqui depois
};
