import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Método para buscar todas as transações
  getTransacoes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transacoes`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para buscar uma transação específica
  getTransacao(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transacoes/${id}`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para criar uma nova transação
  createTransacao(transacao: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transacoes`, transacao, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para atualizar uma transação existente
  updateTransacao(id: number, transacao: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/transacoes/${id}`, transacao, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para excluir uma transação
  deleteTransacao(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/transacoes/${id}`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para buscar todas as categorias
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }
}