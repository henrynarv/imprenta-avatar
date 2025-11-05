import { inject, Injectable, signal } from '@angular/core';
import { AlertService } from '../../../shared/service/alert.service';

export interface Upload3DResult {
  url: string;
  format: 'gltf' | 'glb';
  fileSize: number;
  success: boolean;
  error?: string,
  binFiles?: string[]; // URLs de archivos .bin asociados
}
@Injectable({
  providedIn: 'root'
})
export class Product3dUploadService {

  alertService = inject(AlertService);
  //Evita duplicados y permite limpieza
  private blobUrlCache = new Map<string, string>();

  //señal para el estado de carga global
  private _isUploading = signal<boolean>(false);
  readonly isUploading = this._isUploading.asReadonly();

  //clave para el localStorage
  private readonly STORAGE_PREFIX = 'product_3d_model_'

  //Valida un archivo 3D antes de subirlo
  //Verifica formato, tamaño y estructura del archivo, admite .gltf, .glb y .bin
  validate3DFile(file: File): { valid: boolean, error?: string } {
    const validFormats = ['.gltf', '.glb', '.bin'];
    const maxSize = 20 * 1024 * 1024; //20MB

    //Validar extensión del archvo
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validFormats.includes(fileExtension)) {
      return {
        valid: false,
        error: `Formato no válido, Use: ${validFormats.join(', ')}`
      };
    }

