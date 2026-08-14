// landing-sarten.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild, ChangeDetectionStrategy,ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink,Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';
import { RegistroSupabaseService } from '../../services/registro-supabase.service';

interface LandingLead {
  nombre: string;
  email: string;
  telefono: string;
  cp: string;
  consentimiento: boolean;
}

@Component({
  selector: 'app-landing-sarten',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing-sarten.component.html',
  styleUrls: ['./landing-sarten.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingSartenComponent {
  private readonly supabase = inject(RegistroSupabaseService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  
  @ViewChild('videoCampania') videoCampania!: ElementRef<HTMLVideoElement>;
  isMuted = signal(true);

  constructor() {
    this.title.setTitle('Cambia tu sartén!');
    this.meta.updateTag({name: 'description',content: 'Cambia tu sartén!. Registra tus datos y recibe una asesoría personalizada y un regalo.'});
    this.meta.updateTag({name: 'og:description',content: 'Cambia tu sartén!. Registra tus datos y recibe asesoría personalizada y un regalo.'});
    this.meta.updateTag({name: 'twitter:description',content: 'Cambia tu sartén!. Registra tus datos y recibe asesoría personalizada y un regalo.'});
    this.meta.updateTag({property: 'og:description',content: 'Cambia tu sartén!. Registra tus datos y recibe asesoría personalizada y un regalo.'});
    this.meta.updateTag({property: 'og:image',content: 'https://www.musemex.com/assets/img/campania.webp'});
    this.meta.updateTag({property: 'og:url',content: 'https://www.musemex.com/cambia-tu-sarten/'});
    this.meta.updateTag({name: 'twitter:image',content: 'https://www.musemex.com/assets/img/campania.webp'});
  }

  lead = signal<LandingLead>({
    nombre: '',
    email: '',
    telefono: '',
    cp: '',
    consentimiento: false
  });

  isSubmitting = signal(false);
  error = signal('');
  success = signal('');

    toggleAudio(): void {
    const video = this.videoCampania?.nativeElement;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    this.isMuted.set(video.muted);

    if (!video.muted) {
      video.play().catch(() => {
        // El navegador puede bloquear play con sonido sin interacción
        // previa; como este método viene de un click, no debería fallar.
      });
    }
  }

  updateField<K extends keyof LandingLead>(field: K, value: LandingLead[K]): void {
    this.lead.set({ ...this.lead(), [field]: value });
  }

  private normalizePhone(value: string): string {
    return (value || '').replace(/\D/g, '');
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');

    const data = this.lead();

    if (!data.nombre.trim()) {
      this.error.set('Captura tu nombre.');
      return;
    }
    if (!data.email.trim()) {
      this.error.set('Captura tu correo electrónico.');
      return;
    }
    const telefono = this.normalizePhone(data.telefono);
    if (!telefono || telefono.length !== 10) {
      this.error.set('El teléfono debe tener 10 dígitos.');
      return;
    }
    if (!data.cp.trim()) {
      this.error.set('Captura tu código postal.');
      return;
    }
    if (!data.consentimiento) {
      this.error.set('Debes aceptar el Aviso de Privacidad para continuar.');
      return;
    }
    this.isSubmitting.set(true);

    this.supabase.guardarReferidoLanding({
      nombre: data.nombre.trim(),
      telefono,
      email: data.email.trim(),
      cp: data.cp.trim(),
      origen: 'landing_sarten'
    }).subscribe(ok => {
      this.isSubmitting.set(false);
      if (ok) {
        this.success.set('...');
        this.lead.set({ nombre: '', email: '', telefono: '', cp: '', consentimiento:false });
        this.router.navigate(['/cambia-tu-sarten/gracias']);
      }else {
        this.error.set('No se pudo guardar tu registro. Intenta nuevamente.');
      }
    });
  }
}