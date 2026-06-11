
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanLoad, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { Route } from '@angular/compiler/src/core';


@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
    state: RouterStateSnapshot;
    constructor(private router: Router, private commonService: CommonService) { }

    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        const fullPath = segments.reduce((path, currentSegment) => {
            return `${path}/${currentSegment.path}`;
        }, '');
        this.validateRoutes(fullPath);
        return true;
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        this.validateRoutes(state.url);
        return true;
    }

    validateRoutes(fullPath): any {
        const existingRoutes = ['/diagnostics', '/post-analysis',
          '/configuration', '/system-configuration', '/draw-mask-image' ];
        const userRoles = this.commonService.getDecryptedUserData();
        if (userRoles) {

            const userData = JSON.parse(userRoles);
            // Not Accessible for Operator and Watch Tower
            if (userData && userData.role === 2 || userData && userData.role === 3) {
                if (fullPath === '/diagnostics' || fullPath === '/post-analysis' || fullPath === '/configuration') {
                    this.router.navigate(['/maps']); // Navigate away to map route
                    return false;
                }
            } else if (userData && userData.role === 4) {
                if (fullPath === '/maps' || fullPath === '/post-analysis' || fullPath === '/configuration') {
                    this.router.navigate(['/diagnostics']); // Navigate away to map route
                    return false;
                }
            }

            // Only Accessible for Maintenance User
            if (userData && userData.role !== 4) {
                if (fullPath === '/diagnostics') {
                    this.router.navigate(['/maps']); // Navigate away to map route
                    return false;
                }
            }
            
            // System Configuration is only accessible by super admin
            if (fullPath === '/system-configuration') {
                if (userData && (userData.role !== 1 && userData.role !== 6)) {
                    this.router.navigate(['/maps']); // Navigate away to map route
                    return false;
                }
            }
        }else if(existingRoutes.includes(fullPath)) {
            this.router.navigate(['/maps']); // Navigate away to map route
            return false;
        }
    }
};
