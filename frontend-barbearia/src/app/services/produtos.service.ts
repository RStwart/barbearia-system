import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface Categoria {
  id?: number;
  unidade_id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Produto {
  id?: number;
  unidade_id?: number;
  categoria_id?: number;
  categoria_nome?: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  foto_url?: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CategoriasResponse {
  categorias: Categoria[];
  total: number;
}

export interface ProdutosResponse {
  produtos: Produto[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  // ==================== CATEGORIAS ====================
  
  listarCategorias(): Observable<CategoriasResponse> {
    return this.http.get<CategoriasResponse>(`${this.apiUrl}/categorias/listar`);
  }

  criarCategoria(categoria: Partial<Categoria>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categorias/criar`, categoria);
  }

  atualizarCategoria(id: number, categoria: Partial<Categoria>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categorias/${id}`, categoria);
  }

  excluirCategoria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categorias/${id}`);
  }

  // ==================== PRODUTOS ====================
  
  listarProdutos(): Observable<ProdutosResponse> {
    return this.http.get<ProdutosResponse>(`${this.apiUrl}/listar`);
  }

  buscarProdutoPorId(id: number): Observable<{produto: Produto}> {
    return this.http.get<{produto: Produto}>(`${this.apiUrl}/${id}`);
  }

  criarProduto(produto: Partial<Produto>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, produto);
  }

  atualizarProduto(id: number, produto: Partial<Produto>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, produto);
  }

  excluirProduto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  alternarStatusProduto(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, {});
  }
}
