import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TransacaoService } from './transacao.service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

describe('TransacaoService', () => {
  let service: TransacaoService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Criar um mock do AuthService
    const authSpy = jasmine.createSpyObj('AuthService', ['getAuthHeaders']);
    authSpy.getAuthHeaders.and.returnValue({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer fake-token'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TransacaoService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(TransacaoService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all transações', () => {
    const mockData = [
      { id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita' },
      { id: 2, descricao: 'Transação 2', valor: 200, tipo: 'despesa' }
    ];

    service.getTransacoes().subscribe(transacoes => {
      expect(transacoes.length).toBe(2);
      expect(transacoes).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/transacoes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
    expect(authServiceSpy.getAuthHeaders).toHaveBeenCalled();
  });

  it('should get a specific transação', () => {
    const mockData = { id: 1, descricao: 'Transação 1', valor: 100, tipo: 'receita' };

    service.getTransacao(1).subscribe(transacao => {
      expect(transacao).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/transacoes/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
    expect(authServiceSpy.getAuthHeaders).toHaveBeenCalled();
  });

  it('should create a new transação', () => {
    const newTransacao = { descricao: 'Nova Transação', valor: 150, tipo: 'receita' };
    const mockResponse = { id: 3, ...newTransacao };

    service.createTransacao(newTransacao).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/transacoes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTransacao);
    req.flush(mockResponse);
    expect(authServiceSpy.getAuthHeaders).toHaveBeenCalled();
  });

  it('should update an existing transação', () => {
    const updatedTransacao = { descricao: 'Transação Atualizada', valor: 300, tipo: 'despesa' };
    const mockResponse = { id: 1, ...updatedTransacao };

    service.updateTransacao(1, updatedTransacao).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/transacoes/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTransacao);
    req.flush(mockResponse);
    expect(authServiceSpy.getAuthHeaders).toHaveBeenCalled();
  });

  it('should delete a transação', () => {
    service.deleteTransacao(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/transacoes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(authServiceSpy.getAuthHeaders).toHaveBeenCalled();
  });

  it('should get all categorias', () => {
    const mockData = [
      { id: 1, nome: 'Categoria 1' },
      { id: 2, nome: 'Categoria 2' }
    ];

    service.getCategorias().subscribe(categorias => {
      expect(categorias.length).toBe(2);
      expect(categorias).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categorias`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
    expect(authServiceSpy.getAuthHeaders).toHaveBeenCalled();
  });
});