import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

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
  confirmarSenha = '';
  telefone = '';
  cpf = '';
  carregando = false;
  
  // Validadores de senha
  senhaMinLength = false;
  senhaHasUpper = false;
  senhaHasLower = false;
  senhaHasNumber = false;
  senhasConferem = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  // Formatar telefone
  formatarTelefone() {
    let valor = this.telefone.replace(/\D/g, '');
    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
    this.telefone = valor;
  }

  // Formatar CPF
  formatarCPF() {
    let valor = this.cpf.replace(/\D/g, '');
    valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
    this.cpf = valor;
  }

  // Validar senha em tempo real
  validarSenha() {
    this.senhaMinLength = this.senha.length >= 6;
    this.senhaHasUpper = /[A-Z]/.test(this.senha);
    this.senhaHasLower = /[a-z]/.test(this.senha);
    this.senhaHasNumber = /[0-9]/.test(this.senha);
    this.verificarSenhasConferem();
  }

  // Verificar se as senhas conferem
  verificarSenhasConferem() {
    this.senhasConferem = this.senha === this.confirmarSenha && this.senha.length > 0;
  }

  cadastrar() {
    // Validação básica
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // Validar senhas conferem
    if (this.senha !== this.confirmarSenha) {
      alert('❌ As senhas não conferem!');
      return;
    }

    // Validar requisitos da senha
    if (!this.senhaMinLength || !this.senhaHasUpper || !this.senhaHasLower || !this.senhaHasNumber) {
      alert('❌ A senha não atende aos requisitos mínimos de segurança!');
      return;
    }

    this.carregando = true;

    const dados = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      telefone: this.telefone.replace(/\D/g, '') || null,
      cpf: this.cpf.replace(/\D/g, '') || null,
      tipo: 'CLIENTE'
    };

    this.http.post(`${environment.apiUrl}/auth/register`, dados)
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          alert('✅ Cadastro realizado com sucesso!\n\nFaça login para acessar o sistema.');
          // Redirecionar para tela de login
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao cadastrar:', error);
          alert(error.error?.error || error.error?.message || 'Erro ao realizar cadastro. Tente novamente.');
        }
      });
  }

  voltar() {
    this.router.navigate(['/']);
  }
}

