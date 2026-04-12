import type { AdminUser, AdminSession, Role } from '../types/admin';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSession(): AdminSession | null {
  try {
    const s = sessionStorage.getItem('admin_session');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AdminSession): void {
  sessionStorage.setItem('admin_session', JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem('admin_session');
}

export function getUsers(): AdminUser[] {
  try {
    const s = localStorage.getItem('admin_users');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: AdminUser[]): void {
  localStorage.setItem('admin_users', JSON.stringify(users));
}

export async function initDefaultUsers(): Promise<void> {
  const existing = localStorage.getItem('admin_users');
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed) && parsed.length > 0) return;
    } catch {
      // fall through and recreate
    }
  }
  const hash = await hashPassword('Admin1234!');
  const defaultUser: AdminUser = {
    id: 'user-1',
    name: 'Super Admin',
    email: 'admin@domainedefuego.fr',
    passwordHash: hash,
    role: 'superadmin' as Role,
    active: true,
    createdAt: new Date().toISOString(),
  };
  saveUsers([defaultUser]);
}

export async function authenticate(email: string, password: string): Promise<AdminUser | null> {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.active);
  if (!user) return null;
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return null;
  // update lastLogin
  const updated = users.map(u => u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u);
  saveUsers(updated);
  return user;
}
