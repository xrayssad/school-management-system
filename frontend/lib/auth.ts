import type { AuthUser, UserRole } from './types';

const USER_KEY = 'madrasa_user';
const TOKEN_KEY = 'madrasa_token';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(user: AuthUser, token: string): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthSession(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  return user?.role === role;
}

export function roleHomePath(role: UserRole): string {
  if (role === 'committee') return '/committee/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/student/dashboard';
}
