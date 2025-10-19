import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoactionsPageComponent } from './locations-page.component';

describe('LoactionsPageComponent', () => {
  let component: LoactionsPageComponent;
  let fixture: ComponentFixture<LoactionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoactionsPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoactionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
