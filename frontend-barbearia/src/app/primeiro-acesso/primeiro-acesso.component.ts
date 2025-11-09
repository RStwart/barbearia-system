import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-primeiro-acesso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './primeiro-acesso.component.html',
  styleUrls: ['./primeiro-acesso.component.css']
})
export class PrimeiroAcessoComponent implements OnInit {
  usuario: any = null;
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  carregando = false;
  erro = '';
  mostrarSenhaAtual = false;
  mostrarNovaSenha = false;
  mostrarConfirmarSenha = false;

  // Validações
  senhaValida = {
    tamanho: false,
    maiuscula: false,
    minuscula: false,
    numero: false
  };

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Verificar se há usuário logado
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = JSON.parse(userData);

    // Se não for primeiro acesso, redirecionar para dashboard apropriado
    if (!this.usuario.primeiro_acesso) {
      this.redirectByUserType(this.usuario.tipo);
    }
  }

  validarSenha() {
    this.senhaValida.tamanho = this.novaSenha.length >= 6;
    this.senhaValida.maiuscula = /[A-Z]/.test(this.novaSenha);
    this.senhaValida.minuscula = /[a-z]/.test(this.novaSenha);
    this.senhaValida.numero = /[0-9]/.test(this.novaSenha);
  }

  get senhaAtendeCriterios(): boolean {
    return this.senhaValida.tamanho && 
           this.senhaValida.maiuscula && 
           this.senhaValida.minuscula && 
           this.senhaValida.numero;
  }

  alterarSenha() {
    this.erro = '';

    // Validações
    if (!this.senhaAtual) {
      this.erro = 'Informe a senha atual';
      return;
    }

    if (!this.novaSenha) {
      this.erro = 'Informe a nova senha';
      return;
    }

    if (!this.senhaAtendeCriterios) {
      this.erro = 'A nova senha não atende aos critérios de segurança';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem';
      return;
    }

    if (this.senhaAtual === this.novaSenha) {
      this.erro = 'A nova senha deve ser diferente da atual';
      return;
    }

    this.carregando = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const dados = {
      senhaAtual: this.senhaAtual,
      novaSenha: this.novaSenha
    };

    this.http.post(`${environment.apiUrl}/auth/primeiro-acesso`, dados, { headers })
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          
          // Atualizar dados do usuário no localStorage
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          alert('✅ Senha alterada com sucesso!\n\nAgora você pode utilizar o sistema normalmente.');
          
          // Redirecionar para o dashboard apropriado
          this.redirectByUserType(this.usuario.tipo);
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao alterar senha:', error);
          this.erro = error.error?.message || 'Erro ao alterar senha. Tente novamente.';
        }
      });
  }

  private redirectByUserType(tipo: string) {
    switch(tipo) {
      case 'ADM':
        this.router.navigate(['/admin']);
        break;
      case 'GERENTE':
        this.router.navigate(['/estabelecimento']);
        break;
      case 'FUNCIONARIO':
        this.router.navigate(['/estabelecimento']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/cliente']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
