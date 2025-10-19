import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLocationsPageComponent } from './admin-locations-page.component';

describe('StoreLocationPageComponent', () => {
  let component: AdminLocationsPageComponent;
  let fixture: ComponentFixture<AdminLocationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLocationsPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminLocationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
