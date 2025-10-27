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

  login() {
    this.carregando = true;
    this.erro = '';
    this.auth.login(this.email, this.senha).subscribe({
      next: (res: any) => {
        if (res && res.user && res.user.tipo === 'ADM') {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/app']);
        } else {
          this.erro = 'Acesso negado: usuário não é administrador.';
        }
        this.carregando = false;
      },
      error: err => {
        this.erro = err.error?.error || err.error?.message || 'Erro ao fazer login';
        this.carregando = false;
      }
    });
  }
}
