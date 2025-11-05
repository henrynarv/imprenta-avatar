import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck, heroExclamationTriangle, heroInformationCircle, heroPhoto, heroXMark } from '@ng-icons/heroicons/outline';
import { AlertService } from '../../../../shared/service/alert.service';
import { Product, ProductCategory } from '../../../products/models/product.interface';
import { min } from 'rxjs';
import { CdkDropList } from "@angular/cdk/drag-drop";
import { Product3DData, Product3DUploadComponent } from '../../../products/components/product-three-d-upload/product-three-d-upload.component';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, NgIcon, CommonModule, Product3DUploadComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  providers: [provideIcons({
    heroXMark,
    heroPhoto,
    heroCheck,
    heroExclamationTriangle,
    heroInformationCircle
  })]
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);

  //input/ oututs
  product = input<Product | null>(null);
  save = output<Product>();
  cancel = output<void>();

  //señales del componente
  private _isSubmitting = signal<boolean>(false);
  private _selectedImages = signal<string[]>([]);
  private _activeTab = signal<'basic' | 'pricing' | 'inventory' | 'media' | 'specs' | '3d'>('basic')


  private initial3DData: Product3DData | null = null;

  //señales para datos 3D
  private _product3DData = signal<Product3DData | null>(null)
  private _has3DChanges = signal<boolean>(false);

  // computes para datis 3D
  product3DData = this._product3DData.asReadonly();
  has3DChanges = this._has3DChanges.asReadonly();



  //computed properties
  isSubmitting = computed(() => this._isSubmitting());
  selectImages = computed(() => this._selectedImages());
  activeTab = computed(() => this._activeTab());
  isEditing = computed(() => !!this.product());

  //categorias disonibles
  categories: ProductCategory[] = [
    'tarjetas-de-presentacion',
    'volantes',
    'folletos',
    'postales',
    'invitaciones',
    'sellos',
    'papeleria-corporativa',
    'impresion-digital',
    'gran-formato'
  ]

  // formaulario reactivo
  productForm = this.fb.group({
    //Informacion básica
    basic: this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      category: ['', [Validators.required]],
      tags: ['']
    }),

    //Precios
    pricing: this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0, [Validators.min(0)]],
      hasDiscount: [false],
    }),


    //inventario
    inventory: this.fb.group({
      stock: [0, [Validators.required, Validators.min(0)]],
      minimumOrder: [1, [Validators.required, Validators.min(1)]],
      deliveryTime: ['3 días hábiles', [Validators.required]],
      isActive: [true],
      isFeatured: [false],
    }),

    //especificaciones técnicas
    specs: this.fb.group({
      paperType: [''],
      size: [''],
      color: ['full Color'],
      finish: [''],
      material: [''],
      printingMethod: [''],
      packaging: [''],
    })
  })

  //getteter para acceder fácilmnete a los controles
  get basicControls() {
    return (this.productForm.get('basic') as any).controls;
  }

  get pricingControls() {
    return (this.productForm.get('pricing') as any).controls;
  }


  get inventoryControls() {
    return (this.productForm.get('inventory') as any).controls;
  }

  get specsControls() {
    return (this.productForm.get('specs') as any).controls;
  }


  ngOnInit(): void {
    //cargar datos del producto si estamos editando
    const currentProduct = this.product();
    if (currentProduct) {
      this.loadProductData(currentProduct);
    }
    //configurar validaciones cruzadas
    this.setupCrossFieldValidation()

    //cargar datos 3D existentessi estamos editando
    if (currentProduct?.model3D) {
      this._product3DData.set({
        gltfUrl: currentProduct.model3D.gltfUrl,
        defaultColor: currentProduct.model3D.defaultColor,
        colorableParts: currentProduct.model3D.colorableParts,
        format: currentProduct.model3D.format,
        fileSize: currentProduct.model3D.fileSize,
      })

      this.initial3DData = { ...currentProduct.model3D }
    }
  }

  //carga los datos del producto en el formulario
  private loadProductData(product: Product): void {
    //Grupo básico
    this.basicControls.name.setValue(product.name);
    this.basicControls.description.setValue(product.description);
    this.basicControls.category.setValue(product.category);
    this.basicControls.tags.setValue(product.tags.join(','));


    //Grupo de precios
    this.pricingControls.price.setValue(product.price);
    this.pricingControls.originalPrice.setValue(product.originalPrice || 0);
    this.pricingControls.hasDiscount.setValue(!!product.originalPrice);

    //Grupo de inventario
    this.inventoryControls.stock.setValue(product.stock);
    this.inventoryControls.minimumOrder.setValue(product.minimumOrder);
    this.inventoryControls.deliveryTime.setValue(product.deliveryTime);
    this.inventoryControls.isActive.setValue(product.isActive);
    this.inventoryControls.isFeatured.setValue(product.isFeatured);

    //grupo de especificaciones
    if (product.specifications) {
      const specs = product.specifications;
      this.specsControls.paperType.setValue(specs.paperType || '');
      this.specsControls.size.setValue(specs.size || '');
      this.specsControls.color.setValue(specs.color || 'full Color');
      this.specsControls.finish.setValue(specs.finish || '');
      this.specsControls.material.setValue(specs.material || '');
      this.specsControls.printingMethod.setValue(specs.printingMethod || '');
      this.specsControls.packaging.setValue(specs.packaging || '');
    }

    //imágenes
    this._selectedImages.set(product.images || []);

    //argar datos 3D existentes
    if (product.model3D) {
      this._product3DData.set({
        gltfUrl: product.model3D.gltfUrl,
        defaultColor: product.model3D.defaultColor,
        colorableParts: product.model3D.colorableParts,
        format: product.model3D.format,
        fileSize: product.model3D.fileSize
      });

      this.initial3DData = { ...product.model3D }
    }

  }

  //maneja la subida exisosa del modelo 3D
  on3DModelUpload(modelData: Product3DData): void {
    console.log('🎯 Modelo 3D recibido en padre:', modelData);
    this._product3DData.set(modelData);
    this._has3DChanges.set(true);
    console.log('Modelo 3D subido:', modelData);
  }

  //maneja la eliminación del modeo 3D
  on3DModelRemoved(): void {
    this._product3DData.set(null);
    this._has3DChanges.set(true);
    console.log('Modelo 3D removido');
  }

  //manjea cambios en los datos 3D
  on3DModelChanged(hasChanged: boolean): void {
    this._has3DChanges.set(hasChanged);
    console.log('🔄 Cambios 3D:', hasChanged);
  }


  //Configura validaciones cruzadas entre campos
  private setupCrossFieldValidation(): void {
    //validacion: precio original debe ser mayor que el  precio actual si hay descuento
    this.pricingControls.hasDiscount.valueChanges.subscribe((hasDiscount: FormGroup) => {
      const originalPriceCtrl = this.pricingControls.originalPrice;
      if (hasDiscount) {
        originalPriceCtrl.setValidators([Validators.required, Validators.min(0), this.originalPriceValidator]);
      } else {
        originalPriceCtrl.setValidators([Validators.min(0)]);
        originalPriceCtrl.setValue(0, { emitEvent: false });
      }
      originalPriceCtrl.updateValueAndValidity();
    })
  }

  private originalPriceValidator(control: AbstractControl): ValidationErrors | null {
    const priceCtrl = control.parent?.get('price');
    if (!priceCtrl) return null;

    const price = priceCtrl.value;
    const originalPrice = control.value;
    if (originalPrice && originalPrice <= price) {
      return { originalPriceInvalid: true };
    }
    return null;
  }

  //cambia la pestaña activa
  setActiveTab(tab: 'basic' | 'pricing' | 'inventory' | 'media' | 'specs' | '3d'): void {
    this._activeTab.set(tab);
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // En una implementación real, aquí subirías las imágenes
      // Por ahora, simulamos con URLs mock
      const newImages = Array.from(input.files).map(file =>
        URL.createObjectURL(file)
      );

      this._selectedImages.update(images => [...images, ...newImages]);
      input.value = ''; // Reset input
    }
  }

  //Elimina una imagen seleccinada
  removeImage(index: number): void {
    this._selectedImages.update(images => images.filter((_, i) => i !== index));
  }

  //maneja el envio del formulario
  onSubmit(): void {
    this.markAllAsTouched();

    //validacion especifica para la estaña 3D
    if (this.activeTab() === '3d' && this._has3DChanges() && this.markAllAsTouched()) {
      this.alertService.warning(
        'Modelo 3D incompleto',
        'Hay cambios pendientes en el modelo 3D. Completa la subida o cancela los cambios.'
      );
      return;
    }

    if (this.productForm.valid && this.validate3DModel()) {
      this._isSubmitting.set(true);

      try {
        const formData = this.prepareFormData();
        // Simular envío asíncrono
        setTimeout(() => {
          this.save.emit(formData);
          this._isSubmitting.set(false);


          //Resetear bandera de cambios después de guardar
          this._has3DChanges.set(false);
        }, 2000); // 2 segundos para probar el estado "Guardando..."
      } catch (error) {
        this.alertService.error('Error', 'No se pudo guardar el producto');
        console.log('Error al guardar el producto: ', error);
      }
    } else {
      this.alertService.warning(
        'Formualrio inválido',
        'Por favor, corrige los errores en el formulario'
      );

    }
  }


  //prepara los datos del formulario
  private prepareFormData(): any {
    const basic = this.productForm.value.basic!;
    const pricing = this.productForm.value.pricing!;
    const inventory = this.productForm.value.inventory!;
    const specs = this.productForm.value.specs!;



    // return {
    //   name: basic.name!.trim(),
    //   description: basic.description!.trim(),
    //   category: basic.category as ProductCategory,
    //   tags: basic.tags ? basic.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],

    //   price: Number(pricing.price),
    //   originalPrice: pricing.hasDiscount ? Number(pricing.originalPrice) : undefined,

    //   stock: Number(inventory.stock),
    //   minimumOrder: Number(inventory.minimumOrder),
    //   deliveryTime: inventory.deliveryTime!,
    //   isActive: inventory.isActive!,
    //   isFeatured: inventory.isFeatured!,

    //   images: this._selectedImages(),

    //   specifications: {
    //     paperType: specs.paperType || undefined,
    //     size: specs.size || undefined,
    //     color: specs.color || undefined,
    //     finish: specs.finish || undefined,
    //     material: specs.material || undefined,
    //     printingMethod: specs.printingMethod || undefined,
    //     packaging: specs.packaging || undefined
    //   },

    //   //campos que se generan automaticamente
    //   rating: this.product()?.rating || 0,
    //   reviewCount: this.product()?.reviewCount || 0,



    // }
    const formData: any = {
      // ... datos existentes ...
      name: basic.name!.trim(),
      description: basic.description!.trim(),
      category: basic.category as ProductCategory,
      tags: basic.tags ? basic.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],

      price: Number(pricing.price),
      originalPrice: pricing.hasDiscount ? Number(pricing.originalPrice) : undefined,

      stock: Number(inventory.stock),
      minimumOrder: Number(inventory.minimumOrder),
      deliveryTime: inventory.deliveryTime!,
      isActive: inventory.isActive!,
      isFeatured: inventory.isFeatured!,

      images: this._selectedImages(),

      specifications: {
        paperType: specs.paperType || undefined,
        size: specs.size || undefined,
        color: specs.color || undefined,
        finish: specs.finish || undefined,
        material: specs.material || undefined,
        printingMethod: specs.printingMethod || undefined,
        packaging: specs.packaging || undefined
      },

      // Campos automáticos
      rating: this.product()?.rating || 0,
      reviewCount: this.product()?.reviewCount || 0
    };

    // ✅ MEJORAR: Lógica mejorada para datos 3D
    const current3DData = this._product3DData();
    const has3DChanges = this._has3DChanges();

    // Solo incluir datos 3D si hay cambios o es un nuevo modelo
    if (has3DChanges) {
      if (current3DData) {
        // Modelo subido o modificado
        formData.model3D = {
          gltfUrl: current3DData.gltfUrl,
          defaultColor: current3DData.defaultColor,
          colorableParts: current3DData.colorableParts,
          format: current3DData.format,
          fileSize: current3DData.fileSize,
          createdAt: this.product()?.model3D?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        formData.has3DModel = true;
      } else {
        // Modelo eliminado
        formData.model3D = null;
        formData.has3DModel = false;
      }
    } else if (this.isEditing() && this.product()?.model3D) {
      // En edición sin cambios, mantener datos existentes
      formData.model3D = this.product()!.model3D;
      formData.has3DModel = true;
    }

    // ✅ AGREGAR: Incluir ID si estamos editando
    if (this.isEditing() && this.product()) {
      formData.id = this.product()!.id;
    }

    console.log('📦 Datos preparados para enviar:', {
      tieneModelo3D: !!formData.model3D,
      hayCambios3D: has3DChanges,
      datos3D: formData.model3D
    });

    return formData;
  }





  //marca todos los campos como touched para mostrar errores
  private markAllAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const group = this.productForm.get(key) as any;
      if (group.controls) {
        Object.keys(group.controls).forEach(controlKey => {
          group.controls[controlKey].markAsTouched();
        });
      }
    })
  }

  //Obtine clases CSS para inputs
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg  focus:outline-none focus:ring-2 transition-all duration-200 ';//'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }
    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }


  //Obtiene el manejo de error para un campo
  getErrorMessage(control: any, fieldName: string): string {
    // const field = this.productForm.get(fieldName);

    if (!control?.touched || !control?.errors) return '';

    const errors = control.errors;

    const errorMessages: Record<string, string> = {
      required: 'Este campo es requerido',
      minlength: `Minimo ${errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Maximo ${errors['maxlength']?.requiredLength} caracteres`,
      min: `El valor minimo es ${errors['min']?.min}`,
      originalPriceInvalid: 'El precio original debe ser mayor al precio actual',
    };

    for (const key in errors) {
      if (errorMessages[key]) {
        return errorMessages[key];
      }
    }

    return 'Campo invalido';
  }

  //Formatea el nombre de la categoría para mostrar
  formatCategoryName(category: string): string {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  //calcula el porcentaje de descuento
  getDiscountPercentage(): number {
    const price = this.pricingControls.price.value || 0;
    const originalPrice = this.pricingControls.originalPrice.value || 0;

    if (originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100)
    }
    return 0
  }




  //============ NUEVOS METODOS
  // ✅ AGREGAR: Método para debug del estado 3D
  debug3DState(): void {
    console.log('🐛 Estado 3D actual:', {
      product3DData: this._product3DData(),
      has3DChanges: this._has3DChanges(),
      initial3DData: this.initial3DData,
      isEditing: this.isEditing(),
      activeTab: this.activeTab()
    });
  }

  // ✅ AGREGAR: Validación del modelo 3D
  private validate3DModel(): boolean {
    // Si estamos en la pestaña 3D y hay cambios, validar
    if (this.activeTab() === '3d' && this._has3DChanges()) {
      if (this._product3DData()) {
        const modelData = this._product3DData()!;
        // Validar que tenga los campos mínimos requeridos
        return !!(modelData.gltfUrl && modelData.format);
      }
      return false; // Hay cambios pero no hay datos
    }
    return true; // No hay cambios en 3D o no estamos en esa pestaña
  }

  // ✅ AGREGAR: Cambiar a pestaña con errores
  private switchToFirstInvalidTab(): void {
    const tabs = ['basic', 'pricing', 'inventory', 'media', 'specs', '3d'] as const;

    for (const tab of tabs) {
      if (this.isTabInvalid(tab)) {
        this.setActiveTab(tab);
        this.alertService.info(
          'Revisa esta pestaña',
          `Hay errores que corregir en la sección ${tab}`
        );
        break;
      }
    }
  }

  // ✅ AGREGAR: Verificar si una pestaña tiene errores
  private isTabInvalid(tab: string): boolean {
    switch (tab) {
      case 'basic':
        return this.productForm.get('basic')?.invalid ?? false;
      case 'pricing':
        return this.productForm.get('pricing')?.invalid ?? false;
      case 'inventory':
        return this.productForm.get('inventory')?.invalid ?? false;
      case 'specs':
        return this.productForm.get('specs')?.invalid ?? false;
      case '3d':
        return this._has3DChanges() && !this.validate3DModel();
      default:
        return false;
    }
  }


  ngOnDestroy() {
    // Limpiar URLs de imágenes para evitar memory leaks
    this._selectedImages().forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }
}
