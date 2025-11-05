import { Component, effect, inject, signal } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { UserManagementService } from '../../services/user-management.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AdminUser, BulkActionRequest, UserQueryParams } from '../../models/user-management.interface';
import { heroArrowDownTray, heroUserPlus } from '@ng-icons/heroicons/outline';
import { UserStatsCardComponent } from "../../components/user-stats-card/user-stats-card.component";
import { UserFiltersComponent } from "../../components/user-filters/user-filters.component";
import { UserListComponent } from "../../components/user-list/user-list.component";


@Component({
  selector: 'app-user-management-page',
  imports: [NgIcon, UserStatsCardComponent, UserFiltersComponent, UserListComponent],
  templateUrl: './user-management-page.component.html',
  styleUrl: './user-management-page.component.scss',
  providers: [
    provideIcons({
      heroArrowDownTray, heroUserPlus
    })
  ]
})
export class UserManagementPageComponent {

  //Inyeccon de servicios
  private userManagementService = inject(UserManagementService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();


  //señales del servicio

  users = this.userManagementService.paginatedUsers;
  filteredUsers = this.userManagementService.filteredUsers;
  selectedUsers = this.userManagementService.selectedUsers;
  isLoading = this.userManagementService.isLoading;
  userStats = this.userManagementService.userStats;
  currentFilters = this.userManagementService.currentFilters;
  paginationInfo = this.userManagementService.paginationInfo;

  //señales locales
  private _statsLoading = signal<boolean>(false);
  private _actionLoading = signal<boolean>(false);

  //computed para el estado general
  readonly statsLoading = this._statsLoading.asReadonly();
  readonly actionLoading = this._actionLoading.asReadonly();

  //inicializa el componente
  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadInitialData();



  }

  constructor() {
    effect(() => {
      const filters = this.currentFilters();
      console.log('filtros actualizados: ', filters);
    })
  }

  //impia las suscripciones al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.userManagementService.clearSelectedUsers();
  }

  //Verifica que el usuario tenga acceso de administrador
  private checkAdminAccess(): void {
    if (!this.authService.hasRole('admin')) {
      this.alertService.error(
        'Acceso no denegado',
        'No tienes permisos para acceder a esta sección'
      );
      this.router.navigate(['/']);
    }
  }

  //carga los datos iniciales
  private loadInitialData() {
    this.userManagementService.getUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        console.log('Usuarios cargados exitosamente');
      },
      error: (error) => {
        console.error('Error al cargar los usuarios: ', error);
        this.alertService.error('Error', 'No se pudo cargar los usuarios');
      }
    });

  }


  //maneja el cambio d filtros
  onFiltersChanged(newFilters: Partial<UserQueryParams>): void {
    this.userManagementService.updateFilters(newFilters);
  }

  //maneja la seleccion/deseleccion de usuarios
  onUserSelected(userId: number): void {
    this.userManagementService.toggleUserSelection(userId);
  }

  //manjea el cambio de estado de un usuario
  onUserStatusToggled(userId: number): void {
    this._actionLoading.set(true);

    this.userManagementService.toggleUserStatus(userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedUser) => {
        this._actionLoading.set(false);
        this.alertService.success(
          'Estado actualizado',
          `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} Exitosamente`
        )
      },
      error: (error) => {
        this._actionLoading.set(false);
        this.alertService.error('Error', 'No se pudo actualizar el estado del usuario');
        console.error('Error al cambair estado: ', error);
      }
    })
  }

  //maneja el camio de rol de un usuario
  onUserRoleChanged(event: { userId: number, newRole: 'user' | 'admin' }): void {
    this._actionLoading.set(true);

    this.userManagementService.updateUserRole(event.userId, event.newRole).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedUser) => {
        this._actionLoading.set(false);
        this.alertService.success(
          'Rol actualizado',
          `Usuario ahora es ${event.newRole === 'admin' ? 'administardor' : 'usuario normal'}`
        )
      },
      error: (error) => {
        this._actionLoading.set(false);
        this.alertService.error('Error', 'No se pudo actualizar el rol del usuario');
        console.error('Error al cambair rol: ', error);
      }
    });
  }

  //maneja acciones masivas
  onBulkAction(action: string): void {
    const selectedCount = this.selectedUsers().length;

    if (selectedCount === 0) {
      this.alertService.warning(
        'Accion requerida',
        'Selecciona almenos un usuario'
      )
      return;
    }

    //confirmacón para acciones destructivas
    if (action === 'delete') {
      if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedCount} usuario(s)? Esta acción no se puede deshacer.`)) {
        return;
      }
    }

    this._actionLoading.set(true);

    const bulkRequest: BulkActionRequest = {
      userIds: this.selectedUsers(),
      action: action as any
    };

    this.userManagementService.bulkAction(bulkRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this._actionLoading.set(false);
        this.alertService.success('Accion completada', response.message);
      },
      error: (error) => {
        this._actionLoading.set(false);
        this.alertService.error('Error', 'No se pudo realizar la accion masiva');
        console.error('Error al realizar la accion masiva: ', error);
      }
    })
  }

  //actualiza las estadisticas
  // onRefreshStats(): void {
  //   this._statsLoading.set(true);
  //   //Simular actualización de estadisticas
  //   setTimeout(() => {
  //     this._statsLoading.set(false);
  //     this.alertService.info(
  //       'Estadisticas actualizadas',
  //       'Datos refrescados correctamente'
  //     );
  //   }, 1000);
  // }

  //maneja la edición de usuario
  onUserEdit(user: AdminUser): void {

    // En una implementación real, abrirías un modal o navegarías a la página de edición
    this.alertService.info(
      'Editar Usuario',
      `Funcionalidad de edición para ${user.name} ${user.lastName}`
    );
    console.log('Editar usuario:', user);
  }

  //maneja la visiazlizacon de detalles
  onUserViewDetails(user: AdminUser): void {
    // En una implementación real, mostrarías un modal con detalles completos
    this.alertService.info(
      'Detalles del Usuario',
      `Vista detallada de ${user.name} ${user.lastName}`
    );
    console.log('Ver detalles de usuario:', user);
  }

  //Exporta la lista de usuarios
  exportUsers(): void {
    this.alertService.info('Exportar', 'Funcionalidad de exportación en desarrollo');
    // Implementar lógica de exportación a CSV/Excel
  }


  //Navega a crear nuevo usuario
  createNewUser(): void {
    this.alertService.info('Nuevo Usuario', 'Funcionalidad de creación en desarrollo');
    // this.router.navigate(['/admin/users/create']);
  }
}
