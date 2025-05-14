import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

interface ResumoFinanceiro {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

// Interface que permite qualquer propriedade adicional
interface Transacao {
    id: number;
    description: string;
    descricao?: string;
    amount: number;
    valor?: number;
    type: string;
    tipo?: string;
    category_id: number;
    categoria_id?: number;
    category_name?: string;
    nome_categoria?: string;
    transaction_date: string;
    data_transacao?: string;
    created_at: string;
    [key: string]: any; // Esta linha permite que qualquer propriedade adicional seja acessada
}

@Component({
    selector: 'app-transacao-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatToolbarModule,
        MatSelectModule,
        MatFormFieldModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './transacao-list.component.html',
    styleUrls: ['./transacao-list.component.scss']
})
export class TransacaoListComponent implements OnInit, OnDestroy {
    isLoading = true;
    resumo: ResumoFinanceiro = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    };
    transacoesRecentes: Transacao[] = [];
    transacoes: Transacao[] = [];
    transacoesFiltradas: Transacao[] = [];
    filtroTipo = '';
    displayedColumns: string[] = ['descricao', 'valor', 'tipo', 'categoria', 'acoes'];
    private resumoSubscription?: Subscription;
    private transacoesRecentesSubscription?: Subscription;
    private todasTransacoesSubscription?: Subscription;

    constructor(
        private transactionService: TransactionService,
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.carregarTransacoes();
        this.carregarDadosDashboard();
    }

    ngOnDestroy(): void {
        this.resumoSubscription?.unsubscribe();
        this.transacoesRecentesSubscription?.unsubscribe();
        this.todasTransacoesSubscription?.unsubscribe();
    }

