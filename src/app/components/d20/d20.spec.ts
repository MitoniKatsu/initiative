import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D20 } from './d20';

describe('D20', () => {
  let component: D20;
  let fixture: ComponentFixture<D20>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D20],
    }).compileComponents();

    fixture = TestBed.createComponent(D20);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
