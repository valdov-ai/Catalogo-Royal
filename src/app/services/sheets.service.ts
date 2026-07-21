import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

/**
 * Servicio genérico para enviar datos de formularios hacia una hoja de
 * Google Sheets conectada como fuente de datos en Looker Studio.
 *
 * Looker Studio NO acepta escrituras directas (es solo un visualizador de
 * reportes). El flujo estándar es:
 *   1. Un formulario web (este Angular app) envía datos a un
 *      Google Apps Script Web App (actúa como API REST gratuita).
 *   2. El Apps Script escribe la fila en una Google Sheet.
 *   3. Looker Studio se conecta a esa misma Google Sheet como
 *      "fuente de datos" y grafica/reporta en tiempo real.
 *
 * CREDENCIALES GENÉRICAS (reemplázalas por las tuyas):
 *   - WEB_APP_URL: URL de tu Google Apps Script desplegado como Web App.
 *   - API_KEY: clave simple de validación (opcional, definida por ti mismo
 *     dentro del script de Apps Script).
 */
@Injectable({
  providedIn: 'root'
})
export class SheetsService {
  private readonly WEB_APP_URL = 'https://script.google.com/macros/s/TU_ID_DE_DESPLIEGUE_AQUI/exec';
  private readonly API_KEY = 'GENERIC_API_KEY_2026';

  constructor(private http: HttpClient) {}

  private post(payload: Record<string, unknown>): Observable<boolean> {
    const body = {
      apiKey: this.API_KEY,
      timestamp: new Date().toISOString(),
      ...payload
    };

    return this.http.post(this.WEB_APP_URL, body).pipe(
      catchError((err) => {
        console.error('Error al enviar datos a Google Sheets / Looker Studio:', err);
        return of(false);
      })
    ) as unknown as Observable<boolean>;
  }

  enviarRegistro(data: {
    nombre: string;
    telefono: string;
    direccion: string;
    referido: string;
    observaciones: string;
  }): Observable<boolean> {
    return this.post({ hoja: 'Registros', ...data });
  }

  enviarProspeccion(data: {
    nombre: string;
    telefono: string;
    preguntaUno: string;
    preguntaDos: string;
    preguntaCheckList: string[];
    preguntaCuatro: string;
  }): Observable<boolean> {
    return this.post({
      hoja: 'Prospeccion',
      ...data,
      preguntaCheckList: data.preguntaCheckList.join(', ')
    });
  }
}
