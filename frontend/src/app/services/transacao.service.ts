import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface ResumoFinanceiro {
  totalIncome: number;
  totalExpense: number;
  balanco: number;
}

export interface Transacao {
  id: number;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category_id: number;
  category_name?: string;
  transaction_date: string;
  created_at: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class TransacaoService {
  private apiUrl = `${environment.apiUrl}/transacoes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // === LISTAR TODAS ===
  getTransacoes(params?: any): Observable<Transacao[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(transacoes => Array.isArray(transacoes) ? transacoes.map(this.mapItem) : [])
    );
  }

  // === UMA TRANSACAO ===
  getTransacao(id: number): Observable<Transacao> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(map(this.mapItem));
  }

  // === CRIAR ===
  createTransacao(dados: Partial<Transacao>): Observable<Transacao> {
    const body = {
      descricao: dados.description,
      valor: dados.amount,
      tipo: dados.type,
      categoria_id: dados.category_id
    };
    return this.http.post<any>(this.apiUrl, body, {
      headers: this.authService.getAuthHeaders()
    }).pipe(map(this.mapItem));
  }

  // === ATUALIZAR ===
  updateTransacao(id: number, dados: Partial<Transacao>): Observable<Transacao> {
    const body = {
      descricao: dados.description,
      valor: dados.amount,
      tipo: dados.type,
      categoria_id: dados.category_id
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, body, {
      headers: this.authService.getAuthHeaders()
    }).pipe(map(this.mapItem));
  }

  // === DELETAR ===
  deleteTransacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // === RESUMO (calculado no front) ===
  getResumo(): Observable<ResumoFinanceiro> {
    return this.getTransacoes().pipe(
      map(ts => {
        const totalIncome  = ts.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
        const totalExpense = ts.filter(t => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);
        return { totalIncome, totalExpense, balanco: totalIncome - totalExpense };
      })
    );
  }

  // === RECENTES (front) ===
  getRecentes(limit = 5): Observable<Transacao[]> {
    return this.getTransacoes().pipe(
      map(ts => ts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit))
    );
  }

  // === MAP ===
  private mapItem = (t: any): Transacao => ({
    id: t.id,
    description: t.descricao ?? t.description ?? '',
    amount: parseFloat(t.valor ?? t.amount ?? 0),
    type: (t.tipo ?? t.type ?? '') as 'receita' | 'despesa',
    category_id: t.categoria_id ?? t.category_id ?? 0,
    category_name: t.category_name ?? t.nome_categoria ?? '',
    transaction_date: t.data_transacao ?? t.transaction_date ?? t.created_at ?? '',
    created_at: t.created_at ?? '',
    updated_at: t.updated_at ?? ''
  });
}
