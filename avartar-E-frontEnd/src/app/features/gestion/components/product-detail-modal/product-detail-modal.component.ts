import { Component, computed, inject, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroArchiveBox, heroArchiveBoxXMark, heroCalendar, heroChartBar, heroCheckCircle, heroClock, heroDocumentDuplicate, heroInformationCircle, heroPencil, heroPhoto, heroShoppingBag, heroStar, heroTag, heroTrash, heroTruck, heroUser, heroXCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { AlertService } from '../../../../shared/service/alert.service';
import { Product } from '../../../products/models/product.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail-modal',
  imports: [NgIcon, CommonModule],
  templateUrl: './product-detail-modal.component.html',
  styleUrl: './product-detail-modal.component.scss',
  providers: [provideIcons({
    heroXMark, heroPencil, heroDocumentDuplicate, heroArchiveBox,
    heroArchiveBoxXMark, heroTrash, heroPhoto, heroStar, heroShoppingBag,
    heroClock, heroCalendar, heroUser, heroChartBar, heroTag, heroTruck,
    heroCheckCircle, heroXCircle, heroInformationCircle
  })]
})
export class ProductDetailModalComponent {

  private alertService = inject(AlertService)

  //Inputs/ outputs de hijo al componente padre llamado ProductManagerPageComponent
  product = input.required<Product>();
  isOpen = input.required<boolean>();
  close = output<void>();
  edit = output<Product>();
  duplicate = output<Product>();
  toggleStatus = output<Product>();
  delete = output<Product>();


  //señal para detectar el scroll en el modal
  scrollContainer = viewChild<ElementRef>('scrollContainer')

  //señales para estado interno
  private _activeSection = signal<string>('info');
  private _isloadingStats = signal<boolean>(false);

  //computed properties
  activeSection = this._activeSection.asReadonly();
  isloadingStats = this._isloadingStats.asReadonly();

  //Estadisticas calculadas
  discountPercentage = computed(() => {
    const product = this.product();
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    }
    return 0;
  });


  profitMargin = computed(() => {
    //En un caso real, esto vendria del backend con el consto real
    const product = this.product();
    const estimatedCost = product.price * 0.6; //40% margen estimado
    return Math.round((product.price - estimatedCost) / product.price * 100);
  });


  stockStatus = computed(() => {
    const product = this.product();
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock < 10) return 'low-stock';
    return 'En stock';
  });

  //secciones disponibles para navegación
  sections = [
    { id: 'info', name: 'Información', icon: 'heroInformationCircle' },
    { id: 'pricing', name: 'Precios', icon: 'heroTag' },
    { id: 'inventory', name: 'Inventario', icon: 'heroShoppingBag' },
    { id: 'specs', name: 'Especificaciones', icon: 'heroChartBar' },
    { id: 'media', name: 'Imágenes', icon: 'heroPhoto' },
    { id: 'metadata', name: 'Metadatos', icon: 'heroCalendar' },
  ];

  ngAfterViewInit(): void {
    const container = this.scrollContainer()?.nativeElement as HTMLElement;

    container.addEventListener('scroll', () => this.updateActiveSection());
  }


  //Detecta que metodo detectaraá que sección esra más visible
  private updateActiveSection(): void {
    const container = this.scrollContainer()?.nativeElement as HTMLElement;
    const sections = container.querySelectorAll('section[id]');
    const scrollPosition = container.scrollTop + 200; // margen para compensar encabezados

    let currentSectionId = '';

    sections.forEach((section) => {
      const rect = (section as HTMLElement).offsetTop;
      if (scrollPosition >= rect) {
        currentSectionId = (section as HTMLElement).id;
      }
    });

    if (currentSectionId && this._activeSection() !== currentSectionId) {
      this._activeSection.set(currentSectionId);
    }
  }



  ngOnInit(): void {
    // Cargar estadísticas adicionales si es necesario
    this.loadAdditionalStats();
  }


  // Carga estadísticas adicionales del producto
  private loadAdditionalStats(): void {
    //simular carga de datos adicionales
    this._isloadingStats.set(true);
    setTimeout(() => {
      this._isloadingStats.set(false);
    }, 1000)
  }

  //Cambia la sección activa
  setActiveSection(sectionId: string): void {
    this._activeSection.set(sectionId);
    //Scroll suave a la sección
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  //cierra el modal
  onClose(): void {
    this.close.emit();
  }

  //emite el evento para editar producto
  onEdit(): void {
    this.edit.emit(this.product());
  }



  //Emite evento para duplicar producto
  onDuplicate(): void {
    this.alertService.confirm({
      title: 'Duplicar Producto',
      message: `¿Quieres duplicar "${this.product().name}"? Se creará una copia con "(Copia)" en el nombre.`
    }).then(confirmed => {
      if (confirmed) {
        this.duplicate.emit(this.product());
      }
    });
  }

  //Emite el vento para cambiar el estado dle producto
  onToggleStatus(): void {
    const action = this.product().isActive ? 'desactivar' : 'activar';

    this.alertService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Producto`,
      message: `¿Quieres ${action} "${this.product().name}"?`
    }).then(confirmed => {
      if (confirmed) {
        this.toggleStatus.emit(this.product());
      }
    });
  }

  //emite evento para eliminar producto
  onDelete(): void {
    this.alertService.confirmDelete(this.product().name, 'producto').then(confirmed => {
      if (confirmed) {
        this.delete.emit(this.product());
        this.onClose();
      }
    });
  }


  //Formatea la categoría para mostrar
  formatCategory(category: string): string {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  //obtiene la clase CSS para el badge de stock
  getStockBadgeClass(): string {
    const status = this.stockStatus();
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'out-of-stock':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'low-stock':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-green-100 text-green-800`;
    }
  }

  //Obtiene el texto para el badge de stock
  getStockBadgeText(): string {
    const status = this.stockStatus();
    switch (status) {
      case 'out-of-stock':
        return 'Agotado';
      case 'low-stock':
        return 'Stock bajo';
      default:
        return 'En stock';
    }
  }

  //Calcula el porcentaje de stock restante
  getStockPercentage(): number {
    const product = this.product();
    // Asumimos stock máximo de 100 para calcular porcentaje
    const maxStock = 100;
    return Math.min((product.stock / maxStock) * 100, 100);
  }


  //Verifica si el producto tiene especificaciones técnicas
  hasSpecifications(): boolean {
    const specs = this.product().specifications;
    return !!(
      specs.paperType ||
      specs.size ||
      specs.color ||
      specs.finish ||
      specs.material ||
      specs.printingMethod ||
      specs.packaging
    );
  }


  //Formatea una fecha para mostrar
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  //maneja el click feura del modal para cerrar
  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('fixed')) {
      this.onClose();
    }
  }
}
