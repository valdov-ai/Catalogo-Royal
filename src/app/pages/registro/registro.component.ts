import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegistroSupabaseService } from '../../services/registro-supabase.service';

interface ClienteForm {
  nombre: string;
  direccion: string;
  ciudad: string;
  cp: string;
  telefonoCasa: string;
  telefonoCel: string;
  idRP: string;
  presentaciones: string;
}

interface ReferidoForm {
  nombre: string;
  telefono: string;
  direccion: string;
  observaciones: string;
}

interface ClienteGuardado extends ClienteForm {
  id: string;
  createdAt: string;
}

interface ReferidoGuardado extends ReferidoForm {
  id: string;
  clienteId: string;
  clienteNombre: string;
  createdAt: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  private readonly storageClienteDraft = 'registro_cliente_draft';
  private readonly storageReferidosDraft = 'registro_referidos_draft';
  private readonly storageClientePersistidoDraft = 'registro_cliente_persistido_draft';
  private readonly supabase = inject(RegistroSupabaseService);

  cliente = signal<ClienteForm>({
    nombre: '', direccion: '', ciudad: '', cp: '', telefonoCasa: '', telefonoCel: '', idRP: '', presentaciones: ''
  });

  referido = signal<ReferidoForm>({
    nombre: '', telefono: '', direccion: '', observaciones: ''
  });

  clientePersistido = signal<ClienteGuardado | null>(null);
  referidosVinculados = signal<ReferidoGuardado[]>([]);

  isSavingCliente = signal<boolean>(false);
  isSavingReferido = signal<boolean>(false);
  clienteError = signal<string>('');
  clienteSuccess = signal<string>('');
  referidoError = signal<string>('');
  referidoSuccess = signal<string>('');
  globalAlert = signal<string>('');

  referidosCount = computed(() => this.referidosVinculados().length);

  constructor() {
    this.hydrateDraftState();
  }

  private nowId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private normalizeText(value: string): string {
    return (value || '').trim().toLowerCase();
  }

  private normalizePhone(value: string): string {
    return (value || '').replace(/\D/g, '');
  }

  private hydrateDraftState(): void {
    const draftCliente = localStorage.getItem(this.storageClienteDraft);
    const draftReferidos = localStorage.getItem(this.storageReferidosDraft);
    const draftClientePersistido = localStorage.getItem(this.storageClientePersistidoDraft);
    if (draftCliente) { try { this.cliente.set(JSON.parse(draftCliente)); } catch {} }
    if (draftReferidos) { try { this.referidosVinculados.set(JSON.parse(draftReferidos)); } catch {} }
    if (draftClientePersistido) { try { this.clientePersistido.set(JSON.parse(draftClientePersistido)); } catch {} }
  }

  private persistDraftState(): void {
    localStorage.setItem(this.storageClienteDraft, JSON.stringify(this.cliente()));
    localStorage.setItem(this.storageReferidosDraft, JSON.stringify(this.referidosVinculados()));
    localStorage.setItem(this.storageClientePersistidoDraft, JSON.stringify(this.clientePersistido()));
  }

  updateClienteField<K extends keyof ClienteForm>(field: K, value: ClienteForm[K]): void {
    this.cliente.set({ ...this.cliente(), [field]: value });
    this.persistDraftState();
  }

  updateReferidoField<K extends keyof ReferidoForm>(field: K, value: ReferidoForm[K]): void {
    this.referido.set({ ...this.referido(), [field]: value });
  }

  private validarCliente(): ClienteForm | null {
  const c = this.cliente();

  if (!c.nombre.trim()) {
    this.clienteError.set('El nombre del cliente es obligatorio.');
    return null;
  }

  if (!c.presentaciones.trim()) {
    this.clienteError.set('Presentaciones es obligatorio.');
    return null;
  }

  if (!c.idRP.trim()) {
    this.clienteError.set('El ID RP es obligatorio.');
    return null;
  }

  const telefonoCasa = this.normalizePhone(c.telefonoCasa);
  const telefonoCel = this.normalizePhone(c.telefonoCel);

  if (c.telefonoCasa.trim() && telefonoCasa.length !== 10) {
    this.clienteError.set('El teléfono de casa debe tener 10 dígitos.');
    return null;
  }

  if (c.telefonoCel.trim() && telefonoCel.length !== 10) {
    this.clienteError.set('El teléfono celular debe tener 10 dígitos.');
    return null;
  }

  return c;
}

