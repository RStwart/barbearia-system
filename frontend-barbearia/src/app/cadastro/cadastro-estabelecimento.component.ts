import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cadastro-estabelecimento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-estabelecimento.component.html',
  styleUrls: ['./cadastro-estabelecimento.component.css']
})
export class CadastroEstabelecimentoComponent {
  // Dados Básicos
  nome = '';
  responsavel = '';
  cnpj = '';
  cpf = '';
  
  // Contato
  telefone = '';
  email = '';
  
  // Endereço
  cep = '';
  endereco = '';
  numero = '';
  bairro = '';
  cidade = '';
  estado = '';
  complemento = '';
  
  // Funcionamento
  horario_funcionamento = '';
  horario_abertura = '';
  horario_fechamento = '';
  
  // Localização (Opcional)
  latitude: number | null = null;
  longitude: number | null = null;
  
  submitted = false;
  carregando = false;

  // Lista de estados brasileiros
  estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  cadastrar(form?: NgForm) {
    this.submitted = true;
    
    if (form && form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    this.carregando = true;

    const dados = {
      nome: this.nome,
      responsavel: this.responsavel || null,
      cnpj: this.cnpj || null,
      cpf: this.cpf || null,
      telefone: this.telefone || null,
      email: this.email || null,
      cep: this.cep || null,
      endereco: this.endereco || null,
      numero: this.numero || null,
      bairro: this.bairro || null,
      cidade: this.cidade || null,
      estado: this.estado || null,
      complemento: this.complemento || null,
      horario_funcionamento: this.horario_funcionamento || null,
      horario_abertura: this.horario_abertura || null,
      horario_fechamento: this.horario_fechamento || null,
      latitude: this.latitude,
      longitude: this.longitude,
      // Status padrão para novos cadastros (aguardando aprovação)
      ativo: 0,
      status_pagamento: 'bloqueado',
      status_avaliacao: 'aguardando'
    };

    this.http.post('http://localhost:5000/api/cadastro/estabelecimento', dados)
      .subscribe({
        next: (response: any) => {
          this.carregando = false;
          alert('Cadastro realizado com sucesso!\n\nSeu estabelecimento está em análise. Entraremos em contato em breve através dos dados informados.');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao cadastrar:', error);
          alert(error.error?.message || 'Erro ao realizar cadastro. Tente novamente.');
        }
      });
  }

  voltar() {
    this.router.navigate(['/']);
  }

  // Formatação de campos
  formatarCNPJ(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length <= 14) {
      valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
      this.cnpj = valor;
    }
  }

  formatarCPF(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.cpf = valor;
    }
  }

  formatarTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
      valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
      this.telefone = valor;
    }
  }

  formatarCEP(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length <= 8) {
      valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
      this.cep = valor;
    }
  }
}

