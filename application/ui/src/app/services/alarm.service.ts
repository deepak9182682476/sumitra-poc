/**
 * Name : Vijayakumar & Prudhvi
 * Date of creation: 09-09-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */

import { Injectable, NgZone } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { config } from '../../config/config';

import { webSocket } from 'rxjs/webSocket';
const ws = webSocket(config.WS_URL);

@Injectable({
  providedIn: 'root'
})
export class AlarmService {
  apiConfig = config;

  private clearedAlarmSource = new BehaviorSubject(null);
  clearedAlarmData = this.clearedAlarmSource.asObservable();

  private alarmSource = new BehaviorSubject(null);
  updatedAlarmData = this.alarmSource.asObservable();

  // Get Socket Alarms
  private socketAlarmData = new BehaviorSubject(null);
  receiveSocketAlarms = this.socketAlarmData.asObservable();

  // Get Radar Track Event
  private radarTrackEvent = new BehaviorSubject(null);
  updateRadarTrack = this.radarTrackEvent.asObservable();

  // Get Accordion Zones Data
  private accordionZones = new BehaviorSubject(null);
  getaccordionZones = this.accordionZones.asObservable();

  // Get Slew TI Data
  private slewTIEvent = new BehaviorSubject(null);
  receiveSlewTIEvent = this.slewTIEvent.asObservable();

  constructor(private http: HttpClient, private _zone: NgZone) { }

  // Get SSE Events
  getServerPushData(): Observable<any> {
    return new Observable<string>((observer) => {
      const that = this;
      ws.asObservable().subscribe((data: string) => {
        //console.log("getServerPushData",data);
        //  console.log("new getServerPushData", data);


        that._zone.run(() => {
          observer.next(data);
        });
      });
    });
  }

