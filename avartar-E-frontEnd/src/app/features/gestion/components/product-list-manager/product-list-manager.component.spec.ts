import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListManagerComponent } from './product-list-manager.component';

describe('ProductListManagerComponent', () => {
  let component: ProductListManagerComponent;
  let fixture: ComponentFixture<ProductListManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
