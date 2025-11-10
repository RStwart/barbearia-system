import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

// Interfaces
export interface VendaServico {
  id?: number;
  venda_id?: number;
  agendamento_id?: number | null;
  servico_id?: number | null;
  servico_nome: string;
  servico_preco: number;
  quantidade: number;
  subtotal: number;
}

export interface VendaProduto {
  id?: number;
  venda_id?: number;
  produto_id?: number | null;
  produto_nome: string;
  produto_preco: number;
  quantidade: number;
  subtotal: number;
}

export interface Venda {
  id?: number;
  unidade_id?: number;
  funcionario_id?: number;
  funcionario_nome?: string;
  cliente_id?: number | null;
  cliente_nome?: string | null;
  tipo_venda: 'SERVICO' | 'PRODUTO' | 'MISTO';
  valor_total: number;
  forma_pagamento: 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX' | 'OUTROS';
  status_pagamento: 'AGUARDANDO' | 'PAGO' | 'CANCELADO';
  nota_fiscal?: string | null;
  status_nf: 'AGUARDANDO_AJUSTE' | 'EMITIDA' | 'NAO_NECESSARIA';
  observacoes?: string | null;
  criado_em?: string;
  atualizado_em?: string;
  servicos?: VendaServico[];
  produtos?: VendaProduto[];
}

export interface Estatisticas {
  vendasDia: {
    total: number;
    valor: number;
  };
  vendasSemana: {
    total: number;
    valor: number;
  };
  vendasMes: {
    total: number;
    valor: number;
  };
  vendasAno: {
    total: number;
    valor: number;
  };
  vendasPorTipo: {
    tipo_venda: string;
    quantidade: number;
    total: number;
  }[];
  nfPendentes: number;
  produtosMaisVendidos: {
    produto_nome: string;
    total_vendido: number;
    valor_total: number;
  }[];
  servicosMaisVendidos: {
    servico_nome: string;
    total_vendido: number;
    valor_total: number;
  }[];
  vendasPorPagamento: {
    forma_pagamento: string;
    quantidade: number;
    total: number;
  }[];
}

export interface VendasResponse {
  vendas: Venda[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/vendas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Estatísticas
  obterEstatisticas(): Observable<Estatisticas> {
    return this.http.get<Estatisticas>(`${this.apiUrl}/estatisticas`, {
      headers: this.getHeaders()
    });
  }

  // Vendas
  listarVendas(): Observable<VendasResponse> {
    return this.http.get<VendasResponse>(`${this.apiUrl}/listar`, {
      headers: this.getHeaders()
    });
  }

  buscarVendaPorId(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  criarVenda(venda: Partial<Venda>): Observable<any> {
    return this.http.post(`${this.apiUrl}/criar`, venda, {
      headers: this.getHeaders()
    });
  }

  atualizarNotaFiscal(id: number, nota_fiscal: string, status_nf: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/nota-fiscal`, 
      { nota_fiscal, status_nf }, 
      { headers: this.getHeaders() }
    );
  }

  atualizarVenda(id: number, dados: Partial<Venda>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados, {
      headers: this.getHeaders()
    });
  }

  excluirVenda(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
