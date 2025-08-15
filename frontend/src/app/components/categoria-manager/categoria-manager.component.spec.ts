import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaManagerComponent } from './categoria-manager.component';

describe('CategoriaManagerComponent', () => {
  let component: CategoriaManagerComponent;
  let fixture: ComponentFixture<CategoriaManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriaManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
