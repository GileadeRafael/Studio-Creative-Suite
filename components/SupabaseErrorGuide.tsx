import React, { useState } from 'react';

interface SupabaseErrorGuideProps {
  errorType: 'load' | 'create';
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-zinc-900 rounded-md p-4 text-sm text-zinc-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold py-1 px-2 rounded"
      >
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  );
};

export const SupabaseErrorGuide: React.FC<SupabaseErrorGuideProps> = ({ errorType }) => {
  
  const projectsPolicies = `-- Habilita a RLS (Row Level Security) na tabela 'projects'
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Permite que usuários leiam (SELECT) seus próprios projetos
CREATE POLICY "Allow individual read access" ON projects
FOR SELECT USING (auth.uid() = user_id);

-- Permite que usuários criem (INSERT) novos projetos para si mesmos
CREATE POLICY "Allow individual insert access" ON projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permite que usuários deletem (DELETE) seus próprios projetos
CREATE POLICY "Allow individual delete access" ON projects
FOR DELETE USING (auth.uid() = user_id);

-- Permite que usuários atualizem (UPDATE) seus próprios projetos
CREATE POLICY "Allow individual update access" ON projects
FOR UPDATE USING (auth.uid() = user_id);`;

  const imagesPolicies = `-- Habilita a RLS (Row Level Security) na tabela 'images'
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Permite que usuários leiam (SELECT) suas próprias imagens
CREATE POLICY "Allow individual read access" ON images
FOR SELECT USING (auth.uid() = user_id);

-- Permite que usuários criem (INSERT) novas imagens para si mesmos
CREATE POLICY "Allow individual insert access" ON images
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permite que usuários deletem (DELETE) suas próprias imagens
CREATE POLICY "Allow individual delete access" ON images
FOR DELETE USING (auth.uid() = user_id);

-- Permite que usuários atualizem (UPDATE) suas próprias imagens
CREATE POLICY "Allow individual update access" ON images
FOR UPDATE USING (auth.uid() = user_id);`;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-3xl rounded-lg bg-zinc-900 p-8 border border-zinc-700 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h1 className="mt-4 text-2xl font-bold text-red-400">Ação de Configuração Necessária</h1>
            <p className="mt-2 text-zinc-300">
                O aplicativo não conseguiu {errorType === 'load' ? 'carregar seus projetos' : 'criar um novo projeto'} do seu banco de dados Supabase.
            </p>
             <p className="mt-1 text-zinc-400 text-sm">
                Isso geralmente acontece quando a Segurança em Nível de Linha (RLS) está ativada, mas não há políticas que permitam ao aplicativo acessar os dados.
            </p>
        </div>

        <div className="mt-8 space-y-6 text-left">
            <div>
                <h2 className="text-lg font-semibold text-white">Como Corrigir</h2>
                <p className="mt-1 text-zinc-400">
                    Vá para o seu <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-red-400 underline hover:text-red-300">painel do Supabase</a>, selecione seu projeto, vá para o <strong className="text-zinc-200">SQL Editor</strong>, e rode os seguintes scripts.
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-white">1. Políticas para a Tabela `projects`</h3>
                 <p className="mt-1 mb-3 text-zinc-400 text-sm">
                    Estas regras permitem que os usuários gerenciem seus próprios projetos.
                </p>
                <CodeBlock code={projectsPolicies} />
            </div>

            <div>
                <h3 className="font-semibold text-white">2. Políticas para a Tabela `images`</h3>
                <p className="mt-1 mb-3 text-zinc-400 text-sm">
                    Estas regras permitem que os usuários gerenciem suas próprias imagens dentro de seus projetos.
                </p>
                <CodeBlock code={imagesPolicies} />
            </div>
             <div className="text-center border-t border-zinc-800 pt-6">
                 <p className="text-zinc-400 text-sm mb-4">Após rodar os scripts SQL no Supabase, volte aqui e tente novamente.</p>
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
