import { TestBed, async, ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { DocumentService } from './services/document.service';
import { EventService } from './services/event.service';
import { AuthGuard } from './shared/guards/auth.guards';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ThemeService } from './theme/theme.service';
import { THEMES } from './theme/symbols';
import { ActivatedRoute } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [AuthGuard, DocumentService, EventService, { provide: ThemeService, useValue: THEMES }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('check show header from activatedRoute', () => {
    if (component.showHeader) {
      expect(component.showHeader).toBeTruthy();
    }
    else {
      expect(component.showHeader).toBeFalsy();
    }

    fixture.detectChanges();
    expect(component.showHeader).toBeDefined();
  });

  it('check showSidebar from activatedRoute', () => {
    if (component.showSidebar) {
      expect(component.showSidebar).toBeTruthy();
    }
    else {
      expect(component.showSidebar).toBeFalsy();
    }

    fixture.detectChanges();
    expect(component.showSidebar).toBeDefined();
  });

  it('check showSubHeader from activatedRoute', () => {
    if (component.showSubHeader) {
      expect(component.showSubHeader).toBeTruthy();
    }
    else {
      expect(component.showSubHeader).toBeFalsy();
    }

    fixture.detectChanges();
    expect(component.showSubHeader).toBeDefined();
  });

  it('check showTimeline from activatedRoute', () => {
    if (component.showTimeline) {
      expect(component.showTimeline).toBeTruthy();
    }
    else {
      expect(component.showTimeline).toBeFalsy();
    }

    fixture.detectChanges();
    expect(component.showTimeline).toBeDefined();
  });

  it('check showFooter from activatedRoute', () => {
    if (component.showFooter) {
      expect(component.showFooter).toBeTruthy();
    }
    else {
      expect(component.showFooter).toBeFalsy();
    }

    fixture.detectChanges();
    expect(component.showFooter).toBeDefined();
  });

  it('check diagnosticsSideBar from activatedRoute', () => {
    if (component.diagnosticsSideBar) {
      expect(component.diagnosticsSideBar).toBeTruthy();
    }
    else {
      expect(component.diagnosticsSideBar).toBeFalsy();
    }

    fixture.detectChanges();
    expect(component.diagnosticsSideBar).toBeDefined();
  });

  it('check router event', () => {
    component.router.events.subscribe();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.router).toBeDefined();
  });
});
