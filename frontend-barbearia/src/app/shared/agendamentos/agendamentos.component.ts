import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.css']
})
export class AgendamentosComponent {
  agendamentos = [
    { id: 1, cliente: 'João Silva', servico: 'Corte + Barba', data: '2025-11-05', hora: '09:00', status: 'confirmado' },
    { id: 2, cliente: 'Maria Santos', servico: 'Corte Tradicional', data: '2025-11-05', hora: '10:30', status: 'pendente' },
    { id: 3, cliente: 'Pedro Oliveira', servico: 'Barba Completa', data: '2025-11-05', hora: '14:00', status: 'concluido' }
  ];

  novoAgendamento() {
    console.log('Criar novo agendamento');
  }

  editarAgendamento(id: number) {
    console.log('Editar agendamento:', id);
  }

  cancelarAgendamento(id: number) {
    console.log('Cancelar agendamento:', id);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'confirmado': return 'status-confirmado';
      case 'pendente': return 'status-pendente';
      case 'concluido': return 'status-concluido';
      case 'cancelado': return 'status-cancelado';
      default: return '';
    }
  }
}