import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { fileToBase64 } from '../services/geminiService';

interface SignupPageProps {
  onSignup: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    setError(null);
    setIsLoading(true);

    try {
      let photoBase64: string | undefined = undefined;
      if (photoFile) {
        const base64String = await fileToBase64(photoFile);
        photoBase64 = `data:${photoFile.type};base64,${base64String}`;
      }
      
      const user = await authService.signup(username, email, password, photoBase64);
      onSignup(user);
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
            <h1 className="text-6xl font-bold text-white tracking-tight">Comece sua jornada.</h1>
            <p className="mt-4 text-xl text-zinc-400 max-w-lg mx-auto">Crie sua conta e comece a transformar texto em arte visual deslumbrante em segundos.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Studio Logo" className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-100">Criar uma conta</h2>
            <p className="text-gray-400">Junte-se à nossa comunidade criativa.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                </div>
                <label htmlFor="photo-upload" className="cursor-pointer text-sm font-medium text-red-400 hover:text-red-300">
                    Escolher foto
                    <input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" />
                </label>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400">Nome de usuário</label>
              <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>
            
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-400">Senha</label>
              <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 disabled:bg-red-800 disabled:cursor-not-allowed">
                {isLoading ? 'Criando conta...' : 'Cadastrar'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <button onClick={onNavigateToLogin} className="font-medium text-red-400 hover:text-red-300">
              Faça o login
            </button>
          </p>
        </div>
      </div>
       <style>{`.bg-grid-zinc-800\\/20 { background-image: linear-gradient(to right, rgba(40, 40, 45, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 40, 45, 0.5) 1px, transparent 1px); background-size: 3rem 3rem; }`}</style>
    </div>
  );
};