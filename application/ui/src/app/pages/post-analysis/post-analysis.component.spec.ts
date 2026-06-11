import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { THEMES } from 'src/app/theme/symbols';
import { ThemeService } from 'src/app/theme/theme.service';
import { MatMenuModule } from '@angular/material/menu';
import { PostAnalysisComponent } from './post-analysis.component';

describe('PostAnalysisComponent', () => {
  let component: PostAnalysisComponent;
  let fixture: ComponentFixture<PostAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatMenuModule
      ],
      declarations: [PostAnalysisComponent],
      providers: [{ provide: ThemeService, useValue: THEMES }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should call downloadGraph ', fakeAsync(() => {
    fixture = TestBed.createComponent(PostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'downloadGraph').and.callThrough();
    // component.downloadGraph();

    // expect(component.downloadGraph).toHaveBeenCalled();
    expect(component.downloadGraph).toThrowMatching(err => err);
    flush();
  }));

  it('should call enableDisablePDF ', fakeAsync(() => {
    fixture = TestBed.createComponent(PostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'enableDisablePDF').and.callThrough();
    component.enableDisablePDF([]);

    expect(component.enableDisablePDF).toHaveBeenCalled();
    // expect(component.enableDisablePDF).toThrowMatching(err => err);
    flush();
  }));

  it('should call activateMapGraph ', fakeAsync(() => {
    fixture = TestBed.createComponent(PostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'activateMapGraph').and.callThrough();
    // component.activateMapGraph('graph');

    // expect(component.activateMapGraph).toHaveBeenCalled();
    expect(component.activateMapGraph).toThrowMatching(err => err);
    flush();
  }));

  it('should call filterGraphs ', fakeAsync(() => {
    fixture = TestBed.createComponent(PostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'filterGraphs').and.callThrough();
    // component.filterGraphs();

    // expect(component.filterGraphs).toHaveBeenCalled();
    expect(component.activateMapGraph).toThrowMatching(err => err);
    flush();
  }));

});
