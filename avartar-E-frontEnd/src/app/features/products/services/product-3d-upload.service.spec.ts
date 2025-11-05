import { TestBed } from '@angular/core/testing';

import { Product3dUploadService } from './product-3d-upload.service';

describe('Product3dUploadService', () => {
  let service: Product3dUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Product3dUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
