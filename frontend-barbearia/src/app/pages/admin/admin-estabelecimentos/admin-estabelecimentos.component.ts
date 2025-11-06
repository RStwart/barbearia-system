import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

interface Unidade {
  id_unidade: number;
  nome: string;
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
  data_cadastro: string;
  ativo: boolean;
  status_pagamento: 'pago' | 'atrasado' | 'bloqueado';
  status_avaliacao: 'aprovado' | 'aguardando' | 'negado';
}

interface UnidadeForm {
  id_unidade?: number;
  nome: string;
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
  ativo: boolean;
  status_pagamento: 'pago' | 'atrasado' | 'bloqueado';
  status_avaliacao: 'aprovado' | 'aguardando' | 'negado';
}

@Component({
  selector: 'app-admin-estabelecimentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-estabelecimentos.component.html',
  styleUrls: ['./admin-estabelecimentos.component.css']
})
export class AdminEstabelecimentosComponent implements OnInit {
  // Fazer Math disponível no template
  Math = Math;
  
  // Dados dos cards
  stats = {
    totalUnidades: 0,
    unidadesAtivas: 0,
    novasUnidades: 0
  };

  // Controle da tabela
  unidades: Unidade[] = [];
  unidadesFiltradas: Unidade[] = [];
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 0;
  carregando = false;

  // Filtros
  filtros = {
    nome: '',
    id_unidade: '',
    status_avaliacao: ''
  };

  // Modal/Formulário
  mostrarModal = false;
  editando = false;
  unidadeForm: UnidadeForm = {
    nome: '',
    responsavel: '',
    cnpj: '',
    cpf: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    horario_funcionamento: '',
    horario_abertura: '',
    horario_fechamento: '',
    latitude: undefined,
    longitude: undefined,
    ativo: true,
    status_pagamento: 'bloqueado',
    status_avaliacao: 'aguardando'
  };

