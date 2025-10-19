import { Component, computed, inject } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroCheckCircle, heroExclamationTriangle, heroInformationCircle, heroQuestionMarkCircle, heroXCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { AlertService } from '../../service/alert.service';
import { AlertConfig } from '../../interfaces/alert.interface';

@Component({
  selector: 'app-alert-container',
  imports: [NgIcon],
  templateUrl: './alert-container.component.html',
  styleUrl: './alert-container.component.scss',
  providers: [
    provideIcons({
      heroCheckCircle, heroXCircle, heroExclamationTriangle,
      heroInformationCircle, heroQuestionMarkCircle, heroXMark
    })
  ],
})
export class AlertContainerComponent {

  // Inyección del servicio de alertas
  private alertService = inject(AlertService);

  // Signals computadas del servicio
  alerts = computed(() => this.alertService.alerts());

  /**
   * Obtiene las clases CSS según el tipo de alerta
   */
  getAlertClasses(alert: AlertConfig): string {
    const baseClasses = 'relative p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out max-w-sm animate-alert-in ';

    const typeClasses = {
      success: 'bg-green-50 border-green-500 text-green-800',
      error: 'bg-red-50 border-red-500 text-red-800',
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
      info: 'bg-blue-50 border-blue-500 text-blue-800',
      question: 'bg-purple-50 border-purple-500 text-purple-800'
    };

    return baseClasses + typeClasses[alert.type];
  }

  /**
   * Obtiene las clases CSS para el icono según el tipo
   */
  getIconClasses(alert: AlertConfig): string {
    const typeClasses = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
      question: 'text-purple-500'
    };

    return typeClasses[alert.type];
  }

  /**
   * Obtiene el icono correspondiente al tipo de alerta
   */
  getAlertIcon(alert: AlertConfig): string {
    if (alert.icon) return alert.icon;

    const typeIcons = {
      success: 'heroCheckCircle',
      error: 'heroXCircle',
      warning: 'heroExclamationTriangle',
      info: 'heroInformationCircle',
      question: 'heroQuestionMarkCircle'
    };

    return typeIcons[alert.type];
  }

  /**
   * Obtiene las clases CSS para el botón de confirmar
   */
  getConfirmButtonClasses(alert: AlertConfig): string {
    const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ';

    const typeClasses = {
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      error: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
      info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      question: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
    };

    return baseClasses + typeClasses[alert.type];
  }

  /**
   * Cierra una alerta específica
   */
  closeAlert(alertId: string): void {
    this.alertService.removeAlert(alertId);
  }

  /**
   * Maneja la acción de confirmar en alertas que requieren acción
   */
  onConfirm(alert: AlertConfig): void {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    this.closeAlert(alert.id!);
  }

  /**
   * Maneja la acción de cancelar en alertas que requieren acción
   */
  onCancel(alert: AlertConfig): void {
    if (alert.onCancel) {
      alert.onCancel();
    }
    this.closeAlert(alert.id!);
  }

  /**
   * Obtiene las clases CSS para el contenedor según la posición
   */
  getContainerClasses(): string {
    // Por simplicidad, usamos top-right como posición principal
    // En una implementación completa, se manejarían todas las posiciones
    return 'fixed top-20 right-4 z-50 space-y-3 max-h-screen overflow-y-auto';
  }

  /**
   * TrackBy function para optimizar rendimiento
   */
  trackByAlertId(index: number, alert: AlertConfig): string {
    return alert.id!;
  }

}
