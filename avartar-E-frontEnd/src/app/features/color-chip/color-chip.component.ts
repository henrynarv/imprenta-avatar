import { CommonModule, NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { heroXMarkSolid } from '@ng-icons/heroicons/solid';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { FormsModule } from '@angular/forms';



export interface Colors {
  name: string,
  hex: string
}

@Component({
  selector: 'app-color-chip',
  imports: [NgClass, CommonModule, NgIcon, FormsModule],
  templateUrl: './color-chip.component.html',
  styleUrl: './color-chip.component.scss',
  providers: [provideIcons({ heroXMarkSolid })],
})
export class ColorChipComponent {

  colors: Colors[] = [
    { name: 'Rojo', hex: '#ff0000' },
    { name: 'Verde', hex: '#25D366' },
    { name: 'Azul', hex: '#007DFF' },
    { name: 'Amarillo', hex: '#FFD700' },
    { name: 'Gris', hex: '#9E9E9E' },
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Naranja', hex: '#FFA500' },
    { name: 'Marron', hex: '#8B4513' },
    { name: 'Cian', hex: '#E0FFFF' },
    { name: 'Lavanda', hex: '#CBA6F7' }
  ];

  // onSelectChange(event: Event) {
  //   const target = event.target as HTMLSelectElement;
  //   const index = target.selectedIndex;
  //   if (index > 0) {
  //     this.addColor(this.colors[index - 1]);
  //   }
  // }

  // ngModel se encargará de enlazarlo automáticamente
  selectedColor: Colors | null = null;

  // Signal con los colores que el usuario ya agregó
  selectedColors = signal<Colors[]>([]);

  onSelectChange(color: Colors | null) {
    if (!color) return;
    this.addColor(color)

    setTimeout(() => {
      this.selectedColor = null;
    });

  }


  addColor(color: Colors) {
    if (!this.selectedColors().some(c => c.hex === color.hex)) {
      this.selectedColors.update(list => [...list, color])
    }
  }

  // quitar color
  removeColor(hex: string) {
    this.selectedColors.update(list => list.filter(c => c.hex !== hex))
  }

  //determinar color del texto segun luminosidad
  getTextColor(hex: string): string {


    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    //formula de luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 186 ? 'text-black' : 'text-white';
  }



}
