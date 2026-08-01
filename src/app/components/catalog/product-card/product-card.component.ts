import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { Product } from '../../../models/product.model';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=600&q=80';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  private readonly productSignal = signal<Product | null>(null);
  readonly showMore = signal(false);

  @Input({ required: true })
  set product(value: Product | null) {
    this.productSignal.set(value);
  }

  get product(): Product {
    return this.productSignal() as Product;
  }

  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Input() added = false;
  @Output() addToQuoteClicked = new EventEmitter<Product>();

  readonly images = computed(() => {
    const gallery = this.productSignal()?.galeria_imagenes;
    if (!gallery || !Array.isArray(gallery) || gallery.length === 0) return [PLACEHOLDER_IMAGE];
    return gallery.filter(Boolean);
  });

  readonly mainImage = computed(() => this.images()[0]);

  readonly mensualidadesList = computed(() => {
    const mensualidades = this.productSignal()?.mensualidades;
    if (!mensualidades || typeof mensualidades !== 'object' || Array.isArray(mensualidades)) return [] as Array<{ plazo: number; monto: number | null }>;
    return Object.entries(mensualidades).map(([plazo, monto]) => ({ plazo: Number(plazo), monto: this.toNumber(monto) })).filter(x => Number.isFinite(x.plazo)).sort((a, b) => a.plazo - b.plazo);
  });

  toggleMore(): void { this.showMore.update(v => !v); }
  addToQuote(): void { this.addToQuoteClicked.emit(this.product); }

  private toNumber(value: unknown): number | null { if (value === null || value === undefined || value === '') return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
}
