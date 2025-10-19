import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreLocationsPageComponent } from './store-locations-page.component';

describe('AdminLocationsPageComponent', () => {
  let component: StoreLocationsPageComponent;
  let fixture: ComponentFixture<StoreLocationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreLocationsPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StoreLocationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
