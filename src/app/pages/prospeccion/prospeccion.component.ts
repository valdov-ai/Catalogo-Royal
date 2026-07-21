import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SheetsService } from '../../services/sheets.service';

interface ChecklistOption {
  value: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-prospeccion',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './prospeccion.component.html',
  styleUrls: ['./prospeccion.component.scss']
})
export class ProspeccionComponent {
  nombre = '';
  telefono = '';
  preguntaUno = '';
  preguntaDos = '';
  preguntaCuatro = '';

  opcionesDos = ['R1', 'R2', 'R3'];

  checklistOptions = signal<ChecklistOption[]>([
    { value: 'CH1', label: 'CH1', checked: false },
    { value: 'CH2', label: 'CH2', checked: false },
    { value: 'CH3', label: 'CH3', checked: false },
    { value: 'CH4', label: 'CH4', checked: false }
  ]);

  isSubmitting = signal<boolean>(false);
  formError = signal<string>('');
  formSuccess = signal<string>('');

  constructor(private sheetsService: SheetsService) {}

  toggleChecklistOption(value: string): void {
    const updated = this.checklistOptions().map(opt =>
      opt.value === value ? { ...opt, checked: !opt.checked } : opt
    );
    this.checklistOptions.set(updated);
  }

  private getSelectedChecklist(): string[] {
    return this.checklistOptions().filter(opt => opt.checked).map(opt => opt.value);
  }

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
    if (!this.preguntaUno) {
      this.formError.set('Selecciona una respuesta para la pregunta uno.');
      return;
    }
    if (!this.preguntaDos) {
      this.formError.set('Selecciona una opción para la pregunta dos.');
      return;
    }

    this.isSubmitting.set(true);

    this.sheetsService.enviarProspeccion({
      nombre: this.nombre.trim(),
      telefono: this.telefono.trim(),
      preguntaUno: this.preguntaUno,
      preguntaDos: this.preguntaDos,
      preguntaCheckList: this.getSelectedChecklist(),
      preguntaCuatro: this.preguntaCuatro.trim()
    }).subscribe((success) => {
      this.isSubmitting.set(false);
      if (success !== false) {
        this.formSuccess.set('Prospección guardada correctamente.');
        this.resetForm();
      } else {
        this.formError.set('No se pudo guardar la prospección. Verifica tu conexión e intenta de nuevo.');
      }
    });
  }

  private resetForm(): void {
    this.nombre = '';
    this.telefono = '';
    this.preguntaUno = '';
    this.preguntaDos = '';
    this.preguntaCuatro = '';
    this.checklistOptions.set(this.checklistOptions().map(opt => ({ ...opt, checked: false })));
  }
}
