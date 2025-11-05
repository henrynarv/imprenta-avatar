import { TestBed } from '@angular/core/testing';

import { Product3dService } from './product-3d.service';

describe('Product3dService', () => {
  let service: Product3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Product3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
