import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { config, server_info, server } from './../../config/config';


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

  public deleteZone(zoneId: any): Observable<any> {
    const API_URL = `${this.config.serverApiUrl.zoneService}/${encodeURIComponent(String(zoneId))}`;
    return this.http.delete(API_URL).pipe(catchError(this.keepError));
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
    // Drone API spec v2: POST /fly_track {"track_id": <int>}
    return this.http.post(`${server_info.DRONE_API}/fly_track`, { track_id: parseInt(body.track_id, 10) }).pipe(
      catchError(this.handleError)
    );
   
  }
  
  public returnToHome(data) {
    console.log("testing to rh")

    return this.http.post(`${server_info.DRONE_API}/rtl`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // ---------------- Drone API (spec v2, port 7999) ----------------
  private drone(path: string) { return `${server_info.DRONE_API}${path}`; }

  public droneFlyTrack(trackId: number) {
    return this.http.post(this.drone('/fly_track'), { track_id: trackId }).pipe(catchError(this.keepError));
  }
  public droneFlyTo(latitude: number, longitude: number, altitude?: number) {
    const body: any = { latitude, longitude };
    if (altitude !== undefined && altitude !== null && !isNaN(altitude)) body.altitude = altitude;
    return this.http.post(this.drone('/fly_to'), body).pipe(catchError(this.keepError));
  }
  public droneSetAltitude(altitude: number) {
    return this.http.post(this.drone('/set_altitude'), { altitude }).pipe(catchError(this.keepError));
  }
  public droneRtl() {
    return this.http.post(this.drone('/rtl'), {}).pipe(catchError(this.keepError));
  }
  public droneStopTracking() {
    return this.http.post(this.drone('/stop_tracking'), {}).pipe(catchError(this.keepError));
  }
  // Detection mode on / off. It stays on until the operator turns it off.
  // ---- SDE Spotter ICD (SDE-ICD-SPT-001): sent by our backend as UDP/JSON to the SDE GCS ----
  private get useIcd(): boolean { return (server_info as any).UAV_CONTROL !== 'drone_api'; }
  private uavIcd(path: string) { return `${server.SERVER_URL}/api/uav${path}`; }
  private static readonly ICD_MOVE: any = { forward: 'MOVE_FORWARD', backward: 'MOVE_BACKWARD', left: 'MOVE_LEFT', right: 'MOVE_RIGHT', yaw_left: 'YAW_LEFT', yaw_right: 'YAW_RIGHT' };
  private static readonly ICD_CAMERA: any = { up: 'PLD_Camera_UP', down: 'PLD_Camera_DOWN', zoom_in: 'PLD_Camera_ZOOMIN', zoom_out: 'PLD_Camera_ZOOMOUT' };
  public uavIcdStatus() {
    return this.http.get(this.uavIcd('/status')).pipe(catchError(this.keepError));
  }
  public uavStopTargetTracking() {   // {"type":"STOP_TRACKING",...} (ICD 6.3)
    // drone_api: stop onboard visual tracking, drone loiters (radar pursuit is stopped with /stop_tracking)
    // if (!this.useIcd) return this.http.post(this.drone('/stop_tracking'), {}).pipe(catchError(this.keepError));   // earlier
    if (!this.useIcd) return this.http.post(this.drone('/visual_track/stop'), {}).pipe(catchError(this.keepError));
    return this.http.post(this.uavIcd('/stop-tracking'), {}).pipe(catchError(this.keepError));
  }

  // NOTE (drone_api mode): endpoint names to be confirmed with the drone API (backend must add these).
  public droneDetectionStart() {
    if (this.useIcd) return this.http.post(this.uavIcd('/detection'), { enabled: true }).pipe(catchError(this.keepError));
    // return this.http.post(this.drone('/detection/start'), {}).pipe(catchError(this.keepError));   // earlier guess
    return this.http.post(this.drone('/visual_track/detection'), { enabled: true }).pipe(catchError(this.keepError));
  }
  public droneDetectionStop() {
    if (this.useIcd) return this.http.post(this.uavIcd('/detection'), { enabled: false }).pipe(catchError(this.keepError));
    // return this.http.post(this.drone('/detection/stop'), {}).pipe(catchError(this.keepError));   // earlier guess
    return this.http.post(this.drone('/visual_track/detection'), { enabled: false }).pipe(catchError(this.keepError));
  }
  // Tracking mode: point clicked on the UAV video.
  // x, y = pixel in the video frame itself (0,0 = top-left); width, height = frame size in pixels.
  // NOTE: endpoint name to be confirmed with the drone API (backend must add POST /track_pixel).
  public droneTrackPixel(x: number, y: number, width: number, height: number) {
    // ICD 6.2: {"type":"SELECT_TARGET","x":..,"y":..,"video_width":1280,"video_height":720}
    if (this.useIcd) return this.http.post(this.uavIcd('/select-target'), { x, y, video_width: width, video_height: height }).pipe(catchError(this.keepError));
    // return this.http.post(this.drone('/track_pixel'), { x, y, width, height }).pipe(catchError(this.keepError));   // earlier guess
    return this.http.post(this.drone('/visual_track/select'), { x, y, video_width: width, video_height: height }).pipe(catchError(this.keepError));
  }
  // direction: forward | backward | left | right | yaw_left | yaw_right
  public droneMove(direction: string) {
    if (this.useIcd) return this.http.post(this.uavIcd('/command'), { command: DataService.ICD_MOVE[direction] || direction }).pipe(catchError(this.keepError));
    return this.http.post(this.drone('/move/' + direction), {}).pipe(catchError(this.keepError));
  }
  // action: up | down | zoom_in | zoom_out
  public droneCamera(action: string) {
    if (this.useIcd) return this.http.post(this.uavIcd('/command'), { command: DataService.ICD_CAMERA[action] || action }).pipe(catchError(this.keepError));
    return this.http.post(this.drone('/camera/' + action), {}).pipe(catchError(this.keepError));
  }
  public droneTelemetry() {
    return this.http.get(this.drone('/telemetry')).pipe(catchError(this.keepError));
  }
  public droneHealth() {
    return this.http.get(this.drone('/health')).pipe(catchError(this.keepError));
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
    return this.http.get(`${server_info.CAMERA_API}/ptz?` + queryParams).pipe(catchError(this.handleError));
  }

  public doAutoTrack(body: any) {
    console.log("TI track: ",body)
    return this.http.post(`${server_info.CAMERA_API}/tracker`, body).pipe(
      this.camCheck, catchError(this.keepError)
    );
  }

  public postPTZControls(url: string, body: any) {
    // Sending a POST request with the body (PTZ controls) and headers
    return this.http.post(`${server_info.CAMERA_API}/ptz`, body).pipe(
      catchError(this.handleError)
    );
  }

  public startContinuousTrack(body: any) {
    return this.http.post(`${server_info.CAMERA_API}/track/start`, body).pipe(
      this.camCheck, catchError(this.keepError)
    );
  }

  public stopContinuousTrack() {
    return this.http.post(`${server_info.CAMERA_API}/track/stop`, {}).pipe(
      this.camCheck, catchError(this.keepError)
    );
  }

  public returnCameraHome() {
    return this.http.post(`${server_info.CAMERA_API}/home`, {}).pipe(
      this.camCheck, catchError(this.keepError)
    );
  }

  // ---------------- Camera API (spec v2, port 8000) ----------------
  // Camera server answers HTTP 200 with {"error": "..."} for bad input (e.g. invalid track_id / mode).
  // Turn that into an error so the UI shows the message instead of "success".
  private camCheck = map((res: any) => {
    if (res && res.error) {
      throw { status: 200, error: { message: String(res.error) + (res.supported ? " (supported: " + res.supported.join(", ") + ")" : "") } };
    }
    return res;
  });
  // Slew once to a radar track: the camera server works out pan/tilt itself.
  public cameraSlewOnce(trackId: number) {
    return this.http.post(`${server_info.CAMERA_API}/ptz`, { track_id: trackId }).pipe(this.camCheck, catchError(this.keepError));
  }
  // Camera service health: { camera, angle_scale, encoding, zoom: {last_eo, last_ir}, kafka }
  public cameraHealth() {
    return this.http.get(`${server_info.CAMERA_API}/health`).pipe(catchError(this.keepError));
  }
  // Manual pan / tilt / zoom: all fields optional
  // { pan (deg), tilt (deg, -45..45), zoom_distance_m (m), gimbal_mode (0 Position, 1 Stabilize, 2 Velocity, 4 Halt) }
  public cameraMove(body: any) {
    return this.http.post(`${server_info.CAMERA_API}/move`, body).pipe(this.camCheck, catchError(this.keepError));
  }

  public slewOnce(body: any) {
    return this.http.post(`${server_info.CAMERA_API}/ptz`, body).pipe(
      catchError(this.handleError)
    );
  }
  

  // Spec v2 camera/drone calls: pass the HTTP error through unchanged, so the screen can show the
  // server's own message (e.g. 400 {"status":"error","message":"altitude must be 0-5000 m"}) instead of "not reachable".
  keepError(error: HttpErrorResponse): any {
    return throwError(error);
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
