import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-estabelecimento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-estabelecimento.component.html',
  styleUrls: ['./cadastro-estabelecimento.component.css']
})
export class CadastroEstabelecimentoComponent {
  nome = '';
  email = '';
  senha = '';
  cnpj = '';
  telefone = '';
  // Adicione outros campos conforme necessário

  cadastrar() {
    // Lógica de cadastro de estabelecimento
    alert('Cadastro de estabelecimento realizado!');
  }
}
