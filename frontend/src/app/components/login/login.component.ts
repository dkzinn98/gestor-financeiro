import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
// Corrigido o caminho do AuthService e do environment, caso estejam em outros diretórios
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1) ignore preflight
  if (req.method === 'OPTIONS') return next(req);

  // 2) só intercepta chamadas para a API
  const apiUrl = environment.apiUrl?.replace(/\/+$/, ''); // sem barra no fim
  const isApiCall =
    (apiUrl && req.url.startsWith(apiUrl)) ||
    req.url.includes('/api/');

  // 3) rotas públicas (não anexar Authorization)
  const publicPaths = ['/login', '/register'];
  const isPublic =
    isApiCall && publicPaths.some(p => req.url.startsWith(`${apiUrl}${p}`));

  let authReq = req;

  if (isApiCall && !isPublic) {
    const token = authService.getToken(); // localStorage 'token'
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        // opcional: você pode incluir credenciais se precisar
        // withCredentials: true,
      });
    }
  }

  // 4) trata 401 (sem refresh)
  const alreadyRetried = req.headers.has('X-No-Retry'); // flag para evitar loop

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isApiCall && !isPublic && err.status === 401 && !alreadyRetried) {
        // limpa e redireciona
        authService.doLogout();
        const returnUrl = router.url || '/';
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }
      return throwError(() => err);
    })
  );
};
