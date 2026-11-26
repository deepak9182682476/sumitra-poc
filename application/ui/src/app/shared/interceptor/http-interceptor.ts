import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { server_info } from 'src/config/config';

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
        // Drone integrator API (:7999): "Authorization: Bearer <API_AUTH_TOKEN>" when a token is set in config.ts
        const droneApi = String((server_info as any).DRONE_API || '');
        const droneToken = String((server_info as any).DRONE_API_TOKEN || '');
        if (droneToken && droneApi && req.url.startsWith(droneApi)) {
            req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + droneToken) });
        }
        return next.handle(req);
    }
}