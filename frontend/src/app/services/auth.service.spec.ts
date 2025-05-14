import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        AuthService
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpar o localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    // Verificar se não há requisições pendentes
    httpMock.verify();
    
    // Limpar o localStorage após cada teste
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return isLoggedIn as false when no token is present', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return isLoggedIn as true when token is present', () => {
    localStorage.setItem('auth_token', 'test-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should register a user and save token', () => {
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    };

    const mockResponse = {
      access_token: 'test-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com' }
    };

    service.register(mockUserData).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getToken()).toBe('test-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should login a user and save token', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = {
      access_token: 'test-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com' }
    };

    service.login(mockLoginData).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getToken()).toBe('test-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout a user and clear token', () => {
    // Primeiro simulamos um login
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'Test User' }));
    
    expect(service.isLoggedIn()).toBeTrue();

    service.logout().subscribe(() => {
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.getToken()).toBeNull();
      expect(service.getUser()).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Logged out successfully' });
  });
});