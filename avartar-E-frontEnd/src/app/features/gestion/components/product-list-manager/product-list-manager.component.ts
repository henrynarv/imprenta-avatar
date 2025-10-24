import { CommonModule } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArchiveBox, heroArchiveBoxXMark, heroDocumentDuplicate, heroEye, heroPencil, heroPlus, heroTrash } from '@ng-icons/heroicons/outline';
import { ProductManagerService } from '../../../products/services/product-manager.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../../products/models/product.interface';
import { ProductFiltersComponent } from "../product-filters/product-filters.component";
import { ProductStatusBadgeComponent } from "../product-status-badge/product-status-badge.component";
import { ProductFormComponent } from "../product-form/product-form.component";
import { ProductDetailModalComponent } from "../product-detail-modal/product-detail-modal.component";

@Component({
  selector: 'app-product-list-manager',
  imports: [CommonModule, NgIcon, ProductFiltersComponent, ProductStatusBadgeComponent, ProductFormComponent, ProductDetailModalComponent],
  templateUrl: './product-list-manager.component.html',
  styleUrl: './product-list-manager.component.scss',
  providers: [provideIcons({
    heroEye,
    heroPencil,
    heroTrash,
    heroDocumentDuplicate,
    heroPlus,
    heroArchiveBox,
    heroArchiveBoxXMark
  })]
})
export class ProductListManagerComponent {

  //Inyecciónd de servicios
  private productManagerService = inject(ProductManagerService);
  private alerService = inject(AlertService);
  private router = inject(Router);

  // Output para comunicar filtros internos al padre (status, stock)
  filtersChanged = output<{ status: string; stock: string }>();



  //Señales del servicio
  products = this.productManagerService.filteredProducts;
  isLoading = this.productManagerService.isLoading;
  stats = this.productManagerService.stats;

  //señal local para controlar modales/dialogs
  private _selectedProduct = signal<Product | null>(null);
  private _showDeleteConfirm = signal<boolean>(false);
  private _showProductForm = signal<boolean>(false);

  //Señales para controlar el modal del detalle
  private _showProductDetail = signal<boolean>(false);
  private _detailProduct = signal<Product | null>(null);


  //computed properties para el modal de detalle
  showProductDetail = this._showProductDetail.asReadonly();
  detailProduct = this._detailProduct.asReadonly();

  // Filtros locales (status y stock)
  private statusFilter = signal<string>('');
  private stockFilter = signal<string>('');

  //computed properties
  selectedProduct = this._selectedProduct.asReadonly();
  showDeleteConfirm = this._showDeleteConfirm.asReadonly();
  showProductForm = this._showProductForm.asReadonly();


  // Computed: productos mostrados con filtros adicionales aplicados
  displayedProducts = computed(() => {
    let list = this.products();

    const status = this.statusFilter();
    const stock = this.stockFilter();

    // Filtrar por estado
    if (status === 'active') list = list.filter(p => p.isActive);
    else if (status === 'inactive') list = list.filter(p => !p.isActive);

    // Filtrar por stock
    if (stock === 'low') list = list.filter(p => p.stock > 0 && p.stock < 10);
    else if (stock === 'out') list = list.filter(p => p.stock === 0);

    return list;
  });

  // ========== INICO METODOS DEL DETALLE DE PRODUCTO ==========
  //abre el mdal de detalle
  viewProductDetails(product: Product): void {
    this._detailProduct.set(product);
    this._showProductDetail.set(true);
  }

  //cierra el modal de detalle
  closeProductDetail(): void {
    this._showProductDetail.set(false);
    this._detailProduct.set(null);
  }


  //maneja la edición desde el modal de detalle
  onEditFromDetail(product: Product): void {
    this.closeProductDetail();
    this.editProduct(product);
  }

  //maneja la duplicación desde el modal de detalle
  onDuplicateFromDetail(product: Product): void {
    this.closeProductDetail();
    this.duplicateProduct(product);
  }

  //Maneja el cambio de estado desde el modal de detalle
  onToggleStatusFromDetail(product: Product): void {
    this.closeProductDetail();
    this.toggleProductStatus(product);
  }


  //majena la eliminación desde el modal de detalle
  onDeleteFromDetail(product: Product): void {
    this.closeProductDetail();
    this.confirmDelete(product);
  }

  // ========== FIN METODOS DEL DETALLE DE PRODUCTO ==========


  //Recibe los filtros desde el hijo
  onFiltersChanged(event: { status: string; stock: string }): void {
    this.statusFilter.set(event.status);
    this.stockFilter.set(event.stock);
    this.filtersChanged.emit({
      status: event.status,
      stock: event.stock
    });
    console.log('Filtros actualizados:', event);
  }

  //abre el formularrio para crear nuevo producto
  createProduct(): void {
    this._selectedProduct.set(null);
    this._showProductForm.set(true);
  }

  //abre el formulario para editar producto
  editProduct(product: Product): void {
    this._selectedProduct.set(product);
    this._showProductForm.set(true);
  }

  //muestra confirmacion para eliminar producto
  confirmDelete(product: Product): void {
    this._selectedProduct.set(product);
    this._showDeleteConfirm.set(true);
  }

  //Ejecuta la eliminacion del producto
  deleteProduct(): void {
    const product = this.selectedProduct();
    if (product) {
      this.productManagerService.deleteProduct(product.id);
      //cierra la ventana de cofirmacion
      this._showDeleteConfirm.set(false)
      //limpia la seleccion actual;
      this._selectedProduct.set(null);
    }
  }

  // duplica el producto existenete
  duplicateProduct(product: Product): void {
    this.productManagerService.duplicateProduct(product.id);
  }

  //Activa/desactiba un producto
  toggleProductStatus(product: Product): void {
    this.productManagerService.toggleProductStatus(product.id);
  }


  //actualzia el stock de uyn producto
  updateStock(product: Product, newStock: number): void {
    this.productManagerService.updateStock(product.id, newStock);
  }

  // cierra el modal de confirmación
  closeDeleteConfirm(): void {
    this._showDeleteConfirm.set(false);
    this._selectedProduct.set(null);
  }

  //cierra el formulario producto
  closeProductForm(): void {
    this._showProductForm.set(false);
    this._selectedProduct.set(null);
  }

  //maneja el guardado del producto desde el formulario
  onProductSaved(productData: Product): void {
    const product = this.selectedProduct();
    if (product) {
      //editar producto existente
      this.productManagerService.updateProduct(product.id, productData);
    } else {
      //crear nuevo producto
      this.productManagerService.createProduct(productData);
    }
    this.closeProductForm();
  }

  //Obtiene la clase CSS para la fila según el estado del producto
  // getRowClasses(product:Product):string{
  //   let classes = 'hover:bg-gray-100 transition-colors';

  //   if(!product.isActive){
  //     classes += ' bg-gray-100 text-gray-400';
  //   }
  //   return classes
  // }

  getRowClasses(product: Product): string {
    const baseClasses = 'hover:bg-gray-50 transition-colors';
    if (!product.isActive) return `${baseClasses} bg-gray-100 opacity-75`;
    if (product.stock === 0) return `${baseClasses} bg-red-50`
    if (product.stock < 10) return `${baseClasses} bg-orange-50`
    return baseClasses;
  }


  //Formatea el nombre de la categoría para mostrar
  formatCategory(category: string): string {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  //Obtiene el txto del papel/tamaño para mostrar
  getSpecificationsText(product: Product): string {
    const spects = product.specifications;

    const parts = [];
    if (spects.paperType) parts.push(spects.paperType);
    if (spects) parts.push(spects.size);
    return parts.join('•') || 'Sin especificaciones';
  }
}
