import { User } from '../types';

// IMPORTANT: This is a simulated auth service using localStorage.
// In a real production application, you would use a secure backend with a database
// and proper password hashing (e.g., bcrypt).

const USERS_KEY = 'studio-users';
const CURRENT_USER_KEY = 'studio-currentUser';

const getStoredUsers = (): (User & { password: string })[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
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
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Automatically log in the new user
    const { password: _, ...userToStore } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    
    return userToStore;
  },

  login: (email: string, password: string): User => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const { password: _, ...userToStore } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    return userToStore;
  },

  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Clean up corrupted data
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  },
};
