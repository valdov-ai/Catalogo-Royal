import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  isLoading = true;
  products = this.productService.getProductsSignal();

  async ngOnInit(): Promise<void> {
    await this.productService.ensureLoaded();
    this.isLoading = false;
  }

  hasPrice(price: number | null): boolean {
    return price !== null && price !== undefined;
  }

  hasFinancing(anticipo: number | null, saldo: number | null): boolean {
    return !!anticipo && !!saldo;
  }

  imageCount(gallery: string[] | null): number {
    return gallery ? gallery.filter(img => !!img).length : 0;
  }

  mensualidadesCount(mensualidades: { [plazo: string]: string | number } | null): number {
    return mensualidades ? Object.keys(mensualidades).length : 0;
  }

  confirmDelete(id: string, nombre: string): void {
    const confirmed = window.confirm(`¿Eliminar el producto "${nombre}" (${id})? Esta acción no se puede deshacer.`);
    if (confirmed) {
      this.productService.deleteProduct(id);
    }
  }
}
