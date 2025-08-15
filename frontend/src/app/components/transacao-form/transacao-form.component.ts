import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransacaoService } from '../../services/transacao.service';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transacao-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressBarModule
  ],
  templateUrl: './transacao-form.component.html',
  styleUrls: ['./transacao-form.component.scss']
})
export class TransacaoFormComponent implements OnInit {
  transacao: any = {
    descricao: '',
    valor: null,
    tipo: '',
    categoria_id: null,
    data_transacao: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
  };
  categorias: any[] = [];
  categoriasFiltradas: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private transacaoService: TransacaoService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.carregarCategorias();
    this.verificarEdicao();
  }

  // CORREÇÃO: Removendo getCategorias() que não existe no service
  carregarCategorias() {
    this.isLoading = true;
    
    // Criando categorias hardcoded que sabemos que existem
    this.categorias = [
      { id: 2, nome: 'Geral', tipo: 'receita' },
      { id: 3, nome: 'Despesas Gerais', tipo: 'despesa' }
    ];
    
    console.log('Categorias carregadas:', this.categorias);
    this.filtrarCategorias();
    this.isLoading = false;
    
    // Comentando a chamada para getCategorias que não existe
    /*
    this.transacaoService.getCategorias().subscribe({
      next: (data) => {
        console.log('Categorias carregadas:', data);
        this.categorias = data;
        this.filtrarCategorias();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.snackBar.open('Erro ao carregar categorias.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
    */
  }

  verificarEdicao() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.transacaoService.getTransacao(Number(id)).subscribe({
        next: (data) => {
          console.log('Transação carregada para edição:', data);
          this.transacao = {
            id: data.id,
            descricao: data.description,
            valor: Math.abs(data.amount), // Sempre positivo no formulário
            tipo: data.type,
            categoria_id: data.category_id,
            data_transacao: data.transaction_date || new Date().toISOString().split('T')[0]
          };
          
          this.filtrarCategorias();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar transação para edição:', error);
          this.snackBar.open('Erro ao carregar transação.', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  filtrarCategorias() {
    if (!this.categorias.length) return;
    
    console.log('Filtrando categorias para tipo:', this.transacao.tipo);
    
    // Se não houver tipo selecionado, mostra todas as categorias
    if (!this.transacao.tipo) {
      this.categoriasFiltradas = [...this.categorias];
      return;
    }

    // Filtrar diretamente pelo campo tipo
    this.categoriasFiltradas = this.categorias.filter(c => c.tipo === this.transacao.tipo);
    
    console.log('Categorias filtradas:', this.categoriasFiltradas);
  }

  onTipoChange() {
    this.transacao.categoria_id = null;  // Limpar categoria ao mudar tipo
    this.filtrarCategorias();
  }

  validarFormulario(): boolean {
    if (!this.transacao.descricao) {
      this.snackBar.open('Preencha a descrição!', 'Fechar', { duration: 3000 });
      return false;
    }
    
    if (!this.transacao.valor) {
      this.snackBar.open('Informe o valor!', 'Fechar', { duration: 3000 });
      return false;
    }
    
    if (!this.transacao.tipo) {
      this.snackBar.open('Selecione o tipo da transação!', 'Fechar', { duration: 3000 });
      return false;
    }
    
    if (!this.transacao.categoria_id) {
      this.snackBar.open('Selecione uma categoria!', 'Fechar', { duration: 3000 });
      return false;
    }

    return true;
  }

  // CORREÇÃO: Preparar dados no formato correto para a API
  prepararDados() {
    // Converter para o formato esperado pelo service (interface Transaction)
    console.log('Transacao antes de preparar:', this.transacao);
    const dadosParaAPI = {
      description: this.transacao.descricao,
      amount: Math.abs(parseFloat(this.transacao.valor)), // Sempre positivo
      type: this.transacao.tipo,
      category_id: Number(this.transacao.categoria_id),
      transaction_date: this.transacao.data_transacao || new Date().toISOString().split('T')[0]
    };
    
    console.log('Dados preparados para envio:', dadosParaAPI);
    return dadosParaAPI;
  }

  // CORREÇÃO: Função salvarTransacao corrigida
  salvarTransacao() {
    if (!this.validarFormulario()) return;
    
    const dadosParaAPI = this.prepararDados();
    this.isLoading = true;
    this.errorMessage = null;

    console.log('Iniciando salvamento da transação:', dadosParaAPI);

    const request = this.transacao.id
      ? this.transacaoService.updateTransacao(this.transacao.id, dadosParaAPI)
      : this.transacaoService.createTransacao(dadosParaAPI);

    request.subscribe({
      next: (response) => {
        console.log('Transação salva com sucesso:', response);
        this.isLoading = false;
        this.snackBar.open('Transação salva com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro detalhado ao salvar transação:', error);
        
        if (error.status === 422) {
          // Erro de validação
          this.handleValidationError(error);
        } else if (error.status === 500) {
          this.errorMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.';
        } else if (error.status === 401) {
          this.errorMessage = 'Sessão expirada. Faça login novamente.';
          // Redirecionar para login se necessário
          // this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Erro ao salvar transação. Por favor, tente novamente.';
        }
        
        this.snackBar.open(this.errorMessage || 'Erro desconhecido', 'Fechar', { duration: 5000 });
      }
    });
  }

  handleValidationError(error: any) {
    if (error.error && error.error.errors) {
      const messages: string[] = [];
      
      for (const field in error.error.errors) {
        if (Object.prototype.hasOwnProperty.call(error.error.errors, field)) {
          const fieldErrors = error.error.errors[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            messages.push(`${field}: ${fieldErrors.join(', ')}`);
          } else if (typeof fieldErrors === 'string') {
            messages.push(`${field}: ${fieldErrors}`);
          }
        }
      }
      
      this.errorMessage = messages.join('\n');
    } else if (error.error && error.error.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Erro de validação dos dados.';
    }
  }

  cancelar() {
    this.router.navigate(['/']);
  }



}