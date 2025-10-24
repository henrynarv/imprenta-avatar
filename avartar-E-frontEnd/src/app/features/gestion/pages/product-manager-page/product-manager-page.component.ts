import { Component, inject, signal } from '@angular/core';
import { ProductStatusBadgeComponent } from "../../components/product-status-badge/product-status-badge.component";
import { ProductFiltersComponent } from "../../components/product-filters/product-filters.component";
import { ProductListManagerComponent } from "../../components/product-list-manager/product-list-manager.component";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroChartBar } from '@ng-icons/heroicons/outline';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductManagerService } from '../../../products/services/product-manager.service';
import { AlertService } from '../../../../shared/service/alert.service';

//Página principal de gestión de productos
//Orquesta todos los componentes de administración

@Component({
  selector: 'app-product-manager-page',
  imports: [ProductListManagerComponent, NgIcon, CommonModule],
  templateUrl: './product-manager-page.component.html',
  styleUrl: './product-manager-page.component.scss',
  providers: [provideIcons({ heroArrowLeft, heroChartBar })]
})
export class ProductManagerPageComponent {

  private router = inject(Router);
  private productManagerService = inject(ProductManagerService);
  private alertService = inject(AlertService);


  //Usamos las señales directamente del servicio;
  stats = this.productManagerService.stats;
  isLoading = this.productManagerService.isLoading;


  //filtros internos recibidos desde el componete hijo ProductListManager
  private statusFilter = signal<string>('');
  private stockFilter = signal<string>('');


  //recibe los filtros internos del hijo ProductListManager
  onFiltersChanged(event: { status: string; stock: string }): void {
    this.statusFilter.set(event.status);
    this.stockFilter.set(event.stock);
  }

  navigateToCatalogo(): void {
    this.router.navigate(['/products']);
  }


  //Exporta los pridctos a CSV (funcion b{asica})
  exportProducts(): void {
    let products = this.productManagerService.filteredProducts();
    if (products.length === 0) {
      this.alertService.warning(
        'Sin datos',
        'No hay productos para exportar'
      );
      return; //salimos si no hay productos
    }

    //aplicar filtros internos
    if (this.statusFilter() === 'active') {
      products = products.filter(p => p.isActive);
    } else if (this.statusFilter() === 'inactive') {
      products = products.filter(p => !p.isActive);
    }

    if (this.stockFilter() === 'low') {
      products = products.filter(p => p.stock > 0 && p.stock < 10);
    } else if (this.stockFilter() === 'out') {
      products = products.filter(p => p.stock === 0);
    }

    //crear CSV básico
    const headers = ['ID', 'Nombre', 'Precio', 'Stock', 'Estado'];
    const csvData = products.map(product => [
      product.id,
      `"${product.name}"`,
      product.category,
      product.price,
      product.stock,
      product.isActive ? 'Activo' : 'Inactivo'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    //descargar archivo
    this.downloadCSV(csvContent, 'productos-imprenta-avatar.csv');

    this.alertService.success(
      'Exportación exitosa',
      'Los productos se han exportado correctamente'
    )
  }

  //Descagar aarchivo CSV
  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

}
