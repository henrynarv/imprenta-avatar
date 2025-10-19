import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { NgIcon, NgIconComponent, provideIcons, NgGlyph } from '@ng-icons/core';
import { heroBuildingOffice, heroCalendarDays, heroDocumentText, heroEnvelope, heroMapPin, heroPhone, heroUser, heroXMark } from '@ng-icons/heroicons/outline';
import { OrderDetail } from '../../models/report.interface';

@Component({
  selector: 'app-order-detail-modal',
  imports: [CommonModule, CurrencyPipe, NgIconComponent, NgIcon,],
  templateUrl: './order-detail-modal.component.html',
  styleUrl: './order-detail-modal.component.scss',
  providers: [
    provideIcons({
      heroXMark, heroUser, heroEnvelope, heroPhone, heroMapPin,
      heroBuildingOffice, heroCalendarDays, heroDocumentText
    })
  ]
})
export class OrderDetailModalComponent {

  overlay = viewChild<ElementRef>('overlay');


  //inputs para recibir datos del componeyte padre
  order = input<OrderDetail | null>(null);

  // TODO modificar a false
  isOpen = input<boolean>(false);

  //output para enviar datos al componente padre
  closed = output<void>();



  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.classList.add('overflow-hidden');

        const el = this.overlay();
        if (el) {
          el.nativeElement.focus();
        }
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    });
  }

  ngOnDestroy() {
    document.body.classList.remove('overflow-hidden');
  }


  //computed properties
  orderStatusColor = computed(() => {
    const status = this.order()?.status.toLowerCase()
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800  border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status || 'pending'] || 'bg-gray-100 text-gray-800 border-gray-200';
  })

  //cierra el modal
  closeModal() {
    this.closed.emit();
  }

  //Maneja el click en el overlay:
  //cierra el modal cuando hace click fuera del contenido
  onOverLayClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal()
    }
  }

  //maneka el evento del teclado (EsC para cerrar)
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal()
    }
  }


  //Formatea la fecha para mostrar
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  trackByItemId(index: number, item: any): number {
    return item.id;
  }
}
