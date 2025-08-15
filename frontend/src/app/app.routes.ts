import { Routes } from '@angular/router';
import { TransacaoListComponent } from './components/transacao-list/transacao-list.component';
import { TransacaoFormComponent } from './components/transacao-form/transacao-form.component';
import { CategoriaManagerComponent } from './components/categoria-manager/categoria-manager.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: TransacaoListComponent, // Esta é a rota principal - dashboard/lista de transações
    canActivate: [authGuard]
  },
  { 
    path: 'nova-transacao', 
    component: TransacaoFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'nova-transacao/:id', 
    component: TransacaoFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categorias',
    component: CategoriaManagerComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];