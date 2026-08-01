import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = await auth.ensureSessionLoaded();

  if (!loggedIn) {
    return router.createUrlTree(['/login']);
  }

  const expectedRoles = route.data?.['roles'] as string[] | undefined;

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (auth.hasAnyRole(expectedRoles)) {
    return true;
  }

  return router.createUrlTree(['/catalogo']);
};