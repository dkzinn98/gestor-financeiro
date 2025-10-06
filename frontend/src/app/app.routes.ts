import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/transacao-list/transacao-list.component').then(m => m.TransacaoListComponent)
  },
  {
    path: 'nova-transacao',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/transacao-form/transacao-form.component').then(m => m.TransacaoFormComponent)
  },
  {
    path: 'nova-transacao/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/transacao-form/transacao-form.component').then(m => m.TransacaoFormComponent)
  },
  {
    path: 'categorias',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/categoria-manager/categoria-manager.component').then(m => m.CategoriaManagerComponent)
  },
  { path: '**', redirectTo: '' }
];
