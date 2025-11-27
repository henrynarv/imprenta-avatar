import { inject, Injectable, signal, computed } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { AdminUser, UserQueryParams, UsersResponse, UserStats, BulkActionRequest } from '../models/user-management.interface';
import { delay, filter, Observable, of, tap, throwError, map } from 'rxjs';
import { UserRole } from '../../auth/models/user-role.enum';
import { User } from '../../auth/models/auth-interface';
import { AuthStateService } from '../../auth/services/auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {


  private authStateService = inject(AuthStateService)

  //señales de estado
  private _users = signal<AdminUser[]>([]);
  private _filteredUsers = signal<AdminUser[]>([]);
  private _selectedUsers = signal<number[]>([]);
  private _isLoading = signal<boolean>(false);
  // private _userStats = signal<UserStats | null>(null);
  private _currentFilters = signal<UserQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });


  //señales computadas de solo lectura;
  readonly users = this._users.asReadonly();
  readonly filteredUsers = this._filteredUsers.asReadonly();
  readonly selectedUsers = this._selectedUsers.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  // readonly userStats = this._userStats.asReadonly();
  readonly currentFilters = this._currentFilters.asReadonly();

  //computed values para estadisticas en tiempo real
  readonly userStats = computed(() => {
    const users = this._users();
    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.active).length,
      adminUsers: users.filter(user => user.role === 'ROLE_ADMIN').length,
      newUsersThisMonth: this.getNewUsersThisMonth(users),
      verifiedUsers: users.filter(user => user.emailVerified).length,
      inactiveUsers: users.filter(user => !user.active).length,
      totalLogins: users.reduce((sum, user) => sum + user.loginCount, 0)
    }
  });

  //computed para paginación
  readonly paginationInfo = computed(() => {
    const users = this._filteredUsers();
    const { page, limit } = this._currentFilters();
    const totalPages = Math.ceil(users.length / limit!);

    return {
      currentPage: page!,
      totalPages,
      totalUsers: users.length,
      hasNext: page! < totalPages,
      hasPrev: page! > 1,
      startIndex: (page! - 1) * limit!,
      endIndex: Math.min(page! * limit!, users.length),
    }
  });


  //computed para usuarios paginados
  readonly paginatedUsers = computed(() => {
    const users = this._filteredUsers();
    const { startIndex, endIndex } = this.paginationInfo();
    return users.slice(startIndex, endIndex);
  })

  constructor() {
    this.initializeMockData();
    this.applyFilters(); // Aplicar filtros iniciales
  }

  //Obtiene toso los usuarios(Solo para adminstradores)
  getUsers(params?: UserQueryParams): Observable<UsersResponse> {
    //vericar permisos de admintrador
    if (!this.authStateService.hasRole('ROLE_ADMIN')) {
      return throwError(() => new Error('No tienes permisos para ver esta información'))
    }

    this._isLoading.set(true);

    //actualizar filtris si se proorciona
    if (params) {
      this._currentFilters.update(current => ({
        ...current,
        ...params
      }));
    }

    //simular la llamda a la api
    return of(this.generateUsersResponse()).pipe(
      delay(800),
      tap(response => {
        this._users.set(response.users);
        this.applyFilters();///aplicar filtros despues de cargar
        this._isLoading.set(false);
      })
    )

  }

  //aplicar los filtros actuales a la lista de usuarios
  applyFilters(): void {
    const users = this._users();
    const filters = this._currentFilters();

    let filtered = [...users];

    //filtro de busqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.businessName?.toLowerCase().includes(searchLower)
      )
    }

    //filtro por el rol
    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    //filtro por estado
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(user => user.active === isActive)
    }

    //ordenamiento
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'lastLogin':
          aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      // Comparación genérica (devuelve -1, 0, 1)
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      else if (aValue < bValue) comparison = -1;

      // Invertir si orden descendente
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });


    this._filteredUsers.set(filtered);

  }


  //Actualzia el rol de un usuario
  updateUserRole(userId: number, newRole: UserRole): Observable<AdminUser> {
    this._isLoading.set(true);
    return new Observable(observer => {
      setTimeout(() => {
        this._users.update(users =>
          users.map(user =>
            user.id === userId
              ? {
                ...user,
                role: newRole,
                updatedAt: new Date().toISOString()
              }
              : user
          )
        );
        this.applyFilters();//Re-aplicamos filtris dspues de actualizar

        const updatedUser = this._users().find(u => u.id === userId);
        if (updatedUser) {
          this._isLoading.set(false);
          observer.next(updatedUser);
          observer.complete();
        } else {
          this._isLoading.set(false);
          observer.error('Usuario no encontrado');
        }
      }, 500)
    });
  }

  //activa/desactiva un usuario
  toggleUserStatus(userId: number): Observable<AdminUser> {
    this._isLoading.set(true);

    return new Observable(observer => {
      setTimeout(() => {
        this._users.update(users =>
          users.map(user => {
            if (user.id === userId) {
              return {
                ...user,
                isActive: !user.active,
                updatedAt: new Date().toISOString()
              };
            }
            return user;
          })
        );

        this.applyFilters();

        const updatedUser = this._users().find(u => u.id === userId);
        if (updatedUser) {
          this._isLoading.set(false);
          observer.next(updatedUser);
          observer.complete();
        } else {
          this._isLoading.set(false);
          observer.error('Usuario no encontrado');
        }
      }, 500);
    });
  }

  //ejecuta acciones masivas sobte usuarios seleccionados
  bulkAction(actionRequest: BulkActionRequest): Observable<{ success: boolean; message: string }> {
    this._isLoading.set(true);

    return new Observable(observer => {
      setTimeout(() => {
        try {
          this._users.update(users =>
            users.map(user => {
              if (actionRequest.userIds.includes(user.id)) {
                switch (actionRequest.action) {
                  case 'activate':
                    return { ...user, isActive: true, updatedAt: new Date().toISOString() };
                  case 'deactivate':
                    return { ...user, isActive: false, updatedAt: new Date().toISOString() };
                  case 'makeAdmin':
                    return { ...user, role: UserRole.ROLE_ADMIN, updatedAt: new Date().toISOString() };
                  case 'removeAdmin':
                    return { ...user, role: UserRole.ROLE_USER, updatedAt: new Date().toISOString() };
                  case 'delete':
                    return user; // No eliminamos realmente en el mock
                  default:
                    return user;
                }
              }
              return user;
            })
          );

          this.applyFilters();
          this.clearSelectedUsers();

          this._isLoading.set(false);
          observer.next({
            success: true,
            message: `Acción ${actionRequest.action} aplicada a ${actionRequest.userIds.length} usuarios`
          });
          observer.complete();
        } catch (error) {
          this._isLoading.set(false);
          observer.error('Error al ejecutar acción masiva');
        }
      }, 800);
    });
  }

  //optine estadistica de usuarios
  getUsersStats(): Observable<UserStats> {
    return of(this.userStats()).pipe(delay(800));
  }

  //Selecciona/ deselecciona un usuario
  toggleUserSelection(userId: number): void {
    this._selectedUsers.update(selected => {
      if (selected.includes(userId)) {
        return selected.filter(id => id !== userId);
      } else {
        return [...selected, userId];
      }
    });
  }


  //selecciona/desecciona todos los usuarios visibles
  toggleSelectAll(): void {
    const currentUsers = this.paginatedUsers();
    const allSelected = currentUsers.every(user => this._selectedUsers().includes(user.id));

    if (allSelected) {
      //deselecciona todos
      this._selectedUsers.update(selected => selected.filter(id => !currentUsers.some(user => user.id === id)));
    } else {
      // Seleccionar todos
      const newSelected = [...this._selectedUsers()];
      currentUsers.forEach(user => {
        if (!newSelected.includes(user.id)) {
          newSelected.push(user.id);
        }
      });
      this._selectedUsers.set(newSelected);

    }
  }


  //Limpiar todos los usuarios seleccioandos
  clearSelectedUsers(): void {
    this._selectedUsers.set([]);
  }

  //actualiza los filtros de busqueda
  updateFilters(newFilters: Partial<UserQueryParams>): void {
    this._currentFilters.update(current => ({ ...current, ...newFilters }));
    this.applyFilters();
  }

  //genera respuesta simulada de la PI
  private generateUsersResponse(): UsersResponse {
    return {
      users: this._users(),
      pagination: {
        currentPage: this._currentFilters().page!,
        totalPages: Math.ceil(this._filteredUsers().length / this._currentFilters().limit!),
        totalUsers: this._filteredUsers().length,
        hasNext: false,
        hasPrev: false

      }
    }
  }

  //calcula los usuarios nuevos  este mes
  private getNewUsersThisMonth(users: AdminUser[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth &&
        userDate.getFullYear() === currentYear
    }).length
  }


  //Inicializa datos de prueba
  private initializeMockData(): void {
    const mockUsers: AdminUser[] = [
      {
        id: 1,
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@empresa.com',
        role: UserRole.ROLE_ADMIN,
        phoneNumber: '+56 9 1234 5678',
        businessName: 'Imprenta Creativa S.A.',
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-20T10:30:00Z',
        loginCount: 45,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-03-20T10:30:00Z',
        cedula: '',
        address: '',
        comuna: '',
        region: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 2,
        firstName: 'Carlos',
        lastName: 'López',
        email: 'carlos.lopez@cliente.com',
        role: UserRole.ROLE_ADMIN,
        phoneNumber: '+56 9 8765 4321',
        businessName: 'Distribuidora Norte',
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-19T14:20:00Z',
        loginCount: 12,
        createdAt: '2024-02-10T09:15:00Z',
        updatedAt: '2024-03-19T14:20:00Z',
        cedula: '',
        address: '',
        comuna: '',
        region: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 3,
        firstName: 'María',
        lastName: 'Fernández',
        email: 'maria.fernandez@gmail.com',
        role: UserRole.ROLE_USER,
        active: false,
        emailVerified: true,
        lastLogin: '2024-02-28T16:45:00Z',
        loginCount: 3,
        createdAt: '2024-01-20T11:30:00Z',
        updatedAt: '2024-03-01T10:00:00Z',
        cedula: '',
        phoneNumber: '',
        address: '',
        comuna: '',
        region: '',
        businessName: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 4,
        firstName: 'Roberto',
        lastName: 'Silva',
        email: 'roberto.silva@otraempresa.cl',
        role: UserRole.ROLE_ADMIN,
        phoneNumber: '+56 9 5555 6666',
        businessName: 'Corporación Print',
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-18T09:00:00Z',
        loginCount: 28,
        createdAt: '2024-01-05T14:20:00Z',
        updatedAt: '2024-03-18T09:00:00Z',
        cedula: '',
        address: '',
        comuna: '',
        region: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 5,
        firstName: 'Elena',
        lastName: 'Martínez',
        email: 'elena.martinez@nuevocliente.com',
        role: UserRole.ROLE_USER,
        phoneNumber: '+56 9 7777 8888',
        businessName: 'Tech Solutions',
        active: true,
        emailVerified: false,
        lastLogin: '2024-03-15T13:10:00Z',
        loginCount: 1,
        createdAt: '2024-03-01T16:45:00Z',
        updatedAt: '2024-03-15T13:10:00Z',
        cedula: '',
        address: '',
        comuna: '',
        region: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 6,
        firstName: 'Diego',
        lastName: 'Ramírez',
        email: 'diego.ramirez@startup.io',
        role: UserRole.ROLE_USER,
        phoneNumber: '+56 9 7777 8888',
        businessName: 'Tech Solutions',
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-17T11:20:00Z',
        loginCount: 8,
        createdAt: '2024-02-15T10:30:00Z',
        updatedAt: '2024-03-17T11:20:00Z',
        cedula: '',
        address: '',
        comuna: '',
        region: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 7,
        firstName: 'Laura',
        lastName: 'Hernández',
        email: 'laura.hernandez@consultora.com',
        role: UserRole.ROLE_USER,
        active: false,
        emailVerified: true,
        lastLogin: '2024-01-30T15:40:00Z',
        loginCount: 5,
        createdAt: '2023-12-10T12:00:00Z',
        updatedAt: '2024-02-01T09:15:00Z',
        cedula: '',
        phoneNumber: '',
        address: '',
        comuna: '',
        region: '',
        businessName: '',
        rut: '',
        isBusiness: false
      },

      {
        id: 8,
        firstName: 'Pablo',
        lastName: 'Gómez',
        email: 'pablo.gomez@estudio.com',
        role: UserRole.ROLE_ADMIN,
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-19T17:30:00Z',
        loginCount: 33,
        createdAt: '2024-01-08T08:45:00Z',
        updatedAt: '2024-03-19T17:30:00Z',
        cedula: '',
        phoneNumber: '',
        address: '',
        comuna: '',
        region: '',
        businessName: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 9,
        firstName: 'Sofía',
        lastName: 'Castillo',
        email: 'sofia.castillo@artes.com',
        role: UserRole.ROLE_USER,
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-16T14:15:00Z',
        loginCount: 7,
        createdAt: '2024-02-20T13:20:00Z',
        updatedAt: '2024-03-16T14:15:00Z',
        cedula: '',
        phoneNumber: '',
        address: '',
        comuna: '',
        region: '',
        businessName: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 10,
        firstName: 'Javier',
        lastName: 'Morales',
        email: 'javier.morales@consultor.cl',
        role: UserRole.ROLE_USER,
        active: true,
        emailVerified: false,
        lastLogin: '2024-03-14T10:00:00Z',
        loginCount: 2,
        createdAt: '2024-03-05T11:10:00Z',
        updatedAt: '2024-03-14T10:00:00Z',
        cedula: '',
        phoneNumber: '',
        address: '',
        comuna: '',
        region: '',
        businessName: '',
        rut: '',
        isBusiness: false
      },
      {
        id: 11,
        firstName: 'Valentina',
        lastName: 'Ruiz',
        email: 'valentina.ruiz@empresa.com',
        role: UserRole.ROLE_USER,
        active: true,
        emailVerified: true,
        lastLogin: '2024-03-13T16:30:00Z',
        loginCount: 6,
        createdAt: '2024-02-25T09:00:00Z',
        updatedAt: '2024-03-13T16:30:00Z',
        cedula: '',
        phoneNumber: '',
        address: '',
        comuna: '',
        region: '',
        businessName: '',
        rut: '',
        isBusiness: false

      }
    ];

    this._users.set(mockUsers);
  }
}
