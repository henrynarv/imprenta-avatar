import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStatusBadgeComponent } from './product-status-badge.component';

describe('ProductStatusBadgeComponent', () => {
  let component: ProductStatusBadgeComponent;
  let fixture: ComponentFixture<ProductStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductStatusBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductStatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
