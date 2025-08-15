import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  console.log('🔄 Interceptor: Processando requisição para:', req.url);
  
  // URLs que não precisam de autenticação
  const publicUrls = ['/login', '/register', '/forgot-password'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  let authReq = req;
  
  // Se não for uma URL pública, anexar o token
  if (!isPublicUrl) {
    const token = authService.getToken();
    console.log('🔑 Interceptor: Token encontrado:', token ? 'SIM' : 'NÃO');
    
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Interceptor: Token anexado à requisição');
      console.log('📋 Interceptor: Header Authorization:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️  Interceptor: Nenhum token encontrado para requisição autenticada');
    }
  } else {
    console.log('🌐 Interceptor: URL pública, sem autenticação necessária');
  }
  
  // Processar a requisição e tratar erros 401
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('❌ Interceptor: Erro capturado:', error.status, error.message);
      
      // Se for erro 401 (Unauthorized) e não for na rota de login
      if (error.status === 401 && !isPublicUrl) {
        console.log('🔄 Interceptor: Token expirado detectado, tentando renovar...');
        
        // Tentar renovar o token automaticamente
        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            console.log('✅ Interceptor: Token renovado com sucesso, repetindo requisição');
            
            // Clonar a requisição original com o novo token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access_token}`
              }
            });
            
            // Repetir a requisição original com o novo token
            return next(newReq);
          }),
          catchError((refreshError) => {
            console.error('❌ Interceptor: Falha na renovação automática', refreshError);
            
            // Se falhar na renovação, fazer logout
            authService.doLogout();
            return throwError(() => error);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};