    carregarDadosDashboard() {
        this.isLoading = true;
        this.resumoSubscription = this.transactionService.getSummary().subscribe({
            next: (data) => {
                console.log('Resumo financeiro recebido:', data);
                
                // Log detalhado para verificar o que está chegando
                console.log('totalIncome:', data.totalIncome, typeof data.totalIncome);
                console.log('totalExpense:', data.totalExpense, typeof data.totalExpense);
                
                // Tentar diferentes abordagens para capturar os valores
                let totalIncome = 0;
                let totalExpense = 0;
                
                // Abordagem 1: Verificar propriedades em inglês
                if (typeof data.totalIncome === 'number') {
                    totalIncome = data.totalIncome;
                }
                if (typeof data.totalExpense === 'number') {
                    totalExpense = data.totalExpense;
                }
                
                // Abordagem 3: Procurar por qualquer propriedade numérica que possa conter os valores
                if (totalIncome === 0) {
                    for (const key in data) {
                        if (typeof data[key] === 'number' && 
                            (key.toLowerCase().includes('receita') || 
                             key.toLowerCase().includes('income'))) {
                            totalIncome = data[key];
                            break;
                        }
                    }
                }
                
                if (totalExpense === 0) {
                    for (const key in data) {
                        if (typeof data[key] === 'number' && 
                            (key.toLowerCase().includes('despesa') || 
                             key.toLowerCase().includes('expense'))) {
                            totalExpense = data[key];
                            break;
                        }
                    }
                }
                
                // Se ainda não encontramos valores, vamos tentar extrair os valores das transações
                if (totalIncome === 0 && totalExpense === 0) {
                    this.calcularResumoManualmente();
                } else {
                    // Garantir que o saldo seja calculado corretamente
                    // Se a despesa já está como valor negativo, somamos
                    // Se a despesa está como valor positivo, subtraímos
                    let balance = 0;
                    if (totalExpense < 0) {
                        // Despesa já está como valor negativo, então somamos
                        balance = totalIncome + totalExpense;
                    } else {
                        // Despesa está como valor positivo, então subtraímos
                        balance = totalIncome - totalExpense;
                    }
                    
                    console.log(`Cálculo do saldo: ${totalIncome} ${totalExpense < 0 ? '+' : '-'} ${Math.abs(totalExpense)} = ${balance}`);
                    
                    // Atualizar o resumo
                    this.resumo = {
                        totalIncome: totalIncome,
                        totalExpense: totalExpense,
                        balance: balance
                    };
                    
                    console.log('Resumo processado:', this.resumo);
                }
                
                this.isLoading = false;
            },
            error: (error) => {
                this.notificationService.error('Erro ao carregar resumo financeiro.');
                this.isLoading = false;
                console.error('Erro ao carregar resumo:', error);
                // Em caso de erro, tentar calcular manualmente
                this.calcularResumoManualmente();
            }
        });

        this.transacoesRecentesSubscription = this.transactionService.getRecentTransactions(5).subscribe({
            next: (data: any[]) => {
                console.log('Transações recentes recebidas:', data);
                
                // Verificar os dados recebidos
                if (!Array.isArray(data)) {
                    console.warn('Dados de transações recentes não são um array:', data);
                    this.transacoesRecentes = [];
                    return;
                }
                
                // Log detalhado para verificar os dados de cada transação
                if (data.length > 0) {
                    console.log('Exemplo de transação recebida:', data[0]);
                    console.log('Valor da transação:', data[0].amount, typeof data[0].amount);
                    console.log('Valor alternativo:', data[0].valor, typeof data[0].valor);
                }
                
                // Mapear os campos se necessário, com atenção especial aos valores
                this.transacoesRecentes = data.map(transaction => {
                    // Criar uma cópia do objeto original
                    const result: any = { ...transaction };
                    
                    // Log para verificar o valor específico
                    console.log(`Processando transação ${result.id || 'sem ID'}:`, 
                               `amount=${transaction.amount}, valor=${transaction.valor}`);
                    
                    // Tentar diferentes abordagens para capturar o valor
                    let valorTransacao = 0;
                    
                    // Verificar campos de valor em diferentes formatos
                    if (typeof transaction.amount === 'number') {
                        valorTransacao = transaction.amount;
                    } else if (typeof transaction.valor === 'number') {
                        valorTransacao = transaction.valor;
                    } else if (typeof transaction.amount === 'string' && !isNaN(parseFloat(transaction.amount))) {
                        valorTransacao = parseFloat(transaction.amount);
                    } else if (typeof transaction.valor === 'string' && !isNaN(parseFloat(transaction.valor))) {
                        valorTransacao = parseFloat(transaction.valor);
                    } else {
                        // Procurar por qualquer propriedade que possa conter o valor
                        for (const key in transaction) {
                            if (typeof transaction[key] === 'number' && 
                                (key.toLowerCase().includes('valor') || 
                                 key.toLowerCase().includes('amount') ||
                                 key.toLowerCase().includes('value'))) {
                                valorTransacao = transaction[key];
                                break;
                            } else if (typeof transaction[key] === 'string' && 
                                      !isNaN(parseFloat(transaction[key])) &&
                                      (key.toLowerCase().includes('valor') || 
                                       key.toLowerCase().includes('amount') ||
                                       key.toLowerCase().includes('value'))) {
                                valorTransacao = parseFloat(transaction[key]);
                                break;
                            }
                        }
                    }
                    
                    // Preencher os campos padrão
                    result.id = transaction.id || 0;
                    result.description = transaction.description || transaction.descricao || '';
                    result.descricao = transaction.descricao || transaction.description || '';
                    result.amount = valorTransacao;  // Usar o valor encontrado
                    result.valor = valorTransacao;   // Usar o valor encontrado
                    result.type = transaction.type || transaction.tipo || '';
                    result.tipo = transaction.tipo || transaction.type || '';
                    result.category_id = transaction.category_id || transaction.categoria_id || 0;
                    result.categoria_id = transaction.categoria_id || transaction.category_id || 0;
                    result.category_name = transaction.category_name || transaction.nome_categoria || '';
                    result.nome_categoria = transaction.nome_categoria || transaction.category_name || '';
                    result.transaction_date = transaction.transaction_date || transaction.data_transacao || '';
                    result.data_transacao = transaction.data_transacao || transaction.transaction_date || '';
                    result.created_at = transaction.created_at || '';
                    
                    // Log final para verificar o valor processado
                    console.log(`Valor final da transação ${result.id}: ${result.amount}`);
                    
                    return result as Transacao;
                });
                
                console.log('Transações recentes processadas:', this.transacoesRecentes);
            },
            error: (error) => {
                this.notificationService.error('Erro ao carregar transações recentes.');
                console.error('Erro ao carregar transações:', error);
            }
        });
    }

