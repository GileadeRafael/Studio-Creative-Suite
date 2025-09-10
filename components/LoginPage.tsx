import React, { useEffect, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface LoginPageProps {
  onLogin: (credentialResponse: CredentialResponse) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleError = () => {
    console.error('Login Failed. This is often a configuration issue in your Google Cloud Console.');
    setLoginError(
      "O login falhou. Verifique a configuração do seu Google Client ID."
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="w-full flex md:grid md:grid-cols-2">
        {/* Left Column: Gradient and branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-900/50 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_70%)]"></div>
            <div className="relative z-10">
                <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Studio Logo" className="w-20 h-20 mx-auto mb-6 drop-shadow-lg" />
                <h1 className="text-5xl font-bold text-white tracking-tight">Crie o impossível.</h1>
                <p className="mt-4 text-lg text-zinc-400 max-w-sm mx-auto">Sua imaginação é o único limite. Dê vida às suas ideias com o poder da IA.</p>
            </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="w-full flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto text-center">
                <div className="md:hidden flex items-center justify-center mb-8">
                    <img src="https://framerusercontent.com/images/CHVGn1yl906NV0lL0JCifCk1as.png" alt="Studio Logo" className="w-12 h-12 mr-4" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-100 mb-2">Bem-vindo(a) de volta</h2>
                <p className="text-gray-400 mb-8">Entre com sua conta Google para continuar.</p>
                
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={onLogin}
                        onError={handleError}
                        theme="filled_black"
                        text="signin_with"
                        shape="pill"
                        logo_alignment="left"
                    />
                </div>
                
                {loginError && (
                  <div className="mt-8 p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-left text-sm text-red-400">
                    <p>{loginError}</p>
                  </div>
                )}
            </div>
        </div>
      </div>
      <style>
        {`
          .bg-grid-zinc-800\\/20 {
            background-image: linear-gradient(to right, rgba(40, 40, 45, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 40, 45, 0.5) 1px, transparent 1px);
            background-size: 3rem 3rem;
          }
        `}
      </style>
    </div>
  );
};