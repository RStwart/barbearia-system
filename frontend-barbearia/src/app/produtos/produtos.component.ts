import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent {
  produtos = [
    { id: 1, nome: 'Corte Tradicional', preco: 25.00, categoria: 'Cortes' },
    { id: 2, nome: 'Barba Completa', preco: 15.00, categoria: 'Barba' },
    { id: 3, nome: 'Corte + Barba', preco: 35.00, categoria: 'Combo' }
  ];

  adicionarProduto() {
    // Lógica para adicionar produto
    console.log('Adicionar novo produto');
  }

  editarProduto(id: number) {
    // Lógica para editar produto
    console.log('Editar produto:', id);
  }

  removerProduto(id: number) {
    // Lógica para remover produto
    console.log('Remover produto:', id);
  }
}