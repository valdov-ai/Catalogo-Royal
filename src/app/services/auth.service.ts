import { Injectable, computed, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase.client';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: string;
  telefono: string;
  idrp: string;
}

export interface LoginResult {
  ok: boolean;
  message?: string;
  user?: AuthUser | null;
  profileComplete?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly readySignal = signal(false);
  private restorePromise: Promise<void> | null = null;

  readonly currentUser = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  constructor() {
    this.restorePromise = this.bootstrapSession();
  }

  private async bootstrapSession(): Promise<void> {
    await this.restoreSession();
    this.listenToAuthChanges();
    this.readySignal.set(true);
  }

  private async restoreSession(): Promise<void> {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.user) {
      this.userSignal.set(null);
      return;
    }

    const profile = await this.loadProfile(data.session.user.id);
    this.userSignal.set(profile ?? this.mapUser(data.session.user));
  }

  private listenToAuthChanges(): void {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await this.loadProfile(session.user.id);
        this.userSignal.set(profile ?? this.mapUser(session.user));
      } else {
        this.userSignal.set(null);
      }
    });
  }

  private async loadProfile(userId: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, role, telefono, idrp')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email ?? '',
      nombre: data.nombre ?? 'Usuario X',
      role: data.role ?? 'user',
      telefono: data.telefono ?? '00000000',
      idrp: data.idrp ?? 'RP-00'
    };
  }

  async ensureSessionLoaded(): Promise<boolean> {
    if (!this.readySignal()) {
      await (this.restorePromise ?? this.bootstrapSession());
    }
    return this.isLoggedIn();
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const correo = email.trim();
    const clave = password.trim();

    if (!correo || !clave) {
      return { ok: false, message: 'Captura correo y contraseña.' };
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave
    });

    if (error) {
      return { ok: false, message: this.translateError(error.message) };
    }

    const userId = data.user?.id;
    if (!userId) {
      return { ok: false, message: 'No se pudo obtener la sesión del usuario.' };
    }

    const profile = await this.loadProfile(userId);
    const resolvedUser = profile ?? this.mapUser(data.user);
    this.userSignal.set(resolvedUser);

    return {
      ok: true,
      user: resolvedUser,
      profileComplete: this.isUserProfileComplete(resolvedUser)
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this.userSignal.set(null);
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email ?? '',
      nombre: (user.user_metadata?.['nombre'] as string) ?? user.email ?? 'Usuario',
      role: (user.user_metadata?.['role'] as string) ?? 'user',
      telefono: (user.user_metadata?.['telefono'] as string) ?? '0000000000',
      idrp: (user.user_metadata?.['idrp'] as string) ?? 'RP-000'
    };
  }

  private isUserProfileComplete(user: AuthUser | null): boolean {
    if (!user) return false;
    return !!user.nombre?.trim() && !!user.telefono?.trim();
  }

  isProfileComplete(): boolean {
    return this.isUserProfileComplete(this.currentUser());
  }

  async updateProfile(nombre: string, telefono: string, idrp: string): Promise<{ ok: boolean; message?: string }> {
    const user = this.currentUser();
    if (!user) {
      return { ok: false, message: 'No hay sesión activa.' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        idrp: idrp.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, nombre, role, telefono, idrp')
      .single();

    if (error || !data) {
      return { ok: false, message: 'No fue posible actualizar el perfil.' };
    }

    this.userSignal.set({
      id: data.id,
      email: data.email ?? '',
      nombre: data.nombre ?? 'Usuario',
      role: data.role ?? 'user',
      telefono: data.telefono ?? '',
      idrp: data.idrp ?? ''
    });

    return { ok: true };
  }

  private translateError(message: string): string {
    const text = message.toLowerCase();
    if (text.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
    if (text.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.';
    return message;
  }

  async signUp(email: string, password: string, nombre: string, role: string = 'user'): Promise<{ ok: boolean; message?: string }> {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: { data: { nombre: nombre.trim(), role } }
    });

    if (error) {
      return { ok: false, message: this.translateError(error.message) };
    }

    return { ok: true, message: 'Usuario registrado correctamente.' };
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return !!user && user.role?.toLowerCase() === role.toLowerCase();
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.some(role => user.role?.toLowerCase() === role.toLowerCase());
  }
}
