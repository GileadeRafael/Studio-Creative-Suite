
import React from 'react';
import { SUPABASE_URL } from '../config';

export const SupabaseErrorGuide: React.FC = () => {
  const projectRef = SUPABASE_URL ? SUPABASE_URL.replace('https://', '').split('.')[0] : null;
  const settingsUrl = projectRef ? `https://app.supabase.com/project/${projectRef}/settings/api` : 'https://app.supabase.com/dashboard';

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-2xl rounded-lg bg-zinc-900 p-8 border border-zinc-700 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="text-center">
          <svg xmlns="http://www.w.w3.org/2000/svg" className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-yellow-300">Ação de Configuração Necessária</h1>
          <p className="mt-2 text-zinc-300">
            O aplicativo não conseguiu se conectar ao seu banco de dados Supabase devido a uma restrição de segurança do navegador (Erro de CORS).
          </p>
          <p className="mt-1 text-zinc-400 text-sm">
            Esta é uma configuração única e necessária no seu painel do Supabase para permitir que este aplicativo acesse seus dados com segurança.
          </p>
        </div>

        <div className="mt-8 space-y-6 text-left">
          <div>
            <h2 className="text-lg font-semibold text-white">Como Corrigir em 60 Segundos</h2>
            <ol className="mt-2 list-decimal list-inside space-y-3 text-zinc-300">
              <li>
                Abra o link direto para a página de configurações da API do seu projeto:
                <a 
                  href={settingsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-red-400 font-semibold py-2 px-4 rounded-lg my-2 transition-colors"
                >
                  Ir para as Configurações da API do Supabase
                </a>
              </li>
              <li>Role a página **até o final** para encontrar a seção chamada <strong className="text-zinc-100">"CORS settings"</strong>.</li>
              <li>No campo de texto <strong className="text-zinc-100">"Allowed Origins (CORS)"</strong>, digite um asterisco (<code className="bg-zinc-950 px-1.5 py-0.5 rounded-md text-red-400">*</code>) em uma nova linha.</li>
              <li>Clique no botão verde <strong className="text-zinc-100">"Save"</strong> no final da seção.</li>
              <li>Volte para esta página e clique no botão "Tentar Novamente" abaixo.</li>
            </ol>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h3 className="font-semibold text-white">Não consegue encontrar a seção "CORS settings"?</h3>
            <p className="mt-1 text-zinc-400 text-sm">
              Isso geralmente acontece se você não tiver as permissões de 'Owner' (Dono) ou 'Admin' no projeto Supabase. Por favor, peça ao administrador do projeto para realizar esta alteração.
            </p>
          </div>

          <div className="text-center border-t border-zinc-800 pt-6">
            <p className="text-zinc-400 text-sm mb-4">Após salvar a configuração no Supabase, o aplicativo deve carregar corretamente.</p>
            <button
              onClick={handleRetry}
              className="w-full max-w-xs mx-auto flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
