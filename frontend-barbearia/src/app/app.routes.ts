
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CadastroClienteComponent } from './cadastro/cadastro-cliente.component';
import { CadastroEstabelecimentoComponent } from './cadastro/cadastro-estabelecimento.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProdutosComponent } from './produtos/produtos.component';
import { AgendamentosComponent } from './agendamentos/agendamentos.component';
import { LojaComponent } from './loja/loja.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'cadastro-cliente', component: CadastroClienteComponent },
  { path: 'cadastro-estabelecimento', component: CadastroEstabelecimentoComponent },
  { path: 'login/admin', component: AdminLoginComponent },
  {
    path: 'app',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'produtos', component: ProdutosComponent },
      { path: 'agendamentos', component: AgendamentosComponent },
      { path: 'loja', component: LojaComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
