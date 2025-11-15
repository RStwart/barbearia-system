import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface Barbearia {
  id_unidade?: number;
  id?: number;
  nome: string;
  descricao?: string;
  responsavel?: string;
  cnpj?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;
  horario_funcionamento?: string;
  horario_abertura?: string;
  horario_fechamento?: string;
  latitude?: number;
  longitude?: number;
  instagram?: string | null;
  whatsapp?: string | null;
  foto_url?: string | null;
  dias_funcionamento?: string;
  ativo: boolean;
  data_cadastro?: string;
  criado_em?: string;
  status_pagamento?: string;
  status_avaliacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BarbeariasService {
  private apiUrl = `${environment.apiUrl}/unidades`;

  constructor(private http: HttpClient) {}

  listarBarbearias(): Observable<{ unidades: Barbearia[] }> {
    return this.http.get<{ unidades: Barbearia[] }>(this.apiUrl);
  }

  buscarBarbeariaPorId(id: number): Observable<{ unidade: Barbearia }> {
    return this.http.get<{ unidade: Barbearia }>(`${this.apiUrl}/${id}`);
  }

  listarServicosPorBarbearia(barbeariaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${barbeariaId}/servicos`);
  }

  listarFuncionariosPorBarbearia(barbeariaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${barbeariaId}/funcionarios`);
  }
}
