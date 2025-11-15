import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BarbeariasService, Barbearia } from '../../services/barbearias.service';

@Component({
  selector: 'app-inicio-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-cliente.component.html',
  styleUrls: ['./inicio-cliente.component.css']
})
export class InicioClienteComponent implements OnInit {
  barbearias: Barbearia[] = [];
  carregando = false;
  erro = '';

  constructor(
    private barbeariasService: BarbeariasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarBarbearias();
  }

  carregarBarbearias() {
    this.carregando = true;
    this.barbeariasService.listarBarbearias().subscribe({
      next: (response: { unidades: Barbearia[] }) => {
        // Mapear id_unidade para id para compatibilidade
        this.barbearias = (response.unidades || []).map(unidade => ({
          ...unidade,
          id: unidade.id_unidade || unidade.id
        }));
        console.log('Barbearias carregadas:', this.barbearias);
        this.carregando = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar barbearias:', error);
        this.erro = 'Erro ao carregar barbearias';
        this.carregando = false;
      }
    });
  }

  selecionarBarbearia(barbearia: Barbearia) {
    this.router.navigate(['/cliente/barbearia', barbearia.id]);
  }

  abrirWhatsApp(telefone: string, event: Event) {
    event.stopPropagation();
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  }

  abrirInstagram(instagram: string, event: Event) {
    event.stopPropagation();
    const username = instagram.replace('@', '');
    window.open(`https://instagram.com/${username}`, '_blank');
  }

  getImagemUrl(foto: string | null | undefined): string {
    return foto || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80';
  }
}
