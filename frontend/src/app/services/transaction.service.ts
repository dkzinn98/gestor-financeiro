import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface FinancialSummary {
    totalIncome: number;
    totalExpense: number;
    balanco: number;
}

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: string;
    category_id: number;
    category_name?: string;
    transaction_date: string;
    created_at: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    // Corrigindo a URL da API - removendo o "/api" duplicado
    private apiUrl = `${environment.apiUrl}/transacoes`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    getSummary(): Observable<FinancialSummary> {
        return this.http.get<any>(`${this.apiUrl}/dashboard`, {
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        }).pipe(
            map(response => {
                const totalIncome = response.totalIncome || 0;
                const totalExpense = response.totalExpense || 0;
                const balanco = totalIncome - totalExpense;
                
                return {
                    totalIncome,
                    totalExpense,
                    balanco: balanco
                };
            })
        );
    }

    getRecentTransactions(limit: number): Observable<Transaction[]> {
        return this.http.get<any[]>(`${this.apiUrl}/recent?limit=${limit}`, {
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        }).pipe(
            map(transactions => {
                if (!Array.isArray(transactions)) {
                    console.error('Dados recebidos não são um array:', transactions);
                    return [];
                }
                
                return transactions.map(t => ({
                    id: t.id,
                    description: t.descricao || t.description || '',
                    amount: t.valor || t.amount || 0,
                    type: t.tipo || t.type || '',
                    category_id: t.categoria_id || t.category_id || 0,
                    category_name: t.category_name || t.nome_categoria || '',
                    transaction_date: t.data_transacao || t.transaction_date || '',
                    created_at: t.created_at || ''
                } as Transaction));
            })
        );
    }

    getAllTransactions(params?: any): Observable<Transaction[]> {
        return this.http.get<any[]>(this.apiUrl, {
            params: params,
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        }).pipe(
            map(transactions => {
                if (!Array.isArray(transactions)) {
                    console.error('Dados recebidos não são um array:', transactions);
                    return [];
                }
                
                return transactions.map(t => ({
                    id: t.id,
                    description: t.descricao || t.description || '',
                    amount: t.valor || t.amount || 0,
                    type: t.tipo || t.type || '',
                    category_id: t.categoria_id || t.category_id || 0,
                    category_name: t.category_name || t.nome_categoria || '',
                    transaction_date: t.data_transacao || t.transaction_date || '',
                    created_at: t.created_at || ''
                } as Transaction));
            })
        );
    }

    getTransaction(id: number): Observable<Transaction> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        }).pipe(
            map(t => ({
                id: t.id,
                description: t.descricao || t.description || '',
                amount: t.valor || t.amount || 0,
                type: t.tipo || t.type || '',
                category_id: t.categoria_id || t.category_id || 0,
                category_name: t.category_name || t.nome_categoria || '',
                transaction_date: t.data_transacao || t.transaction_date || '',
                created_at: t.created_at || ''
            } as Transaction))
        );
    }

    createTransaction(transaction: Partial<Transaction>): Observable<Transaction> {
        return this.http.post<Transaction>(this.apiUrl, transaction, {
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        });
    }

    updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
        return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction, {
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        });
    }

    deleteTransaction(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
            headers: this.authService.getAuthHeaders(),
            withCredentials: true
        });
    }
}