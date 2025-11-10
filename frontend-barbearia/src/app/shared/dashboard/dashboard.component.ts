import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, Estatisticas, Venda } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Estatísticas
  estatisticas: Estatisticas | null = null;
  carregandoEstatisticas = false;

  // Vendas
  vendas: Venda[] = [];
  vendasFiltradas: Venda[] = [];
  carregandoVendas = false;

  // Filtros
  filtroStatusNF: string = 'TODOS';
  filtroTipoVenda: string = 'TODOS';
  filtroPeriodo: string = 'TODOS';
  termoBusca: string = '';

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;

  // Modal
  mostrarModalNF = false;
  vendaSelecionada: Venda | null = null;
  notaFiscal = '';
  statusNF = 'EMITIDA';

  // Mensagens
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.carregarEstatisticas();
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

    // Filtro por status de NF
    if (this.filtroStatusNF !== 'TODOS') {
      resultado = resultado.filter(v => v.status_nf === this.filtroStatusNF);
    }

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
        v.nota_fiscal?.toLowerCase().includes(termo) ||
        v.observacoes?.toLowerCase().includes(termo)
      );
    }

    this.vendasFiltradas = resultado;
    this.paginaAtual = 1;
  }

  limparFiltros() {
    this.filtroStatusNF = 'TODOS';
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

  abrirModalNF(venda: Venda) {
    this.vendaSelecionada = venda;
    this.notaFiscal = venda.nota_fiscal || '';
    this.statusNF = venda.status_nf === 'AGUARDANDO_AJUSTE' ? 'EMITIDA' : venda.status_nf;
    this.mostrarModalNF = true;
  }

  salvarNotaFiscal() {
    if (!this.vendaSelecionada) return;

    if (!this.notaFiscal.trim()) {
      this.exibirMensagem('Informe o número da nota fiscal', 'erro');
      return;
    }

    this.dashboardService.atualizarNotaFiscal(
      this.vendaSelecionada.id!,
      this.notaFiscal,
      this.statusNF
    ).subscribe({
      next: () => {
        this.exibirMensagem('Nota fiscal atualizada com sucesso!', 'sucesso');
        this.fecharModalNF();
        this.carregarVendas();
        this.carregarEstatisticas();
      },
      error: (err) => {
        console.error('Erro ao atualizar nota fiscal:', err);
        this.exibirMensagem('Erro ao atualizar nota fiscal', 'erro');
      }
    });
  }

  fecharModalNF() {
    this.mostrarModalNF = false;
    this.vendaSelecionada = null;
    this.notaFiscal = '';
    this.statusNF = 'EMITIDA';
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

  getStatusNFClass(status: string): string {
    switch (status) {
      case 'AGUARDANDO_AJUSTE': return 'badge-warning';
      case 'EMITIDA': return 'badge-success';
      case 'NAO_NECESSARIA': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusNFTexto(status: string): string {
    switch (status) {
      case 'AGUARDANDO_AJUSTE': return 'Aguardando Ajuste';
      case 'EMITIDA': return 'NF Emitida';
      case 'NAO_NECESSARIA': return 'Não Necessária';
      default: return status;
    }
  }

  getTipoVendaClass(tipo: string): string {
    switch (tipo) {
      case 'SERVICO': return 'tipo-servico';
      case 'PRODUTO': return 'tipo-produto';
      case 'MISTO': return 'tipo-misto';
      default: return '';
    }
  }

  exibirMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 4000);
  }
}

