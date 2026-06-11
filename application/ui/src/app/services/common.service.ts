/**
 * Name : Vijayakumar
 * Date of creation: 09-09-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */

import { Injectable, Inject, NgZone, EventEmitter } from "@angular/core";
import * as CryptoJS from "crypto-js";
import jwt_decode from "jwt-decode";

import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Observable, throwError, BehaviorSubject, Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import { server, config } from "../../config/config";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  serverConfig = server;
  apiConfig = config;

  private userLoggedIn = new Subject<boolean>();

  private storageSub = new Subject<String>();
  public modeUpdate = new EventEmitter(null);

  private autoManualMode = new BehaviorSubject(null);
  getAutoManualMode = this.autoManualMode.asObservable();

  // User Role Authentication
  private roleAuthentication = new BehaviorSubject(null);
  getRoleAuthentication = this.roleAuthentication.asObservable();

  constructor(private http: HttpClient, private _zone: NgZone) {}

  // Store Data in Storage
  storeInLocalStorage(name, value, change = null) {
    localStorage.setItem(name, value);
    if (change) {
      this.storageSub.next("changed");
    }
  }

  setInLocalStorage(name, value) {
    localStorage.setItem(name, value);
  }

  // removeLocalStorage(name) {
  //     localStorage.removeItem(name);
  // }

  // Get Data in Storage
  getLocalStorage(name): any {
    return localStorage.getItem(name);
  }

  // Remove Data in Storage
  removeInLocalStorage(name, change = null) {
    localStorage.removeItem(name);
    if (change) {
      this.storageSub.next("changed");
    }
  }

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }

  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  getTokenExpirationDate(token: string): Date {
    const decoded: any = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  isTokenExpired(token?: string): boolean {
    const userData = this.getDecryptedUserData();
    const userInfo = userData ? JSON.parse(userData) : false;
    if (!token)
      token = userInfo && userInfo.authToken ? userInfo.authToken : false;
    if (!token) return false;

    const date = this.getTokenExpirationDate(token);
    if (date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  // Send Mode Data
  publishModeData(data: any): any {
    this.autoManualMode.next(data);
  }

  // Login Api
  signIn(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.authService}/login`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // verfiy access token Api
  verify(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.authService}/verfiy-token`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // Update Authentication
  updateAuthendication(userInfo) {
    this.roleAuthentication.next(userInfo);
  }

  // Config User Roles
  getUserRoles(userData) {
    let roles = {
      isOperator: false,
      isWatchTower: false,
      isSuperUser: false,
      qrtUser: false,
      maintenanceUser: false,
      isDeveloper: false,
    };
    if (userData === "reset") {
      roles = {
        isOperator: false,
        isWatchTower: false,
        isSuperUser: false,
        qrtUser: false,
        maintenanceUser: false,
        isDeveloper: false,
      };
    } else {
      userData.role = parseFloat(userData.role);
      if (userData.role === 1) {
        roles.isSuperUser = true;
      } else if (userData.role === 2) {
        roles.isOperator = true;
      } else if (userData.role === 3) {
        roles.isWatchTower = true;
      } else if (userData.role === 4) {
        roles.maintenanceUser = true;
      } else if (userData.role === 6) {
        roles.isDeveloper = true;
      }
    }
    return roles;
  }

  //The set method is use for encrypt the value.
  encrypt(keys, value) {
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value.toString()),
      key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return encrypted.toString();
  }

  //The get method is use for decrypt the value.
  decrypt(keys, value) {
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var decrypted = CryptoJS.AES.decrypt(value, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // Publish Mode Data
  sendModeData(data) {
    this.modeUpdate.emit(data);
  }

  // Enable Full Screen Mode
  enableFullScreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  //Get Descrypted Data
  getDecryptedUserData() {
    const descryptedData = this.getLocalStorage("userInfo");
    return descryptedData
      ? this.decrypt("123456$#@$^@1ERF", descryptedData)
      : "";
  }

  // Handle Errors
  handleError(error: HttpErrorResponse): any {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  // translation getter
  getTranslationKey(key) {
    let langKey = this.apiConfig.TRANSLATION_KEY;
    let getTranslationData = this.apiConfig.translation && this.apiConfig.translation.length ?  this.apiConfig.translation[0] : '';
    
    let keyValue;
    if (getTranslationData) {
      let data = getTranslationData;
      keyValue = data.trans[langKey][key];
    }
    return keyValue;
  }

  setTranslationLanguage(key) {
    this.apiConfig.TRANSLATION_KEY = key;
  }

  /**
   * GET Call
   * @param apiurl
   */
  getApiCall(apiUrl): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}${apiUrl}`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  /***
   * Delete Api Call
   */
  deleteCall(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}`;
    return this.http
      .delete(API_URL + "delete/" + data.id + "/" + data.type)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update Api Call
   * @param updatedata
   */
  updateCall(data, apiUrl): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}${apiUrl}`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  /**
   * Insert Api Call
   * @param updatedata
   */
  insertCall(data, apiUrl): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}${apiUrl}`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  /**
   * Get Api Call
   */
  getDisabledAlarm(zone_id): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/alarm/zones/${zone_id}`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  getImage(img) {
    console.log('inside -------------');
    const API_URL = `${this.serverConfig.API_URL}/image/getImage`;
    let param = `image_path=${img}`;
    const options = {
      params: new HttpParams({ fromString: param }),
    };
    return this.http.get(API_URL, options).pipe(catchError(this.handleError));
  }

  baseUrl = 'http://localhost:3000/videos'; // Backend base URL

  getVideoUrl(fileName: string): string {
    return `${this.baseUrl}/${fileName}`;
  }

}
