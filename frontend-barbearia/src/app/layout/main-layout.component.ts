import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  // controla estado do menu (colapsado ou não)
  isCollapsed = false;
  isMobile = false;
  usuario: any = { nome: 'Usuário', tipo: 'CLIENTE' }; // Dados temporários, depois virá do token

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkWindow();
    this.loadUserData();
  }

  private loadUserData() {
    if (this.authService.isAuthenticated()) {
      this.authService.getProfile().subscribe({
        next: (response) => {
          this.usuario = response.user;
        },
        error: (error) => {
          console.error('Erro ao carregar dados do usuário:', error);
          // Fallback para dados do token se a API falhar
          const tokenData = this.authService.getUserFromToken();
          if (tokenData) {
            this.usuario = {
              nome: 'Usuário',
              tipo: tokenData.tipo
            };
          }
        }
      });
    }
  }

  getUserInitials(): string {
    if (!this.usuario?.nome) return 'U';
    return this.usuario.nome.split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkWindow();
  }

  private checkWindow() {
    this.isMobile = window.innerWidth <= 900;
    // se for mobile, deixamos a sidebar colapsada por padrão
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    // Usar o método do AuthService para logout completo
    this.authService.logout();
    
    // Limpar dados do usuário no componente
    this.usuario = { nome: 'Usuário', tipo: 'CLIENTE' };
    
    // Redirecionar para a tela inicial (escolha cliente/estabelecimento)
    this.router.navigate(['/']).then(() => {
      // Força o reload da página para garantir que todos os dados sejam limpos
      window.location.reload();
    });
  }
}
