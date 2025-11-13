import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BarbeariasService, Barbearia } from '../../services/barbearias.service';
import { environment } from '../../../environments/environments';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
}

interface Funcionario {
  id: number;
  nome: string;
  foto_url?: string;
}

interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
}

@Component({
  selector: 'app-agendar-servico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-servico.component.html',
  styleUrls: ['./agendar-servico.component.css']
})
export class AgendarServicoComponent implements OnInit {
  barbeariaId!: number;
  servicoId!: number;
  barbearia: Barbearia | null = null;
  servico: Servico | null = null;
  funcionarios: Funcionario[] = [];
  
  // Etapas do agendamento
  etapaAtual = 1; // 1: Funcionário, 2: Data/Hora, 3: Pagamento
  
  // Seleções
  funcionarioSelecionado: Funcionario | null = null;
  dataSelecionada: Date | null = null;
  horarioSelecionado: string | null = null;
  metodoPagamento: 'pix' | 'cartao' | null = null;
  
  // Calendário
  mesAtual: Date = new Date();
  diasDoMes: Date[] = [];
  horariosDisponiveis: HorarioDisponivel[] = [];
  
  // Pagamento
  processandoPagamento = false;
  agendamentoConcluido = false;
  
  carregando = false;
  erro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barbeariasService: BarbeariasService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.barbeariaId = +params['barbeariaId'];
      this.servicoId = +params['servicoId'];
      this.carregarDados();
    });
    
    this.gerarCalendario();
  }

  carregarDados() {
    this.carregando = true;
    
    // Carregar barbearia
    this.barbeariasService.buscarBarbeariaPorId(this.barbeariaId).subscribe({
      next: (response: any) => {
        this.barbearia = response.unidade;
      },
      error: (error) => console.error('Erro ao carregar barbearia:', error)
    });
    
    // Carregar serviço
    this.barbeariasService.listarServicosPorBarbearia(this.barbeariaId).subscribe({
      next: (response: any) => {
        const servicos = response.servicos || [];
        this.servico = servicos.find((s: any) => s.id === this.servicoId) || null;
        if (this.servico) {
          this.servico.preco = parseFloat(this.servico.preco as any) || 0;
          this.servico.duracao = parseInt(this.servico.duracao as any) || 0;
        }
      },
      error: (error) => console.error('Erro ao carregar serviço:', error)
    });
    
    // Carregar funcionários
    this.barbeariasService.listarFuncionariosPorBarbearia(this.barbeariaId).subscribe({
      next: (response: any) => {
        this.funcionarios = response.funcionarios || [];
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários:', error);
        this.carregando = false;
      }
    });
  }

  gerarCalendario() {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    this.diasDoMes = [];
    
    // Adicionar dias vazios no início
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      this.diasDoMes.push(new Date(0));
    }
    
    // Adicionar todos os dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      this.diasDoMes.push(new Date(ano, mes, dia));
    }
  }

  mesAnterior() {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() - 1);
    this.gerarCalendario();
  }

  mesSeguinte() {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1);
    this.gerarCalendario();
  }

  getNomeMes(): string {
    return this.mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  isDiaVazio(dia: Date): boolean {
    return dia.getTime() === 0;
  }

  isDiaPassado(dia: Date): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dia < hoje;
  }

  isDiaSelecionado(dia: Date): boolean {
    if (!this.dataSelecionada) return false;
    return dia.toDateString() === this.dataSelecionada.toDateString();
  }

  selecionarFuncionario(funcionario: Funcionario) {
    this.funcionarioSelecionado = funcionario;
  }

  selecionarData(dia: Date) {
    if (this.isDiaVazio(dia) || this.isDiaPassado(dia)) return;
    
    this.dataSelecionada = dia;
    this.horarioSelecionado = null;
    this.carregarHorariosDisponiveis();
  }

  carregarHorariosDisponiveis() {
    if (!this.dataSelecionada || !this.funcionarioSelecionado || !this.servicoId) return;

    const dataFormatada = this.dataSelecionada.toISOString().split('T')[0];
    
    const url = `${environment.apiUrl}/agendamentos-cliente/horarios-disponiveis?unidadeId=${this.barbeariaId}&funcionarioId=${this.funcionarioSelecionado.id}&data=${dataFormatada}&servicoId=${this.servicoId}`;
    
    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.horariosDisponiveis = response.horarios || [];
        console.log('Horários carregados:', this.horariosDisponiveis);
      },
      error: (error) => {
        console.error('Erro ao carregar horários:', error);
        this.erro = 'Erro ao carregar horários disponíveis';
      }
    });
  }

  selecionarHorario(horario: HorarioDisponivel) {
    if (!horario.disponivel) return;
    this.horarioSelecionado = horario.hora;
  }

  proximaEtapa() {
    if (this.etapaAtual === 1 && !this.funcionarioSelecionado) {
      this.erro = 'Selecione um profissional';
      return;
    }
    
    if (this.etapaAtual === 2 && (!this.dataSelecionada || !this.horarioSelecionado)) {
      this.erro = 'Selecione uma data e horário';
      return;
    }
    
    this.erro = '';
    this.etapaAtual++;
  }

  etapaAnterior() {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
      this.erro = '';
    }
  }

  selecionarMetodoPagamento(metodo: 'pix' | 'cartao') {
    this.metodoPagamento = metodo;
  }

  finalizarAgendamento() {
    if (!this.metodoPagamento) {
      this.erro = 'Selecione um método de pagamento';
      return;
    }
    
    this.processandoPagamento = true;
    this.erro = '';
    
    const dataFormatada = this.dataSelecionada!.toISOString().split('T')[0];
    
    const dadosAgendamento = {
      unidadeId: this.barbeariaId,
      servicoId: this.servicoId,
      funcionarioId: this.funcionarioSelecionado!.id,
      dataAgendamento: dataFormatada,
      horarioInicio: this.horarioSelecionado,
      metodoPagamento: this.metodoPagamento.toUpperCase(),
      observacoes: ''
    };

    console.log('Criando agendamento:', dadosAgendamento);

    this.http.post(`${environment.apiUrl}/agendamentos-cliente`, dadosAgendamento).subscribe({
      next: (response: any) => {
        console.log('Agendamento criado:', response);
        this.processandoPagamento = false;
        this.agendamentoConcluido = true;
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          this.router.navigate(['/cliente/agendamentos']);
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao criar agendamento:', error);
        this.processandoPagamento = false;
        this.erro = error.error?.message || 'Erro ao criar agendamento. Tente novamente.';
      }
    });
  }

  formatarPreco(preco: number): string {
    return 'R$ ' + preco.toFixed(2).replace('.', ',');
  }

  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  voltar() {
    this.router.navigate(['/cliente/barbearia', this.barbeariaId]);
  }
}
