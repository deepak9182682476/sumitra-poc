/**
 * Name : Vijayakumar
 * Date of creation: 09-09-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */
import { Component, OnInit, ViewChild, OnDestroy, DoCheck } from "@angular/core";
import { AlarmService } from "../../services/alarm.service";
import { Subscription } from "rxjs";
import { DataService } from "./../../services/data.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { ToastrService } from "ngx-toastr";
import * as turf from "@turf/turf";
import { AlarmDataService } from '../../shared/alarm-data.service';
import { server_info, stream_urls } from '../../../config/config';
import { isValidTrackId, radarTrackIdOf } from '../../shared/track-id';
import { AlarmActionService } from "../../services/alarm-action.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit, OnDestroy, DoCheck {
  dragPosition = { x: 0, y: 0 };

  // Alarm list docked in (full list) or docked out (slim strip, map gets the space). Remembered in this browser.
  dockedOut = false;

  total_alarms = 0;
  alarms_list = {
    Confirmatory_Alarm: [],
    Early_Alarm: [],
  };
  isLoading = null;
  alarmIndexes = [];
  loadingInfo = {
    gettingAlarmData: false,
  };
  searchValue = "";
  alarmsListSubscription: Subscription;
  assignments = [];
  //Config User privileges
  mccsUsers = {
    isOperator: false,
    isWatchTower: false,
    isSuperUser: false,
    isDeveloper: false,
  };
  isSignedIn = false;
  modeData = "auto";
  enableDisableAssignments = {
    alarmid: [],
    eventData: [],
  };
  alarmSubscription: Subscription;
  roleAuthSubscription: Subscription;
  enabeEarlyAlarmClearBtn = null;
  alarmsData: any[] = [];
  constructor(
    private alarmService: AlarmService,
    private dataService: DataService,
    public commonService: CommonService,
    private toastr: ToastrService,
    private toasterService: ToastrService,
    private eventService: EventService,
    private alarmDataService: AlarmDataService,
    private alarmActions: AlarmActionService


  ) {
    this.eventService.emitter.subscribe((response: any) => {
      if (response.message && response.message.assignToDefault) {
        let assignmentIdx = this.alarmService.apiConfig.assignments.findIndex(rec => rec.type == response.type);
        if (assignmentIdx !== -1) {
          // delete  this.alarmService.apiConfig.assignments[assignmentIdx]['position'];
          this.alarmService.apiConfig.assignments[assignmentIdx].isAssigned = false;
        }
      }
    });
  }

  // ---- Alarm action tracking for the Track History pie chart (nothing shown on the cards) ----
  // Each alarm in the list is registered once (time = alarm time), so alarms with no action
  // are counted as "No action" in the pie chart.
  private seenAlarms = new Set<string>();

  ngDoCheck(): void {
    ["Confirmatory_Alarm", "Early_Alarm"].forEach((k) => {
      const list = (this.alarms_list && this.alarms_list[k]) || [];
      list.forEach((item) => this.registerAlarm(item));
    });
  }

  private registerAlarm(item: any): void {
    const id = item && item.alarm_id;
    if (id === null || id === undefined || this.seenAlarms.has(String(id))) return;
    this.seenAlarms.add(String(id));
    const alarmTime = item.alarmmsg_time ? Date.parse(item.alarmmsg_time) : NaN;
    this.alarmActions.record(id, "seen", item.id, alarmTime);
  }

  ngOnInit(): void {
    try { this.dockedOut = localStorage.getItem("sumitra_alarm_list_docked_out") === "1"; } catch (e) { }
    this.applyDockState(false);
    this.alarmDataService.alarms$.subscribe(data => {
      this.alarmsData = data;
      console.log("Sidebar received alarms:", this.alarmsData);
    });
    const getFilterData = localStorage.getItem("postAnalysisFilter");
    this.setUserPrivileges();
    this.loadingInfo.gettingAlarmData = true;
    this.getAlarmProperties();
    this.initSocketConnection();
    this.assignments = this.alarmService.apiConfig.assignments;
    this.alarmsListSubscription = this.alarmService.receiveSocketAlarms.subscribe(
      (res) => {
        if (res) {
          if (res.mode != "") {
            this.modeData = res.mode;
          }
          this.sideBarUpdateAlarms(res);
        }
      }
    );
    this.validateAckClearAlarm();
    // radar re-used a track id: the old card keeps its own key (and its own Acknowledge / Clear)
    this.alarmArchivedSubscription = this.alarmService.receiveAlarmArchived.subscribe((msg: any) => {
      if (msg && msg.archived_id) this.renameAlarmId(msg.old_id, msg.archived_id);
    });
  }

  alarmArchivedSubscription: any;
  renameAlarmId(oldId: any, newId: any) {
    const o = String(oldId);
    const fix = (arr: any[]) => (arr || []).forEach((a: any) => { if (a && String(a.alarm_id) === o) a.alarm_id = newId; });
    if (this.alarms_list) Object.keys(this.alarms_list).forEach((k) => fix(this.alarms_list[k]));
    fix(this.alarmIndexes);
    const ed: any = this.enableDisableAssignments;
    if (ed) {
      (ed.eventData || []).forEach((e: any) => { if (String(e.alarmId) === o) e.alarmId = newId; });
      ed.alarmid = (ed.alarmid || []).map((x: any) => (String(x) === o ? newId : x));
    }
  }

  changePosition() {
    this.dragPosition = {
      x: this.dragPosition.x + 50,
      y: this.dragPosition.y + 50,
    };
  }

  // Get Alarm Properties
  getAlarmProperties(): void {

    this.alarmService.getAlarmInfo().subscribe(
      (res) => {
        this.loadingInfo.gettingAlarmData = false;
        const getAlarmData = [];
        if (!res.error && !res.errorInfo) {
          // Remove Acknowledged Alarms
          const getAlarmsData = [];
          let resFlag = this.checkAlarmListCount(res.data);
          if (resFlag) {
            this.eventService.broadcastMessage("alarms", {
              result: res,
            });
          }
          res.data.forEach((element, j) => {
            let sensors_triggered = element.sensors_triggered[0].split(",");
            if (!sensors_triggered.includes("BFO")) {
              if (!getAlarmsData.length && element.event_type != 2) {
                getAlarmsData.push(element);
              } else {
                let isExists = false;
                getAlarmsData.forEach((elem, i) => {
                  if (elem.event_type != 2 && element.event_type != 2) {
                    if (
                      String(elem.alarm_id) === String(element.alarm_id) &&
                      (elem.event_type < element.event_type ||
                        elem.event_type === element.event_type)
                    ) {
                      getAlarmsData[i].event_type = element.event_type;
                      isExists = true;
                    }
                    if (String(elem.alarm_id) === String(element.alarm_id)) {
                      isExists = true;
                    }
                  }
                });
                if (!isExists && element.event_type != 2) {
                  getAlarmsData.push(element);
                }
              }
              // Get UAV/UGV/QRT Data
              if (
                element.event_type === 3 ||
                element.event_type === 5 ||
                element.event_type === 11
              ) {
                let mgcsAssignment = "";
                if (element.event_type === 3) {
                  mgcsAssignment = "ugv";
                } else if (element.event_type === 5) {
                  mgcsAssignment = "uav";
                } else if (element.event_type === 11) {
                  mgcsAssignment = "qrt";
                }

                let isExists = null;
                this.enableDisableAssignments.eventData.forEach((elem, i) => {
                  if (elem.alarmId === element.alarm_id) {
                    isExists = i;
                  }
                });
                if (isExists !== null) {
                  this.enableDisableAssignments.eventData[
                    isExists
                  ].assignmentType.push(mgcsAssignment);
                } else {
                  this.enableDisableAssignments.eventData.push({
                    alarmId: element.alarm_id,
                    assignmentType: [mgcsAssignment],
                  });
                  this.enableDisableAssignments.alarmid.push(element.alarm_id);
                }

                if (!this.enableDisableAssignments.eventData.length) {
                  this.enableDisableAssignments.eventData.push({
                    alarmId: element.alarm_id,
                    assignmentType: [mgcsAssignment],
                  });
                }

                getAlarmsData.push(element);
              }
            }
          });

          res = getAlarmsData;
          // console.log(res)
          /** Get Early/Confirmatory Alarms */
          const getEaCaList = [];
          res.forEach((val, i) => {
            // console.log(val)
            if (val.event_type != 2) {
              // if (val.alarm_type === 0 || val.alarm_type === 2) {
              if (val.alarm_type === 2) {
                const alarmExists = this.alarms_list["Early_Alarm"].map(
                  (ele) => String(ele.alarm_id)
                );
                if (alarmExists.indexOf(String(val.alarm_id)) === -1) {
                  this.alarms_list["Early_Alarm"].push(val);
                }
                this.alarmIndexes.push({
                  event_type: val.event_type,
                  alarm_id: val.alarm_id,
                  alarm_type: val.alarm_type,
                });
                getEaCaList.push(val);
              } else if (val.alarm_type === 1) {
                // Check Exists/Not and Update the Event Type
                let isEventTypeUpdated = false;
                for (
                  let j = 0;
                  j < this.alarms_list["Confirmatory_Alarm"].length;
                  j++
                ) {
                  const elem = this.alarms_list["Confirmatory_Alarm"][j];

                  if (String(elem.alarm_id) === String(val.alarm_id)) {
                    const isCleared = [];
                    res.forEach((element) => {
                      if (String(element.alarm_id) === String(val.alarm_id)) {
                        isCleared.push(element.event_type);
                      }
                    });
                    if (!isCleared.includes(2)) {
                      if (elem.event_type < val.event_type) {
                        isEventTypeUpdated = true;
                        this.alarms_list["Confirmatory_Alarm"][j].event_type =
                          val.event_type;
                        this.alarmIndexes[j].event_type = val.event_type;
                        getEaCaList[j].event_type = val.event_type;
                      }
                    } else {
                      isEventTypeUpdated = true;
                      // this.alarms_list['Confirmatory_Alarm'][j].event_type = 2;
                      this.alarms_list["Confirmatory_Alarm"].splice(j, 1);
                      this.alarmIndexes[j].event_type = 2;
                      getEaCaList[j].event_type = 2;
                    }
                    break;
                  }
                }

                if (!isEventTypeUpdated) {
                  getEaCaList.push(val);
                  this.alarmIndexes.push({
                    event_type: val.event_type,
                    alarm_id: val.alarm_id,
                    alarm_type: val.alarm_type,
                  });
                  const alarmExists = this.alarms_list[
                    "Confirmatory_Alarm"
                  ].map((ele) => String(ele.alarm_id));
                  if (alarmExists.indexOf(String(val.alarm_id)) === -1) {
                    this.alarms_list["Confirmatory_Alarm"].push(val);
                  }
                }
              }
            }
          });

          // Check Exists/Not
          getEaCaList.forEach((elem) => {
            if (getEaCaList.some((ele) => String(ele.alarm_id) === String(elem.alarm_id))) {
              elem.formatted_zone_id = "zone-" + elem.zone_id;
              getAlarmData.push(elem);
            }
          });
          if (getAlarmData.length) {
            this.alarmService.publishUpdatedAlarmData(getAlarmData);
          }
        }
      },
      (err) => {
        this.loadingInfo.gettingAlarmData = false;
      }
    );
  }

  //To show notify Alert.
  checkAlarmListCount(alarmList) {
    let limitAlert = false;
    if (alarmList && alarmList.length) {
      //filtering out cleared alarms count.
      var list = alarmList.filter((rec) => rec.event_type != 2);

      if (list && list.length > 50) {
        limitAlert = true;
      }
    }
    return limitAlert;
  }

  getAlarmIndex(alarmId) {
    return this.alarmIndexes.findIndex((ele) => String(ele.alarm_id) === String(alarmId));
  }

  // Update Alarm Status
  acknowledgeClearAlarm(param, isAcknowledged, index): void {
    param.acknowledged_cleared = isAcknowledged ? 1 : 2;
    const alarmId = param.alarm_id;
    const alarmIndex = this.alarmIndexes.findIndex(
      (ele) => String(ele.alarm_id) === String(alarmId)
    );
    this.isLoading = param.alarm_id;

    if (!param.location.coordinates) {
      const locations = param.location;
      param.location = {
        coordinates: locations,
      };
    }
    // console.log(param)
    this.alarmService.acknowledgeClearAlarms(param).subscribe(
      (res) => {
        // console.log("res --- ",res)
        this.isLoading = null;
        if (!res.error) {
          const alarms = param;
          this.alarmActions.record(alarmId, isAcknowledged ? "ack" : "reject", param.id);
          alarms.event_type = isAcknowledged ? 1 : 2;
          if (isAcknowledged) {
            this.alarmIndexes[alarmIndex] = {
              event_type: isAcknowledged ? 1 : 2,
              alarm_id: param.alarm_id,
              alarm_type: param.alarm_type,
            };
          } else {
            this.alarmIndexes[alarmIndex].event_type = 2;
            // Remove Confirmatory Alarm
            const removedData = [];
            this.alarms_list["Confirmatory_Alarm"].forEach((elem, i) => {
              if (String(elem.alarm_id) !== String(alarmId)) {
                removedData.push(elem);
              }
            });
            this.alarms_list["Confirmatory_Alarm"] = removedData;

            // Remove Early Alarm
            const removedEarlyAlarmData = [];
            this.alarms_list["Early_Alarm"].forEach((elem, i) => {
              if (String(elem.alarm_id) !== String(alarmId)) {
                removedEarlyAlarmData.push(elem);
              }
            });
            this.alarms_list["Early_Alarm"] = removedEarlyAlarmData;

            this.alarmIndexes.splice(alarmIndex, 1);
            // param.event_type = '2';
          }
          this.alarmService.publishUpdatedAlarmData([alarms]);
        }
      },
      (err) => {
        console.log("err --- ", err);
        this.isLoading = null;
      }
    );
  }

  clearAll(type) {
    let removedAlarmsData = [];
    let clearedAlarms;
    if (type === "ea") {
      // for early alarm
      this.alarms_list["Early_Alarm"].forEach((elem, i) => {
        if (elem.alarm_type === 2) {
          removedAlarmsData.push(elem);
        }
      });
      clearedAlarms = JSON.parse(JSON.stringify(removedAlarmsData));
      this.alarmIndexes = this.alarmIndexes.filter((element) => element.alarm_type !== 2);
      this.alarms_list["Early_Alarm"] = [];
    } else if (type === "ca") {
      // for confirmatory alarm
      this.alarms_list["Confirmatory_Alarm"].forEach((elem, i) => {
        if (elem.alarm_type === 1) {
          removedAlarmsData.push(elem);
        }
      });
      clearedAlarms = JSON.parse(JSON.stringify(removedAlarmsData));
      this.alarmIndexes = this.alarmIndexes.filter((element) => element.alarm_type !== 1);
      this.alarms_list["Confirmatory_Alarm"] = [];
    }

    // Clear All counts as Cancelled for each alarm it removes
    (clearedAlarms || []).forEach((a) => this.alarmActions.record(a && a.alarm_id, "reject", a && a.id));

    this.alarmService.publishClearedAlarms({
      type: type,
      data: clearedAlarms,
    });

    // send the cleared alarms to the server
    this.alarmService
      .acknowledgeClearAlarms({
        cleared_alarms: clearedAlarms,
        clear_all: true,
      })
      .subscribe(
        (res) => {
          // console.log("--- res --- ", res);
        },
        (err) => {
          console.log("--- err --- ", err);
        }
      );
  }

  clearAllTracks() {
    let removedTracksData = [];
    let clearedAlarmTracks;
    this.alarms_list["Early_Alarm"].forEach((elem, i) => {
      if (elem.alarm_type === 2) {
        removedTracksData.push(elem);
      }
    });
    clearedAlarmTracks = JSON.parse(JSON.stringify(removedTracksData));

    this.alarmService.publishClearedAlarms({
      type: "clear_all_tracks",
      tracks_data: clearedAlarmTracks,
    });
  }

  // Socket connection establish
  initSocketConnection(): void {
    this.alarmService.getServerPushData().subscribe((res) => {
      if (res.category && res.category.toLowerCase() === "alarm") {
        // console.log(res);
        this.loadingInfo.gettingAlarmData = false;
        if (res && res.alarmData) {
          let resFlag = this.checkAlarmListCount(res.alarmData);
          if (resFlag) {
            this.eventService.broadcastMessage("alarms", {
              result: res,
            });
          }
          let sensors_triggered = res.alarmData.sensors_triggered[0].split(",");
          if (!sensors_triggered.includes("BFO")) {
            res.alarmData.id = res.alarmData.id
              ? res.alarmData.id
              : res.alarmData.alarm_id;
            if ((!res.alarmData.location || !res.alarmData.location.coordinates || res.alarmData.location.coordinates.length === 0) && res.location) {
              res.alarmData.location = res.location;
            }
            const results = [res.alarmData]; // JSON.parse(res.alarmData);
            const alarmType = res.alarmData.alarm_type;
            const targetList = alarmType === 2 ? "Early_Alarm" : "Confirmatory_Alarm";
            const getNonExistingData = results.filter(
              ({ alarm_id: id1 }) =>
                !this.alarms_list[targetList].some(
                  ({ alarm_id: id2 }) => String(id2) === String(id1)
                )
            );

            if (getNonExistingData.length) {
              this.alarms_list[targetList] = [
                ...this.alarms_list[targetList],
                ...results,
              ];
              if (this.alarms_list[targetList].length) {
                this.loadingInfo.gettingAlarmData = false;
              }
              this.alarmService.publishUpdatedAlarmData(
                getNonExistingData.length ? getNonExistingData : null
              );
            }
          }
        }
      }
    });
  }

  // Handling Socket Alarm Data
  sideBarUpdateAlarms(res): any {
    // if (res && (res.alarmData.alarm_type === 0 || res.alarmData.alarm_type === 2)) {
    // console.log(res);
    if (res && res.alarmData.alarm_type === 2) {
      res.event_type = 0;
      if (res.gJson) {
        res.location = res.gJson.geometry.coordinates;
        res.alarm_id = res.gJson.properties.id;
      }
      res.id = res.alarmData.id ? res.alarmData.id : res.alarmData.alarm_id;
      res.alarm_id = res.alarm_id ? res.alarm_id : res.alarmData.alarm_id;
      const checkAlarmID = (obj) => String(obj.alarm_id) === String(res.alarm_id);
      const alarms = [
        ...this.alarms_list["Confirmatory_Alarm"],
        ...this.alarms_list["Early_Alarm"],
      ];
      if (alarms.some(checkAlarmID) === false) {
        res.formatted_zone_id = "zone-" + res.alarmData.zone_id;
        this.alarms_list["Early_Alarm"].push(res);
        this.alarmIndexes.push({
          event_type: res.event_type,
          alarm_id: res.alarm_id,
          alarm_type: res.alarm_type,
        });
        this.alarmService.publishUpdatedAlarmData([res]);
      } else {
        this.updateAlarms(res);
      }
    } else if (
      res &&
      ((res.gJson && res.gJson.properties && res.gJson.properties.type === 1) ||
        (res.alarmData && res.alarmData.alarm_type == 1))
    ) {
      if (res.gJson) {
        res.location = res.alarmData.location;
        res.alarm_id = res.alarmData.alarm_id;
      }
      res.id = res.alarmData.id ? res.alarmData.id : res.alarmData.alarm_id;
      res.alarm_id = res.alarm_id ? res.alarm_id : res.alarmData.alarm_id;
      const checkAlarmID = (obj) => String(obj.alarm_id) === String(res.alarm_id);
      const alarms = [
        ...this.alarms_list["Confirmatory_Alarm"],
        ...this.alarms_list["Early_Alarm"],
      ];
      if (alarms.some(checkAlarmID) === false) {
        res.formatted_zone_id = "zone-" + res.alarmData.zone_id;
        this.alarms_list["Confirmatory_Alarm"].push(res);
        this.alarmIndexes.push({
          event_type: res.event_type,
          alarm_id: res.alarm_id,
          alarm_type: res.alarm_type,
        });
        this.alarmService.publishUpdatedAlarmData([res]);
      } else {
        this.updateAlarms(res);
      }
    }
  }

  // Update Alarms based on event type
  updateAlarms(res) {
    let getEAIndex = null;
    this.alarms_list["Early_Alarm"].forEach((elem, i) => {
      if (String(res.alarm_id) === String(elem.alarm_id)) {
        this.alarms_list["Early_Alarm"].splice(i, 1);
        if (res.alarm_type === 2) {
          this.alarms_list["Early_Alarm"].push(res);
        } else {
          this.alarms_list["Confirmatory_Alarm"].push(res);
        }
      }
    });

    let getCAIndex = null;
    this.alarms_list["Confirmatory_Alarm"].forEach((elem, i) => {
      if (String(res.alarm_id) === String(elem.alarm_id)) {
        this.alarms_list["Confirmatory_Alarm"].splice(i, 1);
        if (res.alarm_type === 2) {
          this.alarms_list["Early_Alarm"].push(res);
        } else {
          this.alarms_list["Confirmatory_Alarm"].push(res);
        }
      }
    });

    const idx = this.alarmIndexes.findIndex((ele) => String(ele.alarm_id) === String(res.alarm_id));
    if (idx !== -1) {
      this.alarmIndexes[idx] = {
        event_type: res.event_type,
        alarm_id: res.alarm_id,
        alarm_type: res.alarm_type,
      };
    } else {
      this.alarmIndexes.push({
        event_type: res.event_type,
        alarm_id: res.alarm_id,
        alarm_type: res.alarm_type,
      });
    }
    this.alarmService.publishUpdatedAlarmData([res]);
  }

  assignToResponse_map(items, zone_id, type, index, alarmPosition, alarmtype) {
    // Event Type
    let eventType = null;
    if (type === "uav") {
      eventType = 5; // UAV Assignment
      // Before: posted straight to the drone server and only wrote to the browser console, so nothing visible
      // happened (and DEMO mode was ignored). Now the map runs it like the Pursue button in UAV Controls.
      const rawId = items && (items.event_id !== undefined && items.event_id !== null ? items.event_id : items.alarm_id);
      const trackId = parseInt(String(rawId), 10);
      if (isNaN(trackId) || !isValidTrackId(trackId)) {
        this.toastr.warning("This alarm has no valid track ID - cannot assign the UAV.");
        return;
      }
      const loc = items && items.location ? (items.location.coordinates || items.location) : null;
      this.alarmActions.record(items && items.alarm_id, "uav", items && items.id);
      this.alarmService.publishUavCommand({ type: "pursue", track_id: trackId, location: Array.isArray(loc) ? loc : null });
    } else if (type == 'rh') {
      // Return Home = same as RTL in UAV Controls
      this.alarmActions.record(items && items.alarm_id, "home", items && items.id);
      this.alarmService.publishUavCommand({ type: "rtl" });
    }
    else if (type === "ugv") {
      eventType = 3; // UGV Assignment
      // this.alarmService.publishAccordionData(items);
    } else {
      eventType = 11; // QRT Assignment
    }
    console.log("items: ", items)
    // const data = {
    //   alarm_id: items.alarm_id,
    //   zone_id: zone_id,
    //   mode: "manual",
    //   type: type,
    //   id: items.alarm_id,
    //   eventType: eventType,
    //   alarm_data:
    //     alarmtype == "ca"
    //       ? this.alarms_list.Confirmatory_Alarm[alarmPosition]
    //       : this.alarms_list.Early_Alarm[alarmPosition],
    // };
    // // Get Data into localstorage
    // const storageVal = this.commonService.getLocalStorage("assignmentEnabled");
    // let getConvertedData = [];
    // if (storageVal) {
    //   getConvertedData = storageVal.length ? JSON.parse(storageVal) : [];
    // }

    // let isAssignedIndex = getConvertedData.findIndex(
    //   (lsdata) => lsdata.alarm_id === items.alarm_id
    // );
    // if (isAssignedIndex != -1) {
    //   getConvertedData[isAssignedIndex] = data;
    // } else {
    //   getConvertedData.push(data);
    // }

    // // Add Data into localstorage
    // this.commonService.setInLocalStorage(
    //   "assignmentEnabled",
    //   JSON.stringify(getConvertedData)
    // );

    // console.log("sending data to map", data);
    // this.alarmService.publishRadarTrackData({
    //   display_track: false,
    //   radar_track: false,
    //   type: type,
    //   data: data,
    // });

    // if (alarmtype == "ca") {
    //   this.assignments[index].isAssigned = true;
    //   if (!this.assignments[index].position) {
    //     this.assignments[index].position = [alarmPosition];
    //   } else if (
    //     this.assignments[index].position.indexOf(alarmPosition) === -1
    //   ) {
    //     this.assignments[index].position.push(alarmPosition);
    //   }
    //   this.alarms_list.Confirmatory_Alarm[alarmPosition].isAssigned = true;
    // }



    // this.dataService.assignToResponse(data).subscribe(
    //   (res: any) => {
    //     if (!res.error && !res.errorInfo) {
    //       const result = {
    //         assignedType: type,
    //         enable: true,
    //         ip: "10.66.40.61",
    //         type: "response",
    //         zone_id: zone_id,
    //       };
    //       this.toasterService.info(
    //         `${type.toUpperCase()} has assigned to zone-${zone_id}`
    //       );
    //       this.dataService.enableEmergencyButton(result);
    //       this.assignVehicle(items, type);
    //     }
    //   },
    //   (err) => {
    //     this.assignments[index].isAssigned = false;
    //     this.toasterService.error("Error Occured. Please try later.");
    //   }
    // );
  }

  // Display radar track on the map
  displayRadarTrack(event): void {
    this.alarmService.publishRadarTrackData({
      display_track: event.target.checked,
      radar_track: true,
    });
  }

  // User Configuration
  setUserPrivileges() {
    // Check Signed In/Not
    const getSignedInData = this.commonService.getDecryptedUserData();
    if (
      getSignedInData &&
      JSON.parse(getSignedInData) &&
      JSON.parse(getSignedInData).role
    ) {
      this.mccsUsers = this.commonService.getUserRoles(
        JSON.parse(getSignedInData)
      );
      this.isSignedIn = true;
    }
    this.roleAuthSubscription = this.commonService.getRoleAuthentication.subscribe(
      (res) => {
        if (res && res.role) {
          this.mccsUsers = this.commonService.getUserRoles(res);
          this.isSignedIn = true;
        } else if (res && res.isSignedIn === false) {
          this.mccsUsers = this.commonService.getUserRoles("reset");
          this.isSignedIn = false;
        }
      }
    );
  }

  // Restrict Alarm Event Based on mode
  validateAckClearAlarm() {
    // Subscripe Mode Data
    this.commonService.modeUpdate.subscribe((name) => {
      this.modeData = name;
    });
    const getMode = this.commonService.getLocalStorage("mode");
    if (getMode) {
      this.modeData = getMode;
    }
  }

  // Remove Alarm on the Map
  assignVehicle(sensorData, type) {
    this.alarmService.publishUpdatedAlarmData([
      { isAssigmentEnabled: true, sensorData: sensorData, type: type },
    ]);
  }
  // olmap : Map;
  // constructor(){
  // this.olmap = new Map({
  //   target: null,
  //   view: this.view,
  // });
  // }
  // initializeMapComponent(filteredData) {
  //   let mapTarget = this.olmap.getTarget();
  //   if (!mapTarget) {
  //     const result = [];
  //     filteredData.forEach(
  //       (function (hash) {
  //         return function (a) {
  //           if (!hash[a.alarm_id]) {
  //             hash[a.alarm_id] = {
  //               alarm_id: a.alarm_id,
  //               alarmmsg_time: a.alarmmsg_time,
  //               alarm_type: a.alarm_type,
  //               event_id: a.event_id,
  //               camera_id: a.camera_id,
  //               location: a.location,
  //               sensors_triggered: a.sensors_triggered,
  //               zone_id: a.zone_id,
  //               alarm_priority: a.alarm_priority,
  //               alarm_events: [],
  //             };
  //             result.push(hash[a.alarm_id]);
  //           }
  //           hash[a.alarm_id].alarm_events.push({
  //             event_type: a.event_type,
  //             timeofevent: a.timeofevent,
  //             event_location: a.event_location,
  //           });
  //         };
  //       })(Object.create(null))
  //     );
  //     filteredData = result;
  //     this.alarmsData = filteredData;



  //   }
  // }

  // Show Slew TI on Map
  showSlewTI(item, getFilterData, index) {
    // let lastCoordinate: any = [];
    // this.alarmSubscription = this.alarmService
    // .getServerPushData()
    // .subscribe((results) => {
    //   //console.log("@@**results",results);
    //   if (results?.category === 'radar_tracks') {

    //     const coordinates = results?.gJson?.geometry?.coordinates;

    //      lastCoordinate = coordinates?.[coordinates.length - 1];

    //     console.log("Last coordinate:", lastCoordinate);

    //   }

    // })
    // let params = { column: "ti_id", ip: "195.67.6.3" };

    console.log("showSlewTI item", item);
    var ti_camera_ip = "192.168.30.71";
    var ti_coordinates = item.location.coordinates;
    console.log("testdata....", ti_coordinates)
     this.setAutoPTZControl(item, ti_camera_ip, ti_coordinates);

    /* commented by kkl to check if its needed
    let body = {
      track_id: item.alarm_id
    };
    this.dataService.startContinuousTrack(body).subscribe(
      (res: any) => {
        console.log("Start continuous track response:", res);
      },
      (err) => {
        console.log("Start continuous track error:", err);
      }
    );
    */

    // Directly trigger Slew TI Event on the map without marking the alarm as acknowledged in DB
    var data = {
      isSlewPopupEnabled: true,
      data: item,
      ti_coordinates: ti_coordinates,
    };
    console.log("slew data: ", data);
    this.alarmService.publishSlewTIData(data);

    // sensor_id ip_address target_id target_type distance  speed altitude
    /*let coordinates = item.location.coordinates;
    var slew_data = {
      origin: "slew",
      ip: "localhost",
      data: {
        latitude: coordinates[1],
        longitude: coordinates[0],
        sensor_id: item.alarm_id,
        ip_address: "localhost",
        target_id: item.alarm_id,
      },
    };
    this.alarmService.sendSlewTIToAGU(slew_data).subscribe((results) => {
      console.log(results);
    });*/
  }



  // Camera icon on an alarm card: slew the camera once to this alarm's radar track.
  // Spec v2: POST :8000/ptz {"track_id": N} - the camera server computes pan/tilt/zoom itself.
  // (Replaces the old in-browser angle calculation, which used the alarm position as the camera position.)
  setAutoPTZControl(target_info, ti_camera_ip, ti_coordinates) {
    const trackId = radarTrackIdOf(target_info); // radar track id (event_id), never 0
    if (trackId === null) {
      this.toastr.warning("This alarm has no valid track ID - cannot slew the camera.");
      return;
    }
    if ((stream_urls as any).DEMO_FEED === "on") {
      return; // demo mode: the map's demo camera shows the slew, no real request
    }
    this.dataService.cameraSlewOnce(trackId).subscribe(
      (res: any) => this.toastr.success("Camera slewing to track " + trackId),
      (err) => {
        console.log("Camera slew error:", err);
        const st = err && typeof err.status === "number" ? err.status : 0;
        const msg = st > 0 && err.error && err.error.message;
        this.toastr.error(st > 0 ? "Camera server: " + (msg || "error " + st) : "Camera server not reachable (" + server_info.CAMERA_API + ")");
      }
    );
  }

  toggleDock(): void {
    this.dockedOut = !this.dockedOut;
    try { localStorage.setItem("sumitra_alarm_list_docked_out", this.dockedOut ? "1" : "0"); } catch (e) { }
    this.applyDockState(true);
  }

  // The map page reads this body class to size the map; a resize event makes the map redraw at its new size.
  private applyDockState(animate: boolean): void {
    document.body.classList.toggle("alarms-docked-out", this.dockedOut);
    setTimeout(() => window.dispatchEvent(new Event("resize")), animate ? 260 : 0);
  }

  ngOnDestroy(): void {
    document.body.classList.remove("alarms-docked-out");
    this.roleAuthSubscription.unsubscribe();
    this.alarmsListSubscription.unsubscribe();
    if (this.alarmArchivedSubscription) this.alarmArchivedSubscription.unsubscribe();
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }
}



