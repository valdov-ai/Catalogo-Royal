import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private selectedCategorySignal = signal<string>('Todos');

  isLoading = true;
  errorMessage = '';

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
    return category === 'Todos' ? list : list.filter(p => p.categoria === category);
  });

  get selectedCategory(): string {
    return this.selectedCategorySignal();
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
}
