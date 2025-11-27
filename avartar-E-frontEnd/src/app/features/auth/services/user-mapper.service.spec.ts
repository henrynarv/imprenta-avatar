import { TestBed } from '@angular/core/testing';

import { UserMapperService } from './user-mapper.service';

describe('UserMapperService', () => {
  let service: UserMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
