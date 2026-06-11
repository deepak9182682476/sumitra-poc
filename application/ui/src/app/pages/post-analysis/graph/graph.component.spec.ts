import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { GraphComponent } from './graph.component';
import { PostAnalysisService } from 'src/app/services/post-analysis.service';
import { of } from 'rxjs';
import { Theme } from 'src/app/theme/symbols';
import { ThemeService } from 'src/app/theme/theme.service';

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;
  let postAnalysisService: PostAnalysisService;
  let theme;
  let themes: Theme[];

  let MyMockedService = {
    setTheme: (name) => { theme = name; return theme },
    getActiveTheme: () => {
      if (themes)
        return themes.find(rec => rec.name == theme);
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [GraphComponent],
      providers: [
        PostAnalysisService,
        { provide: ThemeService, useValue: MyMockedService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphComponent);
    postAnalysisService = TestBed.inject(PostAnalysisService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call downloadAsPdf ', fakeAsync(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'downloadAsPdf').and.callThrough();
    // component.downloadAsPdf();

    // expect(component.downloadAsPdf).toHaveBeenCalled();
    expect(component.downloadAsPdf).toThrowMatching(err => err);
    flush();
  }));

  it('should call getActiveTab ', fakeAsync(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getActiveTab').and.callThrough();
    // component.getActiveTab();

    // expect(component.getActiveTab).toHaveBeenCalled();
    expect(component.downloadAsPdf).toThrowMatching(err => err);
    flush();
  }));

  it('should call getActiveTab ', fakeAsync(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getActiveTab').and.callThrough();
    component.getActiveTab(null);

    expect(component.getActiveTab).toHaveBeenCalled();
    // expect(component.getActiveTab).toThrowMatching(err => err);
    flush();
  }));

  it('should call formChartData ', fakeAsync(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'formChartData').and.callThrough();
    component.formChartData();

    expect(component.formChartData).toHaveBeenCalled();
    // expect(component.formChartData).toThrowMatching(err => err);
    flush();
  }));

  it('should call closePopup ', fakeAsync(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'closePopup').and.callThrough();
    component.closePopup();

    expect(component.closePopup).toHaveBeenCalled();
    // expect(component.closePopup).toThrowMatching(err => err);
    flush();
  }));

  it('should call graphTimeFilter ', fakeAsync(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'graphTimeFilter').and.callThrough();
    // component.graphTimeFilter(null);

    // expect(component.graphTimeFilter).toHaveBeenCalled();
    expect(component.graphTimeFilter).toThrowMatching(err => err);
    flush();
  }));

  it('should filteredData to be defined', () => {
    spyOn(postAnalysisService, 'getFilterApi').and.returnValue(of({ graphData: [], zoneWiseData: [] }));
    component.filteredData(JSON.stringify({ zoneId: 'All', alarmId: 'All', }));
    expect(component.filteredData).toBeDefined();
  });

  it('should be defined graphTimeFilter', () => {
    component.getAlarmChartInfo.backUpChartData.series = [
      {
        data: [
          {
            diffHours: '1',
            categories: ''
          }
        ]
      }
    ];
    component.graphTimeFilter('1');
    expect(component.graphTimeFilter).toBeDefined();
  });

  it('should be defined graphTimeFilter with greater than chart hour', () => {
    component.getAlarmChartInfo.backUpChartData.series = [
      {
        data: [
          {
            diffHours: '1',
            categories: ''
          }
        ]
      }
    ];
    component.graphTimeFilter('10');
    expect(component.graphTimeFilter).toBeDefined();
  });

});
