import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'prospeccion',
    loadComponent: () =>
      import('./pages/prospeccion/prospeccion.component').then(m => m.ProspeccionComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'completar-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/completar-perfil/completar-perfil.component').then(m => m.CompletarPerfilComponent)
  },
  {
    path: 'catalogo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'registro',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'administrar',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'admin/nuevo',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'admin/editar/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];