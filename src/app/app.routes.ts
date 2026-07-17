import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProductFormComponent } from './pages/admin/product-form/product-form.component';

export const routes: Routes = [
  { path: '', component: CatalogComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/nuevo', component: ProductFormComponent },
  { path: 'admin/editar/:id', component: ProductFormComponent },
  { path: '**', redirectTo: '' }
];
