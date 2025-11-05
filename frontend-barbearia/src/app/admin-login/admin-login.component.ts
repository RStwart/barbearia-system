import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  email = '';
  senha = '';
  carregando = false;
  erro = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Verificar se já existe token válido e redirecionar
    if (this.auth.isAuthenticated()) {
      const tokenData = this.auth.getUserFromToken();
      if (tokenData && tokenData.tipo === 'ADM') {
        this.router.navigate(['/admin']);
        return;
      }
    }
    
    // Limpar estado anterior
    this.email = '';
    this.senha = '';
    this.erro = '';
  }

  login() {
    this.carregando = true;
    this.erro = '';
    this.auth.login(this.email, this.senha).subscribe({
      next: (res: any) => {
        if (res && res.user && res.user.tipo === 'ADM') {
          // Salvar token e dados do usuário
          localStorage.setItem('token', res.token);
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          
          console.log('✅ Login admin realizado com sucesso:', res.user);
          this.router.navigate(['/admin']);
        } else {
          this.erro = 'Acesso negado: usuário não é administrador.';
        }
        this.carregando = false;
      },
      error: err => {
        console.error('❌ Erro no login admin:', err);
        this.erro = err.error?.error || err.error?.message || 'Erro ao fazer login';
        this.carregando = false;
      }
    });
  }
}
