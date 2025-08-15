// src/app/components/categoria-manager/categoria-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CategoriaService, Categoria } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './categoria-manager.component.html',
  styleUrls: ['./categoria-manager.component.scss']
})
export class CategoriaManagerComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaForm: FormGroup;
  editMode = false;
  editingId: number | null = null;
  loading = false;

  displayedColumns: string[] = ['nome', 'tipo', 'descricao', 'acoes'];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar
  ) {
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['receita', Validators.required],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.showMessage('Erro ao carregar categorias');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoriaForm.valid) {
      const categoria: Categoria = this.categoriaForm.value;
      
      this.loading = true;

      if (this.editMode && this.editingId) {
        // Atualizar categoria existente
        this.categoriaService.updateCategoria(this.editingId, categoria).subscribe({
          next: (response) => {
            this.showMessage('Categoria atualizada com sucesso!');
            this.resetForm();
            this.loadCategorias();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro ao atualizar categoria:', error);
            this.showMessage('Erro ao atualizar categoria');
            this.loading = false;
          }
        });
      } else {
        // Criar nova categoria
        this.categoriaService.createCategoria(categoria).subscribe({
          next: (response) => {
            this.showMessage('Categoria criada com sucesso!');
            this.resetForm();
            this.loadCategorias();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro ao criar categoria:', error);
            this.showMessage('Erro ao criar categoria');
            this.loading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  editCategoria(categoria: Categoria): void {
    this.editMode = true;
    this.editingId = categoria.id!;
    this.categoriaForm.patchValue({
      nome: categoria.nome,
      tipo: categoria.tipo,
      descricao: categoria.descricao || ''
    });
  }

  deleteCategoria(id: number): void {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      this.loading = true;
      this.categoriaService.deleteCategoria(id).subscribe({
        next: (response) => {
          this.showMessage('Categoria deletada com sucesso!');
          this.loadCategorias();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao deletar categoria:', error);
          this.showMessage('Erro ao deletar categoria');
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.categoriaForm.reset();
    this.categoriaForm.patchValue({ tipo: 'receita' });
    this.editMode = false;
    this.editingId = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoriaForm.controls).forEach(key => {
      this.categoriaForm.get(key)?.markAsTouched();
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  getErrorMessage(field: string): string {
    const control = this.categoriaForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`;
    }
    if (control?.hasError('minlength')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} deve ter pelo menos 2 caracteres`;
    }
    return '';
  }
}