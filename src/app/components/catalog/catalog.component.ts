import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCardComponent, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private selectedCategorySignal = signal<string>('Todos');
  private searchTermSignal = signal<string>('');

  isLoading = true;
  errorMessage = '';
  filtersVisible = signal<boolean>(true);

  products = this.productService.getProductsSignal();

  categories = computed(() => {
    const unique = new Set(
      this.products()
        .map(p => p.categoria)
        .filter((c): c is string => !!c)
    );
    return ['Todos', ...Array.from(unique).sort()];
  });

  filteredProducts = computed(() => {
    const category = this.selectedCategorySignal();
    const list = this.products();
    const byCategory = category === 'Todos' ? list : list.filter(p => p.categoria === category);

    const term = this.searchTermSignal().trim().toLowerCase();
    if (!term) {
      return byCategory;
    }
    return byCategory.filter(p =>
      (p.nombre ?? '').toLowerCase().includes(term) ||
      (p.categoria ?? '').toLowerCase().includes(term) ||
      (p.id ?? '').toLowerCase().includes(term)
    );
  });

  get selectedCategory(): string {
    return this.selectedCategorySignal();
  }

  get searchTerm(): string {
    return this.searchTermSignal();
  }
  set searchTerm(value: string) {
    this.searchTermSignal.set(value);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.productService.ensureLoaded();
    } catch {
      this.errorMessage = 'No se pudieron cargar los productos. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  selectCategory(category: string): void {
    this.selectedCategorySignal.set(category);
  }

  toggleFilters(): void {
    this.filtersVisible.set(!this.filtersVisible());
  }

  clearSearch(): void {
    this.searchTermSignal.set('');
  }
}
