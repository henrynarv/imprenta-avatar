import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductThreeDViewerComponent } from './product-three-d-viewer.component';

describe('ProductThreeDViewerComponent', () => {
  let component: ProductThreeDViewerComponent;
  let fixture: ComponentFixture<ProductThreeDViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductThreeDViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductThreeDViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
