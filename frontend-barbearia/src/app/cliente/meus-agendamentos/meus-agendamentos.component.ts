import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';

interface Agendamento {
  id: number;
  unidade_id: number;
  servico_id: number;
  funcionario_id: number;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  valor_total: number;
  observacoes?: string;
  servico_nome: string;
  servico_descricao?: string;
  funcionario_nome: string;
  funcionario_foto?: string;
  unidade_nome: string;
  endereco?: string;
  cidade?: string;
  telefone?: string;
  avaliacao?: number;
  comentario_avaliacao?: string;
}

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meus-agendamentos.component.html',
  styleUrls: ['./meus-agendamentos.component.css']
})
export class MeusAgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  agendamentosFiltrados: Agendamento[] = [];
  filtroStatus: string = 'todos';
  carregando = false;
  erro = '';
  
  // Modal de avaliação
  mostrarModalAvaliacao = false;
  agendamentoParaAvaliar: Agendamento | null = null;
  notaAvaliacao = 0;
  comentarioAvaliacao = '';
  
  // Modal de cancelamento
  mostrarModalCancelar = false;
  agendamentoParaCancelar: Agendamento | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.carregando = true;
    this.erro = '';

    this.http.get<any>(`${environment.apiUrl}/agendamentos-cliente`).subscribe({
      next: (response) => {
        console.log('Response da API:', response);
        this.agendamentos = response.agendamentos || [];
        console.log('Agendamentos carregados:', this.agendamentos);
        this.filtrarAgendamentos();
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar agendamentos:', error);
        this.erro = 'Erro ao carregar agendamentos';
        this.carregando = false;
      }
    });
  }

  filtrarAgendamentos() {
    if (this.filtroStatus === 'todos') {
      this.agendamentosFiltrados = this.agendamentos;
    } else {
      this.agendamentosFiltrados = this.agendamentos.filter(
        a => a.status.toLowerCase() === this.filtroStatus
      );
    }
  }

  alterarFiltro(status: string) {
    this.filtroStatus = status;
    this.filtrarAgendamentos();
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pendente': 'status-pendente',
      'confirmado': 'status-confirmado',
      'em_andamento': 'status-andamento',
      'concluido': 'status-concluido',
      'cancelado': 'status-cancelado'
    };
    return statusMap[status.toLowerCase()] || 'status-pendente';
  }

  getStatusTexto(status: string): string {
    const statusMap: any = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatarPreco(preco: number | string): string {
    const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
    if (isNaN(valor)) return 'R$ 0,00';
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }

  podeAvaliar(agendamento: Agendamento): boolean {
    return agendamento.status.toLowerCase() === 'concluido' && !agendamento.avaliacao;
  }

  podeCancelar(agendamento: Agendamento): boolean {
    const status = agendamento.status.toLowerCase();
    return status === 'pendente' || status === 'confirmado';
  }

  podeRemarcar(agendamento: Agendamento): boolean {
    const status = agendamento.status.toLowerCase();
    return status === 'pendente' || status === 'confirmado';
  }

  abrirModalAvaliacao(agendamento: Agendamento) {
    this.agendamentoParaAvaliar = agendamento;
    this.notaAvaliacao = 0;
    this.comentarioAvaliacao = '';
    this.mostrarModalAvaliacao = true;
  }

  fecharModalAvaliacao() {
    this.mostrarModalAvaliacao = false;
    this.agendamentoParaAvaliar = null;
    this.notaAvaliacao = 0;
    this.comentarioAvaliacao = '';
  }

  selecionarNota(nota: number) {
    this.notaAvaliacao = nota;
  }

  enviarAvaliacao() {
    if (!this.agendamentoParaAvaliar || this.notaAvaliacao === 0) {
      alert('Por favor, selecione uma nota');
      return;
    }

    const avaliacao = {
      nota: this.notaAvaliacao,
      comentario: this.comentarioAvaliacao
    };

    this.http.put(`${environment.apiUrl}/agendamentos-cliente/${this.agendamentoParaAvaliar.id}/avaliar`, avaliacao)
      .subscribe({
        next: () => {
          this.fecharModalAvaliacao();
          alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
          this.carregarAgendamentos();
        },
        error: (error) => {
          console.error('Erro ao enviar avaliação:', error);
          alert('Erro ao enviar avaliação. Tente novamente.');
        }
      });
  }

  abrirModalCancelar(agendamento: Agendamento) {
    this.agendamentoParaCancelar = agendamento;
    this.mostrarModalCancelar = true;
  }

  fecharModalCancelar() {
    this.mostrarModalCancelar = false;
    this.agendamentoParaCancelar = null;
  }

  confirmarCancelamento() {
    if (!this.agendamentoParaCancelar) return;

    this.http.delete(`${environment.apiUrl}/agendamentos-cliente/${this.agendamentoParaCancelar.id}`)
      .subscribe({
        next: () => {
          this.fecharModalCancelar();
          alert('Agendamento cancelado com sucesso!');
          this.carregarAgendamentos();
        },
        error: (error) => {
          console.error('Erro ao cancelar:', error);
          alert('Erro ao cancelar agendamento. Tente novamente.');
        }
      });
  }

  remarcarAgendamento(agendamento: Agendamento) {
    // Redirecionar para detalhes da barbearia com o serviço pré-selecionado
    this.router.navigate(['/cliente/barbearia', agendamento.unidade_id], {
      queryParams: {
        servicoId: agendamento.servico_id,
        funcionarioId: agendamento.funcionario_id,
        remarcar: true
      }
    });
  }

  novoAgendamento() {
    this.router.navigate(['/cliente']);
  }
}
