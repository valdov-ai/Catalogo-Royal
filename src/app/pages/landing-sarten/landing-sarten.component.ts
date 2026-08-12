// landing-sarten.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink,Router } from '@angular/router';
import { RegistroSupabaseService } from '../../services/registro-supabase.service';

interface LandingLead {
  nombre: string;
  email: string;
  telefono: string;
  cp: string;
}

@Component({
  selector: 'app-landing-sarten',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing-sarten.component.html',
  styleUrls: ['./landing-sarten.component.scss']
})
export class LandingSartenComponent {
  private readonly supabase = inject(RegistroSupabaseService);
  private readonly router = inject(Router);

  lead = signal<LandingLead>({
    nombre: '',
    email: '',
    telefono: '',
    cp: ''
  });

  isSubmitting = signal(false);
  error = signal('');
  success = signal('');

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
        this.lead.set({ nombre: '', email: '', telefono: '', cp: '' });
        this.router.navigate(['/cambia-tu-sarten/gracias']);
      }else {
        this.error.set('No se pudo guardar tu registro. Intenta nuevamente.');
      }
    });
  }
}