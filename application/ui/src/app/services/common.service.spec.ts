import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [CommonService]
    });
    service = TestBed.get(CommonService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store in local storage', () => {
    service.storeInLocalStorage('test', 'testvalue');
    expect(localStorage.getItem('test')).toEqual('testvalue');
  });

  it('should set item in local storage', () => {
    service.setInLocalStorage('test', 'testvalue');
    expect(localStorage.getItem('test')).toEqual('testvalue');
  });

  it('should remove item in local storage', () => {
    service.removeInLocalStorage('test');
    expect(localStorage.getItem('test')).toBeNull();
  });

  // it('should remove in local storage', () => {
  //   service.removeLocalStorage('test');
  //   expect(localStorage.getItem('test')).toBeNull();
  // });

  it('should watchStorage', () => {
    service.watchStorage().subscribe();
    expect(service.watchStorage).toHaveBeenCalled();
  });

  it('should publish mode data', fakeAsync(() => {
    let data = {};
    service.publishModeData(data);
    expect( service.publishModeData).toHaveBeenCalled();
  }));

});
