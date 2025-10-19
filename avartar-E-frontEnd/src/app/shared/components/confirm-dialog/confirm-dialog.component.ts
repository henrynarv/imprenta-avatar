import { Component, computed, inject } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroExclamationTriangle, heroInformationCircle, heroQuestionMarkCircle, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { AlertService } from '../../service/alert.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [NgIcon],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  providers: [
    provideIcons({
      heroXMark, heroQuestionMarkCircle, heroExclamationTriangle,
      heroTrash, heroInformationCircle
    })
  ],
})
export class ConfirmDialogComponent {
  // Inyección del servicio
  private alertService = inject(AlertService);
  dialogId = Math.random().toString(36).substring(2, 9);

  // Signals computadas del servicio
  isOpen = computed(() => this.alertService.isConfirmDialogOpen());
  dialogConfig = computed(() => this.alertService.confirmDialogConfig());

  /**
   * Cierra el diálogo sin confirmar
   */
  closeDialog(): void {
    this.alertService.closeConfirmDialog();
  }

  /**
   * Confirma la acción
   */
  confirm(): void {
    this.alertService.handleConfirmResponse(true);
  }

  /**
   * Cancela la acción
   */
  cancel(): void {
    this.alertService.handleConfirmResponse(false);
  }

  /**
   * Maneja el evento de teclado (ESC para cerrar)
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel();
    } else if (event.key === 'Enter') {
      this.confirm();
    }
  }

  /**
   * Previene la propagación del evento click
   */
  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Obtiene el color del icono según el tipo de diálogo
   */
  getIconColor(): string {
    const config = this.dialogConfig();
    if (!config) return 'text-blue-500';

    // Inferir tipo por el icono o contenido
    if (config.icon === 'heroTrash') {
      return 'text-red-500';
    } else if (config.icon === 'heroExclamationTriangle') {
      return 'text-yellow-500';
    } else if (config.icon === 'heroInformationCircle') {
      return 'text-blue-500';
    }

    return 'text-purple-500';
  }
}
