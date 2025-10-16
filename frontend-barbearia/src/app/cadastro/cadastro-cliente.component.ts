import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-cliente.component.html',
  styleUrls: ['./cadastro-cliente.component.css']
})
export class CadastroClienteComponent {
  nome = '';
  email = '';
  senha = '';
  telefone = '';
  // Adicione outros campos conforme necessário

  cadastrar() {
    // Lógica de cadastro de cliente
    alert('Cadastro de cliente realizado!');
  }
}
