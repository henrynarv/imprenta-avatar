import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductThreeDModalComponent } from './product-three-d-modal.component';

describe('ProductThreeDModalComponent', () => {
  let component: ProductThreeDModalComponent;
  let fixture: ComponentFixture<ProductThreeDModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductThreeDModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductThreeDModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
