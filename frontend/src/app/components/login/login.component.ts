import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent implements OnInit {
  loginData = { 
    email: '', 
    password: '',
    remember: false  // Nova propriedade para "lembrar-me"
  };
  errorMessage: string | null = null;
  isLoading: boolean = false;
  returnUrl: string = '/';  // URL padrão para retornar após o login
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    // Capturar returnUrl dos query params, se existir
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Se já estiver logado, redirecionar para returnUrl
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
    
    // Verificar se há um email armazenado do "lembrar-me"
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginData.email = rememberedEmail;
      this.loginData.remember = true;
    }
  }

  login() {
    // Validação aprimorada
    if (!this.loginData.email) {
      this.errorMessage = 'O email é obrigatório.';
      return;
    }
    
    if (!this.loginData.password) {
      this.errorMessage = 'A senha é obrigatória.';
      return;
    }
    
    // Validação de formato de email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.loginData.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    console.log('Enviando dados para login:', this.loginData);
    
    // Enviar apenas email e senha (não enviar propriedade remember)
    const loginPayload = {
      email: this.loginData.email,
      password: this.loginData.password
    };
    
    this.authService.login(loginPayload).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response);
        
        // Se a opção "lembrar-me" estiver ativada, armazenar essa preferência
        if (this.loginData.remember) {
          localStorage.setItem('rememberUser', 'true');
          localStorage.setItem('rememberedEmail', this.loginData.email);
        } else {
          localStorage.removeItem('rememberUser');
          localStorage.removeItem('rememberedEmail');
        }
        
        // Sucesso no login, redirecionar para a página solicitada ou principal
        this.router.navigate([this.returnUrl]);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erro completo no login:', error);
        
        // Tratamento de erros específicos
        if (error.status === 401) {
          this.errorMessage = 'Email ou senha incorretos.';
          
          // Limpar senha em caso de erro de autenticação
          this.loginData.password = '';
        } else if (error.status === 422) {
          // Tratando erros de validação
          if (error.error && error.error.errors) {
            const errorMessages: string[] = [];
            
            Object.entries(error.error.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                errorMessages.push(messages[0] as string);
              } else if (typeof messages === 'string') {
                errorMessages.push(messages);
              }
            });
            
            this.errorMessage = errorMessages.join('<br>');
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Dados inválidos. Por favor, verifique as informações.';
          }
        } else if (error.status === 0) {
          // Erro de conectividade com o servidor
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet ou se o servidor está disponível.';
        } else {
          this.errorMessage = `Erro ao fazer login (${error.status}). Por favor, tente novamente mais tarde.`;
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  // Método para limpar campos e mensagens de erro
  resetForm() {
    this.loginData = { email: '', password: '', remember: false };
    this.errorMessage = null;
  }
  
  // Novo método para testar a conexão com o backend
  testarConexao() {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Faz uma requisição simples para verificar se o backend está acessível
    fetch(`${this.authService['apiUrl']}/ping`)
      .then(response => {
        if (response.ok) {
          console.log('Conexão com o backend OK');
          this.errorMessage = 'Conexão com o servidor estabelecida com sucesso!';
        } else {
          console.error('Erro na conexão com o backend:', response.status);
          this.errorMessage = `Não foi possível conectar ao servidor (${response.status}).`;
        }
      })
      .catch(error => {
        console.error('Falha na conexão com o backend:', error);
        this.errorMessage = 'Falha na conexão com o servidor. Verifique sua conexão de internet ou se o servidor está disponível.';
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}