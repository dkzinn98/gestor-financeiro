import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userData: RegisterPayload = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se já estiver logado, redireciona para a home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  register(): void {
    // validações básicas
    if (!this.userData.name || !this.userData.email || !this.userData.password) {
      this.errorMessage = 'Todos os campos são obrigatórios.';
      return;
    }

    // formato de email
    const emailPattern = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(this.userData.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }

    // senha mínima
    if (this.userData.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    // confirmação de senha
    if (this.userData.password !== this.userData.password_confirmation) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;

    console.log('Enviando dados para registro:', this.userData);

    this.authService.register(this.userData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          console.log('Registro bem-sucedido:', response);
          // após registrar, manda para login com flag de sucesso
          this.router.navigate(['/login'], { queryParams: { registered: 'success' } });
        },
        error: (error) => {
          console.error('Erro completo no registro:', error);

          if (error.status === 422) {
            if (error.error?.errors) {
              const msgs: string[] = [];
              Object.entries(error.error.errors).forEach(([_, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                  msgs.push(String(messages[0]));
                } else if (typeof messages === 'string') {
                  msgs.push(messages);
                }
              });
              this.errorMessage = msgs.join('<br>');
            } else if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'Dados inválidos. Por favor, verifique as informações.';
            }
          } else if (error.status === 0) {
            this.errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
          } else {
            this.errorMessage = `Erro ao fazer registro (${error.status}). Por favor, tente novamente mais tarde.`;
          }
        }
      });
  }
}
