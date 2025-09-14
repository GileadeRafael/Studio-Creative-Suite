import { supabase } from './supabaseClient';
import { User } from '../types';

const defaultPhotoURL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0EwQTBCNiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTRjLTIuMDMgMC0zLjgyLS44Ny01LjE0LTIuMjZsMS40Mi0xLjQyQzkuMSAxMy4xIDEwLjUgMTQgMTIgMTQuMDFjMS41IDAgMi45LS45MSAzLjcyLTIuMjdsMS40MiAxLjQyQzE1LjgxIDE4LjEzIDE0LjA0IDE5IDEyIDE5eiIvPjwvc3ZnPg==';

export const authService = {
  signup: async (username: string, email: string, password: string, photoURL?: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          photo_url: photoURL || defaultPhotoURL,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
    if (!data.user) {
      throw new Error('Cadastro falhou, nenhum usuário retornado.');
    }
    
    return {
      id: data.user.id,
      email: data.user.email!,
      username: data.user.user_metadata.username,
      photoURL: data.user.user_metadata.photo_url,
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error('E-mail ou senha inválidos.');
    }
     if (!data.user) {
      throw new Error('Login falhou, nenhum usuário retornado.');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      username: data.user.user_metadata.username,
      photoURL: data.user.user_metadata.photo_url,
    };
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro ao fazer logout:", error);
        throw new Error(error.message);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }
    const { user } = session;
    return {
      id: user.id,
      email: user.email!,
      username: user.user_metadata.username,
      photoURL: user.user_metadata.photo_url,
    };
  },
};