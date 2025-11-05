import { Component, computed, ElementRef, HostListener, input, output, ViewChild } from '@angular/core';
import { AdminUser } from '../../models/user-management.interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck, heroCheckCircle, heroChevronDown, heroEye, heroNoSymbol, heroPencil, heroShieldCheck, heroUser } from '@ng-icons/heroicons/outline';
import { CdkDropList } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-user-actions',
  imports: [NgIcon],
  templateUrl: './user-actions.component.html',
  styleUrl: './user-actions.component.scss',
  providers: [
    provideIcons({
      heroEye,
      heroPencil,
      heroShieldCheck,
      heroChevronDown,
      heroUser,
      heroCheck,
      heroNoSymbol, heroCheckCircle
    })
  ]
})
export class UserActionsComponent {

  //Inputs
  user = input.required<AdminUser>();
  loading = input<boolean>(false);

  //outputs para las acciones
  editUser = output<AdminUser>();
  toggleStatus = output<number>();
  changeRole = output<{ userId: number; newRole: 'user' | 'admin' }>();
  viewDetails = output<AdminUser>();



  // Variables para el dropdown
  isRoleDropdownOpen = false;

  // Método para toggle del dropdown
  toggleRoleDropdown() {
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  // Para cerrar el dropdown al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.roleDropdownContainer && !this.roleDropdownContainer.nativeElement.contains(event.target)) {
      this.isRoleDropdownOpen = false;
    }
  }

  // Asegúrate de agregar esta referencia
  @ViewChild('roleDropdownContainer', { static: false }) roleDropdownContainer!: ElementRef;


  //maneja la acción de activar/desactivar usuario
  onToggleStatus(): void {
    if (!this.loading()) {
      this.toggleStatus.emit(this.user().id);
    }
  }

  //manejo cambio de rol
  onChangeRole(newRole: 'user' | 'admin'): void {
    if (!this.loading() && this.user().role !== newRole) {
      this.changeRole.emit({ userId: this.user().id, newRole })
    }
  }

  //maneja la edicion del usuario
  onEditUser(): void {
    if (!this.loading()) {
      this.editUser.emit(this.user());
    }
  }


  //manej ala visualizacion de detalle
  onViewDetails(): void {
    if (!this.loading()) {
      this.viewDetails.emit(this.user());
    }
  }

  //Obtiene el texto del bot´on de estado
  // getStatusButtonText():string{
  //   return this.user().isActive ? 'Desactivar' : 'Activar';
  // }
  getStatusButtonText = computed(() => {
    const user = this.user(); // lee el valor actual de la signal
    return user.isActive ? 'Desactivar' : 'Activar';
  });

  getStatusButtonClass(): string {
    return this.user().isActive
      ? 'bg-orange-400 text-white font-medium px-4 py-2 rounded hover:bg-orange-500 transition-colors'
      : 'bg-green-500 text-white font-medium px-4 py-2 rounded hover:bg-green-600 transition-colors';
  }

  //Obtine el icono del botonde estado
  getStatusButtonIcon(): string {
    return this.user().isActive ? 'heroNoSymbol' : 'heroCheckCircle';
  }

  /**
     * Verifica si el usuario actual puede modificar este usuario
     * (Por ejemplo, no permitir que un admin se desactive a sí mismo)
     */
  canModifyUser(): boolean {
    // En una implementación real, verificarías permisos específicos
    return true;
  }
}
