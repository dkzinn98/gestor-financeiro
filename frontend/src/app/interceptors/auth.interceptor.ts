// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obter o token de autenticação
    const token = this.authService.getToken();
    
    // Se houver um token, adicione-o ao cabeçalho da requisição
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    // Processar a requisição e lidar com erros de autenticação
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se receber erro 401 (Não Autorizado) ou 403 (Proibido), significa que o token pode ter expirado
        if (error.status === 401 || error.status === 403) {
          // Limpar dados de autenticação
          this.authService.clearAuthData();
          
          // Redirecionar para a página de login
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}