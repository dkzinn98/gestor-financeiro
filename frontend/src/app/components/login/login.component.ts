import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
    remember: false
  };

  errorMessage: string | null = null;
  isLoading = false;
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // returnUrl (ex.: /?returnUrl=/categorias)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // já logado? manda pra returnUrl
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    // lembrar e-mail
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginData.email = rememberedEmail;
      this.loginData.remember = true;
    }

    // se veio de registro bem-sucedido, pode exibir um aviso no template
    // via query param `registered=success` (opcional)
  }

  login(): void {
    // validações simples
    if (!this.loginData.email) {
      this.errorMessage = 'O email é obrigatório.';
      return;
    }
    if (!this.loginData.password) {
      this.errorMessage = 'A senha é obrigatória.';
      return;
    }
    const emailPattern = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(this.loginData.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = {
      email: this.loginData.email,
      password: this.loginData.password
    };

    this.authService.login(payload).subscribe({
      next: (resp) => {
        // lembrar-me
        if (this.loginData.remember) {
          localStorage.setItem('rememberUser', 'true');
          localStorage.setItem('rememberedEmail', this.loginData.email);
        } else {
          localStorage.removeItem('rememberUser');
          localStorage.removeItem('rememberedEmail');
        }
        // vai pra rota solicitada
        this.router.navigate([this.returnUrl]);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Email ou senha incorretos.';
          this.loginData.password = '';
          return;
        }

        if (error.status === 422) {
          if (error.error?.errors) {
            const msgs: string[] = [];
            Object.entries(error.error.errors).forEach(([_, messages]) => {
              if (Array.isArray(messages) && messages.length) msgs.push(String(messages[0]));
              else if (typeof messages === 'string') msgs.push(messages);
            });
            this.errorMessage = msgs.join('<br>');
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Dados inválidos. Verifique as informações.';
          }
          return;
        }

        if (error.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          return;
        }

        this.errorMessage = `Erro ao fazer login (${error.status}). Tente novamente mais tarde.`;
      },
      complete: () => (this.isLoading = false)
    });
  }

  resetForm(): void {
    this.loginData = { email: '', password: '', remember: false };
    this.errorMessage = null;
  }

  testarConexao(): void {
    this.isLoading = true;
    this.errorMessage = null;

    fetch(`${this.authService['apiUrl']}/ping`)
      .then(r => {
        if (r.ok) this.errorMessage = 'Conexão com o servidor estabelecida com sucesso!';
        else this.errorMessage = `Não foi possível conectar ao servidor (${r.status}).`;
      })
      .catch(() => {
        this.errorMessage = 'Falha na conexão com o servidor.';
      })
      .finally(() => (this.isLoading = false));
  }
}
