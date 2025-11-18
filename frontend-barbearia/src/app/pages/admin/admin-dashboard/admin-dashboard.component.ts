import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

interface EstatisticasAdmin {
  totalUsuarios: number;
  usuariosAtivos: number;
  estabelecimentos: number;
  novosCadastros: number;
  usuariosPorTipo: { tipo: string; quantidade: number; }[];
  agendamentosHoje: number;
  agendamentosPorStatus: { status: string; quantidade: number; }[];
  vendasMes: { total_vendas: number; valor_total: number; };
  vendasHoje: { total_vendas: number; valor_total: number; };
  unidadesAtivas: { nome: string; total_agendamentos: number; receita_mes: number; }[];
  servicosMaisVendidos: { servico_nome: string; total_vendido: number; }[];
  crescimentoMensal: { mes: string; total_vendas: number; receita: number; }[];
}

interface Unidade {
  id_unidade: number;
  nome: string;
  endereco?: string;
  telefone?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  estatisticas: EstatisticasAdmin | null = null;
  carregando = false;
  
  // Unidades
  unidades: Unidade[] = [];
  unidadeSelecionada: number | null = null;
  carregandoUnidades = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarUnidades();
    this.carregarEstatisticas();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  carregarUnidades() {
    this.carregandoUnidades = true;
    this.http.get<any>(`${environment.apiUrl}/unidades`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.unidades = (response.unidades || []).filter((u: Unidade) => u.ativo);
          // Selecionar automaticamente a primeira unidade
          if (this.unidades.length > 0 && !this.unidadeSelecionada) {
            this.unidadeSelecionada = this.unidades[0].id_unidade;
          }
          this.carregandoUnidades = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar unidades:', error);
          this.carregandoUnidades = false;
        }
      });
  }

  selecionarUnidade() {
    console.log('🏪 Unidade selecionada:', this.unidadeSelecionada);
    this.carregarEstatisticas();
  }

  carregarEstatisticas() {
    this.carregando = true;
    console.log('🔄 Carregando estatísticas do dashboard ADM...');
    
    // Adicionar parâmetro de unidade se houver uma selecionada
    const params = this.unidadeSelecionada 
      ? `?unidade_id=${this.unidadeSelecionada}` 
      : '';
    
    this.http.get<any>(`${environment.apiUrl}/admin/estatisticas${params}`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✅ Resposta recebida:', response);
          if (response.success && response.estatisticas) {
            this.estatisticas = response.estatisticas;
            console.log('📊 Estatísticas carregadas:', this.estatisticas);
          } else {
            console.warn('⚠️ Resposta sem estatísticas:', response);
          }
          this.carregando = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar estatísticas:', error);
          console.error('Status:', error.status);
          console.error('Mensagem:', error.message);
          console.error('Erro completo:', error);
          this.carregando = false;
        }
      });
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  }

  formatarMes(mesAno: string): string {
    const [ano, mes] = mesAno.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  }

  getTipoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'CLIENTE': 'Clientes',
      'FUNCIONARIO': 'Funcionários',
      'GERENTE': 'Gerentes',
      'ADM': 'Administradores'
    };
    return labels[tipo] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'CLIENTE': '👤',
      'FUNCIONARIO': '👨‍💼',
      'GERENTE': '👔',
      'ADM': '👑'
    };
    return icons[tipo] || '👤';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pendente': 'Pendentes',
      'confirmado': 'Confirmados',
      'concluido': 'Concluídos',
      'cancelado': 'Cancelados'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pendente': '⏳',
      'confirmado': '✅',
      'concluido': '🎉',
      'cancelado': '❌'
    };
    return icons[status] || '📋';
  }
}