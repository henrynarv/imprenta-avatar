import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, inject, Input, input, signal, SimpleChanges } from '@angular/core';
import { extend, injectLoader, injectStore, NgtArgs } from 'angular-three';
import * as THREE from 'three';
import { Mesh, MeshBasicMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three-stdlib';
import { Product3dService } from '../../services/product-3d.service';
import { Product3dUploadService } from '../../services/product-3d-upload.service';
import { CommonModule } from '@angular/common';


extend(THREE);
extend({ OrbitControls });
@Component({
  selector: 'app-experience',
  imports: [NgtArgs, CommonModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExperienceComponent {
  /*

    private product3DService = inject(Product3dService);
    private product3dUploadService = inject(Product3dUploadService);
    private ngtStore = injectStore();

    // Input para recibir el producto específico
    product = input<any>();
    // ✅ MODIFICAR: Cambiar el input para recibir datos específicos del modelo
    modelUrl = input<string>(''); // Por defecto, pero puede venir del padre
    defaultColor = input<string>('#FFFFFF');
    colorableParts = input<string[]>(['Object_2']);

    // Cargar el modelo GLTF desde tu archivo public/scene.gltf
    gltf = injectLoader(() => GLTFLoader, () => {
      const url = this.modelUrl()
      if (url && url.startsWith('blob:')) {
        console.log('Cargando modelo desde blob URL:', url);
        return url; // Three.js puede cargar desde blob URLs
      }

      // También permitir carga local o absoluta
      if (url && (url.startsWith('http') || url.startsWith('/'))) {
        console.log('🌐 Cargando modelo desde ruta o URL absoluta:', url);
        return url;
      }


      // Fallback a modelo de ejemplo
      console.log('Cargando modelo de ejemplo');
      return 'cup3.glb';
    });

    model = computed(() => {
      const gltf = this.gltf();
      if (!gltf) return null;

      const selectedColor = this.product3DService.selectedColor();
      const scene = gltf.scene;

      // ✅ Encontrar automáticamente todos los Mesh del modelo
      const colorableMeshes: Mesh[] = [];
      scene.traverse((obj: any) => {
        if (obj.isMesh) colorableMeshes.push(obj);
      });

      console.log('Partes detectadas:', colorableMeshes.map(m => m.name));

      // ✅ Aplicar el color a todos los Mesh (material estándar)
      colorableMeshes.forEach(mesh => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => {
            // Asegurarse de que m es un objeto y tiene la propiedad color antes de usarla
            if (typeof m === 'object' && m !== null && 'color' in m) {
              // casteo seguro para evitar error de tipo en tiempo de compilación
              (m as any).color?.set(selectedColor);
            }
          });
        } else if (mesh.material && typeof mesh.material === 'object' && 'color' in mesh.material) {
          // casteo seguro para evitar error de tipo en tiempo de compilación
          (mesh.material as any).color?.set(selectedColor);
        }
      });

      return scene;
    });

    camera = this.ngtStore.select('camera');
    glDomElement = this.ngtStore.select('gl', 'domElement');

    // ngOnInit(): void {

    //   console.log('🎬 ExperienceComponent inicializado');
    //   console.log('Inputs iniciales:', {
    //     modelUrl: this.modelUrl(),
    //     product: this.product(),
    //     defaultColor: this.defaultColor(),
    //   });

    //   // ✅ INICIALIZAR el color por defecto
    //   const initialColor = this.defaultColor();
    //   this.product3DService.setColor(initialColor);
    //   console.log('Color inicial establecido:', initialColor);
    // }

    constructor() {
      // 🔹 Log de los inputs (debug)
      effect(() => {
        console.log('🟢 ExperienceComponent - Inputs recibidos:', {
          product: this.product(),
          modelUrl: this.modelUrl(),
          defaultColor: this.defaultColor(),
          colorableParts: this.colorableParts(),
        });
      });

      // Verificar después de un breve delay
      setTimeout(() => {
        console.log('⏰ ExperienceComponent - Inputs después de delay:', {
          product: this.product(),
          modelUrl: this.modelUrl()
        });
      }, 100);

      // 🔹 Inicializar lógica solo cuando hay datos válidos
      effect(() => {
        const product = this.product();
        const modelUrl = this.modelUrl();

        if (!product || !modelUrl) {
          console.log('⚠️ Esperando a que lleguen los inputs...');
          return;
        }

        console.log('🎬 ExperienceComponent inicializado con:', {
          product,
          modelUrl,
          defaultColor: this.defaultColor(),
          colorableParts: this.colorableParts(),
        });

        const initialColor = this.defaultColor() ?? '#FFFFFF';
        this.product3DService.setColor(initialColor);
        console.log('Color inicial establecido:', initialColor);
      });
    }

    //LIMPIAR blob URLs cuando el componente se destruya
    ngOnDestroy(): void {
      const url = this.modelUrl();
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        console.log('Blob URL revocada');
      }
    }
      */
















  ///=========

  /*

private product3DService = inject(Product3dService);
private ngtStore = injectStore();


private _loaderKey = signal<number>(0);

private modelConfig = computed(() => {
  const data = this.product3DService.currentModelData();
  const key = this._loaderKey();

  if (!data || !data.modelUrl) {
    return { shouldLoad: false, url: '', key };
  }

  return {
    shouldLoad: true,
    url: data.modelUrl,
    key: key + 1
  };
});

gltf = injectLoader(() => GLTFLoader, () => {
  const config = this.modelConfig();

  console.log('🔄 GLTF Loader - Configuración:', config);

  if (!config.shouldLoad || !config.url) {
    console.warn('⏸️ Esperando configuración...');
    return 'cup3.glb';
  }

  console.log('🚀 CARGANDO MODELO CONFIGURADO:', config.url);
  return config.url;
});

model = computed(() => {
  const gltf = this.gltf();
  const config = this.modelConfig();

  console.log('🎯 Model state:', {
    hasGltf: !!gltf,
    shouldLoad: config.shouldLoad,
    modelUrl: config.url
  });

  if (!gltf || !config.shouldLoad) {
    console.log('❌ No se puede mostrar el modelo - gltf:', !!gltf, 'shouldLoad:', config.shouldLoad);
    return null;
  }

  const selectedColor = this.product3DService.selectedColor();
  const scene = gltf.scene.clone();


  // Escala automática basada en el tamaño del modelo
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const scale = 1 / maxSize; // Ajusta el 2 según necesites
  scene.scale.set(scale, scale, scale);
  // 🔥 CORRECCIÓN 3: CENTRAR EL MODELO EN EL ORIGEN
  const center = box.getCenter(new THREE.Vector3());
  scene.position.x = -center.x * scale; // Compensar el centro después de escalar
  scene.position.y = -center.y * scale;
  scene.position.z = -center.z * scale;








  // 🔥 AGREGAR: Debug detallado de la escena
  console.log('🔍 ANALIZANDO ESCENA CARGADA:');
  let meshCount = 0;
  scene.traverse((obj: any) => {
    if (obj.isMesh) {
      meshCount++;
      console.log(`   📦 Mesh ${meshCount}:`, obj.name, 'pos:', obj.position, 'material:', obj.material?.type);
    }
  });
  console.log(`   ✅ Total meshes: ${meshCount}`);

  // Aplicar color
  scene.traverse((obj: any) => {
    if (obj.isMesh && obj.material && 'color' in obj.material) {
      (obj.material as any).color.set(selectedColor);
    }
  });

  console.log('✅ Modelo listo para mostrar en template');
  return scene;
});

camera = this.ngtStore.select('camera');
glDomElement = this.ngtStore.select('gl', 'domElement');

constructor() {
  // Effect que fuerza recreación cuando llegan nuevos datos
  effect(() => {
    const data = this.product3DService.currentModelData();

    if (data && data.modelUrl) {
      console.log('🔄 FORZANDO RECARGA DE LOADER para:', data.modelUrl);
      this._loaderKey.update(key => key + 1);
    }
  });

  // 🔥 AGREGAR: Effect para verificar el estado del modelo en el template
  effect(() => {
    const currentModel = this.model();
    console.log('📊 MODELO EN TEMPLATE:', {
      tieneModelo: !!currentModel,
      tipo: currentModel?.constructor?.name,
      children: currentModel?.children?.length
    });
  });
}

ngOnDestroy(): void {
  console.log('🧹 ExperienceComponent - Destruyéndose');
}

*/


  private product3DService = inject(Product3dService);
  private ngtStore = injectStore();

  private _loaderKey = signal<number>(0);

  private modelConfig = computed(() => {
    const data = this.product3DService.currentModelData();
    const key = this._loaderKey();

    if (!data || !data.modelUrl) {
      return { shouldLoad: false, url: '', key };
    }

    return {
      shouldLoad: true,
      url: data.modelUrl,
      key: key + 1
    };
  });

  gltf = injectLoader(() => GLTFLoader, () => {
    const config = this.modelConfig();

    console.log('🔄 GLTF Loader - Configuración:', config);

    if (!config.shouldLoad || !config.url) {
      console.warn('⏸️ Esperando configuración...');
      return 'cup3.glb';
    }

    console.log('🚀 CARGANDO MODELO CONFIGURADO:', config.url);
    return config.url;
  });

  model = computed(() => {
    const gltf = this.gltf();
    const config = this.modelConfig();

    console.log('🎯 Model state:', {
      hasGltf: !!gltf,
      shouldLoad: config.shouldLoad,
      modelUrl: config.url
    });

    if (!gltf || !config.shouldLoad) {
      console.log('❌ No se puede mostrar el modelo - gltf:', !!gltf, 'shouldLoad:', config.shouldLoad);
      return null;
    }

    const selectedColor = this.product3DService.selectedColor();
    const scene = gltf.scene.clone();

    // Escala automática basada en el tamaño del modelo
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxSize;
    scene.scale.set(scale, scale, scale);

    // Centrar el modelo en el origen
    const center = box.getCenter(new THREE.Vector3());
    scene.position.x = -center.x * scale;
    scene.position.y = -center.y * scale;
    scene.position.z = -center.z * scale;





    // 🔥 MODIFICACIÓN: LOGS DETALLADOS DE MATERIALES Y BLOQUEO DE MATERIALES BLANCOS
    console.log('🔍 ANALIZANDO ESCENA CARGADA:');
    let meshCount = 0;
    let whiteMaterialsCount = 0;
    let coloredMaterialsCount = 0;

    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        meshCount++;

        const material = obj.material;
        const materialName = material?.name?.toLowerCase() || 'sin nombre';
        const materialType = material?.type;
        const currentColor = material?.color;

        console.log(`   📦 Mesh ${meshCount}:`, {
          nombre: obj.name,
          material: materialName,
          tipo: materialType,
          colorActual: currentColor ? `#${currentColor.getHexString()}` : 'sin color'
        });

        // ✅ APLICAR LÓGICA DE COLOR: Solo modificar materiales NO blancos
        if (obj.material && 'color' in obj.material) {

          // 🔍 DETECTAR SI ES MATERIAL BLANCO (por nombre)
          const isWhiteMaterial = materialName.includes('blanco') ||
            materialName.includes('white') ||
            materialName.includes('fijo') ||
            materialName.includes('fixed');

          if (isWhiteMaterial) {
            // 🔒 MATERIAL BLANCO - NO MODIFICAR
            console.log(`   🔒 BLOQUEADO: ${obj.name} - Material "${materialName}" no se modifica`);
            whiteMaterialsCount++;

            // Opcional: Forzar color blanco por si acaso
            (obj.material as any).color.set(0xFFFFFF);
          } else {
            // 🎨 MATERIAL COLORABLE - MODIFICAR
            console.log(`   🎨 MODIFICABLE: ${obj.name} - Material "${materialName}" cambia a color seleccionado`);
            coloredMaterialsCount++;
            (obj.material as any).color.set(selectedColor);
          }
        }
      }
    });

    console.log(`   ✅ Total meshes: ${meshCount}`);
    console.log(`   🔒 Materiales blancos bloqueados: ${whiteMaterialsCount}`);
    console.log(`   🎨 Materiales coloreables: ${coloredMaterialsCount}`);
    console.log(`   🎨 Color aplicado: ${selectedColor}`);

    console.log('✅ Modelo listo para mostrar en template');
    return scene;
  });

  camera = this.ngtStore.select('camera');
  glDomElement = this.ngtStore.select('gl', 'domElement');

  constructor() {
    // Effect que fuerza recreación cuando llegan nuevos datos
    effect(() => {
      const data = this.product3DService.currentModelData();

      if (data && data.modelUrl) {
        console.log('🔄 FORZANDO RECARGA DE LOADER para:', data.modelUrl);
        this._loaderKey.update(key => key + 1);
      }
    });

    // Effect para verificar el estado del modelo
    effect(() => {
      const currentModel = this.model();
      console.log('📊 MODELO EN TEMPLATE:', {
        tieneModelo: !!currentModel,
        tipo: currentModel?.constructor?.name,
        children: currentModel?.children?.length
      });
    });

    // 🔥 NUEVO: Effect para ver cuando cambia el color
    effect(() => {
      const color = this.product3DService.selectedColor();
      console.log('🎨 COLOR SELECCIONADO CAMBIADO:', color);
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 ExperienceComponent - Destruyéndose');
  }
}
