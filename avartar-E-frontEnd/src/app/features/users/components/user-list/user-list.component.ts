import { Component, inject, input, output, signal } from '@angular/core';
import { UserManagementService } from '../../services/user-management.service';
import { AdminUser } from '../../models/user-management.interface';
import { isReactive } from '@angular/core/primitives/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBuildingOffice, heroChartBar, heroCheck, heroCheckCircle, heroChevronDown, heroChevronLeft, heroChevronRight, heroCircleStack, heroCog, heroPhone, heroShieldCheck, heroUser, heroUserGroup, heroXCircle } from '@ng-icons/heroicons/outline';
import { DatePipe } from '@angular/common';
import { UserActionsComponent } from "../user-actions/user-actions.component";

@Component({
  selector: 'app-user-list',
  imports: [NgIcon, DatePipe, UserActionsComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  providers: [
    provideIcons({
      heroUserGroup,
      heroChevronDown,
      heroShieldCheck,
      heroCheckCircle,
      heroXCircle,
      heroCircleStack,
      heroUser,
      heroCog,
      heroChartBar,
      heroChevronLeft,
      heroChevronRight,
      heroBuildingOffice, heroPhone,
      heroCheck,
    })
  ]
})
export class UserListComponent {

  private userManagementService = inject(UserManagementService)

  //Inputs
  users = input.required<AdminUser[]>();
  loading = input<boolean>(false);
  selectedUsers = input.required<number[]>();
  paginationInfo = input.required<any>();

  //outputs
  userSelected = output<number>();
  userStatusToggled = output<number>();
  userRoleChanged = output<{ userId: number; newRole: 'user' | 'admin' }>();
  userEdit = output<AdminUser>();
  userViewDetails = output<AdminUser>();


  //señal local para controlas detalles expandidod
  expandedUserId = signal<number | null>(null);

  //alterna la selelción de un usuario
  toggleUserSelection(userId: number): void {
    this.userSelected.emit(userId);
  }

  toggleSelectAll(): void {
    this.userManagementService.toggleSelectAll();
  }

  updateFilters(page: any): void {
    this.userManagementService.updateFilters({ page });
  }


  //alterna el estado de un usuario
  onUserStatusToggle(userId: number): void {
    this.userStatusToggled.emit(userId);
  }

  //cambia el rol de un usuario
  onUserRoleChange(event: { userId: number, newRole: 'user' | 'admin' }): void {
    this.userRoleChanged.emit(event);
  }




  //maneja la edción de  usuario
  onUserEdit(user: AdminUser): void {
    this.userEdit.emit(user);
  }

  //maneja la visualizacion de detalles
  onUserViewDetails(user: AdminUser): void {
    this.userViewDetails.emit(user);
  }

  //alterna los detalles expendidos de un usuario
  toggleUserDetails(userId: number): void {
    if (this.expandedUserId() === userId) {
      this.expandedUserId.set(null);
    } else {
      this.expandedUserId.set(userId);
    }
  }

  //verifica si un usuario está seleccionado
  isUserSelected(userId: number): boolean {
    return this.selectedUsers().includes(userId);
  }

  areAllUsersSelected(): boolean {
    const all = this.users();
    return all.length > 0 && all.every(user => this.isUserSelected(user.id));
  }

  //Obtiene la clase para el badge de rol
  getRoleBadgeClass(role: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

    return role === 'admin'
      ? `${baseClasses} bg-purple-100 text-purple-800 border-purple-200`
      : `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
  }

  //Obtiene la clase para el badge de estado
  getStatusBadgeClass(isActive: boolean): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
    return isActive
      ? `${baseClasses} bg-green-100 text-green-800 border-green-200`
      : `${baseClasses} bg-red-100 text-red-800 border-red-200`;
  }

  //Obtiene el texto para el ultimo login
  getLastLoginText(user: AdminUser): string {
    if (!user.lastLogin) {
      return 'Nunca';
    }

    const lastLogin = new Date(user.lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoy';
    } else if (diffDays === 2) {
      return 'Ayer';
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`;
    } else {
      return lastLogin.toLocaleDateString();
    }
  }


  //Obtine el icono para el estado de verificacion de email
  getEmailVerificationIcon(user: AdminUser): string {
    return user.emailVerified ? 'heroCheckCircle' : 'heroXCircle';
  }

  //obtine el color para el etado v¿de verificación de email
  getEmailVerificationColor(user: AdminUser): string {
    return user.emailVerified ? 'text-green-500' : 'text-red-400';
  }

  //Obtiene el texto para el estado de verificación de email
  getEmailVerificationText(user: AdminUser): string {
    return user.emailVerified ? 'Verificado' : 'No verificado';
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.paginationInfo().totalPages;
    const currentPage = this.paginationInfo().currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);

      // Mostrar puntos suspensivos si estamos lejos del inicio
      if (currentPage > 4) {
        pages.push('...');
      }

      // Mostrar las páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Mostrar puntos suspensivos si estamos lejos del final
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Siempre mostrar la última página
      pages.push(totalPages);
    }

    return pages;
  }

}