  // Get Alarm List
  acknowledgeClearAlarms(param): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/acknowledge-clear`;
    return this.http.put(API_URL, param).pipe(catchError(this.handleError));
  }

  /** Get Alarm Details */
  getAlarmInfo(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/alarm-info`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // Clear Tracks of alarms
  clearAlarmTracks(param): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/clear-intrusion-tracks`;
    return this.http.post(API_URL, param).pipe(catchError(this.handleError));
  }

  getAlarmTailInfo(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/alarm-tail-info`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  /** Get Alarm Timeline Details */
  getAlarmTimelineInfo(query, searchParams?: any): Observable<any> {
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
    console.log('options', param);
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/alarm-timeline`;
    return this.http.get(API_URL, options).pipe(catchError(this.handleError));
  }

  getNotifications(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.notificationService}/all`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  updateNotification(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.notificationService}/change-status/${data.id}`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  // Publish Clear Alarm Data
  publishClearedAlarms(data: any): any {
    this.clearedAlarmSource.next(data);
  }

  // Publish Alarm Data
  publishUpdatedAlarmData(data: any): any {
    this.alarmSource.next(data);
  }

  // Publish Radar Data
  publishRadarTrackData(data: any): any {
    this.radarTrackEvent.next(data);
  }

  // Publish Alarm Data
  publishAlarmSocketData(data): any {
    this.socketAlarmData.next(data);
  }

  // Publish Alarm Data
  publishAccordionData(data): any {
    this.accordionZones.next(data);
  }

  // Publish Slew TI Data
  publishSlewTIData(data): any {
    this.slewTIEvent.next(data);
  }

  // Dom Content for Alarm
  // alarmDomContent(icon, alarmId, element): any {

  //   return {
  //     unAcknowledged: `
  //         <div>
  //         <span class="ca-alarm-id">
  //           Alarm ID: ${alarmId} 
  //         </span>
  //         <img class="blinking red" style="height: 25px" src="./assets/sensor-icons/`+ icon + `.svg" id="${element.location.coordinates.toString()}-${alarmId}" alt="Confirmatory Alarm-${element.zone_id}" cat="${element.object_identified}"/>
  //         </div>
  //     `,
  //     acknowledged: `
  //       <div>
  //       <span class="ca-alarm-id ca-ack-alarm-id">
  //         Alarm ID: ${alarmId}
  //       </span> 
  //       <img class='acknowledgedAlarm'  style="height: 25px" src="./assets/sensor-icons/` + icon + `.svg" id="${element.location.coordinates.toString()}-${alarmId}"  alt="Confirmatory Alarm-${element.zone_id}" cat="${element.object_identified}"/>
  //       </div>
  //     `,
  //     earlyAlarm: `         
  //       <div>
  //       <span class="ea-alarm-id">
  //           Alarm ID: ${alarmId}
  //         </span> 
  //       <img class='acknowledgedAlarm' style="height: 25px" src="./assets/sensor-icons/` + icon + `.svg" id="${element.location.coordinates.toString()}-${alarmId}"  alt="Early Alarm-${element.zone_id}"/>
  //       </div>
  //     `,
  //     iff: `         
  //     <div>
  //     <span class="ea-alarm-id">
  //         Alarm ID: ${alarmId}
  //       </span> 
  //     <img class='acknowledgedAlarm' style="height: 25px" src="./assets/sensor-icons/` + icon + `.svg" id="${element.location.coordinates.toString()}-${alarmId}"  alt="Early Alarm-${element.zone_id}"/>
  //     </div>
  //   `,
  //   };
  // }
  alarmDomContent(icon, alarmId, element): any {
    const lat = element.location?.coordinates?.[1] ?? 'N/A';
    const lon = element.location?.coordinates?.[0] ?? 'N/A';
    let range = element.range ?? 'N/A';
    if (range !== 'N/A' && !isNaN(Number(range))) {
      range = Math.round(Number(range) * 1000).toString();
    }
    const trackId = element.alarm_id ?? 'N/A';

    const label = (cssClass: string) => `
      <span class="${cssClass}">
        Track ID: ${trackId}<br/>
        Range: ${range} m<br/>
        Lat: ${lat}<br/>
        Lon: ${lon}
      </span>
    `;

    return {
      unAcknowledged: `
        <div>
          ${label('ca-alarm-id')}
          <img class="blinking red" style="height: 25px" src="./assets/sensor-icons/${icon}.svg"
            id="${element.location.coordinates.toString()}-${alarmId}"
            alt="Confirmatory Alarm-${element.zone_id}"
            cat="${element.object_identified}"/>
        </div>
      `,
      acknowledged: `
        <div>
          ${label('ca-alarm-id ca-ack-alarm-id')}
          <img class="acknowledgedAlarm" style="height: 25px" src="./assets/sensor-icons/${icon}.svg"
            id="${element.location.coordinates.toString()}-${alarmId}"
            alt="Confirmatory Alarm-${element.zone_id}"
            cat="${element.object_identified}"/>
        </div>
      `,
      earlyAlarm: `
        <div>
          ${label('ea-alarm-id')}
          <img class="acknowledgedAlarm" style="height: 25px" src="./assets/sensor-icons/${icon}.svg"
            id="${element.location.coordinates.toString()}-${alarmId}"
            alt="Early Alarm-${element.zone_id}"
            cat="${element.object_identified}"/>
        </div>
      `,
      iff: `
        <div>
          ${label('ea-alarm-id')}
          <img class="acknowledgedAlarm" style="height: 25px" src="./assets/sensor-icons/${icon}.svg"
            id="${element.location.coordinates.toString()}-${alarmId}"
            alt="Early Alarm-${element.zone_id}"
            cat="${element.object_identified}"/>
        </div>
      `,
    };
  }

  /** Get Call  -- unused commented by kanaka lakshmi **/
  // getApi(url): Observable<any> {
  //   const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/alarm-info`;
  //   return this.http.get(API_URL).pipe(catchError(this.handleError));
  // }

  // get zone wise info
  getZoneWiseInfo(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.zoneService}/all`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // get sensors details
  getSensorDetails(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/all`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // save sensors uploaded file
  saveSensorsFileUpload(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/upload-sensors-data`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // get sensor mapped config details
  getSensorMappedConfiguration(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/get-sensor-mapped-config`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // post sensors details
  postSensorDetails(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/create`;
    console.log("*************/create");

    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // update sensors details
  updateSensorDetails(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/update`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  // post sensors status
  updateSensorStatus(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.sensorService}/status-update`;
    return this.http.put(API_URL, data).pipe(catchError(this.handleError));
  }

  // Update Mode
  updateMode(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/update-auto-manual-mode`;
    return this.http.put(API_URL, { mode: data }).pipe(catchError(this.handleError));
  }

  // Get Mode Status
  getModeStatus(): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/get-auto-manual-mode`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  // Get Alarm List from zones
  getZonesAlarmList(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.alarmService}/find-zones-alarm-list`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // Send Slew TI to AGU
  sendSlewTIToAGU(data): Observable<any> {
    const API_URL = `${this.apiConfig.serverApiUrl.webadapter}/send-slew-to-agu`;
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

