import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
import { AlertConfig, ConfirmDialogConfig, AlertState, AlertType, AlertPosition } from '../interfaces/alert.interface';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private router = inject(Router);

  // Estado global de alertas usando Signals
  private _alertState = signal<AlertState>({
    alerts: [],
    isConfirmDialogOpen: false,
    confirmDialogConfig: null
  });

  // Computed properties para acceso reactivo
  alertState = computed(() => this._alertState());
  alerts = computed(() => this._alertState().alerts);
  isConfirmDialogOpen = computed(() => this._alertState().isConfirmDialogOpen);
  confirmDialogConfig = computed(() => this._alertState().confirmDialogConfig);

  /**
   * Muestra una alerta toast temporal
   */
  showAlert(config: AlertConfig): string {
    const alertId = uuidv4();
    const defaultConfig: AlertConfig = {
      id: alertId,
      duration: 5000,
      position: 'top-right',
      showCloseButton: true,
      showConfirmButton: false,
      ...config,
      type: config?.type ?? 'info',
    };

    // Agregar la alerta al estado
    this._alertState.update(state => ({
      ...state,
      alerts: [...state.alerts, defaultConfig]
    }));

    // Auto-remover si tiene duración
    if (defaultConfig.duration && defaultConfig.duration > 0) {
      setTimeout(() => {
        this.removeAlert(alertId);
      }, defaultConfig.duration);
    }

    return alertId;
  }

  /**
   * Métodos rápidos para tipos comunes de alertas
   */
  success(title: string, message: string, config?: Partial<AlertConfig>): string {
    return this.showAlert({
      type: 'success',
      title,
      message,
      icon: 'heroCheckCircle',
      ...config
    });
  }

  error(title: string, message: string, config?: Partial<AlertConfig>): string {
    return this.showAlert({
      type: 'error',
      title,
      message,
      icon: 'heroXCircle',
      duration: 7000, // Errores duran más
      ...config
    });
  }

  warning(title: string, message: string, config?: Partial<AlertConfig>): string {
    return this.showAlert({
      type: 'warning',
      title,
      message,
      icon: 'heroExclamationTriangle',
      ...config
    });
  }

  info(title: string, message: string, config?: Partial<AlertConfig>): string {
    return this.showAlert({
      type: 'info',
      title,
      message,
      icon: 'heroInformationCircle',
      ...config
    });
  }

  /**
   * Muestra un diálogo de confirmación (Promise-based)
   */
  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const dialogConfig: ConfirmDialogConfig = {
        title: config.title,
        message: config.message,
        confirmButtonText: config.confirmButtonText || 'Confirmar',
        cancelButtonText: config.cancelButtonText || 'Cancelar',
        confirmButtonColor: config.confirmButtonColor || 'bg-red-600 hover:bg-red-700',
        cancelButtonColor: config.cancelButtonColor || 'bg-gray-600 hover:bg-gray-700',
        icon: config.icon || 'heroQuestionMarkCircle',
        showCloseButton: config.showCloseButton !== false
      };

      this._alertState.update(state => ({
        ...state,
        isConfirmDialogOpen: true,
        confirmDialogConfig: dialogConfig,
        confirmResolve: resolve
      }));
    });
  }

  /**
   * Confirmación rápida para eliminar items
   */
  confirmDelete(itemName: string, itemType: string = 'elemento'): Promise<boolean> {
    return this.confirm({
      title: `Eliminar ${itemType}`,
      message: `¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'bg-red-600 hover:bg-red-700',
      icon: 'heroTrash'
    });
  }

  /**
   * Remueve una alerta específica
   */
  removeAlert(alertId: string): void {
    this._alertState.update(state => ({
      ...state,
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
  }

  /**
   * Limpia todas las alertas
   */
  clearAlerts(): void {
    this._alertState.update(state => ({
      ...state,
      alerts: []
    }));
  }

  /**
   * Maneja la respuesta del diálogo de confirmación
   */
  handleConfirmResponse(confirmed: boolean): void {
    const state = this._alertState();

    if (state.confirmResolve) {
      state.confirmResolve(confirmed);
    }

    this._alertState.update(prevState => ({
      ...prevState,
      isConfirmDialogOpen: false,
      confirmDialogConfig: null,
      confirmResolve: undefined
    }));
  }

  /**
   * Cierra el diálogo de confirmación
   */
  closeConfirmDialog(): void {
    this.handleConfirmResponse(false);
  }

  /**
   * Ejecuta una acción con confirmación
   * Útil para acciones destructivas como eliminar
   */
  async withConfirmation(
    action: () => void | Promise<void>,
    config: ConfirmDialogConfig
  ): Promise<void> {
    const confirmed = await this.confirm(config);

    if (confirmed) {
      try {
        await action();
        this.success('Acción completada', 'La operación se realizó correctamente');
      } catch (error) {
        this.error('Error', 'No se pudo completar la operación');
        throw error;
      }
    }
  }
}
