import { Injectable, signal } from '@angular/core';

// Interfaces para tipado fuerte
export interface CompanyInfo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
}

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
  color: string;
}

export interface QuickLink {
  name: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class FooterDataService {

  private _companyInfo = signal<CompanyInfo>({
    name: 'E-Imprenta Chile',
    description: 'Tu solución integral en impresión digital y offset. Calidad, rapidez y precios competitivos para todo Chile.',
    address: 'Av. Principal 1234, Santiago, Chile',
    phone: '+56 9 1234 5678',
    email: 'contacto@eimprenta.cl',
    businessHours: 'Lunes a Viernes: 9:00 - 18:00 hrs | Sábados: 10:00 - 14:00 hrs'
  });

  private _quickLinks = signal<QuickLink[]>([
    { name: 'Inicio', path: '/home' },
    { name: 'Catálogo', path: '/products' },
    { name: 'Servicios', path: '/services' },
    { name: 'Nosotros', path: '/about' },
    { name: 'Contacto', path: '/contact' }
  ])

  private _services = signal<string[]>([
    'Tarjetas de Presentación',
    'Volantes y Flyers',
    'Folletos y Catálogos',
    'Invitaciones',
    'Papelería Corporativa',
    'Sellos y Timbres',
    'Impresión Digital',
    'Gran Formato'
  ])

  private _socialLinks = signal<SocialLink[]>([
    {
      name: 'Facebook',
      icon: 'simpleFacebook',
      url: 'https://facebook.com/eimprentachile',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Instagram',
      icon: 'simpleInstagram',
      url: 'https://instagram.com/eimprentachile',
      color: 'hover:text-pink-600'
    },
    {
      name: 'WhatsApp',
      icon: 'simpleWhatsapp',
      url: 'https://wa.me/987447318',
      color: 'hover:text-green-600'
    },
    {
      name: 'Youtube',
      icon: 'simpleYoutube',
      url: 'https://www.youtube.com/watch?v=8Rh-Lm0dqOk&list=RD8Rh-Lm0dqOk&start_radio=1',
      color: 'hover:text-red-500'
    }
  ])

  private _paymentMethods = signal<string[]>([
    'WebPay',
    'Transferencia',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Efectivo'
  ]);

  private _shippingMethods = signal<string[]>([
    'Chilexpress',
    'Starken',
    'Blue Express',
    'Retiro en Tienda',
    'Despacho Same Day (Santiago)'
  ]);


  //getters reactivos usando señales
  get companyInfo() {
    return this._companyInfo.asReadonly();
  }

  get quickLinks() {
    return this._quickLinks.asReadonly();
  }

  get services() {
    return this._services.asReadonly();
  }

  get socialLinks() {
    return this._socialLinks.asReadonly();
  }

  get paymentMethods() {
    return this._paymentMethods.asReadonly();
  }

  get shippingMethods() {
    return this._shippingMethods.asReadonly();
  }


  // Método para futuro consumo de API
  // loadFooterDataFromApi(): Observable<FooterData> {
  //   return this.http.get<FooterData>('/api/footer-data');
  // }


  constructor() { }
}
