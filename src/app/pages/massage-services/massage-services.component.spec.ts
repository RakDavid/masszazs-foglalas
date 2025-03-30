import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassageServicesComponent } from './massage-services.component';

describe('MassageServicesComponent', () => {
  let component: MassageServicesComponent;
  let fixture: ComponentFixture<MassageServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MassageServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MassageServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