  guardarCliente(callback?: (cliente: ClienteGuardado) => void): void {
  this.clienteError.set('');
  this.clienteSuccess.set('');
  this.globalAlert.set('');

  const cliente = this.validarCliente();
  if (!cliente) return;

  const clienteActual = this.clientePersistido();
  if (clienteActual?.id && !clienteActual.id.startsWith('cli-')) {
    this.clienteSuccess.set('El cliente ya está guardado.');
    callback?.(clienteActual);
    return;
  }

  this.isSavingCliente.set(true);

  this.supabase.guardarCliente(cliente).subscribe(result => {
    this.isSavingCliente.set(false);

    if (result?.id) {
      const clienteReal: ClienteGuardado = {
        ...cliente,
        id: result.id,
        createdAt: new Date().toISOString()
      };

      this.clientePersistido.set(clienteReal);
      this.persistDraftState();
      this.clienteSuccess.set('Cliente guardado.');
      callback?.(clienteReal);
    } else {
      this.clienteError.set('No se pudo guardar el cliente.');
    }
  });
}

  agregarReferido(): void {
  this.referidoError.set('');
  this.referidoSuccess.set('');
  this.globalAlert.set('');

  const r = this.referido();

  if (!r.nombre.trim()) {
    this.referidoError.set('El nombre del referido es obligatorio.');
    return;
  }

  const telefonoLimpio = this.normalizePhone(r.telefono);

  if (!telefonoLimpio) {
    this.referidoError.set('El teléfono del referido es obligatorio.');
    return;
  }

  if (telefonoLimpio.length !== 10) {
    this.referidoError.set('El teléfono del referido debe tener 10 dígitos.');
    return;
  }

  if (!r.direccion.trim()) {
    this.referidoError.set('La dirección del referido es obligatoria.');
    return;
  }

  const continuarConReferido = (cliente: ClienteGuardado) => {
    this.isSavingReferido.set(true);

    this.supabase.validarReferidoGlobal({
      nombre: r.nombre,
      telefono: telefonoLimpio
    }).subscribe(isUnique => {
      if (!isUnique) {
        this.isSavingReferido.set(false);
        this.globalAlert.set('El referido ya existe vinculado a otro cliente.');
        this.referidoError.set('Duplicado global detectado.');
        return;
      }

      this.supabase.guardarReferido(cliente.id, {
        ...r,
        telefono: telefonoLimpio
      }).subscribe(ok => {
        this.isSavingReferido.set(false);

        if (ok) {
          const nuevoReferido: ReferidoGuardado = {
            id: this.nowId('ref'),
            clienteId: cliente.id,
            clienteNombre: cliente.nombre,
            createdAt: new Date().toISOString(),
            ...r,
            telefono: telefonoLimpio
          };

          const actual = [...this.referidosVinculados(), nuevoReferido];
          this.referidosVinculados.set(actual);
          this.persistDraftState();
          this.referido.set({ nombre: '', telefono: '', direccion: '', observaciones: '' });
          this.referidoSuccess.set('Referido guardado.');
        } else {
          this.referidoError.set('No se pudo guardar el referido.');
        }
      });
    });
  };

  const clienteActual = this.clientePersistido();

  if (!clienteActual?.id || clienteActual.id.startsWith('cli-')) {
    this.guardarCliente((clienteGuardado) => continuarConReferido(clienteGuardado));
    return;
  }

  continuarConReferido(clienteActual);
}

  nuevoRegistro(): void {
    this.cliente.set({ nombre: '', direccion: '', ciudad: '', cp: '', telefonoCasa: '', telefonoCel: '', idRP: '', presentaciones: '' });
    this.referido.set({ nombre: '', telefono: '', direccion: '', observaciones: '' });
    this.referidosVinculados.set([]);
    this.clientePersistido.set(null);
    this.clienteError.set(''); this.clienteSuccess.set(''); this.referidoError.set(''); this.referidoSuccess.set(''); this.globalAlert.set('');
    localStorage.removeItem(this.storageClienteDraft);
    localStorage.removeItem(this.storageReferidosDraft);
    localStorage.removeItem(this.storageClientePersistidoDraft);
  }

  eliminarReferidoLocal(id: string): void {
    this.referidosVinculados.set(this.referidosVinculados().filter(r => r.id !== id));
    this.persistDraftState();
  }
}
