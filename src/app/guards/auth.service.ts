import { Injectable, computed, signal } from '@angular/core';

export interface SessionUser {
  username: string;
  nombre: string;
  role: 'admin' | 'asesor';
}

export interface LoginResult {
  ok: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'catalogo_session_user';
  private readonly userSignal = signal<SessionUser | null>(this.readUserFromStorage());

  readonly currentUser = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  login(username: string, password: string): LoginResult {
    const user = username.trim().toLowerCase();
    const pass = password.trim();

    if (!user || !pass) {
      return { ok: false, message: 'Captura usuario y contraseña.' };
    }

    if (user === 'admin' && pass === '123456') {
      const session: SessionUser = {
        username: 'admin',
        nombre: 'Administrador',
        role: 'admin'
      };

      this.persistSession(session);
      return { ok: true };
    }

    if (user === 'asesor' && pass === '123456') {
      const session: SessionUser = {
        username: 'asesor',
        nombre: 'Asesor Comercial',
        role: 'asesor'
      };

      this.persistSession(session);
      return { ok: true };
    }

    return { ok: false, message: 'Usuario o contraseña incorrectos.' };
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSignal.set(null);
  }

  private persistSession(session: SessionUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.userSignal.set(session);
  }

  private readUserFromStorage(): SessionUser | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as SessionUser : null;
    } catch {
      return null;
    }
  }
}