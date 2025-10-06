import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TransacaoService } from '../../services/transacao.service';
import { NotificationService } from '../../services/notification.service';
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
  [key: string]: any;
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
  resumo: ResumoFinanceiro = { totalIncome: 0, totalExpense: 0, balance: 0 };
  transacoesRecentes: Transacao[] = [];
  transacoes: Transacao[] = [];
  transacoesFiltradas: Transacao[] = [];
  filtroTipo = '';
  displayedColumns: string[] = ['descricao', 'valor', 'tipo', 'categoria', 'acoes'];

  private resumoSubscription?: Subscription;
  private transacoesRecentesSubscription?: Subscription;
  private todasTransacoesSubscription?: Subscription;

  constructor(
    private transacaoService: TransacaoService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

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

    // 1) Resumo vindo do service (ou calculado a partir das transações)
    this.resumoSubscription = this.transacaoService.getResumo().subscribe({
      next: (data) => {
        // data já vem calculado; garantir sinal do balance
        const totalIncome = Number(data.totalIncome) || 0;
        const totalExpense = Number(data.totalExpense) || 0;
        const balance = totalIncome - Math.abs(totalExpense);
        this.resumo = { totalIncome, totalExpense, balance };
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Erro ao carregar resumo financeiro.');
        console.error('Erro ao carregar resumo:', error);
        this.isLoading = false;
        this.calcularResumoManualmente();
      }
    });

    // 2) Recentes
    this.transacoesRecentesSubscription = this.transacaoService.getRecentes(5).subscribe({
      next: (data: any[]) => {
        if (!Array.isArray(data)) {
          this.transacoesRecentes = [];
          return;
        }
        this.transacoesRecentes = data.map(t => ({
          id: t.id || 0,
          description: t.description ?? t.descricao ?? '',
          descricao: t.descricao ?? t.description ?? '',
          amount: typeof t.amount === 'number' ? t.amount
                : typeof t.valor === 'number' ? t.valor
                : parseFloat(t.amount ?? t.valor ?? '0') || 0,
          valor: typeof t.valor === 'number' ? t.valor
               : typeof t.amount === 'number' ? t.amount
               : parseFloat(t.valor ?? t.amount ?? '0') || 0,
          type: t.type ?? t.tipo ?? '',
          tipo: t.tipo ?? t.type ?? '',
          category_id: t.category_id ?? t.categoria_id ?? 0,
          categoria_id: t.categoria_id ?? t.category_id ?? 0,
          category_name: t.category_name ?? t.nome_categoria ?? '',
          nome_categoria: t.nome_categoria ?? t.category_name ?? '',
          transaction_date: t.transaction_date ?? t.data_transacao ?? '',
          data_transacao: t.data_transacao ?? t.transaction_date ?? '',
          created_at: t.created_at ?? ''
        }));
      },
      error: (error) => {
        this.notificationService.error('Erro ao carregar transações recentes.');
        console.error('Erro ao carregar transações:', error);
      }
    });
  }

  carregarTransacoes() {
    this.todasTransacoesSubscription = this.transacaoService.getTransacoes().subscribe({
      next: (data: any[]) => {
        if (!Array.isArray(data)) {
          this.transacoes = [];
          this.transacoesFiltradas = [];
          return;
        }
        this.transacoes = data.map(t => ({
          id: t.id || 0,
          description: t.description ?? t.descricao ?? '',
          descricao: t.descricao ?? t.description ?? '',
          amount: typeof t.amount === 'number' ? t.amount
                : typeof t.valor === 'number' ? t.valor
                : parseFloat(t.amount ?? t.valor ?? '0') || 0,
          valor: typeof t.valor === 'number' ? t.valor
               : typeof t.amount === 'number' ? t.amount
               : parseFloat(t.valor ?? t.amount ?? '0') || 0,
          type: t.type ?? t.tipo ?? '',
          tipo: t.tipo ?? t.type ?? '',
          category_id: t.category_id ?? t.categoria_id ?? 0,
          categoria_id: t.categoria_id ?? t.category_id ?? 0,
          category_name: t.category_name ?? t.nome_categoria ?? '',
          nome_categoria: t.nome_categoria ?? t.category_name ?? '',
          transaction_date: t.transaction_date ?? t.data_transacao ?? '',
          data_transacao: t.data_transacao ?? t.transaction_date ?? '',
          created_at: t.created_at ?? ''
        }));
        this.transacoesFiltradas = [...this.transacoes];
        this.calcularResumoManualmente();
      },
      error: (error) => {
        this.notificationService.error('Erro ao carregar transações.');
        console.error('Erro detalhado ao carregar todas as transações:', error);
      }
    });
  }

  calcularResumoManualmente() {
    if (!this.transacoes.length) return;

    let totalReceitas = 0;
    let totalDespesas = 0;

    this.transacoes.forEach(t => {
      const v = Math.abs(t.amount ?? t.valor ?? 0);
      if ((t.type ?? t.tipo) === 'receita') totalReceitas += v;
      else if ((t.type ?? t.tipo) === 'despesa') totalDespesas += v;
    });

    this.resumo = {
      totalIncome: totalReceitas,
      totalExpense: -totalDespesas,
      balance: totalReceitas - totalDespesas
    };
  }

  filtrarTransacoes() {
    this.transacoesFiltradas = this.filtroTipo
      ? this.transacoes.filter(t => (t.type ?? t.tipo) === this.filtroTipo)
      : [...this.transacoes];
  }

  editarTransacao(transacao: Transacao) {
    this.router.navigate(['/nova-transacao', transacao.id]);
  }

  deletarTransacao(id: number) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      this.transacaoService.deleteTransacao(id).subscribe({
        next: () => {
          this.notificationService.success('Transação excluída com sucesso!');
          this.carregarTransacoes();
          this.carregarDadosDashboard();
        },
        error: () => this.notificationService.error('Erro ao excluir a transação.')
      });
    }
  }

  formatarMoeda(value: number): string {
    if (value === undefined || value === null || isNaN(value)) return 'R$ --';
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        signDisplay: 'auto'
      }).format(value);
    } catch {
      return 'R$ --';
    }
  }

  formatarData(dateString: string): string {
    if (!dateString) return '--/--/----';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '--/--/----' : new Intl.DateTimeFormat('pt-BR').format(d);
  }
}
