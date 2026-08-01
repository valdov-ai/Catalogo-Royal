import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-completar-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './completar-perfil.component.html',
  styleUrls: ['./completar-perfil.component.scss']
})
export class CompletarPerfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (user.telefono?.trim()) {
      this.router.navigate(['/catalogo']);
      return;
    }

    this.form.patchValue({
      nombre: user.nombre ?? '',
      telefono: user.telefono ?? ''
    });
  }

  async submit(): Promise<void> {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { nombre, telefono } = this.form.getRawValue();
    const strRP= 'RP-' + (nombre ?? '').trim().replace(/\s+/g, '').slice(0, 10).padEnd(10, 'X').toUpperCase();
    const result = await this.auth.updateProfile(
      nombre ?? '',
      telefono ?? '',
      strRP
    );

    this.loading.set(false);

    if (!result.ok) {
      this.error.set(result.message ?? 'No fue posible actualizar el perfil.');
      return;
    }

    await this.router.navigate(['/catalogo']);
  }
}