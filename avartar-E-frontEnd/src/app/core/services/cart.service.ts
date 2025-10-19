import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  count = signal<number>(0);

  //metodo para añadir producto
  addToCarrt() {
    this.count.update(value => value + 1);
    console.log('Prodcuto añadido total: ', this.count());
  }

  clearCart() {
    this.count.set(0);

  }
}
