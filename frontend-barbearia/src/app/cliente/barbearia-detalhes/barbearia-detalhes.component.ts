import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BarbeariasService, Barbearia } from '../../services/barbearias.service';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  categoria_nome?: string;
  foto_url?: string;
  ativo: boolean;
}

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  foto_url?: string;
  especialidade?: string;
}

@Component({
  selector: 'app-barbearia-detalhes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barbearia-detalhes.component.html',
  styleUrls: ['./barbearia-detalhes.component.css']
})
export class BarbeariaDetalhesComponent implements OnInit {
  barbeariaId!: number;
  barbearia: Barbearia | null = null;
  servicos: Servico[] = [];
  funcionarios: Funcionario[] = [];
  carregando = false;
  erro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barbeariasService: BarbeariasService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.barbeariaId = +params['id'];
      this.carregarDados();
    });
  }

  carregarDados() {
    this.carregarBarbearia();
    this.carregarServicos();
    this.carregarFuncionarios();
  }

  carregarBarbearia() {
    this.carregando = true;
    this.barbeariasService.buscarBarbeariaPorId(this.barbeariaId).subscribe({
      next: (response: any) => {
        this.barbearia = response.unidade;
        this.carregando = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar barbearia:', error);
        this.erro = 'Erro ao carregar dados da barbearia';
        this.carregando = false;
      }
    });
  }

  carregarServicos() {
    this.barbeariasService.listarServicosPorBarbearia(this.barbeariaId).subscribe({
      next: (response: any) => {
        console.log('Resposta completa de serviços:', response);
        // Converter preço de string para number
        this.servicos = (response.servicos || []).map((s: any) => ({
          ...s,
          preco: parseFloat(s.preco) || 0,
          duracao: parseInt(s.duracao) || 0
        }));
        console.log('Serviços processados:', this.servicos);
      },
      error: (error: any) => {
        console.error('Erro ao carregar serviços:', error);
      }
    });
  }

  carregarFuncionarios() {
    this.barbeariasService.listarFuncionariosPorBarbearia(this.barbeariaId).subscribe({
      next: (response: any) => {
        this.funcionarios = response.funcionarios || [];
      },
      error: (error: any) => {
        console.error('Erro ao carregar funcionários:', error);
      }
    });
  }

  agendarServico(servico: Servico) {
    this.router.navigate(['/cliente/agendar'], {
      queryParams: {
        barbeariaId: this.barbeariaId,
        servicoId: servico.id
      }
    });
  }

  voltar() {
    this.router.navigate(['/cliente']);
  }

  formatarPreco(preco: number): string {
    if (!preco && preco !== 0) return '0,00';
    return preco.toFixed(2).replace('.', ',');
  }

  formatarPrecoReal(preco: number): string {
    if (!preco && preco !== 0) return 'R$ 0,00';
    return 'R$ ' + preco.toFixed(2).replace('.', ',');
  }

  getImagemUrl(foto: string | null | undefined): string {
    return foto || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80';
  }

  getServicoImagemUrl(foto: string | null | undefined): string {
    // Imagens específicas para serviços de barbearia
    if (foto) return foto;
    
    const imagensServicos = [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80', // Corte de cabelo
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80', // Barba
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80', // Barbearia moderna
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80'  // Tesouras
    ];
    
    return imagensServicos[Math.floor(Math.random() * imagensServicos.length)];
  }
}
