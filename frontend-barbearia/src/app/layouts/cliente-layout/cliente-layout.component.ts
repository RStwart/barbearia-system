import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-layout.component.html',
  styleUrls: ['./cliente-layout.component.css']
})
export class ClienteLayoutComponent implements OnInit {
  isCollapsed = false;
  isMobile = false;
  usuario: any = { nome: 'Cliente', tipo: 'CLIENTE' };

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
              nome: 'Cliente',
              tipo: tokenData.tipo
            };
          }
        }
      });
    }
  }

  getUserInitials(): string {
    if (!this.usuario?.nome) return 'C';
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
    this.usuario = { nome: 'Cliente', tipo: 'CLIENTE' };
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}