import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-estabelecimento-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estabelecimento-layout.component.html',
  styleUrls: ['./estabelecimento-layout.component.css']
})
export class EstabelecimentoLayoutComponent implements OnInit {
  isCollapsed = false;
  isMobile = false;
  usuario: any = { nome: 'Estabelecimento', tipo: 'FUNCIONARIO' };

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
          const tokenData = this.authService.getUserFromToken();
          if (tokenData) {
            this.usuario = {
              nome: 'Estabelecimento',
              tipo: tokenData.tipo
            };
          }
        }
      });
    }
  }

  getUserInitials(): string {
    if (!this.usuario?.nome) return 'E';
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
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  logout() {
    this.authService.logout();
    this.usuario = { nome: 'Estabelecimento', tipo: 'FUNCIONARIO' };
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}