import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { config } from './../../config/config';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  config: any;
  private alarmVisilitySource = new BehaviorSubject(null);
  alarmVisibility = this.alarmVisilitySource.asObservable();

  private enableEmergencyButtonsSource = new BehaviorSubject(null);
  enableEmergencyButtons = this.enableEmergencyButtonsSource.asObservable();

  private mapLayersSource = new BehaviorSubject(null);
  getMapLayers = this.mapLayersSource.asObservable();

  private mapLayersTrackSource = new BehaviorSubject(null);
  trackLayer = this.mapLayersTrackSource.asObservable();

  constructor(private http: HttpClient) {
    this.config = config
  }

  public getPerimeterCoordinates(payload): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.sensorService}/get-perimeter-json?type=${payload.type}`;
    return this.http.get(API_URL).pipe(map(result => result));
  }

  public getSensorCoordinates(sensor_type: String = '') {
    var API_URL = `${this.config.serverApiUrl.sensorService}`;
    if (sensor_type != null && sensor_type != '') {
      API_URL = API_URL + `/get-sensors-json?sensor_type=${sensor_type}`;
    }
    else {
      API_URL = API_URL + `/get-sensors-json`;
    }
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  public getZoneCoordinates(): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.zoneService}/all`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  public setZoneCoordinates(data): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.zoneService}/create`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  public enableDisableZone(data): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.zoneService}/enable-disable-zone`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  public getGeoJsonInfo(param) {
    const API_URL = `${this.config.serverApiUrl.responseService}/get-geojson?type=${param}`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  public savePatrolFlag(data) {
    const API_URL = `${this.config.serverApiUrl.responseService}/save-patrol-flag`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  public saveUGVManualRoute(data) {
    const API_URL = `${this.config.serverApiUrl.responseService}/save-ugv-manual-route`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  public getUGVManualRoute(ugv_id) {
    const API_URL = `${this.config.serverApiUrl.responseService}/get-ugv-manual-route?ugv_id=${ugv_id}`;
    return this.http.get(API_URL).pipe(catchError(this.handleError));
  }

  public getBorder()
  {
    console.log(this.config)
    return this.config.border_layer
  }

  // public getZoneWiseUAVUGVs() {
  //   const API_URL = `${this.config.serverApiUrl.responseService}/zone-wise`;
  //   return this.http.get(API_URL).pipe(catchError(this.handleError));
  // }

  public assignToResponse_new(body: any) {
    console.log("body uav: ",body)
    console.log("testing")
    return this.http.post("http://192.168.30.52:7999/fly_track", body).pipe(
      catchError(this.handleError)
    );
   
  }
  
  public returnToHome(data) {
    console.log("testing to rh")

    return this.http.get(`http://192.168.30.52:7999/rtl`).pipe(
      catchError(this.handleError)
    );
  }
  // public assignCommand(data) {
  //   const API_URL = `${this.config.serverApiUrl.responseService}/assign-uav-command`;
  //   return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  // }http://192.168.30.53:5000/fly_track

  // public getUGVPath(data) {
  //   const API_URL = `${this.config.serverApiUrl.map}/gJson/Track`;
  //   return this.http.get(API_URL).pipe(catchError(this.handleError));
  // }

  // send PI request to ROS-Web adapter
  public sendPIRequest(payload) {
    const API_URL = `${this.config.serverApiUrl.adapter}/initialize-pmm`;
    return this.http.post(API_URL, payload).pipe(catchError(this.handleError));
  }

  public addRobotToRos(data) {
    const API_URL = `${this.config.serverApiUrl.adapter}/add-robots`;
    console.log("add robots", API_URL)
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  public assignToDefault(data) {
    const API_URL = `${this.config.serverApiUrl.responseService}/assign-to-default`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }


  /** Get Alarm Details */
  reAssignTeam(data): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.responseService}/re-assign`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // send mask image to ROS-Web adapter
  saveMaskedImage(data): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.webadapter}/save-masked-image`;
    return this.http.post(API_URL, data).pipe(catchError(this.handleError));
  }

  // get all users details
  public getUserDetails(): Observable<any> {
    /* const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token'))
    }); */
    const API_URL = `${this.config.serverApiUrl.authService}/users`;
    return this.http.get(API_URL,
      // { headers: headers }
    ).pipe(catchError(this.handleError));
  }

  // set user update
  public updateUserStatus(data): Observable<any> {
    /* const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token'))
    }); */
    const API_URL = `${this.config.serverApiUrl.authService}/update-user/${data.id}`;
    return this.http.put(API_URL, data,
      // { headers: headers }
    ).pipe(catchError(this.handleError));
  }

  public changeAlarmVisbility(data: any): any {
    this.alarmVisilitySource.next(data);
  }
  public enableEmergencyButton(data: any): any {
    this.enableEmergencyButtonsSource.next(data);
  }


  // public sendTrackToMapComponent(data: any): any {
  //   this.mapLayersTrackSource.next(data);
  // }

  public publishMapLayers(data: any): any {
    this.mapLayersSource.next(data);
  }

  
  
  public getPTZControls(url, queryParams) {
    // const API_URL = `${url}/axis-cgi/com/ptz.cgi?${queryParams}`;
    // console.log(API_URL)
    // const headers = {'Access-Control-Allow-Origin': '*','Access-Control-Allow-Methods': 'GET, POST, OPTIONS','Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',"content-type":"text/plain"}
    //return this.http.get(API_URL).pipe(catchError(this.handleError));
    const API_URL = `${this.config.serverApiUrl.sensorService}`;
    return this.http.get("http://192.168.2.101:8000/ptz?" + queryParams).pipe(catchError(this.handleError));
  }

  public doAutoTrack(body: any) {
    console.log("TI track: ",body)
    return this.http.post("http://192.168.2.101:8000/tracker", body).pipe(
      catchError(this.handleError)
    );
  }

  public postPTZControls(url: string, body: any) {
    // URL for the POST request (you can still keep your base API URL from config or hard-code it)
   // const API_URL = `${this.config.serverApiUrl.sensorService}/ptz`;
  
    // Sending a POST request with the body (PTZ controls) and headers
    return this.http.post("http://192.168.2.101:8000/ptz?", body).pipe(
      catchError(this.handleError)
    );
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
