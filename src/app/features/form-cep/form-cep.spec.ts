import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCEP } from './form-cep';

describe('FormCEP', () => {
  let component: FormCEP;
  let fixture: ComponentFixture<FormCEP>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCEP],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCEP);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
