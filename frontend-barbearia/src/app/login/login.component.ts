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
        localStorage.setItem('token', res.token);
        alert(`Login bem-sucedido como ${res.tipo_usuario}`);
        this.router.navigate(['/']);
      },
      error: err => {
        this.erro = err.error?.message || 'Erro ao fazer login';
        this.carregando = false;
      }
    });
  }

  abrirCadastro() {
    if (this.tipoUsuario === 'CLIENTE') {
      this.router.navigate(['/cadastro-cliente']);
    } else if (this.tipoUsuario === 'FUNCIONARIO') {
      this.router.navigate(['/cadastro-estabelecimento']);
    }
  }
  
}
