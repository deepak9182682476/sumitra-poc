/**
 * Name : Vijayakumar
 * Date of creation: 09-11-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { config } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class RndfService {
  apiConfig = config;

  constructor(private http: HttpClient) { }

  // save rndf configuration
  saveRndfConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/save-rndf`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // get rndf configuration
  getRndfConfiguration(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/get-rndf`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // save rndf configuration
  updateRndfConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/update-rndf`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  // delete rndf configuration
  deleteRndfConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/delete-rndf/${data.id}/${data.file_name}`;
    return this.http.delete(API_URL).pipe(catchError(this.handleError));
  }

  // set default rndf configuration
  setDefaultRndfConfig(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.responseService}/set-default-rndf/${data.id}`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
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
