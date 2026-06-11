import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualRouteMapComponent } from './manual-route-map.component';

describe('ManualRouteMapComponent', () => {
  let component: ManualRouteMapComponent;
  let fixture: ComponentFixture<ManualRouteMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualRouteMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualRouteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
