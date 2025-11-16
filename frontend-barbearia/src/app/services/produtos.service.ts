import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  nome: string;
  descricao?: string;
  preco: number;
  duracao?: number;
  estoque?: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
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
  constructor(private http: HttpClient) {}

  // ==================== CATEGORIAS ====================
  
  listarCategorias(): Observable<CategoriasResponse> {
    return this.http.get<CategoriasResponse>(`${environment.apiUrl}/produtos/categorias/listar`);
  }

  criarCategoria(categoria: Partial<Categoria>): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/produtos/categorias/criar`, categoria);
  }

  atualizarCategoria(id: number, categoria: Partial<Categoria>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/produtos/categorias/${id}`, categoria);
  }

  excluirCategoria(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/produtos/categorias/${id}`);
  }

  // ==================== PRODUTOS (SERVIÇOS) ====================
  
  listarProdutos(): Observable<ProdutosResponse> {
    return this.http.get<any>(`${environment.apiUrl}/produtos/listar`).pipe(
      map((response: any) => ({
        produtos: response.produtos || [],
        total: response.produtos?.length || 0
      }))
    );
  }

  buscarProdutoPorId(id: number): Observable<{produto: Produto}> {
    return this.http.get<{produto: Produto}>(`${environment.apiUrl}/produtos/${id}`);
  }

  criarProduto(produto: Partial<Produto>): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/produtos/criar`, produto);
  }

  atualizarProduto(id: number, produto: Partial<Produto>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/produtos/${id}`, produto);
  }

  excluirProduto(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/produtos/${id}`);
  }

  alternarStatusProduto(id: number): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/produtos/${id}/status`, {});
  }
}