    carregarTransacoes() {
        this.todasTransacoesSubscription = this.transactionService.getAllTransactions().subscribe({
            next: (data: any[]) => {
                console.log('Todas as transações recebidas:', data);
                
                // Verificar os dados recebidos
                if (!Array.isArray(data)) {
                    console.warn('Dados de transações não são um array:', data);
                    this.transacoes = [];
                    this.transacoesFiltradas = [];
                    return;
                }
                
                // Log detalhado para verificar os dados
                if (data.length > 0) {
                    console.log('Exemplo de transação recebida:', data[0]);
                    console.log('Valor da transação:', data[0].amount, typeof data[0].amount);
                    console.log('Valor alternativo:', data[0].valor, typeof data[0].valor);
                }
                
                // Mapear os dados com foco especial nos valores
                this.transacoes = data.map(transaction => {
                    const result: any = { ...transaction };
                    
                    // Tentar diferentes abordagens para capturar o valor
                    let valorTransacao = 0;
                    
                    // Verificar campos de valor em diferentes formatos
                    if (typeof transaction.amount === 'number') {
                        valorTransacao = transaction.amount;
                    } else if (typeof transaction.valor === 'number') {
                        valorTransacao = transaction.valor;
                    } else if (typeof transaction.amount === 'string' && !isNaN(parseFloat(transaction.amount))) {
                        valorTransacao = parseFloat(transaction.amount);
                    } else if (typeof transaction.valor === 'string' && !isNaN(parseFloat(transaction.valor))) {
                        valorTransacao = parseFloat(transaction.valor);
                    } else {
                        // Procurar por qualquer propriedade que possa conter o valor
                        for (const key in transaction) {
                            if (typeof transaction[key] === 'number' && 
                                (key.toLowerCase().includes('valor') || 
                                 key.toLowerCase().includes('amount') ||
                                 key.toLowerCase().includes('value'))) {
                                valorTransacao = transaction[key];
                                break;
                            } else if (typeof transaction[key] === 'string' && 
                                      !isNaN(parseFloat(transaction[key])) &&
                                      (key.toLowerCase().includes('valor') || 
                                       key.toLowerCase().includes('amount') ||
                                       key.toLowerCase().includes('value'))) {
                                valorTransacao = parseFloat(transaction[key]);
                                break;
                            }
                        }
                    }
                    
                    // Preencher os campos padrão
                    result.id = transaction.id || 0;
                    result.description = transaction.description || transaction.descricao || '';
                    result.descricao = transaction.descricao || transaction.description || '';
                    result.amount = valorTransacao;  // Usar o valor encontrado
                    result.valor = valorTransacao;   // Usar o valor encontrado
                    result.type = transaction.type || transaction.tipo || '';
                    result.tipo = transaction.tipo || transaction.type || '';
                    result.category_id = transaction.category_id || transaction.categoria_id || 0;
                    result.categoria_id = transaction.categoria_id || transaction.category_id || 0;
                    result.category_name = transaction.category_name || transaction.nome_categoria || '';
                    result.nome_categoria = transaction.nome_categoria || transaction.category_name || '';
                    result.transaction_date = transaction.transaction_date || transaction.data_transacao || '';
                    result.data_transacao = transaction.data_transacao || transaction.transaction_date || '';
                    result.created_at = transaction.created_at || '';
                    
                    return result as Transacao;
                });
                
                this.transacoesFiltradas = [...this.transacoes];
                
                // Agora que temos todas as transações, vamos calcular o resumo manualmente
                this.calcularResumoManualmente();
                
                console.log('Transações processadas:', this.transacoes);
            },
            error: (error) => {
                this.notificationService.error('Erro ao carregar transações.');
                console.error('Erro detalhado ao carregar todas as transações:', error);
            }
        });
    }

