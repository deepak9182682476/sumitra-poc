/**
 * Name : Vijayakumar
 * Date of creation: 09-09-2020
 * E-Mail: m.vijayakumar@lnttsthales.com
 */
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { DiagnosticsService } from '../../services/diagnostics.service';

@Component({
  selector: 'app-maintenance-user-sidebar',
  templateUrl: './maintenance-user-sidebar.component.html',
  styleUrls: ['./maintenance-user-sidebar.component.scss'],
})
export class MaintenanceUserSidebarComponent implements OnInit, OnDestroy {
  dragPosition = { x: 0, y: 0 };
  sensorsList = [];
  isLoading = false;
  //Config User privileges
  mccsUsers = {
    isOperator: false,
    isWatchTower: false,
    isSuperUser: false,
    isDeveloper: false
  };
  isSignedIn = false;

  roleAuthSubscription: Subscription;
  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-xl'
  };
  selectedSensors = [];
  sensorsData = {
    sensor_type: null,
    ip: null,
    mac_address: null,
    lat: null,
    long: null,
    azimuth: null,
    current_status: false,
    password: null
  };
  checkBoxModel = [];
  isConfigLoading = false;
  allSensorsData = [];

  //Added to get template reference in spec.ts file -- By kanaka lakshmi
  @ViewChild('template') templateRef: TemplateRef<any>;

  constructor(
    private commonService: CommonService,
    private diagnosticsService: DiagnosticsService,
    private modalService: BsModalService,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.setUserPrivileges();
    this.getSensorsData();
  }

  // User Configuration
  setUserPrivileges() {
    // Check Signed In/Not
    const getSignedInData = this.commonService.getDecryptedUserData();
    if (getSignedInData && JSON.parse(getSignedInData) && JSON.parse(getSignedInData).role) {
      this.mccsUsers = this.commonService.getUserRoles(JSON.parse(getSignedInData));
      this.isSignedIn = true;
    }
    this.roleAuthSubscription = this.commonService.getRoleAuthentication.subscribe((res) => {
      if (res && res.role) {
        this.mccsUsers = this.commonService.getUserRoles(res);
        this.isSignedIn = true;
      } else if (res && res.isSignedIn === false) {
        this.mccsUsers = this.commonService.getUserRoles('reset');
        this.isSignedIn = false;
      }
    });
  }

  getSensorsData(isRefresh?: any) {
    this.isLoading = true;
    const diagnosticsData: any = [];
    this.sensorsList = [];
    this.selectedSensors = [];
    this.diagnosticsService.getAllSensors().subscribe((sensors) => {
      if (!sensors.error) {
        this.diagnosticsService.getDiagnosticsData().subscribe((zones) => {
          if (!zones.error) {
            zones.data.map(rec => {
              rec.error_data =  rec.error_data.replace(/['"]+/g, '');
            });
            const filteredZonesData = zones.data;
            this.allSensorsData = sensors.data;
            
            let result = filteredZonesData.map(senData => senData.zone_id);
            let resultIp = filteredZonesData.map(senData => senData.ip);
            sensors.data.forEach(element => {
              if (resultIp.indexOf(element.ip) !== -1 &&
                   result.indexOf(element.zone_id) !== -1 &&
                    element.current_status === false) {
                element.isAddOpacity = false;
                diagnosticsData.push(element);
              } else {
                element.isAddOpacity = true;
                diagnosticsData.push(element);
              }
            });
            this.sensorsList = filteredZonesData;
            if (isRefresh) {
              this.diagnosticsService.publishDiagnosticsData({ type: 'refresh', data: diagnosticsData });
            }
          }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
        });
      }
    });
  }

  // Modify Configurations
  modifyConfiguration(template: TemplateRef<any>, data) {
    const sensorData = {
      sensor_type: data.sensor_type,
      ip: data.ip,
      mac_address: data.mac_address,
      lat: data.lat,
      long: data.long,
      azimuth: data.azimuth,
      password: data.password,
      current_status: false,
      sensor_id: data.sensor_id,
      error_data: data.error_data
    };
    this.sensorsData = JSON.parse(JSON.stringify(sensorData));
    this.sensorsData.current_status = false;
    this.sensorsData.long = data.sensor_location.coordinates[0];
    this.sensorsData.lat = data.sensor_location.coordinates[1];
    this.isConfigLoading = false;
    this.modalRef = this.modalService.show(template, this.config);
  }

  getSelectedSensors(event, id) {
    if (event.target.checked && this.selectedSensors.indexOf(id) === -1) {
      this.selectedSensors.push(id);
    } else {
      this.selectedSensors.splice(this.selectedSensors.indexOf(id), 1);
    }
  }

  discardSensor(sensor_id, sensorIndex) {
    const getSensorData = JSON.parse(JSON.stringify(this.sensorsList[sensorIndex]));
    const sensorsId = this.allSensorsData.map(sensor => sensor.sensor_id);
    this.sensorsList.splice(sensorIndex, 1);
    this.allSensorsData.splice(sensorsId.indexOf(sensor_id), 1);
    this.diagnosticsService.publishDiagnosticsData({ type: 'discard', data: [getSensorData] });
    this.checkBoxModel[sensorIndex] = false;
    const discardMessage = this.getTranslationLang('discard_success');
    this.toastr.success(discardMessage);
  }

  fixedSensor() {
    if (this.selectedSensors && this.selectedSensors.length) {
      this.toastr.info(this.getTranslationLang('please_wait'));
      this.diagnosticsService.updateDiagnostics({ type: 'discard', data: this.selectedSensors }).subscribe((res) => {
        if (res.error) {
          let errMsg = res.status ? this.getTranslationLang('sensor_required') :
            this.getTranslationLang('error_try_later');
          this.toastr.error(errMsg);
        } else {
          this.checkBoxModel = [];
          this.selectedSensors.forEach((ele, index) => {
            this.checkBoxModel[index] = false;
          });
          this.selectedSensors = [];
          this.toastr.success(this.getTranslationLang("updated_successfully"));
        }
      });
    } else {
      this.toastr.info(this.getTranslationLang('please_choose_sensor'));
    }
  }

  updateSensorData() {
    let isError = false;
    Object.keys(this.sensorsData).forEach(elem => {
      if (this.sensorsData[elem] === null || this.sensorsData[elem] === undefined) {
        isError = true;
      }
    });

    if (!isError) {
      this.isConfigLoading = true;
      this.diagnosticsService.updateDiagnostics({ type: 'configuration', data: this.sensorsData }).subscribe((res) => {
        this.isConfigLoading = false;
        if (res.error) {
          let errMsg = res.status ? this.getTranslationLang('sensor_required') :
            this.getTranslationLang('error_try_later');
          this.toastr.error(errMsg);
        } else {
          this.receivesSensorData();
          this.toastr.success(this.getTranslationLang("updated_successfully"));
          this.modalRef.hide();
        }
      }, err => {
        this.isConfigLoading = false;
      });
    } else {
      this.toastr.info(this.getTranslationLang('please_provide_all_fields'));
    }
  }

  receivesSensorData() {
    this.getSensorsData();
  }

  ngOnDestroy(): void {
    this.roleAuthSubscription.unsubscribe();
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }
}
