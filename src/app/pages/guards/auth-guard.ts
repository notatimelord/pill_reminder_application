import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const loggedIn = sessionStorage.getItem('loggedIn') === 'true';
  console.log('GUARD loggedIn =', sessionStorage.getItem('loggedIn'));

  if (!loggedIn) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
