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
  abaAtiva: 'produtos' | 'categorias' = 'produtos';

  // Dados
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];

  // Estados
  carregando = false;
  erro = '';
  sucesso = '';

  // Modais - Produtos
  mostrarModalProduto = false;
  mostrarModalExcluirProduto = false;
  editandoProduto = false;
  produtoSelecionado: Produto | null = null;

  // Modais - Categorias
  mostrarModalCategoria = false;
  mostrarModalExcluirCategoria = false;
  editandoCategoria = false;
  categoriaSelecionada: Categoria | null = null;

  // Formulários
  formularioProduto: Partial<Produto> = {
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    categoria_id: undefined,
    foto_url: '',
    ativo: true
  };

  formularoCategoria: Partial<Categoria> = {
    nome: '',
    descricao: '',
    ativo: true
  };

  // Busca e filtros
  termoBuscaProduto = '';
  termoBuscaCategoria = '';

  // Paginação - Produtos
  paginaAtualProdutos = 1;
  itensPorPagina = 12;

  // Paginação - Categorias
  paginaAtualCategorias = 1;

  constructor(private produtosService: ProdutosService) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.carregarProdutos();
    this.carregarCategorias();
  }

  // ==================== PRODUTOS ====================

  carregarProdutos() {
    this.carregando = true;
    this.produtosService.listarProdutos().subscribe({
      next: (response) => {
        this.produtos = response.produtos;
        this.aplicarFiltrosProdutos();
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.erro = error.error?.error || 'Erro ao carregar produtos';
        this.carregando = false;
      }
    });
  }

  aplicarFiltrosProdutos() {
    let resultado = [...this.produtos];

    if (this.termoBuscaProduto.trim()) {
      const termo = this.termoBuscaProduto.toLowerCase();
      resultado = resultado.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
        (p.categoria_nome && p.categoria_nome.toLowerCase().includes(termo))
      );
    }

    this.produtosFiltrados = resultado;
  }

  get produtosPaginados(): Produto[] {
    const inicio = (this.paginaAtualProdutos - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.produtosFiltrados.slice(inicio, fim);
  }

  get totalPaginasProdutos(): number {
    return Math.ceil(this.produtosFiltrados.length / this.itensPorPagina);
  }

  abrirModalNovoProduto() {
    this.editandoProduto = false;
    this.formularioProduto = {
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      categoria_id: undefined,
      foto_url: '',
      ativo: true
    };
    this.mostrarModalProduto = true;
    this.erro = '';
  }

  abrirModalEditarProduto(produto: Produto) {
    this.editandoProduto = true;
    this.produtoSelecionado = produto;
    this.formularioProduto = {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      categoria_id: produto.categoria_id,
      foto_url: produto.foto_url,
      ativo: produto.ativo
    };
    this.mostrarModalProduto = true;
    this.erro = '';
  }

  salvarProduto() {
    if (!this.formularioProduto.nome || !this.formularioProduto.preco) {
      this.erro = 'Nome e preço são obrigatórios';
      return;
    }

    this.carregando = true;
    this.erro = '';

    const operacao = this.editandoProduto
      ? this.produtosService.atualizarProduto(this.produtoSelecionado!.id!, this.formularioProduto)
      : this.produtosService.criarProduto(this.formularioProduto);

    operacao.subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalProduto = false;
        this.carregarProdutos();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao salvar produto:', error);
        this.erro = error.error?.error || 'Erro ao salvar produto';
        this.carregando = false;
      }
    });
  }

  confirmarExclusaoProduto(produto: Produto) {
    this.produtoSelecionado = produto;
    this.mostrarModalExcluirProduto = true;
  }

  excluirProduto() {
    if (!this.produtoSelecionado) return;

    this.carregando = true;
    this.produtosService.excluirProduto(this.produtoSelecionado.id!).subscribe({
      next: (response) => {
        this.sucesso = response.message;
        this.carregando = false;
        this.mostrarModalExcluirProduto = false;
        this.carregarProdutos();
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
        this.carregarProdutos();
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

    const operacao = this.editandoCategoria
      ? this.produtosService.atualizarCategoria(this.categoriaSelecionada!.id!, this.formularoCategoria)
      : this.produtosService.criarCategoria(this.formularoCategoria);

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

  mudarAba(aba: 'produtos' | 'categorias') {
    this.abaAtiva = aba;
    this.erro = '';
    this.sucesso = '';
  }

  fecharModais() {
    this.mostrarModalProduto = false;
    this.mostrarModalExcluirProduto = false;
    this.mostrarModalCategoria = false;
    this.mostrarModalExcluirCategoria = false;
    this.erro = '';
  }

  limparFiltrosProdutos() {
    this.termoBuscaProduto = '';
    this.aplicarFiltrosProdutos();
    this.paginaAtualProdutos = 1;
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