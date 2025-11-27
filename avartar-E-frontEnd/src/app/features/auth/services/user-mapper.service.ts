import { Injectable } from '@angular/core';
import { AuthResponse, User } from '../models/auth-interface';

@Injectable({
  providedIn: 'root'
})
export class UserMapperService {

  mapAuthResponseToUser(authResponse: AuthResponse): User {
    return {
      id: authResponse.userId,
      cedula: '',
      firstName: authResponse.fullName.split(' ')[0] || '',
      lastName: authResponse.fullName.split(' ').slice(1).join(' ') || '',
      email: authResponse.email,
      phoneNumber: '',
      address: '',
      comuna: '',
      region: '',
      businessName: '',
      rut: '',
      isBusiness: false,
      active: true,
      role: authResponse.role,
      fullName: authResponse.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

  }

  constructor() { }
}
