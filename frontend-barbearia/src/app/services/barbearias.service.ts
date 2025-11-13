import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface Barbearia {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  instagram: string | null;
  whatsapp: string | null;
  foto_url: string | null;
  horario_abertura: string;
  horario_fechamento: string;
  dias_funcionamento: string;
  ativo: boolean;
  criado_em?: string;
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
