import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface Funcionario {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  foto_perfil?: string;
  tipo: 'FUNCIONARIO';
  unidade_id?: number;
  ativo: boolean;
  criado_em?: string;
  primeiro_acesso?: boolean;
}

export interface FuncionarioResponse {
  funcionarios: Funcionario[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {
  private apiUrl = `${environment.apiUrl}/funcionarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<FuncionarioResponse> {
    return this.http.get<FuncionarioResponse>(`${this.apiUrl}/listar`);
  }

  buscarPorId(id: number): Observable<{funcionario: Funcionario}> {
    return this.http.get<{funcionario: Funcionario}>(`${this.apiUrl}/${id}`);
  }

  criar(funcionario: Partial<Funcionario>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, funcionario);
  }

  atualizar(id: number, funcionario: Partial<Funcionario>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, funcionario);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  alternarStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, {});
  }

  resetarSenha(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/resetar-senha`, {});
  }
}
