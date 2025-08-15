import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  id?: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // Listar todas as categorias
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Buscar categoria por ID
  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Criar nova categoria
  createCategoria(categoria: Categoria): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoria, {
      headers: this.getHeaders()
    });
  }

  // Atualizar categoria
  updateCategoria(id: number, categoria: Categoria): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoria, {
      headers: this.getHeaders()
    });
  }

  // Deletar categoria
  deleteCategoria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Filtrar categorias por tipo
  getCategoriasByTipo(tipo: 'receita' | 'despesa'): Observable<Categoria[]> {
    return new Observable(observer => {
      this.getCategorias().subscribe({
        next: (categorias) => {
          const filtered = categorias.filter(cat => cat.tipo === tipo);
          observer.next(filtered);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}