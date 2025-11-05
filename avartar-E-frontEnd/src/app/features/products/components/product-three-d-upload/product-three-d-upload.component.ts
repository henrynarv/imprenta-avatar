import { Component, inject, input, output, signal, computed } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroCheckCircle, heroCube, heroDocumentArrowUp, heroExclamationTriangle, heroPhoto, heroXMark } from '@ng-icons/heroicons/outline';
import { Product3dUploadService, Upload3DResult } from '../../services/product-3d-upload.service';
import { AlertService } from '../../../../shared/service/alert.service';


export interface Product3DData {
  gltfUrl: string,
  defaultColor: string,
  colorableParts: string[]
  format?: 'gltf' | 'glb' | 'bin'
  fileSize?: number
}


@Component({
  selector: 'app-product-3d-upload',
  imports: [NgIcon],
  templateUrl: './product-three-d-upload.component.html',
  styleUrl: './product-three-d-upload.component.scss',
  providers: [provideIcons({
    heroCube, heroDocumentArrowUp, heroXMark, heroPhoto,
    heroCheckCircle, heroExclamationTriangle
  })]
})
export class Product3DUploadComponent {
  private uploadService = inject(Product3dUploadService);
  private alertService = inject(AlertService);

  //inputs para integración con formulario padre
  productId = input<number>(0); //ID para generar rutas unicas
  existing3DData = input<Product3DData | null>(null);//datos existentes al editar

  //outputs para comincacion con el formulario padre
  modelUploaded = output<Product3DData>();
  modelRemoved = output<void>();
  modelChanged = output<boolean>();


  //Señales para estado del componente
  private _selectedFile = signal<File | null>(null);
  private _previewUrl = signal<string>('');
  private _isDragOver = signal<boolean>(false);
  private _uploadResult = signal<Upload3DResult | null>(null);
  private _defaultColor = signal<string>('#b3478c');

  //computed properties
  selectedFile = this._selectedFile.asReadonly();
  previewUrl = this._previewUrl.asReadonly();
  isDragOver = this._isDragOver.asReadonly();
  uploadResult = this._uploadResult.asReadonly();
  defaultColor = this._defaultColor.asReadonly();
  isUploading = this.uploadService.isUploading;

  //Estado computado para UI
  hasExistingModel = computed(() => !!this.existing3DData());
  hasNewFile = computed(() => !!this._selectedFile());


  ngOnInit(): void {
    //cargamos datos existentes si estamos editando
    const existingData = this.existing3DData();
    if (existingData) {
      this._defaultColor.set(existingData.defaultColor);
      this._previewUrl.set(existingData.gltfUrl);
    }
  }

  //Maneja la selección de archivo vía input
  onFileSelected(event: Event): void {
    event.stopPropagation(); //REVIENE la propagación
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  // mneja el drag an drop de archivos
  onFileDrop(event: DragEvent): void {
    event.stopPropagation(); //REVIENE la propagación
    event.preventDefault();
    this._isDragOver.set(false);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  //procesa y valida el archvi seleccinado
  private processFile(file: File): void {
    const validation = this.uploadService.validate3DFile(file);

    if (!validation.valid) {
      this.alertService.error('Formato no valido', validation.error!);
      return;
    }

    this._selectedFile.set(file);
    this.modelChanged.emit(true);


    // Generar preview local (en un caso real, podrías mostrar un thumbnail)
    this._previewUrl.set(URL.createObjectURL(file));
  }

  // sube el archvivo 3d al servidor
  async uploadFile(): Promise<void> {
    const file = this._selectedFile()
    const productId = this.productId();

    console.log('Debug upload:', {
      archivo: file?.name,
      productId,
      tieneArchivo: !!file
    });

    if (!file) {
      this.alertService.warning(
        'Archivo requerido',
        'Selecciona un archivo GLB o GLTF para subir'
      )
      return;
    }

    const result = await this.uploadService.upload3DFile(file, productId);


    if (result.success) {
      this._uploadResult.set(result);

      //emitir datos al comooenete padre
      const modelData: Product3DData = {
        gltfUrl: result.url,
        defaultColor: this._defaultColor(),
        colorableParts: ['Object_2'], // Por defecto, se puede extenderresult.colorableParts,
        format: result.format,
        fileSize: result.fileSize
      };

      this.modelUploaded.emit(modelData);
      this.alertService.success('Éxito', 'Modelo 3D subido correctamente');
    } else {
      //AGREGAR: Manejo de error
      this.alertService.error('Error', result.error || 'Error al subir el modelo 3D');
    }
  }


  resetComponent(): void {
    this._selectedFile.set(null);
    this._previewUrl.set('');
    this._uploadResult.set(null);
    this._defaultColor.set('#ffffff');
    this._isDragOver.set(false);
  }

  //elimina el archvivo seleccionado
  removeFile(): void {
    const hadExistingModel = this.hasExistingModel();

    // Limpiar preview URL
    if (this._previewUrl() && this._previewUrl().startsWith('blob:')) {
      URL.revokeObjectURL(this._previewUrl());
    }

    // Resetear estado
    this.resetComponent();
    this.modelChanged.emit(false);

    // Solo emitir removed si había un modelo existente configurado
    if (hadExistingModel) {
      this.modelRemoved.emit();
    }

    console.log('Modelo 3D removido:', {
      hadExistingModel,
      hadNewFile: this.hasNewFile()
    });
  }

  //maneja evenyos de drag over efectos visuales
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(true);
  }

  //manejar eventos de drag leave
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(false);
  }

  //actualizar el color por defecto
  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement
    this._defaultColor.set(input.value);

    //notificar cambio si hay modeo existente
    if (this.hasExistingModel()) {
      this.modelChanged.emit(true);
    }
  }


  //Obtiene el nombre del archivo para mostrar
  getFileName(): string {
    return this._selectedFile()?.name || this.existing3DData()?.gltfUrl.split('/').pop() || '';
  }

  //formatea el tamaño del archivo para mostrar
  getFileSize(): string {
    const size = this._selectedFile()?.size || this.existing3DData()?.fileSize;
    if (!size) return '';

    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  ngOnDestroy() {
    // Limpiar URLs de preview para evitar memory leaks
    if (this._previewUrl()) {
      URL.revokeObjectURL(this._previewUrl());
    }
  }
}
