import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidationErrorResponse } from '../models/auth-interface';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handleAuthError(error: any): string {
    if (error instanceof HttpErrorResponse) {
      //Manejar errores de validación de @Valid sprigboot
      if (error.status === 400) {
        return this.handleValidationError(error);
      }

      if (error.status === 409) {
        return this.getPriorityErrorMessage(error);
      }

      switch (error.status) {
        case 401:
          return 'Credenciales inválidas';
        case 0:
          return 'no se puede conectar con el servidor';
        default:
          return this.getErrorMessageFromResponse(error);
      }
    }

    return error?.message || 'Error de conexión con el servidor';
  }

  private handleValidationError(error: HttpErrorResponse): string {
    const apiError = error.error as ValidationErrorResponse

    //procesar errores de validación de @Valid de springboot
    if (apiError.errors && Object.keys(apiError.errors).length > 0) {
      return this.getMostImportantValidationError(apiError.errors);
    }

    //Manejar mensajes especificos del backend
    if (apiError.message) {
      return this.translateToUserFriendlyMessage(apiError.message);
    }
    return 'Por favor, completa todos los campos requeridos.';
  }

  //Obyener el error de validación más importante
  private getMostImportantValidationError(errors: { [key: string]: string[] }): string {
    const fieldPriority = [
      'email', 'cedula', 'password', 'phoneNumber',
      'firstName', 'lastName', 'address', 'comuna', 'region'
    ];

    // Buscar el primer error según prioridad
    for (const field of fieldPriority) {
      if (errors[field] && errors[field].length > 0) {
        return this.formatValidationError(field, errors[field][0]);
      }
    }

    //si no coinciden co prioridad, tomar l primero
    const firstField = Object.keys(errors)[0];
    const firstError = errors[firstField][0];
    return this.formatValidationError(firstField, firstError);
  }

  //Formatear errores de validación
  private formatValidationError(field: string, message: string): string {
    const fieldNames: { [key: string]: string } = {
      'firstName': 'Nombres',
      'lastName': 'Apellidos',
      'email': 'Correo electrónico',
      'password': 'Contraseña',
      'phoneNumber': 'Teléfono',
      'cedula': 'Cédula de identidad',
      'rut': 'RUT',
      'address': 'Dirección',
      'comuna': 'Comuna',
      'region': 'Región',
      'businessName': 'Nombre de empresa'
    };

    const fieldName = fieldNames[field] || field;
    return `${fieldName}: ${message}`;
  }

  private getPriorityErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error;

    if (apiError?.message) {
      return this.translateToUserFriendlyMessage(apiError.message);
    }
    return 'Por favor, verifica la información ingresada.';
  }

  private translateToUserFriendlyMessage(backendMessage: string): string {
    const messageMap: { [key: string]: string } = {
      'La cédula ya está registrada': 'Esta cédula de identidad ya está registrada. ¿Ya tienes una cuenta?',
      'El email ya esta registrado': 'Este correo electrónico ya está registrado. ¿Has olvidado tu contraseña?',
      'Las contraseñas no coinciden': 'Las contraseñas no coinciden. Por favor, verifica que sean iguales.',
      'Credenciales inválidas': 'Correo electrónico o contraseña incorrectos.',
      'Error de validation': 'Algunos datos no son válidos. Por favor, revísalos.'
    };

    return messageMap[backendMessage] || backendMessage;
  }


  private getErrorMessageFromResponse(error: HttpErrorResponse): string {
    const apiError = error.error;
    return apiError?.message || `Error del servidor (${error.status})`;
  }

  constructor() { }
}
