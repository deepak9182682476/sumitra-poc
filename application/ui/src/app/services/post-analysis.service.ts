/**
 * Name : Vijayakumar
 * Date of creation: 19-09-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { config } from '../../config/config';

@Injectable({
  providedIn: 'root',
})
export class PostAnalysisService {
  apiConfig = config;

  constructor(private http: HttpClient) { }

  public getImagesSourceApi(query, searchParams?: any): Observable<any> {
    let param = `filterName=${query}`;
    if (searchParams) {
      param = `filterName=${query}`;

      if (searchParams.zoneId) {
        param = param + `&zone_id=${searchParams.zoneId}`;
      }
      if (searchParams.alarmId) {
        param = param + `&alarm_id=${searchParams.alarmId}`;
      }
      if (searchParams.startDate) {
        param = param + `&startDate=${searchParams.startDate}`;
      }
      if (searchParams.endDate) {
        param = param + `&endDate=${searchParams.endDate}`;
      }
    }
    const options = {
      params: new HttpParams({ fromString: param }),
    };
    const API_URL = `${this.apiConfig.serverApiUrl.videoService}/image-from-database`;
    return this.http.get(API_URL, options).pipe(catchError(this.handleError));
  }

  // Get Filter Data
  getFilterApi(query, searchParams?: any): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}`;
    let param = `filterName=${query}`;
    if (searchParams) {
      param = `filterName=${query}`;

      if (searchParams.zoneId) {
        param = param + `&zone_id=${searchParams.zoneId}`;
      }
      if (searchParams.alarmId) {
        param = param + `&alarm_id=${searchParams.alarmId}`;
      }
      if (searchParams.startDate) {
        param = param + `&startDate=${searchParams.startDate}`;
      }
      if (searchParams.endDate) {
        param = param + `&endDate=${searchParams.endDate}`;
      }
    }
    const options = {
      params: new HttpParams({ fromString: param }),
    };
    return this.http
      .get(API_URL + 'findAll', options)
      .pipe(catchError(this.handleError));
  }

  // Get Alarm Data
  getAlarmData(id): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}`;
    const idParam = id ? `zone_id=${id}` : '';
    const options = {
      params: new HttpParams({ fromString: idParam }),
    };
    return this.http
      .get(API_URL + 'findAlarm', options)
      .pipe(catchError(this.handleError));
  }

  // Save Post Analysis Search 
  saveSearch(data: any): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}`;
    return this.http.post(API_URL + 'save-search', data).pipe(catchError(this.handleError))
  }

  // Get Save Post Analysis Search 
  getSaveSearch(role: any): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}`;
    const idParam = role ? `role=${role}` : '';
    const options = {
      params: new HttpParams({ fromString: idParam }),
    };
    return this.http.get(API_URL + 'save-search', options).pipe(catchError(this.handleError))
  }

  // Delete Saved Search
  deleteSavedSearch(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.dbService}`;
    return this.http.delete(API_URL + 'delete-search/' + data.id).pipe(catchError(this.handleError));
  }

  // graphModelContent(pointVal): string {
  //   return `
  //   <style>
  //   u {
  //     position: relative;
  //     top: 10px;
  //   }
  //   table {
  //       text-align: center;
  //       background: #000000;
  //       width: 95%;
  //       color: #f4f4f4ba;
  //       margin-left: 6px;
  //   }
  //   td,
  //   th {
  //       border: 1px solid #666666;
  //       padding: 2px;
  //   }
  //   a, a:hover {
  //     color: #f4f4f4ba;
  //   }
  //   .popup-wrapper {
  //       font-size: 11px;
  //   }
  //   .main-content {
  //     background: #8080800f;
  //     min-height: 100%;
  //   }
  //   .close-btn {
  //     float: right;
  //     font-size: 16px;
  //     cursor: pointer;
  //   }
  // </style>
  //   <div class="main-content">
  //     <span class="float-right mr-2 pb-2 close-btn" >X</span>
  //     <div class="popup-wrapper">
  //     <table>
  //     <tr>
  //       <td>Alarm ID</td>
  //       <td >${pointVal.alarm_id}</td>
  //     </tr>
  //     <tr>
  //       <td>Zone ID</td>
  //       <td>${pointVal.zone_id ? pointVal.zone_id : '--'}</td>
  //     </tr>
  //     <tr>
  //     <td>Latitude</td>
  //     <td>${pointVal.location.coordinates[0]}</td>
  //   </tr>
  //   <tr>
  //     <td>Longitude</td>
  //     <td>${pointVal.location.coordinates[1]}</td>
  //   </tr>
  //   <tr>
  //     <td>Type</td>
  //     <td>${
  //     pointVal.event_type === 0 || pointVal.event_type === 1
  //       ? 'Early Warning'
  //       : pointVal.event_type === 2
  //         ? 'Confirmatory Alarm'
  //         : '--'
  //     }</td>
  //   </tr>
  //     <tr>
  //       <td>Priority</td>
  //       <td>--</td>
  //     </tr>
  //     <tr>
  //       <td>Video Record</td>
  //       <td>--</td>
  //     </tr>
  //     <tr>
  //       <td>Hours</td>
  //       <td>--</td>
  //     </tr>
  //     <tr>
  //       <td>Sensor ID</td>
  //       <td>--</td>
  //     </tr>
  //   </table>
  //     <div class="pb-2" style="background: #00000078;height: 38px;"><u><a href="#">VIDEO LINK</a></u></div>
  //     </div>
  //   </div>
  //   `;
  // }

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
