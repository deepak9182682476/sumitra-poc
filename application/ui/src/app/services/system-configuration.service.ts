/**
 * Name : Vijayakumar
 * Date of creation: 09-11-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { config, server } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigurationService {
  apiConfig = config;
  apiUrl = server;

  constructor(private http: HttpClient) { }

  // get Assignment Rules
  getAssignmentRules(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/get-assignment-rules`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // Save/Update Assignment Rules
  saveAssignmentRules(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/save-assignment-rules`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // save system configuration
  saveSystemConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/system-configuration`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // get system configuration
  getSystemConfiguration(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/system-configuration`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // get system configuration
  getSensors(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/system-configuration/sensors`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // save system configuration
  updateSystemConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.adapter}/configuration/system`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

   // Get system mapped configuration
   getSystemMappedConfig(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/get-system-mapped-config`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // save system mapped configuration
  systemMappedConfig(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/system-mapped-config`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // get map configuration
  getMapConfiguration(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/get-mapconfig`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // save map configuration
  saveMapConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/save-mapconfig`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // save uploaded map
  saveUploadedMap(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/save-uloaded-map`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // get all uploaded map files
  getUploadedMap(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/get-uploaded-map-files`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // update uploaded map
  updateUploadedMap(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/update-uploaded-map`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  // delete uploaded map
  deleteUploadedMap(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.map}/delete-uploaded-map/${data.id}/${data.file_name}`;
    return this.http.delete(API_URL).pipe(catchError(this.handleError));
  }

  // Database Configuration
  dbConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}config`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // save/update time Configuration
  timeConfiguration(data): Observable<any> {
    const API_URL = `${this.apiUrl.API_URL}/time-config`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  getTimeConfiguration(): Observable<any> {
    const API_URL = `${this.apiUrl.API_URL}/get-time-config`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // ros config
  rosConfig(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.adapter}/rosConfig`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }
  
  // Handle Errors
  handleError(error: HttpErrorResponse): any {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
