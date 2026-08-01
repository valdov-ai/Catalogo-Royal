import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { QuoteStateService } from './quote-state.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from './product-card/product-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  readonly quoteState = inject(QuoteStateService);

  private readonly selectedCategorySignal = signal('Todos');
  private readonly searchTermSignal = signal('');
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly selectedProduct = signal<Product | null>(null);

  isLoading = true;
  errorMessage = '';
  filtersVisible = signal(false);
  products = this.productService.getProductsSignal();

  categories = computed(() => {
    const unique = new Set(this.products().map(p => p.categoria).filter((c): c is string => !!c));
    return ['Todos', ...Array.from(unique).sort()];
  });

  filteredProducts = computed(() => {
    const category = this.selectedCategorySignal();
    const list = this.products();
    const byCategory = category === 'Todos' ? list : list.filter(p => p.categoria === category);
    const term = this.searchTermSignal().trim().toLowerCase();
    if (!term) return byCategory;
    return byCategory.filter(p => (p.nombre ?? '').toLowerCase().includes(term) || (p.categoria ?? '').toLowerCase().includes(term) || (p.id ?? '').toLowerCase().includes(term));
  });

  get selectedCategory(): string { return this.selectedCategorySignal(); }
  get searchTerm(): string { return this.searchTermSignal(); }
  set searchTerm(value: string) { this.searchTermSignal.set(value); }

  async ngOnInit(): Promise<void> {
    try { await this.productService.ensureLoaded(); } catch { this.errorMessage = 'No se pudieron cargar los productos. Intenta nuevamente.'; } finally { this.isLoading = false; }
  }

  ngOnDestroy(): void { this.quoteState.clear(); }
  selectCategory(category: string): void { this.selectedCategorySignal.set(category); }
  clearSearch(): void { this.searchTermSignal.set(''); }
  setViewMode(mode: 'grid' | 'list'): void { this.viewMode.set(mode); }
  addToQuote(product: Product): void { this.quoteState.add(product, 1); }
  openQuote(): void { this.quoteState.openModal(); }
  closeQuote(): void { this.quoteState.closeModal(); }
  updateGiftPercent(value: string | number): void { this.quoteState.setGiftPercent(Number(value)); }
  finishQuote(): void { this.quoteState.clear(); }
  isProductAdded(productId: string): boolean { return this.quoteState.items().some(item => item.product.id === productId && item.mode === 'compra'); }
}
