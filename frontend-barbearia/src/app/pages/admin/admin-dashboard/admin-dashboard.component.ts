import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  foto_perfil?: string;
  tipo: 'CLIENTE' | 'FUNCIONARIO' | 'GERENTE' | 'ADM';
  unidade_id?: number;
  ativo: boolean;
  criado_em: string;
  primeiro_acesso: boolean;
}

interface UsuarioForm {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  telefone?: string;
  foto_perfil?: string;
  tipo: 'CLIENTE' | 'FUNCIONARIO' | 'GERENTE' | 'ADM';
  unidade_id?: number;
  ativo: boolean;
  primeiro_acesso: boolean;
}

interface Unidade {
  id_unidade: number;
  nome: string;
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
  // Fazer Math disponível no template
  Math = Math;
  
  // Dados dos cards
  stats = {
    totalUsuarios: 0,
    usuariosAtivos: 0,
    estabelecimentos: 0
  };

  // Controle da tabela
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 0;
  carregando = false;

  // Filtros
  filtros = {
    nome: '',
    id: '',
    unidade_id: ''
  };

  // Modal/Formulário
  mostrarModal = false;
  editando = false;
  usuarioForm: UsuarioForm = {
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    foto_perfil: '',
    tipo: 'CLIENTE',
    unidade_id: undefined,
    ativo: true,
    primeiro_acesso: true
  };

  // Lista de unidades para o select
  unidades: Unidade[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarEstatisticas();
    this.carregarUnidades();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  carregarUsuarios() {
    this.carregando = true;
    this.http.get<any>(`${environment.apiUrl}/admin/usuarios`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.usuarios = response.usuarios || [];
          this.aplicarFiltros();
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);
          this.carregando = false;
        }
      });
  }

  carregarEstatisticas() {
    this.http.get<any>(`${environment.apiUrl}/admin/estatisticas`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          if (response.success && response.estatisticas) {
            this.stats = {
              totalUsuarios: response.estatisticas.totalUsuarios,
              usuariosAtivos: response.estatisticas.usuariosAtivos,
              estabelecimentos: response.estatisticas.estabelecimentos
            };
          }
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas:', error);
          // Manter valores padrão em caso de erro
          this.stats = {
            totalUsuarios: this.usuarios.length,
            usuariosAtivos: this.usuarios.filter(u => u.ativo).length,
            estabelecimentos: 0 // Será carregado da API de unidades
          };
        }
      });
  }

  carregarUnidades() {
    this.http.get<any>(`${environment.apiUrl}/unidades`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          // Filtrar apenas unidades ativas
          this.unidades = (response.unidades || []).filter((u: Unidade) => u.ativo);
        },
        error: (error) => {
          console.error('Erro ao carregar unidades:', error);
          this.unidades = [];
        }
      });
  }

  aplicarFiltros() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nomeMatch = !this.filtros.nome || 
        usuario.nome.toLowerCase().includes(this.filtros.nome.toLowerCase());
      
      const idMatch = !this.filtros.id || 
        usuario.id.toString().includes(this.filtros.id);
      
      const unidadeMatch = !this.filtros.unidade_id || 
        (usuario.unidade_id && usuario.unidade_id.toString().includes(this.filtros.unidade_id));
      
      return nomeMatch && idMatch && unidadeMatch;
    });

    this.calcularPaginacao();
  }

  calcularPaginacao() {
    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itensPorPagina);
    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = 1;
    }
  }

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.usuariosFiltrados.slice(inicio, fim);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  novoUsuario() {
    this.editando = false;
    this.usuarioForm = {
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      foto_perfil: '',
      tipo: 'CLIENTE',
      unidade_id: undefined,
      ativo: true,
      primeiro_acesso: true
    };
    this.mostrarModal = true;
    // Recarregar unidades para garantir que está atualizado
    if (this.unidades.length === 0) {
      this.carregarUnidades();
    }
  }

  editarUsuario(usuario: Usuario) {
    this.editando = true;
    this.usuarioForm = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      foto_perfil: usuario.foto_perfil,
      tipo: usuario.tipo,
      unidade_id: usuario.unidade_id,
      ativo: usuario.ativo,
      primeiro_acesso: usuario.primeiro_acesso
    };
    this.mostrarModal = true;
  }

  salvarUsuario() {
    const url = this.editando 
      ? `${environment.apiUrl}/admin/usuarios/${this.usuarioForm.id}`
      : `${environment.apiUrl}/admin/usuarios`;
    
    const method = this.editando ? 'PUT' : 'POST';
    
    const dados = { ...this.usuarioForm };
    if (this.editando && !dados.senha) {
      delete dados.senha; // Não enviar senha vazia em edição
    }

    const request = this.editando 
      ? this.http.put(url, dados, { headers: this.getHeaders() })
      : this.http.post(url, dados, { headers: this.getHeaders() });

    request.subscribe({
      next: (response) => {
        console.log('Usuário salvo com sucesso!');
        this.fecharModal();
        this.carregarUsuarios();
      },
      error: (error) => {
        console.error('Erro ao salvar usuário:', error);
        alert('Erro ao salvar usuário. Verifique os dados e tente novamente.');
      }
    });
  }

  excluirUsuario(usuario: Usuario) {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      this.http.delete(`${environment.apiUrl}/admin/usuarios/${usuario.id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            console.log('Usuário excluído com sucesso!');
            this.carregarUsuarios();
          },
          error: (error) => {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário.');
          }
        });
    }
  }

  alternarStatus(usuario: Usuario) {
    const novoStatus = !usuario.ativo;
    this.http.patch(`${environment.apiUrl}/admin/usuarios/${usuario.id}/status`, 
      { ativo: novoStatus }, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        usuario.ativo = novoStatus;
        console.log(`Status do usuário ${usuario.nome} alterado para ${novoStatus ? 'ativo' : 'inativo'}`);
      },
      error: (error) => {
        console.error('Erro ao alterar status:', error);
        alert('Erro ao alterar status do usuário.');
      }
    });
  }

  fecharModal() {
    this.mostrarModal = false;
    this.usuarioForm = {
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      foto_perfil: '',
      tipo: 'CLIENTE',
      unidade_id: undefined,
      ativo: true,
      primeiro_acesso: true
    };
  }

  getTipoBadgeClass(tipo: string): string {
    switch(tipo) {
      case 'ADM': return 'badge-admin';
      case 'GERENTE': return 'badge-gerente';
      case 'FUNCIONARIO': return 'badge-funcionario';
      case 'CLIENTE': return 'badge-cliente';
      default: return 'badge-default';
    }
  }

  limparFiltros() {
    this.filtros = {
      nome: '',
      id: '',
      unidade_id: ''
    };
    this.aplicarFiltros();
  }
}