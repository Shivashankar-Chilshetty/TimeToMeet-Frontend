import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalUserPageComponent } from './normal-user-page.component';

describe('NormalUserPageComponent', () => {
  let component: NormalUserPageComponent;
  let fixture: ComponentFixture<NormalUserPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalUserPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
