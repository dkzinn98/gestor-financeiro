import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
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
    private apiUrl = `${environment.apiUrl}/transacoes`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    // Método corrigido para calcular resumo financeiro baseado nas transações existentes
    getSummary(): Observable<FinancialSummary> {
        return this.getAllTransactions().pipe(
            map(transactions => {
                const totalIncome = transactions
                    .filter(t => t.type === 'receita')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const totalExpense = transactions
                    .filter(t => t.type === 'despesa')
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const balanco = totalIncome - totalExpense;
                
                return {
                    totalIncome,
                    totalExpense,
                    balanco
                };
            })
        );
    }

    // Método para obter transações recentes (baseado na lista completa)
    getRecentTransactions(limit: number = 5): Observable<Transaction[]> {
        return this.getAllTransactions().pipe(
            map(transactions => {
                // Ordenar por data de criação (mais recentes primeiro) e limitar
                return transactions
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, limit);
            })
        );
    }

    // Método principal para obter todas as transações (este funciona!)
    getAllTransactions(params?: any): Observable<Transaction[]> {
        return this.http.get<any[]>(this.apiUrl, {
            params: params,
            headers: this.authService.getAuthHeaders()
            // Removido withCredentials para evitar problemas CORS
        }).pipe(
            map(transactions => {
                if (!Array.isArray(transactions)) {
                    console.error('Dados recebidos não são um array:', transactions);
                    return [];
                }
                
                return transactions.map(t => ({
                    id: t.id,
                    description: t.descricao || t.description || '',
                    amount: parseFloat(t.valor || t.amount || 0),
                    type: t.tipo || t.type || '',
                    category_id: t.categoria_id || t.category_id || 0,
                    category_name: t.category_name || t.nome_categoria || '',
                    transaction_date: t.data_transacao || t.transaction_date || t.created_at || '',
                    created_at: t.created_at || '',
                    updated_at: t.updated_at || ''
                } as Transaction));
            })
        );
    }

    // Obter uma transação específica
    getTransaction(id: number): Observable<Transaction> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.authService.getAuthHeaders()
        }).pipe(
            map(t => ({
                id: t.id,
                description: t.descricao || t.description || '',
                amount: parseFloat(t.valor || t.amount || 0),
                type: t.tipo || t.type || '',
                category_id: t.categoria_id || t.category_id || 0,
                category_name: t.category_name || t.nome_categoria || '',
                transaction_date: t.data_transacao || t.transaction_date || t.created_at || '',
                created_at: t.created_at || '',
                updated_at: t.updated_at || ''
            } as Transaction))
        );
    }

    // CORRIGIDO: Criar nova transação com logs para debug
    createTransaction(transaction: Partial<Transaction>): Observable<Transaction> {
        console.log('=== DEBUG CREATETRANSACTION ===');
        console.log('Dados recebidos:', transaction);
        
        // Validação adicional
        if (!transaction.description || !transaction.amount || !transaction.type || !transaction.category_id) {
            console.error('Dados obrigatórios faltando:', {
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category_id: transaction.category_id
            });
        }
        
        // Mapeando os campos para o formato que a API Laravel espera
        const transactionData = {
            descricao: transaction.description,
            valor: transaction.amount,
            tipo: transaction.type,
            categoria_id: transaction.category_id
        };

        console.log('Dados mapeados para API:', transactionData);
        console.log('URL da API:', this.apiUrl);
        
        const headers = this.authService.getAuthHeaders();
        console.log('Headers enviados:', headers);

        return this.http.post<any>(this.apiUrl, transactionData, {
            headers: headers
        }).pipe(
            map(t => {
                console.log('✅ Resposta da API recebida:', t);
                
                const mappedResponse = {
                    id: t.id,
                    description: t.descricao || t.description || '',
                    amount: parseFloat(t.valor || t.amount || 0),
                    type: t.tipo || t.type || '',
                    category_id: t.categoria_id || t.category_id || 0,
                    category_name: t.category_name || t.nome_categoria || '',
                    transaction_date: t.data_transacao || t.transaction_date || t.created_at || '',
                    created_at: t.created_at || '',
                    updated_at: t.updated_at || ''
                } as Transaction;
                
                console.log('✅ Resposta mapeada final:', mappedResponse);
                return mappedResponse;
            })
        );
    }

    // Atualizar transação existente
    updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
        console.log('=== DEBUG UPDATETRANSACTION ===');
        console.log('ID:', id, 'Dados:', transaction);
        
        // Mapeando os campos para o formato que a API Laravel espera
        const transactionData = {
            descricao: transaction.description,
            valor: transaction.amount,
            tipo: transaction.type,
            categoria_id: transaction.category_id
        };

        console.log('Dados mapeados para API:', transactionData);

        return this.http.put<any>(`${this.apiUrl}/${id}`, transactionData, {
            headers: this.authService.getAuthHeaders()
        }).pipe(
            map(t => {
                console.log('✅ Resposta UPDATE da API:', t);
                
                return {
                    id: t.id,
                    description: t.descricao || t.description || '',
                    amount: parseFloat(t.valor || t.amount || 0),
                    type: t.tipo || t.type || '',
                    category_id: t.categoria_id || t.category_id || 0,
                    category_name: t.category_name || t.nome_categoria || '',
                    transaction_date: t.data_transacao || t.transaction_date || t.created_at || '',
                    created_at: t.created_at || '',
                    updated_at: t.updated_at || ''
                } as Transaction;
            })
        );
    }

    // Deletar transação
    deleteTransaction(id: number): Observable<void> {
        console.log('=== DEBUG DELETETRANSACTION ===');
        console.log('Deletando transação ID:', id);
        
        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}