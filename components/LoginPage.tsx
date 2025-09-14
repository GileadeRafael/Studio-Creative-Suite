import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-zinc-900 via-black to-red-900/50 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_70%)]"></div>
        <div className="relative z-10">
            <h1 className="text-6xl font-bold text-white tracking-tight">Crie o impossível.</h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-lg mx-auto">Sua imaginação é o único limite. Dê vida às suas ideias com o poder da IA.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Studio Logo" className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-100">Bem-vindo(a) de volta</h2>
            <p className="text-gray-400">Entre com sua conta para continuar.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-baseline">
                <label htmlFor="password"className="block text-sm font-medium text-gray-400">Senha</label>
                <a href="#" className="text-sm text-red-400 hover:text-red-300">Esqueceu a senha?</a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 disabled:bg-red-800 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Login'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Não tem uma conta?{' '}
            <button onClick={onNavigateToSignup} className="font-medium text-red-400 hover:text-red-300">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
       <style>{`.bg-grid-zinc-800\\/20 { background-image: linear-gradient(to right, rgba(40, 40, 45, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 40, 45, 0.5) 1px, transparent 1px); background-size: 3rem 3rem; }`}</style>
    </div>
  );
};