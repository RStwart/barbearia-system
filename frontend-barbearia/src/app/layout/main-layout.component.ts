import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  // controla estado do menu (colapsado ou não)
  isCollapsed = false;
  isMobile = false;

  ngOnInit(): void {
    this.checkWindow();
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
}
