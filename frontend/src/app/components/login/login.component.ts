import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

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
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response);
        
        // Se a opção "lembrar-me" estiver ativada, armazenar essa preferência
        if (this.loginData.remember) {
          localStorage.setItem('rememberUser', 'true');
          // Salvar o email do usuário (opcional)
          localStorage.setItem('rememberedEmail', this.loginData.email);
        } else {
          localStorage.removeItem('rememberUser');
          localStorage.removeItem('rememberedEmail');
        }
        
        // Sucesso no login, redirecionar para a página solicitada ou principal
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro completo no login:', error);
        
        // Tratamento de erros específicos
        if (error.status === 401) {
          this.errorMessage = 'Email ou senha incorretos.';
        } else if (error.status === 422) {
          // Tratando erros de validação
          if (error.error && error.error.errors) {
            // Usando tipagem mais segura para evitar problemas com arrays
            const errorMessages: string[] = [];
            
            // Usando Object.entries para iterar com segurança
            Object.entries(error.error.errors).forEach(([field, messages]) => {
              // Verificando se messages é um array e tem pelo menos um elemento
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
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
        } else {
          this.errorMessage = `Erro ao fazer login (${error.status}). Por favor, tente novamente mais tarde.`;
        }
      }
    });
  }
  
  // Método para limpar campos e mensagens de erro
  resetForm() {
    this.loginData = { email: '', password: '', remember: false };
    this.errorMessage = null;
  }
}