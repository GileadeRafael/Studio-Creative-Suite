import { User } from '../types';

// IMPORTANT: This is a simulated auth service using localStorage.
// In a real production application, you would use a secure backend with a database
// and proper password hashing (e.g., bcrypt).

const USERS_KEY = 'studio-users';
const CURRENT_USER_KEY = 'studio-currentUser';

const getStoredUsers = (): (User & { password: string })[] => {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
        console.error("Failed to read users from localStorage. It might be disabled.", error);
        return []; // Return empty array if localStorage is not accessible.
    }
};

const defaultPhotoURL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0EwQTBCNiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTRjLTIuMDMgMC0zLjgyLS44Ny01LjE0LTIuMjZsMS40Mi0xLjQyQzkuMSAxMy4xIDEwLjUgMTQgMTIgMTQuMDFjMS41IDAgMi45LS45MSAzLjcyLTIuMjdsMS40MiAxLjQyQzE1LjgxIDE4LjEzIDE0LjA0IDE5IDEyIDE5eiIvPjwvc3ZnPg==';


export const authService = {
  signup: (username: string, email: string, password: string, photoURL?: string): User => {
    const users = getStoredUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Já existe uma conta com este e-mail.');
    }

    const newUser: User & { password: string } = {
      id: new Date().toISOString() + Math.random(),
      username,
      email,
      password, // In a real app, HASH THIS PASSWORD!
      photoURL: photoURL || defaultPhotoURL,
    };

    users.push(newUser);
    const { password: _, ...userToStore } = newUser;

    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    } catch (error) {
        console.error("Failed to save user to localStorage. It might be disabled.", error);
        throw new Error('Não foi possível salvar a conta. O armazenamento do navegador pode estar desativado ou cheio.');
    }
    
    return userToStore;
  },

  login: (email: string, password: string): User => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const { password: _, ...userToStore } = user;
    try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    } catch (error) {
        console.error("Failed to save current user to localStorage. It might be disabled.", error);
        throw new Error('Não foi possível iniciar a sessão. O armazenamento do navegador pode estar desativado ou cheio.');
    }
    return userToStore;
  },

  logout: (): void => {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error("Failed to remove current user from localStorage.", error);
    }
  },

  getCurrentUser: (): User | null => {
    try {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        if (!userJson) return null;
        return JSON.parse(userJson);
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Clean up corrupted data
        try {
            localStorage.removeItem(CURRENT_USER_KEY);
        } catch (removeError) {
            console.error("Failed to remove corrupted user data from localStorage", removeError);
        }
        return null;
    }
  },
};