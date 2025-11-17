import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, Estatisticas, Venda } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Tipo de usuário
  isFuncionario = false;
  
  // Estatísticas
  estatisticas: Estatisticas | null = null;
  carregandoEstatisticas = false;

  // Vendas
  vendas: Venda[] = [];
  vendasFiltradas: Venda[] = [];
  carregandoVendas = false;

  // Filtros
  filtroTipoVenda: string = 'TODOS';
  filtroPeriodo: string = 'TODOS';
  termoBusca: string = '';

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;

  // Mensagens
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  // Modal de detalhes
  mostrarModal = false;
  vendaSelecionada: Venda | null = null;
  carregandoDetalhes = false;

  // Modal de edição
  mostrarModalEdicao = false;
  vendaEdicao: any = {};
  salvandoEdicao = false;

  // Modal de confirmação de exclusão
  mostrarModalExclusao = false;
  vendaExclusao: Venda | null = null;
  excluindo = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar se é funcionário
    const user = this.authService.getUserFromToken();
    this.isFuncionario = user?.tipo === 'FUNCIONARIO';
    
    // Funcionários não carregam estatísticas
    if (!this.isFuncionario) {
      this.carregarEstatisticas();
    }
    
    this.carregarVendas();
  }

  carregarEstatisticas() {
    this.carregandoEstatisticas = true;
    this.dashboardService.obterEstatisticas().subscribe({
      next: (data) => {
        this.estatisticas = data;
        this.carregandoEstatisticas = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.exibirMensagem('Erro ao carregar estatísticas', 'erro');
        this.carregandoEstatisticas = false;
      }
    });
  }

  carregarVendas() {
    this.carregandoVendas = true;
    this.dashboardService.listarVendas().subscribe({
      next: (response) => {
        this.vendas = response.vendas;
        this.aplicarFiltros();
        this.carregandoVendas = false;
      },
      error: (err) => {
        console.error('Erro ao carregar vendas:', err);
        this.exibirMensagem('Erro ao carregar vendas', 'erro');
        this.carregandoVendas = false;
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.vendas];

    // Filtro por tipo de venda
    if (this.filtroTipoVenda !== 'TODOS') {
      resultado = resultado.filter(v => v.tipo_venda === this.filtroTipoVenda);
    }

    // Filtro por período
    if (this.filtroPeriodo !== 'TODOS') {
      const hoje = new Date();
      resultado = resultado.filter(v => {
        const dataVenda = new Date(v.criado_em!);
        switch (this.filtroPeriodo) {
          case 'HOJE':
            return dataVenda.toDateString() === hoje.toDateString();
          case 'SEMANA':
            const semanaAtras = new Date(hoje);
            semanaAtras.setDate(hoje.getDate() - 7);
            return dataVenda >= semanaAtras;
          case 'MES':
            return dataVenda.getMonth() === hoje.getMonth() && 
                   dataVenda.getFullYear() === hoje.getFullYear();
          default:
            return true;
        }
      });
    }

    // Busca por termo
    if (this.termoBusca) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(v =>
        v.funcionario_nome?.toLowerCase().includes(termo) ||
        v.cliente_nome?.toLowerCase().includes(termo) ||
        v.observacoes?.toLowerCase().includes(termo)
      );
    }

    this.vendasFiltradas = resultado;
    this.paginaAtual = 1;
  }

  limparFiltros() {
    this.filtroTipoVenda = 'TODOS';
    this.filtroPeriodo = 'TODOS';
    this.termoBusca = '';
    this.aplicarFiltros();
  }

  get vendasPaginadas(): Venda[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.vendasFiltradas.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.ceil(this.vendasFiltradas.length / this.itensPorPagina);
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  formatarPreco(valor: number | string): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return 'R$ 0,00';
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }

  getTipoVendaClass(tipo: string): string {
    switch (tipo) {
      case 'SERVICO': return 'tipo-servico';
      case 'PRODUTO': return 'tipo-produto';
      case 'MISTO': return 'tipo-misto';
      default: return '';
    }
  }

  visualizarDetalhes(venda: Venda): void {
    this.carregandoDetalhes = true;
    this.mostrarModal = true;
    
    // Buscar detalhes completos da venda
    this.dashboardService.buscarVendaPorId(venda.id!).subscribe({
      next: (vendaCompleta) => {
        this.vendaSelecionada = vendaCompleta;
        this.carregandoDetalhes = false;
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes da venda:', err);
        this.exibirMensagem('Erro ao carregar detalhes da venda', 'erro');
        this.carregandoDetalhes = false;
        this.fecharModal();
      }
    });
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.vendaSelecionada = null;
  }

  getStatusPagamentoClass(status: string): string {
    switch (status) {
      case 'PAGO': return 'status-pago';
      case 'AGUARDANDO': return 'status-aguardando';
      case 'CANCELADO': return 'status-cancelado';
      default: return '';
    }
  }

  getStatusNFClass(status: string): string {
    switch (status) {
      case 'EMITIDA': return 'status-emitida';
      case 'AGUARDANDO_AJUSTE': return 'status-aguardando-ajuste';
      case 'NAO_NECESSARIA': return 'status-nao-necessaria';
      default: return '';
    }
  }

  editarVenda(venda: Venda): void {
    this.vendaEdicao = {
      id: venda.id,
      forma_pagamento: venda.forma_pagamento,
      status_pagamento: venda.status_pagamento,
      observacoes: venda.observacoes || ''
    };
    this.mostrarModalEdicao = true;
  }

  salvarEdicao(): void {
    if (!this.vendaEdicao.id) return;

    this.salvandoEdicao = true;
    this.dashboardService.atualizarVenda(this.vendaEdicao.id, {
      forma_pagamento: this.vendaEdicao.forma_pagamento,
      status_pagamento: this.vendaEdicao.status_pagamento,
      observacoes: this.vendaEdicao.observacoes
    }).subscribe({
      next: () => {
        this.exibirMensagem('Venda atualizada com sucesso!', 'sucesso');
        this.fecharModalEdicao();
        this.carregarVendas();
      },
      error: (err) => {
        console.error('Erro ao atualizar venda:', err);
        this.exibirMensagem('Erro ao atualizar venda', 'erro');
        this.salvandoEdicao = false;
      }
    });
  }

  fecharModalEdicao(): void {
    this.mostrarModalEdicao = false;
    this.vendaEdicao = {};
    this.salvandoEdicao = false;
  }

  confirmarExclusao(venda: Venda): void {
    this.vendaExclusao = venda;
    this.mostrarModalExclusao = true;
  }

  excluirVenda(): void {
    if (!this.vendaExclusao?.id) return;

    this.excluindo = true;
    this.dashboardService.excluirVenda(this.vendaExclusao.id).subscribe({
      next: () => {
        this.exibirMensagem('Venda excluída com sucesso!', 'sucesso');
        this.fecharModalExclusao();
        this.carregarVendas();
      },
      error: (err) => {
        console.error('Erro ao excluir venda:', err);
        this.exibirMensagem('Erro ao excluir venda', 'erro');
        this.excluindo = false;
      }
    });
  }

  fecharModalExclusao(): void {
    this.mostrarModalExclusao = false;
    this.vendaExclusao = null;
    this.excluindo = false;
  }

  exibirMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 4000);
  }
}

