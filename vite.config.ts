import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // Carrega variáveis de ambiente (ex: de um arquivo .env) para o ambiente Node.js do Vite.
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    define: {
      // Expõe seletivamente as variáveis de ambiente necessárias para o código do cliente.
      // Isso substitui `process.env` no código do cliente por este objeto.
      'process.env': {
        'API_KEY': env.API_KEY
      }
    }
  });
};
