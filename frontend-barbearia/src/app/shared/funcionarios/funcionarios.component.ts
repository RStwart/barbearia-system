import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuncionariosService, Funcionario } from '../../services/funcionarios.service';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.css']
})
export class FuncionariosComponent implements OnInit {
  Math = Math; // Expor Math para o template
  
  funcionarios: Funcionario[] = [];
  funcionariosFiltrados: Funcionario[] = [];
  carregando = false;
  erro = '';
  sucesso = '';

  // Modais
  mostrarModalForm = false;
  mostrarModalExcluir = false;
  editando = false;

  // Formulário
  formulario: Partial<Funcionario> = {
    nome: '',
    email: '',
    telefone: '',
    foto_perfil: '',
    ativo: true
  };

  funcionarioSelecionado: Funcionario | null = null;

  // Filtros e busca
  termoBusca = '';

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;

  constructor(private funcionariosService: FuncionariosService) {}

  ngOnInit() {
    this.carregarFuncionarios();
  }

  carregarFuncionarios() {
    this.carregando = true;
    this.erro = '';

    this.funcionariosService.listar().subscribe({
      next: (response) => {
        this.funcionarios = response.funcionarios;
        this.aplicarFiltros();
        this.carregando = false;
        console.log('Funcionários carregados:', this.funcionarios);
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários:', error);
        this.erro = error.error?.error || 'Erro ao carregar funcionários';
        this.carregando = false;
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.funcionarios];

    // Filtro de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(f => 
        f.nome.toLowerCase().includes(termo) ||
        f.email.toLowerCase().includes(termo) ||
        (f.telefone && f.telefone.includes(termo))
      );
    }

    this.funcionariosFiltrados = resultado;
  }

  get funcionariosPaginados(): Funcionario[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.funcionariosFiltrados.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.ceil(this.funcionariosFiltrados.length / this.itensPorPagina);
  }

  get paginasVisiveis(): number[] {
    const total = this.totalPaginas;
    const atual = this.paginaAtual;
    const paginas: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      if (atual <= 4) {
        for (let i = 1; i <= 5; i++) paginas.push(i);
        paginas.push(-1); // Ellipsis
        paginas.push(total);
      } else if (atual >= total - 3) {
        paginas.push(1);
        paginas.push(-1);
        for (let i = total - 4; i <= total; i++) paginas.push(i);
      } else {
        paginas.push(1);
        paginas.push(-1);
        for (let i = atual - 1; i <= atual + 1; i++) paginas.push(i);
        paginas.push(-1);
        paginas.push(total);
      }
    }

    return paginas;
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  abrirModalNovo() {
    this.editando = false;
    this.formulario = {
      nome: '',
      email: '',
      telefone: '',
      foto_perfil: '',
      ativo: true
    };
    this.mostrarModalForm = true;
    this.erro = '';
    this.sucesso = '';
  }

  abrirModalEditar(funcionario: Funcionario) {
    this.editando = true;
    this.funcionarioSelecionado = funcionario;
    this.formulario = {
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: this.formatarTelefoneExibicao(funcionario.telefone),
      foto_perfil: funcionario.foto_perfil,
      ativo: funcionario.ativo
    };
    this.mostrarModalForm = true;
    this.erro = '';
    this.sucesso = '';
  }

  salvarFuncionario() {
    if (!this.formulario.nome || !this.formulario.email) {
      this.erro = 'Preencha todos os campos obrigatórios';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.sucesso = '';

    // Remover formatação do telefone antes de enviar
    const dadosEnvio = {
      ...this.formulario,
      telefone: this.formulario.telefone ? this.formulario.telefone.replace(/\D/g, '') : ''
    };

    const operacao = this.editando
      ? this.funcionariosService.atualizar(this.funcionarioSelecionado!.id!, dadosEnvio)
      : this.funcionariosService.criar(dadosEnvio);

    operacao.subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalForm = false;
        this.carregarFuncionarios();

        // Se for criação, mostrar a senha padrão
        if (!this.editando && response.info) {
          alert(response.message + '\n\n' + response.info);
        }
      },
      error: (error) => {
        console.error('Erro ao salvar funcionário:', error);
        this.erro = error.error?.error || 'Erro ao salvar funcionário';
        this.carregando = false;
      }
    });
  }

  confirmarExclusao(funcionario: Funcionario) {
    this.funcionarioSelecionado = funcionario;
    this.mostrarModalExcluir = true;
    this.erro = '';
  }

  excluirFuncionario() {
    if (!this.funcionarioSelecionado) return;

    this.carregando = true;
    this.erro = '';

    this.funcionariosService.excluir(this.funcionarioSelecionado.id!).subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalExcluir = false;
        this.carregarFuncionarios();
      },
      error: (error) => {
        console.error('Erro ao excluir funcionário:', error);
        this.erro = error.error?.error || 'Erro ao excluir funcionário';
        this.carregando = false;
      }
    });
  }

  alternarStatus(funcionario: Funcionario) {
    this.funcionariosService.alternarStatus(funcionario.id!).subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregarFuncionarios();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao alternar status:', error);
        this.erro = error.error?.error || 'Erro ao alternar status';
        setTimeout(() => this.erro = '', 3000);
      }
    });
  }

  resetarSenha(funcionario: Funcionario) {
    if (!confirm(`Resetar senha de ${funcionario.nome}?\n\nA senha será alterada para: Funcionario123`)) {
      return;
    }

    this.funcionariosService.resetarSenha(funcionario.id!).subscribe({
      next: (response) => {
        alert(response.message + '\n\n' + response.info);
        this.carregarFuncionarios();
      },
      error: (error) => {
        console.error('Erro ao resetar senha:', error);
        this.erro = error.error?.error || 'Erro ao resetar senha';
        setTimeout(() => this.erro = '', 3000);
      }
    });
  }

  fecharModais() {
    this.mostrarModalForm = false;
    this.mostrarModalExcluir = false;
    this.erro = '';
    this.sucesso = '';
  }

  limparFiltros() {
    this.termoBusca = '';
    this.aplicarFiltros();
    this.paginaAtual = 1;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatarTelefoneInput() {
    if (!this.formulario.telefone) return;
    
    let valor = this.formulario.telefone.replace(/\D/g, '');
    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
    this.formulario.telefone = valor;
  }

  formatarTelefoneExibicao(telefone: string | undefined): string {
    if (!telefone) return '-';
    
    const numero = telefone.replace(/\D/g, '');
    if (numero.length === 0) return '-';
    
    if (numero.length <= 10) {
      return numero.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      return numero.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
  }
}
