import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Interface para tipagem da resposta de autenticação
interface AuthResponse {
  access_token?: string;
  user?: any;
  message?: string;
  token_type?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base - agora usando o environment
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  
  // Subject para notificar sobre mudanças no status de autenticação
  private authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authStatus$ = this.authStatus.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Configuração dos headers HTTP padrão
  private getHttpOptions(includeAuth: boolean = false) {
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }

  // Registro de usuário
  register(data: any): Observable<AuthResponse> {
    console.log('Enviando dados de registro:', data);
    
    const registerData = {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation
    };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData, this.getHttpOptions())
      .pipe(
        tap(response => {
          console.log('Resposta do registro:', response);
          if (response && response.access_token) {
            this.saveToken(response.access_token);
            if (response.user) {
              this.saveUser(response.user);
            }
            this.authStatus.next(true);
          }
        }),
        catchError(error => {
          console.error('Erro no registro:', error);
          return throwError(() => error);
        })
      );
  }

  // Login de usuário - CORRIGIDO para salvar credenciais automaticamente
  login(data: any): Observable<AuthResponse> {
    console.log('Enviando dados de login:', { url: `${this.apiUrl}/login`, data });
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data, this.getHttpOptions())
      .pipe(
        tap(response => {
          console.log('Resposta do login:', response);
          if (response && response.access_token) {
            this.saveToken(response.access_token);
            if (response.user) {
              this.saveUser(response.user);
            }
            
            // CORREÇÃO: Salvar credenciais automaticamente para renovação
            this.saveCredentialsForRenewal(data.email, data.password);
            
            this.authStatus.next(true);
          }
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          this.authStatus.next(false);
          return throwError(() => error);
        })
      );
  }

  // Logout de usuário
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, this.getHttpOptions(true))
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.authStatus.next(false);
        }),
        catchError(error => {
          console.error('Erro no logout:', error);
          this.clearAuthData();
          this.authStatus.next(false);
          return throwError(() => error);
        })
      );
  }

  // Método para fazer logout e redirecionar
  doLogout(): void {
    this.clearAuthData();
    this.authStatus.next(false);
    this.router.navigate(['/login']);
  }

  // Obter dados do usuário atual do backend
  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, this.getHttpOptions(true))
      .pipe(
        tap(user => {
          this.saveUser(user);
        }),
        catchError(error => {
          console.error('Erro ao obter dados do usuário:', error);
          if (error.status === 401) {
            this.handleTokenExpired();
          }
          return throwError(() => error);
        })
      );
  }

  // CORREÇÃO: Renovar token automaticamente
  refreshToken(): Observable<AuthResponse> {
    console.log('Tentando renovar token...');
    
    const storedCredentials = localStorage.getItem('temp_credentials');
    
    if (storedCredentials) {
      try {
        const credentials = JSON.parse(storedCredentials);
        console.log('Fazendo novo login com credenciais salvas...');
        
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, this.getHttpOptions())
          .pipe(
            tap(response => {
              console.log('Token renovado com sucesso!');
              if (response && response.access_token) {
                this.saveToken(response.access_token);
                if (response.user) {
                  this.saveUser(response.user);
                }
                this.authStatus.next(true);
              }
            }),
            catchError(error => {
              console.error('Erro na renovação do token:', error);
              this.doLogout();
              return throwError(() => error);
            })
          );
      } catch (e) {
        console.error('Erro ao parsear credenciais salvas:', e);
        this.doLogout();
        return throwError(() => new Error('Credenciais corrompidas'));
      }
    }
    
    // Se não temos credenciais salvas, redirecionar para login
    console.warn('Não há credenciais salvas para renovação');
    this.doLogout();
    return throwError(() => new Error('Credenciais não disponíveis'));
  }

  // CORREÇÃO: Lidar com token expirado
  private handleTokenExpired(): void {
    console.warn('Token expirado detectado - tentando renovar...');
    
    // Tentar renovar automaticamente
    this.refreshToken().subscribe({
      next: (response) => {
        console.log('Token renovado automaticamente!');
      },
      error: (error) => {
        console.error('Falha na renovação automática:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  // FUNÇÃO ATUALIZADA: Verificar se requisição falhou por token expirado
  handleApiError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 401) {
      console.log('Erro 401 detectado - token expirado');
      this.handleTokenExpired();
    }
    return throwError(() => error);
  }

  // Salvar token no localStorage
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    console.log('Token salvo:', token.substring(0, 20) + '...');
  }

  // Salvar dados do usuário no localStorage
  private saveUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Salvar credenciais temporariamente para renovação
  saveCredentialsForRenewal(email: string, password: string): void {
    const credentials = { email, password };
    localStorage.setItem('temp_credentials', JSON.stringify(credentials));
    console.log('Credenciais salvas para renovação automática');
  }

  // Limpar dados de autenticação
  clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('temp_credentials');
    console.log('Dados de autenticação limpos');
  }

  // Obter o token atual
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token;
  }

  // Verificar se o usuário está logado
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Obter informações do usuário logado
  getUser(): any {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error('Erro ao analisar dados do usuário:', e);
        return null;
      }
    }
    return null;
  }

  // CORREÇÃO: Obter headers de autenticação para outros serviços
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    
    if (!token) {
      console.warn('Token não encontrado');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }

    console.log('Usando token:', token.substring(0, 20) + '...');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Método para verificar o status da autenticação e redirecionar se necessário
  checkAuthStatus(): void {
    if (!this.isLoggedIn()) {
      this.authStatus.next(false);
      this.router.navigate(['/login']);
    } else {
      this.authStatus.next(true);
    }
  }

  // NOVA FUNÇÃO: Validar token atual
  validateCurrentToken(): Observable<boolean> {
    if (!this.isLoggedIn()) {
      return throwError(() => new Error('Não logado'));
    }

    return this.getMe().pipe(
      tap(() => console.log('Token válido')),
      catchError(error => {
        if (error.status === 401) {
          console.log('Token inválido');
          this.handleTokenExpired();
        }
        return throwError(() => error);
      })
    );
  }
}