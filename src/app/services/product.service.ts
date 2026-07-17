import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'catalogo_productos_data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly dataUrl = 'assets/data/products.json';
  private productsSignal = signal<Product[]>([]);
  private initialized = false;

  constructor(private http: HttpClient) {}

  private loadInitial(): Promise<Product[]> {
    return new Promise((resolve) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Product[];
          this.productsSignal.set(parsed);
          resolve(parsed);
          return;
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      this.http.get<Product[]>(this.dataUrl).subscribe({
        next: (data) => {
          const safeData = data ?? [];
          this.productsSignal.set(safeData);
          this.persist(safeData);
          resolve(safeData);
        },
        error: () => {
          this.productsSignal.set([]);
          resolve([]);
        }
      });
    });
  }

  async ensureLoaded(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;
      await this.loadInitial();
    }
  }

  getProductsSignal() {
    return this.productsSignal;
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  generateNextId(): string {
    const numbers = this.productsSignal()
      .map(p => parseInt((p.id ?? '').replace('PROD-', ''), 10))
      .filter(n => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    const next = max + 1;
    return `PROD-${String(next).padStart(3, '0')}`;
  }

  addProduct(product: Product): void {
    const updated = [...this.productsSignal(), product];
    this.productsSignal.set(updated);
    this.persist(updated);
  }

  updateProduct(product: Product): void {
    const updated = this.productsSignal().map(p => p.id === product.id ? product : p);
    this.productsSignal.set(updated);
    this.persist(updated);
  }

  deleteProduct(id: string): void {
    const updated = this.productsSignal().filter(p => p.id !== id);
    this.productsSignal.set(updated);
    this.persist(updated);
  }

  private persist(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}
