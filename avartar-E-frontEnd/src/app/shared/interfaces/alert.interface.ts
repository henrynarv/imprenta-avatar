/**
 * Interfaces para el sistema de alertas y confirmaciones
 */

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question';
export type AlertPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface AlertConfig {
  id?: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number; // Duración en milisegundos (0 = no auto-cerrar)
  position?: AlertPosition;
  showCloseButton?: boolean;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  icon?: string;
  customClass?: string;
}

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  icon?: string;
  showCloseButton?: boolean;
}

export interface AlertState {
  alerts: AlertConfig[];
  isConfirmDialogOpen: boolean;
  confirmDialogConfig: ConfirmDialogConfig | null;
  confirmResolve?: (value: boolean) => void;
}
