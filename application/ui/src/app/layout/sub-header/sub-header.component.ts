import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { DataService } from "./../../services/data.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "../../services/event.service";
import { AlarmService } from "src/app/services/alarm.service";
import { PopoverDirective } from 'ngx-bootstrap/popover';

@Component({
  selector: "app-sub-header",
  templateUrl: "./sub-header.component.html",
  styleUrls: ["./sub-header.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SubHeaderComponent implements OnInit {
  // The bar has nothing to show (robot controls off): collapse it and let the map use the height (see body.sub-nav-empty)
  ngDoCheck(): void {
    document.body.classList.toggle("sub-nav-empty", !(this.isSignedIn && this.showRobotControls));
  }


  selectedRobots = new FormControl();
  selectedAlgoType = new FormControl();
  @ViewChild("selRobotsPopover") robotsPopover: PopoverDirective;
  isSignedIn: Boolean = false;
  // UGV patrol buttons (Add Robot / Init / Assign MR) - hidden: no UGVs at the Sundarbans site. Set true to show again.
  showRobotControls = false;
  uavs = [];
  ugvs = [];
  algorithm_types = [];
  openById = {};
  zonesData = [];
  reAssignLoading = false;
  getSelectedAlarm: any = {
    id: null,
    alarms: [],
  };
  event_types = {}
  addedRobots = [];
  manualRouteCbox = false;

  // Get Radar Track Event
  private alarmVisibilityEvent = new BehaviorSubject(null);
  alarmVisibility = this.alarmVisibilityEvent.asObservable();

  constructor(
    public dataService: DataService,
    public commonService: CommonService,
    public eventService: EventService,
    private toasterService: ToastrService,
    public alarmService: AlarmService
  ) {
    this.eventService.emitter.subscribe((response: any) => {
      if (response.message != '' && response.message != null && response.message.length > 0) {
        if (response.type === "UGV") {
          this.ugvs = response.message;
          this.setSelRobotsValues();
          this.algorithm_types = dataService.config.algorithm_types;
        }
        else if (response.type === "UAV") {
          this.uavs = response.message;
        }
        else if (response.type === "isSignedIn") {
          this.isSignedIn = response.message;
        }
        else if (response.type === "smrpopup_close") {
          this.manualRouteCbox = false;
        }
      }
    });
    this.event_types = dataService.config.event_types
  }

  ngOnInit(): void {
    this.enableEmergencyButton();
    this.alarmService.getaccordionZones.subscribe((res) => {
      if (res) {
        this.findZonesAlarmList(res);
      }
    });

    if (!this.commonService.getLocalStorage('userInfo')) {
      this.isSignedIn = false;
    }
    else {
      const getSignedInData = this.commonService.getDecryptedUserData();
      const userInfo = (getSignedInData) ? JSON.parse(getSignedInData) : false;
      this.isSignedIn = (userInfo) ? true : false;
    }
  }

  sendSelectedRobots() {
    console.log()
    this.dataService.addRobotToRos({}).subscribe(
      (res: any) => {
        if (res && !res.error && !res.errorInfo) {
          this.robotsPopover.hide();
          this.getRobotInfo();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAddedRobotsToPMM() {
    this.addedRobots = this.selectedRobots.value
  }
  setSelRobotsValues() {
    if(this.ugvs && this.ugvs.length){
      const ugvArray: any[] = this.ugvs.filter((item) => item.properties.is_in_patrol == true).map((item) => 'UGV_' + item.properties.ugv_id + '_' + item.properties.ip);
      this.selectedRobots.setValue(ugvArray);
    }
    // console.log(this.selectedRobots)
  }

  getRobotInfo() {
    this.dataService.getGeoJsonInfo("UGV").subscribe(
      (result: any) => {
        this.ugvs = result.data.features;
        this.setSelRobotsValues();
      },
      (err) => {
        // console.log(err);
      }
    );
  }

  sendPIRequest() {
    this.dataService.sendPIRequest({algo_type: this.selectedAlgoType}).subscribe(
      (res: any) => {
        if (res && !res.error && !res.errorInfo) {
          console.log(res);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }


  /* This function is used for ESTOP or RTH of UGV or UAV */
  manualRoute(event) {
    this.eventService.broadcastMessage("manual_route", { selectedRobots: this.selectedRobots.value, algo_type: this.selectedAlgoType.value });
  }

  assignToDefault(item, type) {
    // Event Type
    type = type.toLowerCase();
    let eventType = null;
    if (type === "uav") {
      eventType = 6; // Stop the UAV assignment
    } else if (type === "ugv") {
      eventType = 4; // Stop the UGV assignment
    } else {
      eventType = 12; // Stop the QRT assignment
    }

    const getAssignedData = this.commonService.getLocalStorage(
      "assignmentEnabled"
    );
    let getConvertedData = [];
    if (getAssignedData) {
      getConvertedData = JSON.parse(getAssignedData);
    }

    let isAssignedData = getConvertedData.find((lsdata) => {
      if (
        lsdata &&
        lsdata.zone_id === item.properties.zone_id &&
        lsdata.type === type
      ) {
        return lsdata;
      }
    });
    if (isAssignedData) {
      const data = {
        alarm_id: isAssignedData.alarm_id,
        zone_id: isAssignedData.zone_id,
        mode: "manual",
        type: type,
        id: isAssignedData.alarm_id,
        eventType: eventType,
        alarm_data: isAssignedData.alarm_data,
      };

    /*  this.dataService.assignToResponse(data).subscribe(
        (res: any) => {
          if (!res.error && !res.errorInfo) {
            this.toasterService.info(
              `${type.toUpperCase()} has stopped to zone-${isAssignedData.zone_id
              }`
            );
            this.eventService.broadcastMessage(type, {
              assignToDefault: true,
              ip: item.properties.ip,
              zone_id: item.properties.zone_id,
            });

            const storageVal = this.commonService.getLocalStorage(
              "assignmentEnabled"
            );
            const lsVal = storageVal ? JSON.parse(storageVal) : [];
            const alarmIndex = lsVal.findIndex(
              (item) => item.alarm_id === isAssignedData.alarm_id
            );
            lsVal.splice(alarmIndex, 1);
            this.commonService.setInLocalStorage(
              "assignmentEnabled",
              JSON.stringify(lsVal)
            );

            let btn_color =
              type == "uav"
                ? "btn rthz-btn rthz-light"
                : "btn estopz-btn";
            document.getElementById(
              isAssignedData.zone_id + "-" + type
            ).className = btn_color;
          }
        },
        (err) => {
          let btn_color =
            type == "uav"
              ? "btn rthz-btn"
              : "btn estopz-btn";
          document.getElementById(
            isAssignedData.zone_id + "-" + type
          ).className = btn_color;
          this.toasterService.error("Error Occured. Please try later.");
        }
      ); */
    }
  }

  changeLayerVisibility(event) {
    this.dataService.changeAlarmVisbility(event);
  }

  enableEmergencyButton() {
    this.dataService.enableEmergencyButtons.subscribe(
      (res: any) => {
        if (res && !res.error && !res.errorInfo) {
          let btn_color =
            res.assignedType == "uav" ? "btn rthz-btn" : "btn estopz-btn";
          document.getElementById(
            res.zone_id + "-" + res.assignedType
          ).className = btn_color;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }

  accPanelChange(event) {
    this.openById[event.panelId] = event.nextState;
  }

  /** Get Zones Data for Accordion */
  findZonesAlarmList(item) {
    this.alarmService.getZonesAlarmList(item).subscribe((res) => {
      if (res) {
        this.zonesData = res.zone_lists;
      }
    });
  }

  /** Re-Assign UGV */
  reAssignUGV(data) {
    let alarmData = null;
    if (this.getSelectedAlarm.id) {
      this.getSelectedAlarm.alarms.alarmData.forEach((element) => {
        if (element.alarm_id === this.getSelectedAlarm.id) {
          alarmData = element;
        }
      });
    } else {
      this.getSelectedAlarm.alarms = data;
      alarmData = this.getSelectedAlarm.alarms.alarmData[0];
    }
    alarmData.zone_id = data.zoneData.zone_id;
    alarmData.event_type = 13;
    alarmData.alarm_data = {
      alarm_id: alarmData.alarm_id,
    };
    this.dataService.reAssignTeam(alarmData).subscribe((res: any) => {
      this.reAssignLoading = false;
      if (res.error) {
        this.toasterService.success("Sorry Error Occured...");
      } else {
        this.getSelectedAlarm = {
          id: null,
          alarms: [],
        };
        this.toasterService.success("Successfully Reassigned");
      }
    });
  }

  getSelectedAlarms(data, selectedValue) {
    this.getSelectedAlarm.id = selectedValue;
    this.getSelectedAlarm.alarms = data;
  }
}