    //validar tamaño dela archivo
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo excede el tamaño permitido (${maxSize / 1024 / 1024}MB)`
      };
    }

    //validar tupo MIME
    const validMimeTypes = [
      'model/gltf+json',
      'model/gltf-binary',
      'application/octet-stream',
      'application/gltf-buffer', // para archivos .bin
    ];
    if (file.type && !validMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no compatible, Use: ${validMimeTypes.join(', ')}`
      };
    }
    return { valid: true };
  }

  //Simula la subida de un archivo 3D al servidor
  //En producción, aquí iría la lógica real de upload a tu backend


  async upload3DFile(file: File, productId: number): Promise<Upload3DResult> {
    console.log('🔍 DEBUG upload3DFile - productId recibido:', productId);
    this._isUploading.set(true);

    try {

      console.log('Guardando archvi 3D localmente:', {
        nombre: file.name,
        tamaño: file.size,
        tipo: file.type,
        productId: productId
      });

      //1 validar archivo
      const validation = this.validate3DFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      //2 guardar en localstorage y crear URL temporal
      await this.simulateFileUpload(file);

      const blobUrl = await this.saveToLocalStorageAndCreateURL(file, productId);

      //3 generar informacion del archivo
      const fileExtension = file.name.toLocaleLowerCase().endsWith('.glb') ? 'glb' : 'gltf';


      console.log('Archivo guardado localmente:', {
        blobUrl,
        formato: fileExtension,
        tamaño: file.size,
        storageKey: this.getStorageKey(file.name, productId)
      });


      this.alertService.success(
        'Modelo 3D guardado',
        `${file.name} se ha guardado correctamente y está listo para usar`
      );

      return {
        url: blobUrl,
        format: fileExtension as 'gltf' | 'glb', // .bin se maneja aparte
        fileSize: file.size,
        success: true
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.alertService.error(
        'Error al guardar', errorMessage
      );

      return {
        url: '',
        format: 'gltf',
        fileSize: 0,
        success: false,
        error: errorMessage
      };
    } finally {
      this._isUploading.set(false);
    }
  }

  //GUARDA el archivo en localStorage y crea una URL blob para Three.js
  private async saveToLocalStorageAndCreateURL(file: File, productId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          //1 Guardaren localStorage como arrayBuffer
          const storageKey = this.getStorageKey(file.name, productId);
          const uintArray = new Uint8Array(arrayBuffer);

          //convertir a strung para localStorage
          const binaryString = uintArray.reduce((data, byte) => data + String.fromCharCode(byte), '');

          localStorage.setItem(storageKey, btoa(binaryString));
          localStorage.setItem(`${storageKey}_type`, file.type);
          localStorage.setItem(`${storageKey}_name`, file.name);
          localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());

          //2 crear blob URL para three.js
          const blob = new Blob([arrayBuffer], { type: file.type });
          const blobUrl = URL.createObjectURL(blob);
          console.log('💾 Archivo guardado en localStorage:', {
            key: storageKey,
            size: arrayBuffer.byteLength,
            blobUrl: blobUrl,
            type: file.type
          });

          resolve(blobUrl);

        } catch (error) {
          reject(new Error(`Error procesando archivo: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsArrayBuffer(file);
    })
  }

  //Recupera un archivo gaurdado de localstorage
  getStorageModelUrl(productId: number, fileName: string): string | null {
    const storageKey = this.getStorageKey(fileName, productId);

    console.log('🔍 getStorageModelUrl - Buscando:', {
      productId,
      fileName,
      storageKey
    });

    // 🔥 CORRECCIÓN: Verificar si la Blob URL en cache sigue siendo válida
    if (this.blobUrlCache.has(storageKey)) {
      const cachedUrl = this.blobUrlCache.get(storageKey)!;
      try {
        // Intentar una verificación simple de la Blob URL
        fetch(cachedUrl, { method: 'HEAD' })
          .then(() => console.log('✅ Blob URL en cache sigue válida:', cachedUrl))
          .catch(() => {
            console.log('🔄 Blob URL en cache inválida, recreando...');
            this.blobUrlCache.delete(storageKey);
          });
      } catch (e) {
        console.log('🔄 Blob URL en cache inválida, recreando...');
        this.blobUrlCache.delete(storageKey);
      }
    }

    // Verificar cache primero para evitar crear múltiples URLs
    if (this.blobUrlCache.has(storageKey)) {
      console.log('📂 Usando Blob URL desde cache:', storageKey);
      return this.blobUrlCache.get(storageKey)!;
    }


    const storedData = localStorage.getItem(storageKey);
    const fileType = localStorage.getItem(`${storageKey}_type`);

    console.log('🔍 getStorageModelUrl - Datos en localStorage:', {
      hasStoredData: !!storedData,
      storedDataLength: storedData?.length,
      hasFileType: !!fileType,
      fileType
    });


    if (!storedData || !fileType) {
      console.error('❌ No hay datos suficientes en localStorage');

      // 🔥 NUEVO: Debug de qué hay en localStorage
      this.debugProductStorage(productId);
      return null;
    }

    try {
      // Convertir de base64 a ArrayBuffer
      const binaryString = atob(storedData);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Crear Blob URL
      const blob = new Blob([bytes], { type: fileType });
      const blobUrl = URL.createObjectURL(blob);

      // Guardar en cache para reutilizar y poder limpiar después
      this.blobUrlCache.set(storageKey, blobUrl);

      console.log('✅ Blob URL recreada exitosamente:', {
        blobUrl,
        blobSize: blob.size,
        fromCache: false
      });

      return blobUrl;
    } catch (error) {
      console.error('Error recuperando archivo:', error);
      return null;
    }

  }



  // 🔥 NUEVO: Método para debug específico del producto
  private debugProductStorage(productId: number): void {
    console.log('🔍 DEBUG: Buscando archivos para producto', productId);

    const prefix = `${this.STORAGE_PREFIX}${productId}_`;
    const files = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const fileName = key.replace(prefix, '');
        const hasType = !!localStorage.getItem(`${key}_type`);
        const hasName = !!localStorage.getItem(`${key}_name`);

        files.push({
          key,
          fileName,
          hasType,
          hasName,
          dataLength: localStorage.getItem(key)?.length
        });
      }
    }

    console.log('📋 Archivos encontrados para producto', productId, ':', files);

    if (files.length === 0) {
      console.warn('⚠️ No se encontraron archivos para el producto', productId);

      // Mostrar todos los archivos 3D en localStorage para debug
      console.log('🔍 Todos los archivos 3D en localStorage:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('product_3d_model')) {
          console.log('   -', key, 'type:', !!localStorage.getItem(`${key}_type`));
        }
      }
    }
  }
  //ELIMINA un archivo de localStorage
  deleteStoredModel(productId: number, fileName: string): boolean {
    try {
      const storageKey = this.getStorageKey(fileName, productId);


      //Limpiar Blob URL del cache cuando se elimina el modelo
      if (this.blobUrlCache.has(storageKey)) {
        URL.revokeObjectURL(this.blobUrlCache.get(storageKey)!);
        this.blobUrlCache.delete(storageKey);
        console.log('🗑️ Blob URL revocada y eliminada del cache:', storageKey);
      }

      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_type`);
      localStorage.removeItem(`${storageKey}_name`);
      localStorage.removeItem(`${storageKey}_timestamp`);

      console.log('🗑️ Archivo eliminado de localStorage:', storageKey);
      return true;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return false;
    }

  }



  //OBTIENE todos los modelos guardados para un producto
  getStoredModelsForProduct(productId: number): Array<{ fileName: string, timestamp: number }> {
    const models = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${this.STORAGE_PREFIX}${productId}_`)) {
        const fileName = key.replace(`${this.STORAGE_PREFIX}${productId}_`, '');
        const timestamp = localStorage.getItem(`${key}_timestamp`);

        models.push({
          fileName: fileName,
          timestamp: timestamp ? parseInt(timestamp) : 0
        });
      }
    }

    return models;
  }



  // 🔥 CORRECCIÓN NUEVA: Método para limpiar todas las Blob URLs
  cleanupAllBlobUrls(): void {
    let revokedCount = 0;
    this.blobUrlCache.forEach((url, key) => {
      URL.revokeObjectURL(url);
      revokedCount++;
      console.log('🧹 Blob URL revocada:', key);
    });
    this.blobUrlCache.clear();
    console.log(`🧹 Limpieza completada: ${revokedCount} Blob URLs revocadas`);
  }

  // 🔥 CORRECCIÓN NUEVA: Limpiar URLs específicas por producto
  cleanupProductBlobUrls(productId: number): void {
    let revokedCount = 0;
    const prefix = `${this.STORAGE_PREFIX}${productId}_`;

    this.blobUrlCache.forEach((url, key) => {
      if (key.startsWith(prefix)) {
        URL.revokeObjectURL(url);
        this.blobUrlCache.delete(key);
        revokedCount++;
        console.log('🧹 Blob URL de producto revocada:', key);
      }
    });

    console.log(`🧹 Limpieza de producto ${productId}: ${revokedCount} URLs revocadas`);
  }



  private getStorageKey(fileName: string, productId: number): string {
    return `${this.STORAGE_PREFIX}${productId}_${fileName}`;
  }


  /**
     * Método para subir múltiples archivos (GLTF + BIN)
     */
  async upload3DWithBinFiles(
    gltfFile: File,
    binFiles: File[],
    productId: number
  ): Promise<Upload3DResult> {
    this._isUploading.set(true);

    try {
      // 1. Validar archivo GLTF principal
      const gltfValidation = this.validate3DFile(gltfFile);
      if (!gltfValidation.valid) {
        throw new Error(`Archivo GLTF: ${gltfValidation.error}`);
      }

      // 2. Validar archivos BIN
      for (const binFile of binFiles) {
        const binValidation = this.validate3DFile(binFile);
        if (!binValidation.valid) {
          throw new Error(`Archivo BIN ${binFile.name}: ${binValidation.error}`);
        }
      }

      // 3. Simular subida de todos los archivos
      await this.simulateMultipleFileUpload([gltfFile, ...binFiles]);

      // 4. Generar URLs
      const gltfFileExtension = gltfFile.name.toLowerCase().endsWith('.glb') ? 'glb' : 'gltf';
      const gltfUrl = this.generateModelUrl(gltfFile.name, productId);

      const binFilesUrls = binFiles.map(binFile =>
        this.generateModelUrl(binFile.name, productId)
      );

      this.alertService.success(
        'Modelo 3D subido',
        `Se subieron ${1 + binFiles.length} archivos correctamente (GLTF + ${binFiles.length} BIN)`
      );

      return {
        url: gltfUrl,
        format: gltfFileExtension,
        fileSize: gltfFile.size + binFiles.reduce((sum, file) => sum + file.size, 0),
        success: true,
        binFiles: binFilesUrls
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.alertService.error('Error al subir', errorMessage);

      return {
        url: '',
        format: 'gltf',
        fileSize: 0,
        success: false,
        error: errorMessage
      };
    } finally {
      this._isUploading.set(false);
    }
  }



  //Simula el proceso de subida con delay
  private simulateFileUpload(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        //simular fallo aleatorio(10% de probabilidad)
        if (Math.random() < 0.1) {
          reject(new Error('Error al subir el archivo'));
        } else {
          resolve();
        }
      }, 1500);
    })
  }


  /**
* Simula subida de múltiples archivos
*/
  private simulateMultipleFileUpload(files: File[]): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('Error de conexión durante la subida múltiple'));
        } else {
          console.log(`Archivos subidos: ${files.map(f => f.name).join(', ')}`);
          resolve();
        }
      }, 2000);
    });
  }

  //Genera URL local para el modelo
  //En producción, generarías la URL de tu CDN
  private generateModelUrl(fileName: string, productId: number): string {
    const timestamp = new Date().getTime();
    const url = `models/producto-${productId}-${fileName}`;

    console.log('URL generada para modelo 3D:', {
      fileName,
      productId,
      generatedUrl: url,
      timestamp: new Date().toISOString()
    });

    return url;
    // return `models/producto-${productId}-${fileName}-${timestamp}`
  }

  //Elimina un modelo 3D (para cuando se edita/elimina producto)
  async delete3DModel(modelUrl: string, binFilesUrls: string[] = []): Promise<boolean> {
    try {
      // En producción, aquí llamarías a tu API para eliminar el archivo
      console.log('Eliminando modelo 3D:', modelUrl);
      for (const binUrl of binFilesUrls) {
        console.log('Eliminando archivo binario:', binUrl);
      }

      return true;
    } catch (error) {
      console.error('Error eliminando modelo 3D:', error);
      return false;
    }
  }


  /**
  * Helper: Filtra archivos .bin de una lista
  */
  extractBinFiles(files: FileList | File[]): File[] {
    const filesArray = Array.from(files);
    return filesArray.filter(file =>
      file.name.toLowerCase().endsWith('.bin')
    );
  }

  /**
   * Helper: Filtra archivos GLTF/GLB de una lista
   */
  extractMainFiles(files: FileList | File[]): File[] {
    const filesArray = Array.from(files);
    return filesArray.filter(file =>
      file.name.toLowerCase().endsWith('.gltf') ||
      file.name.toLowerCase().endsWith('.glb')
    );
  }
}
