import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroBuildingOffice, heroCalendar, heroCheckBadge, heroCog6Tooth, heroEnvelope, heroMapPin, heroPencilSquare, heroPhone, heroShieldCheck, heroUser } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../auth/services/auth.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from '../../../auth/models/auth-interface';
import { ProfileFormComponent } from "../../components/profile-form/profile-form.component";
import { AuthStateService } from '../../../auth/services/auth-state.service';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule, NgIcon, ProfileFormComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  providers: [
    provideIcons({
      heroUser,
      heroEnvelope,
      heroPhone,
      heroBuildingOffice,
      heroMapPin,
      heroCalendar,
      heroShieldCheck,
      heroPencilSquare,
      heroArrowLeft,
      heroCheckBadge,
      heroCog6Tooth
    })
  ],
})
export class ProfilePageComponent {

  //inyeccionde servicios
  private authStateService = inject(AuthStateService);
  private alertService = inject(AlertService)
  private router = inject(Router)
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>;


  //signal para el estado del componente
  private _isEditing = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);
  private _activeTab = signal<'profile' | 'security' | 'preferences'>('profile');

  //computed properties
  isEditing = computed(() => this._isEditing());
  isLoading = computed(() => this._isLoading());
  activeTab = computed(() => this._activeTab());
  currentUser = computed(() => this.authStateService.currentUser());
  userRole = computed(() => this.authStateService.userRole());

  //formatea la fecha para mostrar
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  //obtiene el texto del rol osea muestra el nombre mas amigable al usuario
  getRoleText(role: string): string {
    const roles = {
      'ROLE_USER': 'Usuario',
      'ROLE_ADMIN': 'Administrador'
    };
    return roles[role as keyof typeof roles] || role;
  }

  //Obtiene las clases CSS para el badge de rol
  getRoleBadgeClasses(role: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

    const roleClasses = {
      'user': 'bg-blue-100 text-blue-800 border-blue-200',
      'admin': 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return `${baseClasses} ${roleClasses[role as keyof typeof roleClasses] || 'bg-gray-100 text-gray-800 '}`
  }

  //cambia la pestaña activa
  setActiveTab(tab: 'profile' | 'security' | 'preferences'): void {
    this._activeTab.set(tab);
  }

  //alterna el modo de edicion
  toggleEditMode(): void {
    this._isEditing.set(!this.isEditing())
  }

  //cancela el modo ediciom
  cancelEdit(): void {
    this._isEditing.set(false);
  }

  //maneja la actualizacion del perfil
  // onProfileUpdate(updateUser: User): void {
  //   this._isLoading.set(true);

  //   this.authService.updateProfile(updateUser).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         this.alertService.success(
  //           'Perfil actualizado',
  //           'Tu perfil ha sido actualizado correctamente'
  //         );
  //         this._isEditing.set(false);
  //       }
  //       this._isLoading.set(false);
  //     },
  //     error: (error) => {
  //       console.log('Error al actualizar el perfil', error);
  //       this.alertService.error(
  //         'Error',
  //         'Ocurrio un error al actualizar el perfil'
  //       );
  //       this._isLoading.set(false);
  //     }
  //   })
  // }

  //navega hacia atras
  goBack(): void {
    // if (window.history.length > 1) {
    //   window.history.back();
    // } else {
    //   this.router.navigate(['/']);
    // }

    window.history.length > 1 ? window.history.back() : this.router.navigate(['/']);
  }


  //Obtine las clases para las pestañas
  getTabClasses(tab: string): string {
    const baseClasses = 'px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200';

    if (this.activeTab() === tab) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg`;
    }
    return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
  }

  /**
   * TrackBy function para optimización
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Limpia las subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
