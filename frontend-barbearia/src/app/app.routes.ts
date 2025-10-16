
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CadastroClienteComponent } from './cadastro/cadastro-cliente.component';
import { CadastroEstabelecimentoComponent } from './cadastro/cadastro-estabelecimento.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'cadastro-cliente', component: CadastroClienteComponent },
  { path: 'cadastro-estabelecimento', component: CadastroEstabelecimentoComponent },
  { path: '**', redirectTo: '' }
];
