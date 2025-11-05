import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loja.component.html',
  styleUrls: ['./loja.component.css']
})
export class LojaComponent {
  produtosLoja = [
    { id: 1, nome: 'Shampoo Premium', preco: 45.90, imagem: '', categoria: 'Cuidados', estoque: 15 },
    { id: 2, nome: 'Pomada Modeladora', preco: 32.50, imagem: '', categoria: 'Styling', estoque: 8 },
    { id: 3, nome: 'Óleo para Barba', preco: 28.90, imagem: '', categoria: 'Barba', estoque: 12 }
  ];

  filtroCategoria = 'todas';
  categorias = ['todas', 'Cuidados', 'Styling', 'Barba'];

  get produtosFiltrados() {
    if (this.filtroCategoria === 'todas') {
      return this.produtosLoja;
    }
    return this.produtosLoja.filter(p => p.categoria === this.filtroCategoria);
  }

  adicionarAoCarrinho(produtoId: number) {
    console.log('Adicionar ao carrinho:', produtoId);
  }

  verDetalhes(produtoId: number) {
    console.log('Ver detalhes do produto:', produtoId);
  }
}