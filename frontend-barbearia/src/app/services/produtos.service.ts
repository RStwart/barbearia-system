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
  private apiUrl = `${environment.apiUrl}/agendamentos`;

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
    return this.http.get<any>(`${this.apiUrl}/servicos/listar`).pipe(
      map((response: any) => ({
        produtos: response.servicos || [],
        total: response.servicos?.length || 0
      }))
    );
  }

  buscarProdutoPorId(id: number): Observable<{produto: Produto}> {
    // TODO: Implementar endpoint no backend
    return this.http.get<{produto: Produto}>(`${environment.apiUrl}/servicos/${id}`);
  }

  criarProduto(produto: Partial<Produto>): Observable<any> {
    // TODO: Implementar endpoint no backend
    console.warn('Endpoint de criar serviço não implementado no backend');
    return new Observable(observer => observer.error('Not implemented'));
  }

  atualizarProduto(id: number, produto: Partial<Produto>): Observable<any> {
    // TODO: Implementar endpoint no backend
    console.warn('Endpoint de atualizar serviço não implementado no backend');
    return new Observable(observer => observer.error('Not implemented'));
  }

  excluirProduto(id: number): Observable<any> {
    // TODO: Implementar endpoint no backend
    console.warn('Endpoint de excluir serviço não implementado no backend');
    return new Observable(observer => observer.error('Not implemented'));
  }

  alternarStatusProduto(id: number): Observable<any> {
    // TODO: Implementar endpoint no backend
    console.warn('Endpoint de alternar status não implementado no backend');
    return new Observable(observer => observer.error('Not implemented'));
  }
}
