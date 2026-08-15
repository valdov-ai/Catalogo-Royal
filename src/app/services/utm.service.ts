import { Injectable, signal } from '@angular/core';

const UTM_STORAGE_KEY = 'utm_query_string';

@Injectable({
  providedIn: 'root'
})
export class UtmService {
  private readonly queryString = signal('');

  constructor() {
    this.capture();
  }

  private capture(): void {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    const hasUtm = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content'
    ].some(key => params.has(key));

    if (hasUtm) {
      this.queryString.set(search);
      sessionStorage.setItem(UTM_STORAGE_KEY, search);
      return;
    }

    this.queryString.set(
      sessionStorage.getItem(UTM_STORAGE_KEY) ?? ''
    );
  }

  getQueryString(): string {
    return this.queryString();
  }

  buildLandingLink(fragment = 'formulario'): string {
    const query = this.getQueryString();
    return `/cambia-tu-sarten${query}#${fragment}`;
  }
}