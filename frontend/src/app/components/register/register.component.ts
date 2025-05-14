import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterComponent implements OnInit {
  userData = { 
    name: '',
    email: '', 
    password: '',
    password_confirmation: ''
  };
  errorMessage: string | null = null;
  isLoading: boolean = false;
  
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}
  
  ngOnInit() {
    // Se já estiver logado, redirecionar
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  register() {
    // Validação básica
    if (!this.userData.name || !this.userData.email || !this.userData.password) {
      this.errorMessage = 'Todos os campos são obrigatórios.';
      return;
    }
    
    // Validação de formato de email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.userData.email)) {
      this.errorMessage = 'Por favor, insira um email válido.';
      return;
    }
    
    // Validação de senha
    if (this.userData.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }
    
    // Validar se as senhas coincidem
    if (this.userData.password !== this.userData.password_confirmation) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    console.log('Enviando dados para registro:', this.userData);
    
    this.authService.register(this.userData).subscribe({
      next: (response) => {
        console.log('Registro bem-sucedido:', response);
        // Sucesso no registro, redirecionar para a página de login com mensagem de sucesso
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'success' } 
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro completo no registro:', error);
        
        // Tratamento de erros específicos
        if (error.status === 422) {
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
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
        } else {
          this.errorMessage = `Erro ao fazer registro (${error.status}). Por favor, tente novamente mais tarde.`;
        }
      }
    });
  }
}