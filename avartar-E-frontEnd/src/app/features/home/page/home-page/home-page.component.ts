import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowRight, heroChatBubbleLeftRight, heroCheckBadge, heroDocumentText, heroPhoto, heroPrinter, heroShieldCheck, heroStar, heroTruck } from '@ng-icons/heroicons/outline';
import { ProductService } from '../../../products/services/product.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { Router } from '@angular/router';
import { Product } from '../../../products/models/product.interface';
import { AlertService } from '../../../../shared/service/alert.service';
import { ProductCardComponent } from "../../../../shared/components/product-card/product-card.component";
import { SliderComponent } from "../../components/slider/slider.component";

@Component({
  selector: 'app-home-page',
  imports: [NgIcon, ProductCardComponent, SliderComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  providers: [
    provideIcons({
      heroArrowRight,
      heroCheckBadge,
      heroStar,
      heroTruck,
      heroShieldCheck,
      heroChatBubbleLeftRight,
      heroPrinter,
      heroPhoto,
      heroDocumentText
    })
  ],
})
export class HomePageComponent {

  private productService = inject(ProductService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private alertService = inject(AlertService)

  //signal para estado  del componente
  private _featuredProducts = signal<Product[]>([]);
  private _isLoading = signal<boolean>(true);
  private _activeTestimonial = signal<number>(0);


  // computed proerties
  featuredProducts = computed(() => this._featuredProducts());
  isLoading = computed(() => this.loadingService.isLoading());
  activeTestimonial = computed(() => this._activeTestimonial());

  // Datos estáticos para la página de inicio
  services = [
    {
      icon: 'heroPrinter',
      title: 'Impresión Digital',
      description: 'Calidad profesional en todos tus proyectos de impresión',
      features: ['Full Color', 'Rápido', 'Económico']
    },
    {
      icon: 'heroDocumentText',
      title: 'Diseño Gráfico',
      description: 'Diseños creativos que destacan tu marca',
      features: ['Logotipos', 'Branding', 'Material Publicitario']
    },
    {
      icon: 'heroPhoto',
      title: 'Gran Formato',
      description: 'Impresiones de impacto para publicidad',
      features: ['Lonas', 'Vinilos', 'Backlight']
    }
  ];

  features = [
    {
      icon: 'heroTruck',
      title: 'Envío Rápido',
      description: 'Entrega en 24-48 horas en Santiago'
    },
    {
      icon: 'heroShieldCheck',
      title: 'Calidad Garantizada',
      description: 'Resultados profesionales asegurados'
    },
    {
      icon: 'heroStar',
      title: 'Precios Competitivos',
      description: 'La mejor relación calidad-precio'
    },
    {
      icon: 'heroChatBubbleLeftRight',
      title: 'Soporte Expertos',
      description: 'Asesoría profesional en tu proyecto'
    }
  ];

  testimonials = [
    {
      name: 'María González',
      company: 'Imprenta Creativa S.A.',
      comment: 'Excelente servicio y calidad en nuestras tarjetas de presentación. Muy recomendables.',
      rating: 5,
      image: '/images/image.jpg'
    },
    {
      name: 'Carlos Rodríguez',
      company: 'Agencia Marketing Plus',
      comment: 'Los volantes que imprimimos tuvieron un impacto increíble en nuestra campaña.',
      rating: 5,
      image: '/images/image.jpg'
    },
    {
      name: 'Ana Fernández',
      company: 'Eventos Elegance',
      comment: 'Las invitaciones para nuestra boda fueron exactamente como las soñamos. ¡Perfectas!',
      rating: 5,
      image: '/images/image.jpg'
    }
  ];

  //inicalización del componete
  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.startTestimonialRotation();
  }


  //Carga los productos destacados para mostrar en el home
  private loadFeaturedProducts(): void {
    this._isLoading.set(true);
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this._featuredProducts.set(products);
        this._isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro al cargar prodcutos destacados:', error);
        this.alertService.error(
          'Error',
          'No se pudieron cargar los productos destacados. Intenta nuevamente.');

        this._isLoading.set(false);
      }

    });
  }

  //Inica rotacion automatica de testimonios
  private startTestimonialRotation(): void {
    setInterval(() => {
      this.nextTestimonial();
    }, 5000); //cambia cada 5 seguudos
  }

  // Navega al siguiente testimonio
  nextTestimonial(): void {
    this._activeTestimonial.update(current =>
      current >= this.testimonials.length - 1 ? 0 : current + 1
    );
  }

  // navega al testimonio anterior
  previousTestimonial(): void {
    this._activeTestimonial.update(current =>
      current <= 0 ? this.testimonials.length - 1 : current - 1
    )
  }

  //Selecciona un testimonio específico
  selectTestimonial(index: number): void {
    this._activeTestimonial.set(index);
  }

  //navega al catalogo de productos;
  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Navega a una categoría específica
   */
  navigateToCategory(category: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category }
    });
  }

  /**
  * Navega a la página de contacto
  */
  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  /**
   * Maneja el click en un producto destacado
   */
  onProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  //Maneja el agregar al carrito desde productos destacados
  onAddToCart(product: Product): void {
    this.productService.addToCart(product.id, 1);
    this.alertService.success('Producto agregado', 'El producto se agrego al carrito');
  }


  /**
   * Obtiene las clases CSS para un item de testimonio
   */
  getTestimonialClasses(index: number): string {
    const baseClasses = 'transition-all duration-500 ease-in-out transform';

    if (index === this.activeTestimonial()) {
      return `${baseClasses} opacity-100 scale-100 translate-x-0`;
    } else if (index < this.activeTestimonial()) {
      return `${baseClasses} opacity-0 scale-95 -translate-x-8 absolute`;
    } else {
      return `${baseClasses} opacity-0 scale-95 translate-x-8 absolute`;
    }
  }


  /**
 * Genera estrellas de rating para testimonios
 */
  generateStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }


  /**
   * TrackBy functions para optimización
   */
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByService(index: number, service: any): string {
    return service.title;
  }

  /**
   * Limpia los intervals al destruir el componente
   */
  ngOnDestroy(): void {
    // En una implementación real, limpiaríamos los intervals aquí
  }
}
