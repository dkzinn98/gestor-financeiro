import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { TransacaoFormComponent } from './transacao-form.component';

describe('TransacaoFormComponent', () => {
  let component: TransacaoFormComponent;
  let fixture: ComponentFixture<TransacaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransacaoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransacaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
