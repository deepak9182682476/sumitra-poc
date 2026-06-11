import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AlarmService } from 'src/app/services/alarm.service';

import { TimelineComponent } from './timeline.component';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let ROOT_URl = 'http://localhost:5106/api/alarm';


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ],
      declarations: [ TimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call  get alarm timeline', fakeAsync(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    let filterData = {"zoneId":"All","alarmId":"All","startDate":"","endDate":""}

    localStorage.setItem('postAnalysisFilter', JSON.stringify(filterData));
    fixture.detectChanges();

    spyOn(component, 'getAlarmTimeline').and.callThrough();
    component.getAlarmTimeline();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    let allfilter = {
      alarmId: "",
      endDate: "",
      startDate: "",
      zoneId: ""
    };

    component.alarmService.getAlarmTimelineInfo('filter', allfilter).subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        component.alarmTimelineData = res;
        fixture.detectChanges();
        flush();
      } else {
        expect(res.error).toThrowMatching(err => err);
        fixture.detectChanges();
        flush();
      }
    });

    expect(component.getAlarmTimeline).toHaveBeenCalled();
    flush();
  }));


  it('should call  getTranslationLang', fakeAsync(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getTranslationLang').and.callThrough();
    component.getTranslationLang('test');

    expect(component.getTranslationLang).toHaveBeenCalled();
    flush();
  }));
  
});
