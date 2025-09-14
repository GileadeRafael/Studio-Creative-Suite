import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define as variáveis de ambiente do lado do cliente.
  // A API_KEY do Gemini continua a ser lida a partir do ambiente.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
