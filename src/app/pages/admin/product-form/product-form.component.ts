import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

interface MensualidadRow {
  plazo: string;
  detalle: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId = '';

  id = '';
  nombre = '';
  categoria = '';
  precioBase: number | null = null;
  anticipo: number | null = null;
  saldoAFinanciar: number | null = null;

  mensualidadesRows = signal<MensualidadRow[]>([]);
  imagenesRows = signal<string[]>(['']);

  formError = signal<string>('');
  formSuccess = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.productService.ensureLoaded();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.productId = idParam;
      const existing = this.productService.getProductById(idParam);
      if (existing) {
        this.loadProductIntoForm(existing);
      } else {
        this.formError.set('No se encontró el producto solicitado.');
      }
    } else {
      this.id = this.productService.generateNextId();
    }
  }

  private loadProductIntoForm(product: Product): void {
    this.id = product.id ?? '';
    this.nombre = product.nombre ?? '';
    this.categoria = product.categoria ?? '';
    this.precioBase = product.precio_base ?? null;
    this.anticipo = product.anticipo ?? null;
    this.saldoAFinanciar = product.saldo_a_financiar ?? null;

    const mensualidades = product.mensualidades;
    if (mensualidades && Object.keys(mensualidades).length > 0) {
      const rows: MensualidadRow[] = Object.entries(mensualidades).map(([plazo, detalle]) => ({
        plazo,
        detalle: detalle !== null && detalle !== undefined ? String(detalle) : ''
      }));
      this.mensualidadesRows.set(rows);
    } else {
      this.mensualidadesRows.set([]);
    }

    const galeria = product.galeria_imagenes;
    if (galeria && galeria.length > 0) {
      this.imagenesRows.set([...galeria]);
    } else {
      this.imagenesRows.set(['']);
    }
  }

  addMensualidadRow(): void {
    this.mensualidadesRows.set([...this.mensualidadesRows(), { plazo: '', detalle: '' }]);
  }

  removeMensualidadRow(index: number): void {
    const rows = [...this.mensualidadesRows()];
    rows.splice(index, 1);
    this.mensualidadesRows.set(rows);
  }

  addImagenRow(): void {
    this.imagenesRows.set([...this.imagenesRows(), '']);
  }

  removeImagenRow(index: number): void {
    const rows = [...this.imagenesRows()];
    rows.splice(index, 1);
    this.imagenesRows.set(rows.length > 0 ? rows : ['']);
  }

  updateImagenValue(index: number, value: string): void {
    const rows = [...this.imagenesRows()];
    rows[index] = value;
    this.imagenesRows.set(rows);
  }

  updateMensualidadPlazo(index: number, value: string): void {
    const rows = [...this.mensualidadesRows()];
    rows[index] = { ...rows[index], plazo: value };
    this.mensualidadesRows.set(rows);
  }

  updateMensualidadDetalle(index: number, value: string): void {
    const rows = [...this.mensualidadesRows()];
    rows[index] = { ...rows[index], detalle: value };
    this.mensualidadesRows.set(rows);
  }

  private buildMensualidadesObject(): { [plazo: string]: string } | null {
    const validRows = this.mensualidadesRows().filter(r => r.plazo.trim() !== '');
    if (validRows.length === 0) {
      return null;
    }
    const result: { [plazo: string]: string } = {};
    validRows.forEach(r => {
      result[r.plazo.trim()] = r.detalle.trim();
    });
    return result;
  }

  private buildGaleriaArray(): string[] | null {
    const validImages = this.imagenesRows().filter(img => img.trim() !== '');
    return validImages.length > 0 ? validImages : null;
  }

  onSubmit(): void {
    this.formError.set('');
    this.formSuccess.set('');

    if (!this.nombre.trim()) {
      this.formError.set('El nombre del producto es obligatorio.');
      return;
    }
    if (!this.categoria.trim()) {
      this.formError.set('La categoría es obligatoria.');
      return;
    }

    const product: Product = {
      id: this.id,
      nombre: this.nombre.trim(),
      categoria: this.categoria.trim(),
      precio_base: this.precioBase !== null && this.precioBase !== undefined ? Number(this.precioBase) : null,
      anticipo: this.anticipo !== null && this.anticipo !== undefined ? Number(this.anticipo) : null,
      saldo_a_financiar: this.saldoAFinanciar !== null && this.saldoAFinanciar !== undefined ? Number(this.saldoAFinanciar) : null,
      mensualidades: this.buildMensualidadesObject(),
      galeria_imagenes: this.buildGaleriaArray()
    };

    if (this.isEditMode) {
      this.productService.updateProduct(product);
      this.formSuccess.set('Producto actualizado correctamente.');
    } else {
      this.productService.addProduct(product);
      this.formSuccess.set('Producto agregado correctamente.');
      this.id = this.productService.generateNextId();
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.nombre = '';
    this.categoria = '';
    this.precioBase = null;
    this.anticipo = null;
    this.saldoAFinanciar = null;
    this.mensualidadesRows.set([]);
    this.imagenesRows.set(['']);
  }

  cancel(): void {
    this.router.navigate(['/administrar']);
  }
}
