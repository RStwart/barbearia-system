import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})



export class LoginComponent {
  etapa: 'bemvindo' | 'login' = 'bemvindo';
  tipoUsuario: 'CLIENTE' | 'FUNCIONARIO' | null = null;
  email = '';
  senha = '';
  carregando = false;
  erro = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('🌐 API em uso:', environment.apiUrl);
    
    // Verificar se já existe token válido e redirecionar
    if (this.auth.isAuthenticated()) {
      const tokenData = this.auth.getUserFromToken();
      if (tokenData) {
        this.redirectByUserType(tokenData.tipo);
        return;
      }
    }
    
    // Limpar qualquer estado anterior que possa ter ficado
    this.etapa = 'bemvindo';
    this.tipoUsuario = null;
    this.email = '';
    this.senha = '';
    this.erro = '';
  }

  selecionarTipo(tipo: 'CLIENTE' | 'FUNCIONARIO') {
    this.tipoUsuario = tipo;
    this.etapa = 'login';
  }

  voltar() {
    this.etapa = 'bemvindo';
    this.email = '';
    this.senha = '';
  }

  login() {
    this.carregando = true;
    this.erro = '';
    this.auth.login(this.email, this.senha).subscribe({
      next: (res: any) => {
        // Salvar token e dados do usuário
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        
        console.log('✅ Login realizado com sucesso:', res.user);
        
        // Verificar se é primeiro acesso
        if (res.user.primeiro_acesso) {
          console.log('🔐 Primeiro acesso detectado - redirecionando para troca de senha');
          this.router.navigate(['/primeiro-acesso']);
          return;
        }
        
        // Redirecionar baseado no tipo de usuário
        this.redirectByUserType(res.user.tipo);
      },
      error: err => {
        console.error('❌ Erro no login:', err);
        this.erro = err.error?.error || err.error?.message || 'Erro ao fazer login';
        this.carregando = false;
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
      case 'CLIENTE':
        this.router.navigate(['/cliente']);
        break;
      case 'FUNCIONARIO':
        this.router.navigate(['/estabelecimento']);
        break;
      default:
        this.router.navigate(['/cliente']); // Fallback
    }
  }

  abrirCadastro() {
    if (this.tipoUsuario === 'CLIENTE') {
      this.router.navigate(['/cadastro-cliente']);
    } else if (this.tipoUsuario === 'FUNCIONARIO') {
      this.router.navigate(['/cadastro-estabelecimento']);
    }
  }
  
}
