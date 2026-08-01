import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Promo {
  id: string;
  tag: string;
  titulo: string;
  texto: string;
  badge: string;
  imagen: string;
}

export interface VideoItem {
  titulo: string;
  descripcion: string;
  duracion: string;
  imagen: string;
  videoUrl: string;
}

export interface Testimonio {
  nombre: string;
  rol: string;
  texto: string;
  avatar: string;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    ctaPrimary: { label: string; link: string };
    ctaSecondary: { label: string; link: string };
    imagenFondo: string;
  };
  promos: Promo[];
  about: { imagen: string };
  videos: VideoItem[];
  testimonios: Testimonio[];
  jobs: { imagen: string };
}

@Injectable({ providedIn: 'root' })
export class HomeContentService {
  private readonly http = inject(HttpClient);

  getContent(): Observable<HomeContent> {
    return this.http.get<HomeContent>('assets/data/home-content.json');
  }
}