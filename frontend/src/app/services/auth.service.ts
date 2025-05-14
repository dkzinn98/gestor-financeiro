import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

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
      // Removendo withCredentials para evitar problemas CORS
    };
  }

  // Registro de usuário
  register(data: any): Observable<AuthResponse> {
    console.log('Enviando dados de registro:', data);
    
    // Certifique-se de que password_confirmation seja enviado corretamente
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
          }
        }),
        catchError(error => {
          console.error('Erro no registro:', error);
          return throwError(() => error);
        })
      );
  }

  // Login de usuário
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
          }
        }),
        catchError(error => {
          console.error('Erro no login:', error);
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
        }),
        catchError(error => {
          console.error('Erro no logout:', error);
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  // Método para fazer logout e redirecionar
  doLogout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
    
    // Comentamos o logout via API porque pode falhar se não houver conexão
    // E o importante é limpar os dados locais
    /*
    this.logout().subscribe({
      next: () => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    });
    */
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
            this.clearAuthData();
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
  }

  // Salvar token no localStorage
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Salvar dados do usuário no localStorage
  private saveUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Limpar dados de autenticação
  clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Obter o token atual
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Verificar se o usuário está logado
  isLoggedIn(): boolean {
    return !!this.getToken();
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

  // Obter headers de autenticação para outros serviços
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // Método para verificar o status da autenticação e redirecionar se necessário
  checkAuthStatus(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }
}