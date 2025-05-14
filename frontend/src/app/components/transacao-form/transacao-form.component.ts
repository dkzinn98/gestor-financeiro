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

  carregarCategorias() {
    this.isLoading = true;
    this.transacaoService.getCategorias().subscribe({
      next: (data) => {
        console.log('Categorias carregadas:', data);
        this.categorias = data;
        
        // Garantir que todas as categorias tenham um tipo definido
        this.categorias = this.categorias.map(categoria => {
          // Se a categoria não tiver tipo definido, inferir com base no nome
          if (!categoria.tipo) {
            if (categoria.nome.toLowerCase().includes('renda') || 
                categoria.nome.toLowerCase().includes('salário') || 
                categoria.nome.toLowerCase().includes('investimento') || 
                categoria.nome.toLowerCase().includes('pagamento') || 
                categoria.nome.toLowerCase().includes('pro-labore')) {
              categoria.tipo = 'receita';
            } else {
              categoria.tipo = 'despesa';
            }
          }
          return categoria;
        });
        
        this.filtrarCategorias();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.snackBar.open('Erro ao carregar categorias.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  verificarEdicao() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.transacaoService.getTransacao(Number(id)).subscribe({
        next: (data) => {
          console.log('Transação carregada para edição:', data);
          this.transacao = data;
          
          // Garantir que o tipo da transação esteja definido
          if (!this.transacao.tipo) {
            // Inferir tipo com base no valor
            this.transacao.tipo = this.transacao.valor >= 0 ? 'receita' : 'despesa';
          }
          
          // Garantir que o valor seja exibido como positivo no formulário
          this.transacao.valor = Math.abs(this.transacao.valor);
          
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

    // Filtrar diretamente pelo campo tipo (método principal)
    this.categoriasFiltradas = this.categorias.filter(c => c.tipo === this.transacao.tipo);
    
    // Se não encontrar nenhuma categoria com o tipo correspondente
    if (this.categoriasFiltradas.length === 0) {
      // Método alternativo: filtrar por nomes
      if (this.transacao.tipo === 'receita') {
        this.categoriasFiltradas = this.categorias.filter(c =>
          c.nome.toLowerCase().includes('renda') || 
          c.nome.toLowerCase().includes('salário') ||
          c.nome.toLowerCase().includes('investimento') ||
          c.nome.toLowerCase().includes('pagamento') || 
          c.nome.toLowerCase().includes('pro-labore')
        );
      } else if (this.transacao.tipo === 'despesa') {
        this.categoriasFiltradas = this.categorias.filter(c =>
          c.nome.toLowerCase().includes('despesa') || 
          c.nome.toLowerCase().includes('aluguel') || 
          c.nome.toLowerCase().includes('serviços') ||
          c.nome.toLowerCase().includes('transporte') ||
          c.nome.toLowerCase().includes('alimentação')
        );
      }
      
      // Se ainda não encontrar nenhuma, mostra todas as categorias
      if (this.categoriasFiltradas.length === 0) {
        this.categoriasFiltradas = [...this.categorias];
      }
    }
    
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

  prepararDados() {
    // Ajustar valor com base no tipo
    if (this.transacao.tipo === 'despesa') {
      this.transacao.valor = -Math.abs(this.transacao.valor);
    } else if (this.transacao.tipo === 'receita') {
      this.transacao.valor = Math.abs(this.transacao.valor);
    }
    
    // Garantir que categoria_id seja um número
    this.transacao.categoria_id = Number(this.transacao.categoria_id);
    
    // Formatar data se necessário
    if (!this.transacao.data_transacao) {
      this.transacao.data_transacao = new Date().toISOString().split('T')[0];
    }
    
    console.log('Dados preparados para envio:', this.transacao);
  }

  salvarTransacao() {
    if (!this.validarFormulario()) return;
    
    this.prepararDados();
    this.isLoading = true;
    this.errorMessage = null;

    console.log('Iniciando salvamento da transação:', this.transacao);

    const request = this.transacao.id
      ? this.transacaoService.updateTransacao(this.transacao.id, this.transacao)
      : this.transacaoService.createTransacao(this.transacao);

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
        } else {
          this.errorMessage = 'Erro ao salvar transação. Por favor, tente novamente.';
        }
        
        // Usando o operador não-nulo para garantir que o errorMessage é uma string
        this.snackBar.open(this.errorMessage || 'Erro desconhecido', 'Fechar', { duration: 5000 });
      }
    });
  }

  handleValidationError(error: any) {
    if (error.error && error.error.errors) {
      // Usando tipagem explícita para o array
      const messages: string[] = [];
      
      // Iterando sobre as propriedades do objeto error.error.errors
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