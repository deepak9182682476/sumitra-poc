"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.HttpInterceptorService = void 0;
var core_1 = require("@angular/core");
var HttpInterceptorService = /** @class */ (function () {
    function HttpInterceptorService(commonService) {
        this.commonService = commonService;
    }
    HttpInterceptorService.prototype.intercept = function (req, next) {
        // All HTTP requests are going to go through this method
        var userInfo = this.commonService.getLocalStorage('userInfo');
        if (userInfo) {
            var getConvertedData = this.commonService.decrypt('123456$#@$^@1ERF', userInfo);
            var userData = JSON.parse(getConvertedData);
            req = req.clone({
                headers: req.headers.set('Auth-Token', userData.authToken)
            });
        }
        return next.handle(req);
    };
    HttpInterceptorService = __decorate([
        core_1.Injectable()
    ], HttpInterceptorService);
    return HttpInterceptorService;
}());
exports.HttpInterceptorService = HttpInterceptorService;
