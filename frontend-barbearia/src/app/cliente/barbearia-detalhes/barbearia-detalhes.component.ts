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
        this.servicos = response.servicos || [];
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
    return preco.toFixed(2).replace('.', ',');
  }

  getImagemUrl(foto: string | null | undefined): string {
    return foto || 'https://via.placeholder.com/300x200?text=Serviço';
  }
}
