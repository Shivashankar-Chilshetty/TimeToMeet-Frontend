import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingHomeComponent } from './meeting-home.component';

describe('MeetingHomeComponent', () => {
  let component: MeetingHomeComponent;
  let fixture: ComponentFixture<MeetingHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