// Original
//   setAutoPTZControl(target_info, ti_camera_ip, ti_coordinates) {

//     console.log("autoptzcontroll")
//     // lat2 lon2 == target
//     // lat1 lat2 == ti

//     // z2 altitude of target
//     let z2 = 11;

//     //target location
//     let target_location = target_info.location.coordinates;
//     let lat2 = target_location[1];
//     let lon2 = target_location[0];

//     // z1 = altitude of ti
//     let z1 = 13;

//     //ti location
//     let ti_location = ti_coordinates;
//     let lat1 = ti_location[1];
//     let lon1 = ti_location[0];
//     let offset = 0;

//     //98 pan tilt -46 146 -269

//     let p = Math.PI / 180;
//     let y =
//       Math.sin((ti_location[0] - target_location[0]) * p) * Math.cos(lat2 * p);
//     let x =
//       Math.cos(lat1 * p) * Math.sin(lat2 * p) -
//       Math.sin(lat1 * p) * Math.cos(lat2 * p) * Math.cos((lon2 - lon1) * p);
//     let angle = (Math.atan2(y, x) * 180) / Math.PI;

//     let bearing = turf.bearing(ti_location, target_location);
//     console.log(angle, bearing);
//     // let pan = -offset + angle;
//     let pan = 50;

//     let dist = turf.distance(ti_location, target_location);
//     console.log(dist);
//     let tanVlaue = Math.atan2(0.16, dist);

//     let tilt = -(tanVlaue * 180) / Math.PI;
//     tilt = 0;
//     console.log(tanVlaue, tanVlaue * 180, Math.PI, pan, tilt);

//     let queryParams = "pan=" + pan + "&tilt=" + tilt;
//     let url = "http://" + ti_camera_ip;
//   //  queryParams = queryParams + "&ip=" + ti_camera_ip;
//    let body = {
//     pan: pan ,
//     tilt: tilt
//    zoom:zoom              // Add the IP to the body
//   };
//     this.dataService.postPTZControls(url, body).subscribe(
//       (res: any) => {
//         if (res && !res.error && !res.errorInfo) {
//           console.log(res);
//         } else {
//           console.log(res);
//         }
//       },
//       (err) => {
//         console.log(err);
//       }
//     );
//   }

//   ngOnDestroy(): void {
//     this.roleAuthSubscription.unsubscribe();
//     this.alarmsListSubscription.unsubscribe();
//   }

//   getTranslationLang(key) {
//     return this.commonService.getTranslationKey(key);
//   }
// }