  // Lista de estados brasileiros
  estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

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
    this.carregando = true;
    this.http.get<any>(`${environment.apiUrl}/admin/unidades`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.unidades = response.unidades || [];
          this.aplicarFiltros();
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao carregar unidades:', error);
          this.carregando = false;
        }
      });
  }

  carregarEstatisticas() {
    this.http.get<any>(`${environment.apiUrl}/admin/unidades/estatisticas`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          if (response.success && response.estatisticas) {
            this.stats = {
              totalUnidades: response.estatisticas.totalUnidades,
              unidadesAtivas: response.estatisticas.unidadesAtivas,
              novasUnidades: response.estatisticas.novasUnidades
            };
          }
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas:', error);
          // Manter valores padrão em caso de erro
          this.stats = {
            totalUnidades: this.unidades.length,
            unidadesAtivas: this.unidades.filter(u => u.ativo).length,
            novasUnidades: this.unidades.filter(u => {
              const cadastro = new Date(u.data_cadastro);
              const hoje = new Date();
              const diffTime = Math.abs(hoje.getTime() - cadastro.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 30;
            }).length
          };
        }
      });
  }

  aplicarFiltros() {
    this.unidadesFiltradas = this.unidades.filter(unidade => {
      const nomeMatch = !this.filtros.nome || 
        unidade.nome.toLowerCase().includes(this.filtros.nome.toLowerCase());
      
      const idMatch = !this.filtros.id_unidade || 
        unidade.id_unidade.toString().includes(this.filtros.id_unidade);
      
      const statusAvaliacaoMatch = !this.filtros.status_avaliacao || 
        unidade.status_avaliacao === this.filtros.status_avaliacao;
      
      return nomeMatch && idMatch && statusAvaliacaoMatch;
    });

    this.calcularPaginacao();
  }

  calcularPaginacao() {
    this.totalPaginas = Math.ceil(this.unidadesFiltradas.length / this.itensPorPagina);
    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = 1;
    }
  }

  get unidadesPaginadas(): Unidade[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.unidadesFiltradas.slice(inicio, fim);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  novaUnidade() {
    this.editando = false;
    this.unidadeForm = {
      nome: '',
      responsavel: '',
      cnpj: '',
      cpf: '',
      telefone: '',
      email: '',
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: '',
      horario_funcionamento: '',
      horario_abertura: '',
      horario_fechamento: '',
      latitude: undefined,
      longitude: undefined,
      ativo: true,
      status_pagamento: 'bloqueado',
      status_avaliacao: 'aguardando'
    };
    this.mostrarModal = true;
  }

  editarUnidade(unidade: Unidade) {
    this.editando = true;
    this.unidadeForm = {
      id_unidade: unidade.id_unidade,
      nome: unidade.nome,
      responsavel: unidade.responsavel,
      cnpj: unidade.cnpj,
      cpf: unidade.cpf,
      telefone: unidade.telefone,
      email: unidade.email,
      cep: unidade.cep,
      endereco: unidade.endereco,
      numero: unidade.numero,
      bairro: unidade.bairro,
      cidade: unidade.cidade,
      estado: unidade.estado,
      complemento: unidade.complemento,
      horario_funcionamento: unidade.horario_funcionamento,
      horario_abertura: unidade.horario_abertura,
      horario_fechamento: unidade.horario_fechamento,
      latitude: unidade.latitude,
      longitude: unidade.longitude,
      ativo: unidade.ativo,
      status_pagamento: unidade.status_pagamento,
      status_avaliacao: unidade.status_avaliacao
    };
    this.mostrarModal = true;
  }

  salvarUnidade() {
    const url = this.editando 
      ? `${environment.apiUrl}/admin/unidades/${this.unidadeForm.id_unidade}`
      : `${environment.apiUrl}/admin/unidades`;
    
    const method = this.editando ? 'PUT' : 'POST';
    
    const dados = { ...this.unidadeForm };

    const request = this.editando 
      ? this.http.put(url, dados, { headers: this.getHeaders() })
      : this.http.post(url, dados, { headers: this.getHeaders() });

    request.subscribe({
      next: (response) => {
        console.log('Unidade salva com sucesso!');
        this.fecharModal();
        this.carregarUnidades();
      },
      error: (error) => {
        console.error('Erro ao salvar unidade:', error);
        alert('Erro ao salvar unidade. Verifique os dados e tente novamente.');
      }
    });
  }

  excluirUnidade(unidade: Unidade) {
    if (confirm(`Tem certeza que deseja excluir a unidade ${unidade.nome}?`)) {
      this.http.delete(`${environment.apiUrl}/admin/unidades/${unidade.id_unidade}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            console.log('Unidade excluída com sucesso!');
            this.carregarUnidades();
          },
          error: (error) => {
            console.error('Erro ao excluir unidade:', error);
            alert('Erro ao excluir unidade.');
          }
        });
    }
  }

  alternarStatus(unidade: Unidade) {
    const novoStatus = !unidade.ativo;
    this.http.patch(`${environment.apiUrl}/admin/unidades/${unidade.id_unidade}/status`, 
      { ativo: novoStatus }, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        unidade.ativo = novoStatus;
        console.log(`Status da unidade ${unidade.nome} alterado para ${novoStatus ? 'ativo' : 'inativo'}`);
      },
      error: (error) => {
        console.error('Erro ao alterar status:', error);
        alert('Erro ao alterar status da unidade.');
      }
    });
  }

  alternarStatusPagamento(unidade: Unidade) {
    // Ciclo: bloqueado -> atrasado -> pago -> bloqueado
    const statusCiclo: Record<string, 'pago' | 'atrasado' | 'bloqueado'> = {
      'bloqueado': 'atrasado',
      'atrasado': 'pago',
      'pago': 'bloqueado'
    };
    
    const novoStatus = statusCiclo[unidade.status_pagamento];
    
    this.http.patch(`${environment.apiUrl}/admin/unidades/${unidade.id_unidade}/status-pagamento`, 
      { status_pagamento: novoStatus }, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        unidade.status_pagamento = novoStatus;
        console.log(`Status de pagamento da unidade ${unidade.nome} alterado para ${novoStatus}`);
      },
      error: (error) => {
        console.error('Erro ao alterar status de pagamento:', error);
        alert('Erro ao alterar status de pagamento da unidade.');
      }
    });
  }

  getStatusPagamentoClass(status: string): string {
    switch(status) {
      case 'pago': return 'status-pago';
      case 'atrasado': return 'status-atrasado';
      case 'bloqueado': return 'status-bloqueado';
      default: return 'status-bloqueado';
    }
  }

  getStatusPagamentoLabel(status: string): string {
    switch(status) {
      case 'pago': return '✓ Pago';
      case 'atrasado': return '⚠ Atrasado';
      case 'bloqueado': return '✕ Bloqueado';
      default: return '✕ Bloqueado';
    }
  }

  alternarStatusAvaliacao(unidade: Unidade) {
    // Ciclo: aguardando -> aprovado -> negado -> aguardando
    const statusCiclo: Record<string, 'aprovado' | 'aguardando' | 'negado'> = {
      'aguardando': 'aprovado',
      'aprovado': 'negado',
      'negado': 'aguardando'
    };
    
    const novoStatus = statusCiclo[unidade.status_avaliacao];
    
    this.http.patch(`${environment.apiUrl}/admin/unidades/${unidade.id_unidade}/status-avaliacao`, 
      { status_avaliacao: novoStatus }, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        unidade.status_avaliacao = novoStatus;
        console.log(`Status de avaliação da unidade ${unidade.nome} alterado para ${novoStatus}`);
      },
      error: (error) => {
        console.error('Erro ao alterar status de avaliação:', error);
        alert('Erro ao alterar status de avaliação da unidade.');
      }
    });
  }

  getStatusAvaliacaoClass(status: string): string {
    switch(status) {
      case 'aprovado': return 'status-aprovado';
      case 'aguardando': return 'status-aguardando';
      case 'negado': return 'status-negado';
      default: return 'status-aguardando';
    }
  }

  getStatusAvaliacaoLabel(status: string): string {
    switch(status) {
      case 'aprovado': return '✓ Aprovado';
      case 'aguardando': return '⏱ Aguardando';
      case 'negado': return '✕ Negado';
      default: return '⏱ Aguardando';
    }
  }

  fecharModal() {
    this.mostrarModal = false;
    this.unidadeForm = {
      nome: '',
      responsavel: '',
      cnpj: '',
      cpf: '',
      telefone: '',
      email: '',
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: '',
      horario_funcionamento: '',
      horario_abertura: '',
      horario_fechamento: '',
      latitude: undefined,
      longitude: undefined,
      ativo: true,
      status_pagamento: 'bloqueado',
      status_avaliacao: 'aguardando'
    };
  }

  limparFiltros() {
    this.filtros = {
      nome: '',
      id_unidade: '',
      status_avaliacao: ''
    };
    this.aplicarFiltros();
  }

  // Método auxiliar para formatar CNPJ
  formatarCNPJ(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
      this.unidadeForm.cnpj = value;
    }
  }

  // Método auxiliar para formatar CPF
  formatarCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.unidadeForm.cpf = value;
    }
  }

  // Método auxiliar para formatar telefone
  formatarTelefone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
      this.unidadeForm.telefone = value;
    }
  }

  // Método auxiliar para formatar CEP
  formatarCEP(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      this.unidadeForm.cep = value;
    }
  }
}