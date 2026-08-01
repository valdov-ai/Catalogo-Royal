import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';

  export interface IdRPOption {
    id: string;
    nombre: string;
  }

export interface ClientePayload {
  nombre: string;
  direccion: string;
  ciudad: string;
  cp: string;
  telefonoCasa: string;
  telefonoCel: string;
  idRP: string;
  presentaciones: string;
}

export interface ReferidoPayload {
  nombre: string;
  telefono: string;
  direccion: string;
  observaciones: string;
}


export interface ProspectoPayload {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class RegistroSupabaseService {
  private readonly SUPABASE_URL = 'https://xjzcphcywxrsvoavnhkd.supabase.co';
  private readonly SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqemNwaGN5d3hyc3ZvYXZuaGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NDg4MTIsImV4cCI6MjEwMDMyNDgxMn0.Ddbdm4EFh1AQ0g2hgWq0jCr06K9Ad7yQ-4ZsHEa3ODY';
  private readonly SUPABASE_API_URL = `${this.SUPABASE_URL}/rest/v1`;

  constructor(private http: HttpClient) {}

  private headers() {
    return new HttpHeaders({
      apikey: this.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${this.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    });
  }

  guardarCliente(payload: ClientePayload): Observable<{ id: string } | null> {
  const body = {
    nombre: payload.nombre,
    direccion: payload.direccion,
    ciudad: payload.ciudad,
    cp: payload.cp,
    telefono_casa: (payload.telefonoCasa || '').replace(/\D/g, ''),
    telefono_cel: (payload.telefonoCel || '').replace(/\D/g, ''),
    id_rp: payload.idRP,
    presentaciones: payload.presentaciones
  };

  return this.http
    .post<any[]>(
      `${this.SUPABASE_API_URL}/clientes?select=id`,
      body,
      { headers: this.headersConRetorno() }
    )
    .pipe(
      map(rows => rows?.[0] ? { id: rows[0].id } : null),
      catchError(err => {
        console.error('Supabase cliente error', err);
        return of(null);
      })
    );
}

private headersConRetorno() {
  return new HttpHeaders({
    apikey: this.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${this.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  });
}

guardarReferido(clienteId: string, payload: ReferidoPayload): Observable<boolean> {
  const body = {
    cliente_id: clienteId,
    nombre: payload.nombre,
    telefono: (payload.telefono || '').replace(/\D/g, ''),
    direccion: payload.direccion,
    observaciones: payload.observaciones
  };

  return this.http
    .post(
      `${this.SUPABASE_API_URL}/referidos`,
      body,
      { headers: this.headers() }
    )
    .pipe(
      map(() => true),
      catchError(err => {
        console.error('Supabase referido error', err);
        return of(false);
      })
    );
}


  obtenerIdRPOptions(): Observable<IdRPOption[]> {
    
    return this.http.get<IdRPOption[]>('assets/data/rps.json').pipe(
      catchError(err => {
        console.error('No se pudo cargar rps.json', err);
        return of([]);
      })
    );
  }

  validarReferidoGlobal(payload: Pick<ReferidoPayload, 'nombre' | 'telefono'>): Observable<boolean> {
    const nombre = encodeURIComponent(`eq.${payload.nombre.trim().toLowerCase()}`);
    const telefono = encodeURIComponent(`eq.${payload.telefono.trim()}`);
    return this.http
      .get<any[]>(
        `${this.SUPABASE_API_URL}/referidos?or=(nombre.${nombre},telefono.${telefono})&select=id`,
        { headers: this.headers() }
      )
      .pipe(
        map(rows => (rows?.length ?? 0) === 0),
        catchError(err => {
          console.error('Supabase duplicate check error', err);
          return of(false);
        })
      );
  }
  private headersReturnRepresentation() {
    return {
      apikey: this.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${this.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
  }
  guardarProspecto(payload: ProspectoPayload): Observable<boolean> {
    const body = {
      nombre: payload.nombre.trim(),
      email: payload.email.trim(),
      telefono: payload.telefono.trim(),
      mensaje: payload.mensaje.trim()
    };

    return this.http
      .post(
        `${this.SUPABASE_API_URL}/prospectos`,
        body,
        { headers: this.headers() }
      )
      .pipe(
        map(() => true),
        catchError(err => {
          console.error('Prospecto error', err);
          return of(false);
        })
      );
  }
}
