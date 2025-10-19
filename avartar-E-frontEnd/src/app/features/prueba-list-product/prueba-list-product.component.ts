import { Component, inject } from '@angular/core';
import { AlertService } from '../../shared/service/alert.service';

@Component({
  selector: 'app-prueba-list-product',
  imports: [],
  templateUrl: './prueba-list-product.component.html',
  styleUrl: './prueba-list-product.component.scss'
})
export class PruebaListProductComponent {
  private alertService = inject(AlertService);

  products = [
    { id: 1, name: 'Tarjetas de Presentación' },
    { id: 2, name: 'Volantes Publicitarios' },
    { id: 3, name: 'Folletos Corporativos' }
  ];

  /**
   * Ejemplo: Eliminar producto con confirmación
   */
  async deleteProduct(product: any): Promise<void> {
    try {
      await this.alertService.withConfirmation(
        () => {
          // Simular eliminación
          this.products = this.products.filter(p => p.id !== product.id);
          return Promise.resolve();
        },
        {
          title: 'Eliminar Producto',
          message: `¿Estás seguro de que quieres eliminar "${product.name}"?`,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          icon: 'heroTrash'
        }
      );
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  }

  /**
   * Ejemplos de diferentes tipos de alertas
   */
  showSuccess(): void {
    this.alertService.success(
      'Operación exitosa',
      'El producto se ha guardado correctamente'
    );
  }

  showError(): void {
    this.alertService.error(
      'Error al guardar',
      'No se pudo completar la operación. Inténtalo nuevamente.'
    );
  }

  showWarning(): void {
    this.alertService.warning(
      'Advertencia',
      'Estás a punto de realizar una acción irreversible.'
    );
  }

  showInfo(): void {
    this.alertService.info(
      'Información',
      'Tu solicitud está siendo procesada.'
    );
  }

  /**
   * Ejemplo de confirmación simple
   */
  async confirmAction(): Promise<void> {
    const confirmed = await this.alertService.confirm({
      title: 'Confirmar acción',
      message: '¿Estás seguro de que quieres realizar esta acción?',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Volver'
    });

    if (confirmed) {
      // Ejecutar acción
      this.alertService.success('Acción completada', 'La acción se realizó correctamente');
    }
  }

}
