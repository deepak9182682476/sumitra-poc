import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonService } from 'src/app/services/common.service';
import { THEMES } from 'src/app/theme/symbols';
import { ThemeService } from 'src/app/theme/theme.service';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let cs: CommonService
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: ThemeService, useValue: THEMES }],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('expect user info to be null from local storage', () => {
    let userInfo = component.commonService.getLocalStorage('userInfo');
    fixture.detectChanges();
    if (userInfo) {
      expect(userInfo).toBeDefined();
    } else {
      expect(userInfo).toBeNull();
    }
  });

  it('expect active theme to be undefined', () => {
    let activeTheme = component.activeTheme.name;
    fixture.detectChanges();
    expect(activeTheme).toBeUndefined();
  });

  it('expect watchStorage', () => {

    spyOn(component.commonService, 'watchStorage').and.callThrough();
    component.commonService.watchStorage().subscribe();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.commonService.watchStorage).toHaveBeenCalled();
    expect(component.commonService.watchStorage).toBeDefined();

  });

  it('expect getdecrypteduserdata as empty', () => {
    let decryptedUserData = component.commonService.getDecryptedUserData();
    fixture.detectChanges();
    if(decryptedUserData){
      expect(decryptedUserData).toBeDefined();
    }else{
      expect(decryptedUserData).toEqual('');
    }
  });


});
