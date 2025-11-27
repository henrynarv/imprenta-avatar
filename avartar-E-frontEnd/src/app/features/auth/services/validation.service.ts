import { Injectable } from '@angular/core';
import { PasswordStrength, RegisterRequest } from '../models/auth-interface';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  validationPasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 6) {
      score += 1;
    } else {
      feedback.push("Mínimo 6 caracteres");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Incluir al menos un número");
    }


    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluir al menos una mayúscula');
    }


    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Incluir al menos una minúscula");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluir al menos un carácter especial');
    }


    return {
      score,
      feedback,
      isValid: score >= 3
    };
  }


  validateRegisterData(userData: RegisterRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userData.password !== userData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    if (!this.isValidEmail(userData.email)) {
      errors.push('El Formato de correo no es valido');
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private isValidEmail(email: string): boolean {
    //Ejemplos que dan true; usuario@correo.com,john.doe@example.es,test123@mail.co
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


}
