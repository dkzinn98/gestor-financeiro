// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.isLoggedIn()) {
    // Usuário autenticado, permite acesso à rota
    return true;
  }
  
  // Salvar URL atual para redirecionamento após login
  const returnUrl = state.url;
  console.log(`Acesso negado à rota: ${returnUrl}. Redirecionando para login.`);
  
  // Redirecionar para a página de login se não estiver autenticado
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};