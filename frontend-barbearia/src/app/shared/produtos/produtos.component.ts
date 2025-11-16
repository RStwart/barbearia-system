import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutosService, Produto, Categoria } from '../../services/produtos.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent implements OnInit {
  Math = Math;
  
  // Controle de tabs
  abaAtiva: 'servicos' | 'categorias' = 'servicos';

  // Dados - Renomeado de produtos para servicos
  servicos: Produto[] = [];
  servicosFiltrados: Produto[] = [];
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];

  // Estados
  carregando = false;
  erro = '';
  sucesso = '';

  // Modais - Serviços
  mostrarModalServico = false;
  mostrarModalExcluirServico = false;
  editandoServico = false;
  servicoSelecionado: Produto | null = null;

  // Modais - Categorias
  mostrarModalCategoria = false;
  mostrarModalExcluirCategoria = false;
  editandoCategoria = false;
  categoriaSelecionada: Categoria | null = null;

  // Formulários
  formularioServico: Partial<Produto> = {
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 30,
    ativo: true
  };

  formularoCategoria: Partial<Categoria> = {
    nome: '',
    descricao: '',
    ativo: true
  };

  // Busca e filtros
  termoBuscaServico = '';
  termoBuscaCategoria = '';

  // Paginação - Produtos
  paginaAtualServicos = 1;
  itensPorPagina = 12;

  // Paginação - Categorias
  paginaAtualCategorias = 1;

  constructor(private produtosService: ProdutosService) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.carregarServicos();
    this.carregarCategorias();
  }

  // ==================== PRODUTOS ====================

  carregarServicos() {
    this.carregando = true;
    this.produtosService.listarProdutos().subscribe({
      next: (response) => {
        this.servicos = response.produtos;
        this.aplicarFiltrosServicos();
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.erro = error.error?.error || 'Erro ao carregar produtos';
        this.carregando = false;
      }
    });
  }

  aplicarFiltrosServicos() {
    let resultado = [...this.servicos];

    if (this.termoBuscaServico.trim()) {
      const termo = this.termoBuscaServico.toLowerCase();
      resultado = resultado.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        (p.descricao && p.descricao.toLowerCase().includes(termo))
      );
    }

    this.servicosFiltrados = resultado;
  }

  get servicosPaginados(): Produto[] {
    const inicio = (this.paginaAtualServicos - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.servicosFiltrados.slice(inicio, fim);
  }

  get totalPaginasServicos(): number {
    return Math.ceil(this.servicosFiltrados.length / this.itensPorPagina);
  }

  abrirModalNovoServico() {
    this.editandoServico = false;
    this.formularioServico = {
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 30,
      ativo: true
    };
    this.mostrarModalServico = true;
    this.erro = '';
  }

  abrirModalEditarServico(produto: Produto) {
    this.editandoServico = true;
    this.servicoSelecionado = produto;
    this.formularioServico = {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque || produto.duracao,
      ativo: produto.ativo
    };
    this.mostrarModalServico = true;
    this.erro = '';
  }

  salvarServico() {
    if (!this.formularioServico.nome || !this.formularioServico.preco) {
      this.erro = 'Nome e preço são obrigatórios';
      return;
    }

    this.carregando = true;
    this.erro = '';

    // Garantir que ativo seja booleano
    const dadosServico = {
      ...this.formularioServico,
      ativo: Boolean(this.formularioServico.ativo)
    };

    const operacao = this.editandoServico
      ? this.produtosService.atualizarProduto(this.servicoSelecionado!.id!, dadosServico)
      : this.produtosService.criarProduto(dadosServico);

    operacao.subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalServico = false;
        this.carregarServicos();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao salvar produto:', error);
        this.erro = error.error?.error || 'Erro ao salvar produto';
        this.carregando = false;
      }
    });
  }

  confirmarExclusaoServico(produto: Produto) {
    this.servicoSelecionado = produto;
    this.mostrarModalExcluirServico = true;
  }

  excluirProduto() {
    if (!this.servicoSelecionado) return;

    this.carregando = true;
    this.produtosService.excluirProduto(this.servicoSelecionado.id!).subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalExcluirServico = false;
        this.carregarServicos();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao excluir produto:', error);
        this.erro = error.error?.error || 'Erro ao excluir produto';
        this.carregando = false;
      }
    });
  }

  alternarStatusProduto(produto: Produto) {
    this.produtosService.alternarStatusProduto(produto.id!).subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregarServicos();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao alternar status:', error);
        this.erro = error.error?.error || 'Erro ao alternar status';
        setTimeout(() => this.erro = '', 3000);
      }
    });
  }

  // ==================== CATEGORIAS ====================

  carregarCategorias() {
    this.produtosService.listarCategorias().subscribe({
      next: (response) => {
        this.categorias = response.categorias;
        this.aplicarFiltrosCategorias();
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  aplicarFiltrosCategorias() {
    let resultado = [...this.categorias];

    if (this.termoBuscaCategoria.trim()) {
      const termo = this.termoBuscaCategoria.toLowerCase();
      resultado = resultado.filter(c =>
        c.nome.toLowerCase().includes(termo) ||
        (c.descricao && c.descricao.toLowerCase().includes(termo))
      );
    }

    this.categoriasFiltradas = resultado;
  }

  get categoriasPaginadas(): Categoria[] {
    const inicio = (this.paginaAtualCategorias - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.categoriasFiltradas.slice(inicio, fim);
  }

  get totalPaginasCategorias(): number {
    return Math.ceil(this.categoriasFiltradas.length / this.itensPorPagina);
  }

  abrirModalNovaCategoria() {
    this.editandoCategoria = false;
    this.formularoCategoria = {
      nome: '',
      descricao: '',
      ativo: true
    };
    this.mostrarModalCategoria = true;
    this.erro = '';
  }

  abrirModalEditarCategoria(categoria: Categoria) {
    this.editandoCategoria = true;
    this.categoriaSelecionada = categoria;
    this.formularoCategoria = {
      nome: categoria.nome,
      descricao: categoria.descricao,
      ativo: categoria.ativo
    };
    this.mostrarModalCategoria = true;
    this.erro = '';
  }

  salvarCategoria() {
    if (!this.formularoCategoria.nome) {
      this.erro = 'Nome da categoria é obrigatório';
      return;
    }

    this.carregando = true;
    this.erro = '';

    // Garantir que ativo seja booleano
    const dadosCategoria = {
      ...this.formularoCategoria,
      ativo: Boolean(this.formularoCategoria.ativo)
    };

    const operacao = this.editandoCategoria
      ? this.produtosService.atualizarCategoria(this.categoriaSelecionada!.id!, dadosCategoria)
      : this.produtosService.criarCategoria(dadosCategoria);

    operacao.subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalCategoria = false;
        this.carregarCategorias();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao salvar categoria:', error);
        this.erro = error.error?.error || 'Erro ao salvar categoria';
        this.carregando = false;
      }
    });
  }

  confirmarExclusaoCategoria(categoria: Categoria) {
    this.categoriaSelecionada = categoria;
    this.mostrarModalExcluirCategoria = true;
  }

  excluirCategoria() {
    if (!this.categoriaSelecionada) return;

    this.carregando = true;
    this.produtosService.excluirCategoria(this.categoriaSelecionada.id!).subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalExcluirCategoria = false;
        this.carregarCategorias();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao excluir categoria:', error);
        this.erro = error.error?.error || 'Erro ao excluir categoria';
        this.carregando = false;
      }
    });
  }

  // ==================== UTILS ====================

  mudarAba(aba: 'servicos' | 'categorias') {
    this.abaAtiva = aba;
    this.erro = '';
    this.sucesso = '';
  }

  fecharModais() {
    this.mostrarModalServico = false;
    this.mostrarModalExcluirServico = false;
    this.mostrarModalCategoria = false;
    this.mostrarModalExcluirCategoria = false;
    this.erro = '';
  }

  limparFiltrosServicos() {
    this.termoBuscaServico = '';
    this.aplicarFiltrosServicos();
    this.paginaAtualServicos = 1;
  }

  limparFiltrosCategorias() {
    this.termoBuscaCategoria = '';
    this.aplicarFiltrosCategorias();
    this.paginaAtualCategorias = 1;
  }

  formatarPreco(preco: number | string): string {
    const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
    if (isNaN(valor)) return '0,00';
    return valor.toFixed(2).replace('.', ',');
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    // Imagem SVG inline para evitar erros de CORS
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VjZjBmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM3ZjhjOGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TZW0gSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
  }
}