    // MÉTODO MODIFICADO - Este é o método principal que foi corrigido
    calcularResumoManualmente() {
        if (this.transacoes.length === 0) {
            console.log('Sem transações para calcular o resumo.');
            return;
        }
        
        console.log('Calculando resumo a partir das transações...');
        
        let totalReceitas = 0;
        let totalDespesas = 0;
        
        this.transacoes.forEach((transacao, index) => {
            console.log(`[${index}] Analisando transação:`, 
                      `tipo=${transacao.type || transacao.tipo}`, 
                      `valor=${transacao.amount || transacao.valor}`);
            
            const valorOriginal = transacao.amount || transacao.valor || 0;
            
            // Usar o valor absoluto para cálculos
            const valorAbsoluto = Math.abs(valorOriginal);
            
            if (transacao.type === 'receita' || transacao.tipo === 'receita') {
                totalReceitas += valorAbsoluto;
                console.log(`[${index}] Adicionando receita: +${valorAbsoluto}, total receitas=${totalReceitas}`);
            } else if (transacao.type === 'despesa' || transacao.tipo === 'despesa') {
                totalDespesas += valorAbsoluto;
                console.log(`[${index}] Adicionando despesa: +${valorAbsoluto}, total despesas=${totalDespesas}`);
            } else {
                console.warn(`[${index}] Tipo de transação desconhecido: ${transacao.type || transacao.tipo}`);
            }
        });
        
        // Calcular o saldo
        const saldo = totalReceitas - totalDespesas;
        
        console.log('RESUMO CALCULADO:');
        console.log(`Receitas: ${totalReceitas}`);
        console.log(`Despesas: ${totalDespesas}`);
        console.log(`Saldo: ${saldo}`);
        
        this.resumo = {
            totalIncome: totalReceitas,
            totalExpense: -totalDespesas, // Armazenamos a despesa como valor negativo para exibição
            balance: saldo
        };
        
        console.log('Resumo atualizado:', this.resumo);
    }

    filtrarTransacoes() {
        if (this.filtroTipo) {
            this.transacoesFiltradas = this.transacoes.filter(t => t.type === this.filtroTipo || t.tipo === this.filtroTipo);
        } else {
            this.transacoesFiltradas = [...this.transacoes];
        }
    }

    editarTransacao(transacao: Transacao) {
        this.router.navigate(['/nova-transacao', transacao.id]);
    }

    deletarTransacao(id: number) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactionService.deleteTransaction(id).subscribe({
                next: () => {
                    this.notificationService.success('Transação excluída com sucesso!');
                    this.carregarTransacoes();
                    this.carregarDadosDashboard(); // Recarregar o resumo após deletar
                },
                error: () => {
                    this.notificationService.error('Erro ao excluir a transação.');
                }
            });
        }
    }

    formatarMoeda(value: number): string {
        if (value === undefined || value === null || isNaN(value)) {
            console.warn('Tentativa de formatar valor inválido como moeda:', value);
            return 'R$ --';
        }

        try {
            console.log(`Formatando valor como moeda: ${value}`);
            // Para valores negativos, queremos que o sinal apareça
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                signDisplay: 'auto' // Permitir que o formatador mostre o sinal negativo
            }).format(value);
        } catch (error) {
            console.error('Erro ao formatar moeda:', error);
            return 'R$ --';
        }
    }

    formatarData(dateString: string): string {
        if (!dateString) {
            console.warn('Tentativa de formatar data vazia');
            return '--/--/----';
        }
        
        try {
            const date = new Date(dateString);
            
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                console.warn('Data inválida:', dateString);
                return '--/--/----';
            }
            
            return new Intl.DateTimeFormat('pt-BR').format(date);
        } catch (error) {
            console.error('Erro ao formatar data:', error, 'para o valor:', dateString);
            return '--/--/----';
        }
    }
}