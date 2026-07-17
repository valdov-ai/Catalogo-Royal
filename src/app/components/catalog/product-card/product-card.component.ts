import { Component, Input, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product, MensualidadOpcion } from '../../../models/product.model';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=600&q=80';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  private productSignal = signal<Product | null>(null);

  @Input({ required: true })
  set product(value: Product) {
    this.productSignal.set(value);
  }
  get product(): Product {
    return this.productSignal() as Product;
  }

  images = computed<string[]>(() => {
    const p = this.productSignal();
    const gallery = p?.galeria_imagenes;
    if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
      return [PLACEHOLDER_IMAGE];
    }
    return gallery.filter(img => !!img);
  });

  mainImage = computed<string>(() => this.images()[0]);

  hasPrice = computed<boolean>(() => {
    const price = this.productSignal()?.precio_base;
    return price !== null && price !== undefined;
  });

  hasFinancing = computed<boolean>(() => {
    const p = this.productSignal();
    return !!p?.anticipo && !!p?.saldo_a_financiar;
  });

  mensualidadesList = computed<MensualidadOpcion[]>(() => {
    const mensualidades = this.productSignal()?.mensualidades;
    if (!mensualidades || Object.keys(mensualidades).length === 0) {
      return [];
    }
    return Object.entries(mensualidades).map(([plazo, detalle]) => ({
      plazo,
      detalle: detalle !== null && detalle !== undefined ? String(detalle) : 'No disponible'
    }));
  });

  hasMensualidades = computed<boolean>(() => this.mensualidadesList().length > 0);
}
