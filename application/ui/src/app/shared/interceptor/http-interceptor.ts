import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
    constructor(public commonService: CommonService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // All HTTP requests are going to go through this method
        const userInfo = this.commonService.getLocalStorage('userInfo');
        if (userInfo) {
            const getConvertedData = this.commonService.decrypt('123456$#@$^@1ERF', userInfo);
            const userData = JSON.parse(getConvertedData);
            req = req.clone({
                headers: req.headers.set('Auth-Token', userData.authToken)
            });
        }
        return next.handle(req);
    }
}