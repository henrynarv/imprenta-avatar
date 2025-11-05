import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductThreeDUploadComponent } from './product-three-d-upload.component';

describe('ProductThreeDUploadComponent', () => {
  let component: ProductThreeDUploadComponent;
  let fixture: ComponentFixture<ProductThreeDUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductThreeDUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductThreeDUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
