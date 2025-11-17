import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface Agendamento {
  id?: number;
  unidade_id: number;
  cliente_id: number;
  funcionario_id: number;
  servico_id: number;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'pendente' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  valor_total: number;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  funcionario_nome?: string;
  servico_nome?: string;
  servico_duracao?: number;
  unidade_nome?: string;
}

export interface Servico {
  id: number;
  unidade_id: number;
  nome: string;
  descricao?: string;
  duracao: number;
  preco: number;
  ativo: boolean;
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private apiUrl = `${environment.apiUrl}/agendamentos`;

  constructor(private http: HttpClient) {}

  listarAgendamentos(unidade_id?: number, data_inicio?: string, data_fim?: string): Observable<any> {
    let params = new HttpParams();
    
    if (unidade_id) {
      params = params.set('unidade_id', unidade_id.toString());
    }
    if (data_inicio) {
      params = params.set('data_inicio', data_inicio);
    }
    if (data_fim) {
      params = params.set('data_fim', data_fim);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  buscarAgendamento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  criarAgendamento(agendamento: Agendamento): Observable<any> {
    return this.http.post<any>(this.apiUrl, agendamento);
  }

  atualizarAgendamento(id: number, agendamento: Partial<Agendamento>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, agendamento);
  }

  cancelarAgendamento(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  deletarAgendamento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  listarServicos(unidade_id?: number): Observable<any> {
    let params = new HttpParams();
    
    if (unidade_id) {
      params = params.set('unidade_id', unidade_id.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/servicos/listar`, { params });
  }

  listarFuncionarios(unidade_id?: number): Observable<any> {
    let params = new HttpParams();
    
    if (unidade_id) {
      params = params.set('unidade_id', unidade_id.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/funcionarios/listar`, { params });
  }

  buscarClientes(termo: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('termo', termo);
    
    return this.http.get<any>(`${this.apiUrl}/clientes/buscar`, { params });
  }
}
