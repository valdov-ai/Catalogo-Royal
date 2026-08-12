import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = await auth.ensureSessionLoaded();

  if (!loggedIn) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Si el usuario está logueado pero no tiene perfil completo
  if (!auth.isProfileComplete() && state.url !== '/completar-perfil') {
    return router.createUrlTree(['/completar-perfil'], {
      queryParams: { returnUrl: state.url }
    });
  }

  return true;
};