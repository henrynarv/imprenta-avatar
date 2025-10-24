import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductManagerPageComponent } from './product-manager-page.component';

describe('ProductManagerPageComponent', () => {
  let component: ProductManagerPageComponent;
  let fixture: ComponentFixture<ProductManagerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductManagerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductManagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
