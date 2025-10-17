import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
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
  submitted = false;

  constructor(private router: Router) {}

  cadastrar(form?: NgForm) {
    this.submitted = true;
    if (form && form.invalid) {
      // Marca todos como touched para exibir mensagens
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    // Lógica de cadastro de estabelecimento (formulário válido)
    alert('Cadastro de estabelecimento realizado!');
    // opcional: navegar ou limpar campos
    this.router.navigate(['/']);
  }

  voltar() {
    this.router.navigate(['/']);
  }
}
