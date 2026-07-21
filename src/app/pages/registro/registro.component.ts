import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SheetsService } from '../../services/sheets.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  nombre = '';
  telefono = '';
  direccion = '';
  referido = '';
  observaciones = '';

  isSubmitting = signal<boolean>(false);
  formError = signal<string>('');
  formSuccess = signal<string>('');

  constructor(private sheetsService: SheetsService) {}

  onSubmit(): void {
    this.formError.set('');
    this.formSuccess.set('');

    if (!this.nombre.trim()) {
      this.formError.set('El nombre es obligatorio.');
      return;
    }
    if (!this.telefono.trim()) {
      this.formError.set('El teléfono es obligatorio.');
      return;
    }

    this.isSubmitting.set(true);

    this.sheetsService.enviarRegistro({
      nombre: this.nombre.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim(),
      referido: this.referido.trim(),
      observaciones: this.observaciones.trim()
    }).subscribe((success) => {
      this.isSubmitting.set(false);
      if (success !== false) {
        this.formSuccess.set('Registro guardado correctamente.');
        this.resetForm();
      } else {
        this.formError.set('No se pudo guardar el registro. Verifica tu conexión e intenta de nuevo.');
      }
    });
  }

  private resetForm(): void {
    this.nombre = '';
    this.telefono = '';
    this.direccion = '';
    this.referido = '';
    this.observaciones = '';
  }
}
