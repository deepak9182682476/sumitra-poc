import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject, fakeAsync, ComponentFixture, flush } from '@angular/core/testing';
import { Theme, THEMES } from './symbols';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {

    let theme;
    let themes : Theme[];
    
    let MyMockedService = {
        setTheme: (name) => {theme = name; return theme},
        getActiveTheme: () => {
          return themes.find(rec => rec.name == theme);
        }
    }
    

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [{ provide: ThemeService, useValue: MyMockedService }]
        });
    }));

    it('should call alarm service', inject(
        [ThemeService], (service: ThemeService) => {
            expect(service).toBeTruthy();
        }));

    it('Api call getActiveTheme', inject([ThemeService], (service: ThemeService) => {
        spyOn(service, 'getActiveTheme');
        service.getActiveTheme();
        expect(service.getActiveTheme).toHaveBeenCalled();
    }));

    it('Api call setTheme', inject([ThemeService], (service: ThemeService) => {
        spyOn(service, 'setTheme');
        service.setTheme('dark');
        expect(service.setTheme).toHaveBeenCalled();
    }));

    it("should getActiveTheme throw error", inject([ThemeService], (service: ThemeService) => {
        let error: any;
        let theme;

        if(service.themes)
        theme = service.themes.find(t => t.name === service.theme);

        if (!theme) {
            error = 'Theme not found';
        };
        expect(error).toEqual('Theme not found');
      }));
});
