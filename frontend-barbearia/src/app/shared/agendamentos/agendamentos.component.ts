import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendamentosService, Agendamento, Servico, Funcionario } from '../../services/agendamentos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.css']
})
export class AgendamentosComponent implements OnInit {
  // Calendário
  mesAtual: Date = new Date();
  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  diasCalendario: any[] = [];
  diaSelecionado: Date | null = null;

  // Dados
  agendamentos: Agendamento[] = [];
  agendamentosDia: Agendamento[] = [];
  servicos: Servico[] = [];
  funcionarios: Funcionario[] = [];
  unidade_id: number | null = null;

  // Modais
  mostrarModalDetalhes = false;
  mostrarModalEditar = false;
  mostrarModalNovo = false;
  agendamentoSelecionado: Agendamento | null = null;

  // Formulário
  formulario: Partial<Agendamento> = {
    status: 'pendente'
  };

  carregando = false;
  erro = '';

  constructor(
    private agendamentosService: AgendamentosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.obterUnidadeUsuario();
    this.gerarCalendario();
    this.selecionarDia(new Date());
  }

  obterUnidadeUsuario() {
    const user = this.authService.getUserFromToken();
    if (user && user.unidade_id) {
      this.unidade_id = user.unidade_id;
      this.carregarDados();
    }
  }

  carregarDados() {
    if (!this.unidade_id) return;

    // Carregar agendamentos do mês
    const primeiroDia = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth(), 1);
    const ultimoDia = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1, 0);

    this.agendamentosService.listarAgendamentos(
      this.unidade_id,
      this.formatarData(primeiroDia),
      this.formatarData(ultimoDia)
    ).subscribe({
      next: (response) => {
        this.agendamentos = response.agendamentos || [];
        this.atualizarAgendamentosDia();
      },
      error: (error) => {
        console.error('Erro ao carregar agendamentos:', error);
        this.erro = 'Erro ao carregar agendamentos';
      }
    });

    // Carregar serviços
    this.agendamentosService.listarServicos(this.unidade_id).subscribe({
      next: (response) => {
        this.servicos = response.servicos || [];
      },
      error: (error) => console.error('Erro ao carregar serviços:', error)
    });

    // Carregar funcionários
    this.agendamentosService.listarFuncionarios(this.unidade_id).subscribe({
      next: (response) => {
        this.funcionarios = response.funcionarios || [];
      },
      error: (error) => console.error('Erro ao carregar funcionários:', error)
    });
  }

  gerarCalendario() {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    this.diasCalendario = [];
    
    // Dias vazios antes do primeiro dia do mês
    const diaSemanaInicio = primeiroDia.getDay();
    for (let i = 0; i < diaSemanaInicio; i++) {
      this.diasCalendario.push({ vazio: true });
    }
    
    // Dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(ano, mes, dia);
      const agendamentosNoDia = this.agendamentos.filter(a => 
        a.data_agendamento === this.formatarData(data)
      );
      
      this.diasCalendario.push({
        dia,
        data,
        hoje: this.ehHoje(data),
        selecionado: this.diaSelecionado && this.formatarData(data) === this.formatarData(this.diaSelecionado),
        agendamentos: agendamentosNoDia.length
      });
    }
  }

  mesAnterior() {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() - 1, 1);
    this.gerarCalendario();
    this.carregarDados();
  }

  proximoMes() {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1, 1);
    this.gerarCalendario();
    this.carregarDados();
  }

  selecionarDia(data: Date) {
    this.diaSelecionado = data;
    this.gerarCalendario();
    this.atualizarAgendamentosDia();
  }

  atualizarAgendamentosDia() {
    if (!this.diaSelecionado) return;
    
    const dataFormatada = this.formatarData(this.diaSelecionado);
    this.agendamentosDia = this.agendamentos
      .filter(a => a.data_agendamento === dataFormatada)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }

  abrirModalNovo() {
    this.formulario = {
      unidade_id: this.unidade_id!,
      data_agendamento: this.diaSelecionado ? this.formatarData(this.diaSelecionado) : this.formatarData(new Date()),
      status: 'pendente'
    };
    this.mostrarModalNovo = true;
  }

  abrirModalDetalhes(agendamento: Agendamento) {
    this.agendamentoSelecionado = agendamento;
    this.mostrarModalDetalhes = true;
  }

  abrirModalEditar(agendamento: Agendamento) {
    this.agendamentoSelecionado = agendamento;
    this.formulario = { ...agendamento };
    this.mostrarModalEditar = true;
    this.mostrarModalDetalhes = false;
  }

  fecharModais() {
    this.mostrarModalDetalhes = false;
    this.mostrarModalEditar = false;
    this.mostrarModalNovo = false;
    this.agendamentoSelecionado = null;
    this.erro = '';
  }

  salvarAgendamento() {
    if (!this.validarFormulario()) return;

    this.carregando = true;
    this.erro = '';

    if (this.mostrarModalEditar && this.agendamentoSelecionado) {
      // Atualizar
      this.agendamentosService.atualizarAgendamento(this.agendamentoSelecionado.id!, this.formulario)
        .subscribe({
          next: () => {
            this.carregando = false;
            this.fecharModais();
            this.carregarDados();
          },
          error: (error) => {
            this.carregando = false;
            this.erro = error.error?.error || 'Erro ao atualizar agendamento';
          }
        });
    } else {
      // Criar novo
      this.agendamentosService.criarAgendamento(this.formulario as Agendamento)
        .subscribe({
          next: () => {
            this.carregando = false;
            this.fecharModais();
            this.carregarDados();
          },
          error: (error) => {
            this.carregando = false;
            this.erro = error.error?.error || 'Erro ao criar agendamento';
          }
        });
    }
  }

  cancelarAgendamento(id: number) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    this.agendamentosService.cancelarAgendamento(id).subscribe({
      next: () => {
        this.fecharModais();
        this.carregarDados();
      },
      error: (error) => {
        this.erro = error.error?.error || 'Erro ao cancelar agendamento';
      }
    });
  }

  calcularHoraFim() {
    if (this.formulario.servico_id && this.formulario.hora_inicio) {
      const servico = this.servicos.find(s => s.id === Number(this.formulario.servico_id));
      if (servico) {
        const [hora, minuto] = this.formulario.hora_inicio.split(':').map(Number);
        const dataInicio = new Date();
        dataInicio.setHours(hora, minuto, 0, 0);
        dataInicio.setMinutes(dataInicio.getMinutes() + servico.duracao);
        
        this.formulario.hora_fim = dataInicio.toTimeString().slice(0, 5);
        this.formulario.valor_total = servico.preco;
      }
    }
  }

  validarFormulario(): boolean {
    if (!this.formulario.cliente_id || !this.formulario.funcionario_id || 
        !this.formulario.servico_id || !this.formulario.data_agendamento || 
        !this.formulario.hora_inicio || !this.formulario.hora_fim) {
      this.erro = 'Preencha todos os campos obrigatórios';
      return false;
    }
    return true;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pendente': 'status-pendente',
      'confirmado': 'status-confirmado',
      'em_andamento': 'status-andamento',
      'concluido': 'status-concluido',
      'cancelado': 'status-cancelado'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }

  formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  formatarDataExibicao(dataStr: string): string {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  ehHoje(data: Date): boolean {
    const hoje = new Date();
    return data.toDateString() === hoje.toDateString();
  }
}
