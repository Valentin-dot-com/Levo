import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/authenticate';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (authService.isAuthenticated) {
        return true;
      }

      router.navigate(['/auth'])
      return false;
    })
  )
};
