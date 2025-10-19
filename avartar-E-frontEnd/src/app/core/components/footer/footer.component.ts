import { Component, computed, inject, signal } from '@angular/core';
import { FooterDataService, CompanyInfo, SocialLink, QuickLink } from '../../services/footer-data.service';
import { NgIcon, NgIconComponent, provideIcons } from "@ng-icons/core";
import { heroCheckBadgeSolid, heroChevronRightSolid, heroClockSolid, heroEnvelopeSolid, heroMapPinSolid } from '@ng-icons/heroicons/solid';
import { heroPhoneSolid } from '@ng-icons/heroicons/solid';
import { RouterLink } from '@angular/router';
import { APP_ASSETS } from '../../../shared/constants/assets';


@Component({
  selector: 'app-footer',
  imports: [NgIcon, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  providers: provideIcons({
    heroMapPinSolid, heroPhoneSolid, heroEnvelopeSolid, heroClockSolid, heroChevronRightSolid, heroCheckBadgeSolid
  })
})
export class FooterComponent {


  logoUrl_color = APP_ASSETS.LOGO_COLOR

  private footerDataService = inject(FooterDataService);

  private _currentYear = signal<number>(new Date().getFullYear());
  private _isLoading = signal<boolean>(false);

  currentYear = computed(() => this._currentYear());
  isLoading = computed(() => this._isLoading());

  // datos reactivos del servicio
  companyInfo = this.footerDataService.companyInfo;
  quickLinks = this.footerDataService.quickLinks;
  services = this.footerDataService.services;
  socialLinks = this.footerDataService.socialLinks;
  paymentMethods = this.footerDataService.paymentMethods;
  shippingMethods = this.footerDataService.shippingMethods;

  hasSocialLinks = computed(() => this.socialLinks().length > 0);
  hasQuickLinks = computed(() => this.quickLinks().length > 0);
  hasServices = computed(() => this.services().length > 0);


  // abre enlaces externos
  openExternalLink(url: string, event?: Event) {
    event?.preventDefault();
    if (this.isValidUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open('URL no válida', url);
    }

  }


  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'tel:', 'mailto:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // manejo de enlaces de telefono
  onPhoneClick(phoneNumber: string, event: Event): void {
    event.preventDefault();
    const learNumber = phoneNumber.replace(/\D/g, '');
    window.open(`tel:${learNumber}`, '_blank');
  }

  // manejo de enlaces de email
  onEmailClick(email: string, event: Event): void {
    event.preventDefault();

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // En móviles abre la app de correo en una pestaña nueva
      window.open(`mailto:${email}`, '_blank');
    } else {
      try {
        // Intentar abrir cliente de correo del sistema
        const mailtoWin = window.open(`mailto:${email}`, '_blank');

        // Si no se abre nada útil, fallback a Gmail
        setTimeout(() => {
          if (mailtoWin && mailtoWin.closed) {
            // si mailto se cerró rápido → abrimos Gmail
            window.open(
              `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
              '_blank',
              'noopener,noreferrer'
            );
          }
        }, 500);
      } catch {
        // Fallback Gmail directo
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    }
  }
  // TrackBy generico para las listas
  trackByIndex<T>(index: number, _: T): number {
    return index;
  }
  //TrackBy para social links
  trackBySocialLink(_: number, item: SocialLink): string {
    return item.name;
  }

  /**
   * TrackBy para quick links
   */
  trackByQuickLink(_: number, item: QuickLink): string {
    return item.name;
  }

}
