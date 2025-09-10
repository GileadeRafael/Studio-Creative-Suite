
import React from 'react';

export const ConfigurationError: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-gray-200">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50 border border-red-800 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">Configuração Necessária</h1>
        <p className="mt-4 text-zinc-400">
          Este aplicativo requer uma chave de API do Gemini para funcionar. Para fins de segurança, a chave deve ser nomeada corretamente para ser incluída no site.
        </p>
        
        <div className="mt-8 text-left rounded-lg bg-zinc-800/50 border border-zinc-700 p-6">
            <h2 className="text-lg font-semibold text-white">Como resolver:</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6 text-zinc-300">
                <li>
                    Acesse as configurações (<strong>Settings</strong>) do seu projeto no Vercel.
                </li>
                <li>
                    Navegue até a seção <strong>Environment Variables</strong>.
                </li>
                <li>
                    Crie (ou renomeie a existente) uma variável com o nome (<strong>Name</strong>) <code className="rounded bg-zinc-700 px-2 py-1 text-sm font-mono text-amber-400">VITE_API_KEY</code>. O prefixo <code className="rounded bg-zinc-700 px-1 font-mono text-amber-400">VITE_</code> é obrigatório.
                </li>
                <li>
                    Cole sua chave secreta da API do Gemini no campo de valor (<strong>Value</strong>).
                </li>
                <li>
                    Salve a variável e faça o <strong>Redeploy</strong> da sua aplicação (vá para a aba "Deployments" e use a opção "Redeploy" no último deploy).
                </li>
            </ol>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Se você não tem uma chave de API, pode obter uma gratuitamente no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">Google AI Studio</a>.
        </p>
      </div>
    </div>
  );
};
