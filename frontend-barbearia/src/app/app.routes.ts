import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CadastroClienteComponent } from './cadastro/cadastro-cliente.component';
import { CadastroEstabelecimentoComponent } from './cadastro/cadastro-estabelecimento.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { PrimeiroAcessoComponent } from './primeiro-acesso/primeiro-acesso.component';

// Novos Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ClienteLayoutComponent } from './layouts/cliente-layout/cliente-layout.component';
import { EstabelecimentoLayoutComponent } from './layouts/estabelecimento-layout/estabelecimento-layout.component';

// Componentes específicos do Admin
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminUsuariosComponent } from './pages/admin/admin-usuarios/admin-usuarios.component';
import { AdminEstabelecimentosComponent } from './pages/admin/admin-estabelecimentos/admin-estabelecimentos.component';

// Componentes do Cliente
import { InicioClienteComponent } from './cliente/inicio-cliente/inicio-cliente.component';
import { BarbeariaDetalhesComponent } from './cliente/barbearia-detalhes/barbearia-detalhes.component';
import { AgendarServicoComponent } from './cliente/agendar-servico/agendar-servico.component';
import { MeusAgendamentosComponent } from './cliente/meus-agendamentos/meus-agendamentos.component';

// Componentes compartilhados (temporários)
import { DashboardComponent } from './shared/dashboard/dashboard.component';
import { ProdutosComponent } from './shared/produtos/produtos.component';
import { AgendamentosComponent } from './shared/agendamentos/agendamentos.component';
import { FuncionariosComponent } from './shared/funcionarios/funcionarios.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'cadastro-cliente', component: CadastroClienteComponent },
  { path: 'cadastro-estabelecimento', component: CadastroEstabelecimentoComponent },
  { path: 'login/admin', component: AdminLoginComponent },
  { path: 'primeiro-acesso', component: PrimeiroAcessoComponent },
  
  // ================ ROTAS DO ADMIN ================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'usuarios', component: AdminUsuariosComponent }, // Gerenciamento de usuários
      { path: 'estabelecimentos', component: AdminEstabelecimentosComponent }, // Gerenciamento de unidades
      { path: 'logs', component: DashboardComponent } // Temporário
    ]
  },
  
  // ================ ROTAS DO CLIENTE ================
  {
    path: 'cliente',
    component: ClienteLayoutComponent,
    children: [
      { path: '', component: InicioClienteComponent },
      { path: 'barbearia/:id', component: BarbeariaDetalhesComponent },
      { path: 'agendar', component: AgendarServicoComponent },
      { path: 'agendamentos', component: MeusAgendamentosComponent },
      { path: 'favoritos', component: DashboardComponent }, // TODO: Criar componente
      { path: 'historico', component: DashboardComponent } // TODO: Criar componente
    ]
  },
  
  // ================ ROTAS DO ESTABELECIMENTO ================
  {
    path: 'estabelecimento',
    component: EstabelecimentoLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'agendamentos', component: AgendamentosComponent },
      { path: 'produtos', component: ProdutosComponent },
      { path: 'funcionarios', component: FuncionariosComponent }
    ]
  },

  // ================ ROTA LEGADA (temporária) ================
  {
    path: 'app',
    redirectTo: '/cliente',
    pathMatch: 'full'
  },
  
  { path: '**', redirectTo: '' }
];
