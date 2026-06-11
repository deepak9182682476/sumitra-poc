import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';

import { HeaderComponent } from './header.component';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeService } from 'src/app/theme/theme.service';
import { Theme, THEMES } from 'src/app/theme/symbols';
import { EventService } from 'src/app/services/event.service';
import { By } from '@angular/platform-browser';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentService } from 'src/app/services/document.service';
import { MainPipe } from '../../shared/pipes/main-pipe.module';
import { Router, NavigationEnd } from '@angular/router';
import { MapsComponent } from 'src/app/pages/maps/maps.component';
import { PostAnalysisComponent } from 'src/app/pages/post-analysis/post-analysis.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let themeService: ThemeService;
  let theme;
  let themes: Theme[];
  let router: Router;

  let MyMockedService = {
    setTheme: (name) => { theme = name; return theme },
    getActiveTheme: () => {
      if (themes)
        return themes.find(rec => rec.name == theme);
    }
  }
  const toastrService = {
    success: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => { },
    error: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => { },
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{ path: 'maps', component: MapsComponent },
          { path: 'post-analysis', component: PostAnalysisComponent }]
        ),
        HttpClientTestingModule,
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        BsDropdownModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MainPipe
      ],
      declarations: [HeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [BsModalService, { provide: ToastrService, useValue: toastrService },
        { provide: ThemeService, useValue: MyMockedService }, EventService, DocumentService],
    })
      .compileComponents();
    themeService = TestBed.get(ThemeService);
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getmode', () => {
    if (component.getMode) {
      expect(component.getMode).toEqual('auto');
    }
    expect(component.getMode).toBeDefined();
  });

  it('should call setTranslationOptions', () => {
    spyOn(component, 'setTranslationOptions').and.callThrough();
    component.setTranslationOptions();
    fixture.detectChanges();

    expect(component.setTranslationOptions).toHaveBeenCalled();
    expect(component.setTranslationOptions).toBeDefined();
  });

  it('should get save search ', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    var searchResult = {
      alarmId: "All",
      endDate: "2020-10-31",
      role: 1,
      startDate: "2020-10-22",
      zoneId: ""
    };
    spyOn(component, 'saveSearch');
    component.saveSearch(searchResult);
    fixture.detectChanges();

    expect(component.saveSearch).toHaveBeenCalled();
  }));

  it('should get stored data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getStoredData').and.callThrough();
    component.getStoredData();
    fixture.detectChanges();

    expect(component.getStoredData).toHaveBeenCalled();
  }))

  it('should get save search data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getSavedSearchData').and.callThrough();
    component.getSavedSearchData();
    fixture.detectChanges();

    expect(component.getSavedSearchData).toHaveBeenCalled();
  }))

  it('should save search ', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var searchResult = {
      alarmId: "All",
      endDate: "2020-10-31",
      role: 1,
      startDate: "2020-10-22",
      zoneId: ""
    };
    spyOn(component, 'saveSearch').and.callThrough();
    component.saveSearch(searchResult);
    fixture.detectChanges();

    expect(component.saveSearch).toHaveBeenCalled();
  }));

  it('should call and filter post analysis for saved search ', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.mccsUsers.isSuperUser = true;
    component.isFiltersToggled = false;
    fixture.detectChanges();
    var searchResult = {
      alarmId: "All",
      endDate: "2020-10-31",
      role: 1,
      startDate: "2020-10-22",
      zoneId: ""
    };

    let savedSearch = fixture.debugElement.queryAll(By.css('#saved-search'));
    savedSearch[0].nativeElement.click();

    tick();
    fixture.detectChanges();

    expect(savedSearch[0].nativeNode.ariaExpanded).toContain('true');

    spyOn(component, 'filterPostAnalysis').and.callThrough;
    component.filterPostAnalysis(searchResult, savedSearch);

    expect(component.filterPostAnalysis).toHaveBeenCalled();
  }));

  it('should delete saved search on click ', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    var searchResult = {
      alarmId: "All",
      endDate: "2020-10-31",
      role: 1,
      startDate: "2020-10-22",
      zoneId: ""
    };
    spyOn(component, 'saveSearch');
    component.saveSearch(searchResult);
    expect(component.saveSearch).toHaveBeenCalled();

    spyOn(component, 'deleteSavedSearch');
    component.deleteSavedSearch(0, searchResult);
    expect(component.deleteSavedSearch).toHaveBeenCalled();
  }));

  it('should validate search alarm button', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.mccsUsers.isSuperUser = true;
    component.isFiltersToggled = true;
    component.searchObj = {
      filter: {
        zoneId: '',
        alarmId: '',
        startDate: new Date().toString(),
        endDate: ''
      },
      enableSearchBtn: false,
      enableLoader: false,
      isSaveSearchLoading: false,
      getSaveSearchLoading: false
    };
    fixture.detectChanges();

    let toggleButton = fixture.debugElement.queryAll(By.css('.dropdown-toggle'));
    toggleButton[0].nativeElement.click();
    tick();
    fixture.detectChanges();

    expect(toggleButton[0].nativeNode.ariaExpanded).toContain('true');

    let searchBtn = fixture.debugElement.queryAll(By.css('.save-search'));
    searchBtn[0].nativeElement.click();
    tick();
    fixture.detectChanges();

    expect(searchBtn[0].nativeNode.disabled).toBeTruthy;

  }));

  it('should open/hide Search Filter alarms', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.mccsUsers.isSuperUser = true;
    component.isFiltersToggled = false;
    fixture.detectChanges();

    let toggleButton = fixture.debugElement.queryAll(By.css('.dropdown-toggle'));
    toggleButton[0].nativeElement.click();
    tick();
    fixture.detectChanges();

    expect(toggleButton[0].nativeNode.ariaExpanded).toContain('true');

    let cancelBtn = fixture.debugElement.queryAll(By.css('.cancelcls'));
    cancelBtn[0].nativeElement.click();
    tick();
    fixture.detectChanges();

    expect(toggleButton[0].nativeNode.ariaExpanded).toContain('false');
  }));

  it('should call header get notifications Data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getNotificationsData').and.callThrough();
    component.getNotificationsData();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getNotificationsData).toHaveBeenCalled();
    expect(component.getNotificationsData).toBeDefined();
  }));

  it('should call get icons Data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getIconsData').and.callThrough();
    component.getIconsData();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getIconsData).toHaveBeenCalled();
    expect(component.getIconsData).toBeDefined();
  }));

  it('should call header get filters Data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getFilterData').and.callThrough();
    component.getFilterData();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getFilterData).toHaveBeenCalled();
    expect(component.getFilterData).toBeDefined();
  }));

  it('should call header get alarms Data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getAlarms').and.callThrough();
    component.getAlarms();
    fixture.detectChanges();

    expect(component.getAlarms).toHaveBeenCalled();
    expect(component.getAlarms).toBeDefined();
  }));

  it('should call get post analysis Data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getPostAnalysisData').and.callThrough();
    component.getPostAnalysisData();
    fixture.detectChanges();

    expect(component.getPostAnalysisData).toHaveBeenCalled();

    spyOn(component.router, 'navigate').and.returnValue(
      new Promise((resolve, reject) => { resolve(true); })
    );
    component.router.navigate(['/post-analysis']);
    fixture.detectChanges();


    expect(component.router.navigate).toHaveBeenCalledWith(['/post-analysis']);
    flush();
  }));

  it('should call update filter data', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'updateFilterData').and.callThrough();
    component.updateFilterData();
    fixture.detectChanges();

    expect(component.updateFilterData).toHaveBeenCalled();
    expect(component.updateFilterData).toBeDefined();
  }));

  it('should call set Mode', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'setMode').and.callThrough();
    component.setMode();
    fixture.detectChanges();

    expect(component.setMode).toHaveBeenCalled();
    expect(component.setMode).toBeDefined();
  }));

  it('should call update Mode', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'updateMode').and.callThrough();
    component.updateMode();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.updateMode).toHaveBeenCalled();
    expect(component.updateMode).toBeDefined();
  }));

  it('should call switch theme', async(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.themeService = themeService;
    fixture.detectChanges();

    spyOn(component, 'switchTheme').and.callThrough();
    component.switchTheme();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.switchTheme).toHaveBeenCalled();
    expect(component.switchTheme).toBeDefined();
  }));

  it('should call sigin modal open function when clicked ', async(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.themeService = themeService;
    fixture.detectChanges();

    spyOn(component, 'openModal').and.callThrough();
    component.openModal(component.templateRef, 'login');
    fixture.detectChanges();

    expect(component.openModal).toHaveBeenCalled();
    expect(component.openModal).toBeDefined();
  }));

  it('should call sigin function when clicked ', async(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'signIn').and.callThrough();
    component.signIn();
    fixture.detectChanges();

    expect(component.signIn).toHaveBeenCalled();
    expect(component.signIn).toBeDefined();
  }));

  it('should call check sigin function when clicked ', async(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockResponse = {
      data: {
        authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpYXQiOjE2MDQzODA4MDl9.rtinRiztPQarWWw40qUEhzWqYFPqN5dgP5ojjhIA8Lw",
        id: 2,
        role: 2,
        user_name: "operator"
      },
      error: false,
      message: "Successfully Signed In",
      status: false
    }

    spyOn(component, 'checkSignIn').and.callThrough();
    component.checkSignIn(mockResponse);
    fixture.detectChanges();

    expect(component.checkSignIn).toHaveBeenCalled();
    expect(component.checkSignIn).toBeDefined();
  }));

  it('should call logout function when clicked ', async(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.themeService = themeService;
    fixture.detectChanges();

    component.router = router;
    fixture.detectChanges();

    spyOn(component, 'logOut').and.callThrough();
    component.logOut();
    fixture.detectChanges();

    expect(component.logOut).toHaveBeenCalled();
    expect(component.logOut).toBeDefined();
  }));

  it('should call initiateOperatorLogin', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'initiateOperatorLogin').and.callThrough();
    component.initiateOperatorLogin();
    fixture.detectChanges();

    expect(component.initiateOperatorLogin).toHaveBeenCalled();
    expect(component.initiateOperatorLogin).toBeDefined();
  }));

  it('should call toggleFilters', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'toggleFilters').and.callThrough();
    component.toggleFilters();
    fixture.detectChanges();

    expect(component.toggleFilters).toHaveBeenCalled();
    expect(component.toggleFilters).toBeDefined();
  }));

  it('should call setPreferences', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'setPreferences').and.callThrough();
    component.setPreferences(component.prefFormGroup);
    fixture.detectChanges();

    expect(component.setPreferences).toHaveBeenCalled();
    expect(component.setPreferences).toBeDefined();
  }));

  it('should call getFonSizeValue', fakeAsync(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getFonSizeValue').and.callThrough();
    component.getFonSizeValue('Small');
    fixture.detectChanges();

    expect(component.getFonSizeValue).toHaveBeenCalled();
    expect(component.getFonSizeValue).toBeDefined();
  }));

  it('should call setTranslationLang', () => {
    spyOn(component, 'setTranslationLang').and.callThrough();
    component.setTranslationLang('test');
    fixture.detectChanges();

    expect(component.setTranslationLang).toHaveBeenCalled();
    expect(component.setTranslationLang).toBeDefined();
  });

  it('should call getTranslationLang', () => {
    spyOn(component, 'getTranslationLang').and.callThrough();
    component.getTranslationLang('test');
    fixture.detectChanges();

    expect(component.getTranslationLang).toHaveBeenCalled();
    expect(component.getTranslationLang).toBeDefined();
  });

  it('should call getInitials', () => {
    spyOn(component, 'getInitials').and.callThrough();
    component.getInitials('test');
    fixture.detectChanges();

    expect(component.getInitials).toHaveBeenCalled();
    expect(component.getInitials).toBeDefined();
  });

  it('should call encryptPassword', () => {
    spyOn(component, 'encryptPassword').and.callThrough();
    component.encryptPassword('test');
    fixture.detectChanges();

    expect(component.encryptPassword).toHaveBeenCalled();
    expect(component.encryptPassword).toBeDefined();
  });

  it('should call getFont', () => {
    spyOn(component, 'getFont').and.callThrough();
    component.getFont('test');
    fixture.detectChanges();

    expect(component.getFont).toHaveBeenCalled();
    expect(component.getFont).toBeDefined();
  });

});

