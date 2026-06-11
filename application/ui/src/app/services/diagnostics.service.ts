import { Injectable, EventEmitter } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { config } from '../../config/config';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsService {
  public diagnosticsDataEmitter = new EventEmitter<string>(null);

  apiConfig = config;
  constructor(private http: HttpClient) {
  }

  publishDiagnosticsData(message: any): void {
    this.diagnosticsDataEmitter.emit(message);
  }

  updateDiagnostics(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/update-diagnostics`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  /** Get Diagnostics Details */
  getDiagnosticsData(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/diagnostics-data`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  /** Get All Sensors Data */
  getAllSensors(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/all`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
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