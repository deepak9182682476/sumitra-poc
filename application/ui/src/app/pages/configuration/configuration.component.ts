import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Validators, FormBuilder, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DataService } from '../../services/data.service';
import { AlarmService } from '../../services/alarm.service';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { RndfService } from '../../services/rndf.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../services/common.service';
import { forkJoin } from 'rxjs';
export interface form {
  formGroup: FormGroup,
  metaData: any[],
  transactionalData: any[],
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigurationComponent implements OnInit {

  private readonly _eventService: EventService;

  tbodyData = [];
  columns: string[] = [];
  sensorsList: String[] = [];
  filterVal: String = "";
  
  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-lg popupModal'
  };

  form: form = {
    formGroup: null,
    metaData: [],
    transactionalData: [],
  };
  dynamicForm: FormGroup;
  clonedDataJson: any;
  dataJson: any;
  isEditable: Boolean = false;
  config_type: string;
  showMapForCoords: Boolean = false;

  // RNDF Configuration
  rndfConfig = {
    isUploadFile: false,
    isFormSubmitted: false,
    isLoading: false,
    formData: {
      title: '',
      file: null
    },
    columns: ['Title', 'File Name', 'Updated Date', 'Edit/Delete'],
    configData: [],
    isUpdate: false,
    updateData: {
      file_name: '',
      id: null
    },
    submit: {
      isFormSubmitted: false
    }
  };

  uavUgvData = {
    uav: [],
    ugv: [],
    forms: {
      isUAVormSubmitted: false,
      isUGVormSubmitted: false,
      isLoading: {
        uavForm: false,
        ugvForm: false
      },
      isEditAdd: {
        uav: false,
        ugv: false
      }
    }
  };
  uavForm: FormGroup;
  ugvForm: FormGroup;

  //Added to get template reference in spec.ts file -- By kanaka lakshmi
  @ViewChild('template') templateRef: TemplateRef<any>;

  //Added to get template reference in spec.ts file -- By kanaka lakshmi
  @ViewChild('template1') template1Ref: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private modalService: BsModalService,
    public dataService: DataService,
    public alarmService: AlarmService,
    private eventService: EventService,
    private commonService: CommonService,
    private toaster: ToastrService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private RndfService: RndfService) {
    this._eventService = eventService;
    this._eventService.emitter.subscribe((response: any) => {
      if (response.type === 'addcoords') {
        Object.keys(this.dataJson).forEach((key: any) => {
          if (key === "longitude") {
            this.dataJson[key].value = response.message[0];
          }
          if (key === "latitude") {
            this.dataJson[key].value = response.message[1];
          }
        });
        this.setFormFields();
        this.showMapForCoords = false;
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.config_type = params.get('type');
      this.setConfigurableData(this.config_type);
    });
    this.getRndfFiles();
    this.getUAVUGVData();
  }

  setConfigurableData(config_type) {
    if (config_type === "sensor") {
      const sensor_config = require('../../../config/sensor_configuration.json');
      this.dataJson = sensor_config;
      this.clonedDataJson = JSON.parse(JSON.stringify(sensor_config));
      this.getSensorDetails();
    }
    else if (config_type === "user") {
      const user_config = require('../../../config/user_configuration.json');
      this.dataJson = user_config;
      this.clonedDataJson = JSON.parse(JSON.stringify(user_config));
      this.getUserDetails();
    }
  }

  setFormFields() {
    let dataObject = this.dataJson;
    let objectProps = Object.keys(dataObject).map(prop => {
      return Object.assign({}, { key: prop }, dataObject[prop]);
    });

    const formGroup = {};
    for (let prop of Object.keys(dataObject)) {
      if (dataObject[prop].hasOwnProperty(prop)) {
        formGroup[prop] = new FormControl(dataObject[prop].value || '', this.mapValidators(dataObject[prop].validations));
      }
      formGroup[prop] = new FormControl(dataObject[prop].value || '', this.mapValidators(dataObject[prop].validations));
    }

    this.dynamicForm = new FormGroup(formGroup);
    this.form = {
      formGroup: this.dynamicForm,
      metaData: objectProps,
      transactionalData: [],
    }
  }

  getSensorDetails(): void {
    this.alarmService.getSensorDetails().subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        this.columns = res.header.params;
        this.tbodyData = res.data;
        this.sensorsList = res.data.map(item => item.sensor_type)
          .filter((value, index, self) => self.indexOf(value) === index);
      }
    });
  }

  getUserDetails(): void {
    this.dataService.getUserDetails().subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        this.columns = res.header.params;
        this.tbodyData = res.data;
      }
    });
  }

  getMapKeyValue(obj, key) {
    return (obj.hasOwnProperty(key)) ? obj[key] : obj;
  }

  getChildParams(event, keyval) {
    if (event.target.value) {
      var params = this.clonedDataJson[keyval].options.find(element => element.params && (element.value === event.target.value)).params;
      const { sensor_type, sensor_id } = this.dataJson;
      delete this.dataJson['sensor_id'];
      this.dataJson = Object.assign({ sensor_type: sensor_type }, this.getMapKeyValue(params, event.target.value));
      this.dataJson = Object.assign(this.dataJson, { sensor_id: sensor_id });
      this.dataJson[keyval].value = event.target.value;
      this.setFormFields();
    }
    else {
      const { sensor_type, sensor_id } = this.dataJson;
      this.dataJson = Object.assign({ sensor_type: sensor_type, sensor_id: sensor_id });
      this.dataJson[keyval].value = null;
      this.setFormFields();
    }
  }

  openModal(template: TemplateRef<any>, item: any = null) {
    this.showMapForCoords = false;
    if (item) {
      var params = this.clonedDataJson['sensor_type'].options.find(element => element.params && (element.value === item.sensor_type)).params;
      const { sensor_type, sensor_id } = this.dataJson;
      delete this.dataJson['sensor_id'];
      this.dataJson = Object.assign({ sensor_type: sensor_type }, this.getMapKeyValue(params, item.sensor_type));
      this.dataJson = Object.assign(this.dataJson, { sensor_id: sensor_id });

      if (item.sensor_location) {
        Object.assign(item, { longitude: item.sensor_location.coordinates[0], latitude: item.sensor_location.coordinates[1] });
        delete item['sensor_location'];
      }
      Object.keys(this.dataJson).forEach((key: any) => {
        const itemkey = Object.keys(item).filter(elkey => elkey === key)[0];
        if (key === itemkey) {
          this.dataJson[key].value = item[key];
        }
      });
      this.isEditable = true;
    }
    else {
      const { sensor_type, sensor_id } = this.dataJson;
      this.dataJson = Object.assign({ sensor_type: sensor_type, sensor_id: sensor_id });
      this.dataJson['sensor_type'].value = null;
      this.isEditable = false;
    }
    this.setFormFields();
    this.modalRef = this.modalService.show(template, this.config);
  }

  openUserModal(template: TemplateRef<any>, item: any = null) {
    if (item) {
      Object.keys(this.dataJson).forEach((key: any) => {
        const itemkey = Object.keys(item).filter(elkey => elkey === key)[0];
        if (key === itemkey) {
          this.dataJson[key].value = item[key];
        }
      });
    }
    this.setFormFields();
    this.modalRef = this.modalService.show(template, this.config);
  }

  private mapValidators(validators) {
    const formValidators = [];

    if (validators) {
      for (const validation of Object.keys(validators)) {
        if (validation === 'required') {
          formValidators.push(Validators.required);
        } else if (validation === 'minLength') {
          formValidators.push(Validators.minLength(validators[validation]));
        } else if (validation === 'maxLength') {
          formValidators.push(Validators.maxLength(validators[validation]));
        }
      }
    }

    return formValidators;
  }

  public hasValidator(controlName: string, validator: string): boolean {
    let control: AbstractControl = this.dynamicForm.controls[controlName];
    switch (validator) {
      case 'required':
        control.setValue('');  // as is appropriate for the control
      case 'pattern':
        control.setValue('3'); // given you have knowledge of what the pattern is - say its '\d\d\d'
    }
    if (control.validator != null && control.validator(control) != null) {
      let hasValidator: boolean = !!control.validator(control).hasOwnProperty(validator);
      return hasValidator;
    }
    return false;
  }

  updateForm(id: string, transactionalData: any) {
    console.log({ id, transactionalData: transactionalData });
  }

  onSubmit(form: any) {
    if (this.isEditable) {
      this.alarmService.updateSensorDetails(form).subscribe((res) => {
        if (!res.error && !res.errorInfo) {
          this.getSensorDetails();
          this.modalRef.hide();
          this.toastr.success('Updated Successfully');
        }
      });
    }
    else {
      this.alarmService.postSensorDetails(form).subscribe((res) => {
        if (!res.error && !res.errorInfo) {
          this.getSensorDetails();
          this.modalRef.hide();
          this.toastr.success('Updated Successfully');
        }
      });
    }
  }

  onUserConfigSubmit(form: any) {
    if (form.hasOwnProperty("user_id")) {
      Object.assign(form, { id: form.user_id });
      delete form.user_id;
    }
    this.dataService.updateUserStatus(form).subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        this.getUserDetails();
        this.modalRef.hide();
      }
    });
  }

  changeStatus(event = null, item) {
    let data;
    if (event !== null) {
      data = { id: item.sensor_id, status: event.target.checked };
    }
    else {
      data = { id: item.sensor_id, status: 2 }; // 2 for delete
    }

    this.alarmService.updateSensorStatus(data).subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        this.getSensorDetails();
      }
    });
  }

  changeUserStatus(item) {
    let data = { id: item.user_id, status: 0 }; // 2 for delete    
    this.dataService.updateUserStatus(data).subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        this.getUserDetails();
      }
    });
  }

  getCoord(event: any) {
    this.showMapForCoords = !this.showMapForCoords;
  }


  /********************************* RNDF Configuration ****************************/

  // Save Configuration
  saveRndfConfig() {
    this.rndfConfig.isFormSubmitted = true;

    // Check Name is Already Exists/Not
    let isExists = false;
    this.rndfConfig.configData.forEach((elem, index) => {
      if (elem.title === this.rndfConfig.formData.title) {
        isExists = true;
      }
    });

    if (!this.rndfConfig.isUpdate) {
      if (this.rndfConfig.formData.file && this.rndfConfig.formData.title) {
        if (isExists) {
          this.toastr.info('Sorry the entered title is already exists');
          return;
        }
        // this.toastr.info('Please wait');
        const formData = new FormData();
        formData.append('file', this.rndfConfig.formData.file);
        formData.append('file_name', this.rndfConfig.formData.title);
        this.rndfConfig.submit.isFormSubmitted = true;
        this.RndfService.saveRndfConfiguration(formData).subscribe((res) => {
          this.rndfConfig.isFormSubmitted = false;
          this.rndfConfig.submit.isFormSubmitted = false;
          if (!res.error) {
            this.saveRndfCallback();
            this.toastr.success(res.message);
          }
        }, error => {
          this.rndfConfig.isFormSubmitted = false;
          this.rndfConfig.submit.isFormSubmitted = false;
        });

      }
    } else {
      if (this.rndfConfig.formData.title && (this.rndfConfig.formData.file || this.rndfConfig.updateData.file_name)) {
        const formData = new FormData();
        formData.append('file_name', this.rndfConfig.formData.title);
        formData.append('id', this.rndfConfig.updateData.id);
        if (this.rndfConfig.formData.file) {
          formData.append('old_file_name', this.rndfConfig.updateData.file_name);
          formData.append('file', this.rndfConfig.formData.file);
        }
        this.rndfConfig.submit.isFormSubmitted = true;
        this.RndfService.updateRndfConfiguration(formData).subscribe((res) => {
          this.rndfConfig.isFormSubmitted = false;
          this.rndfConfig.submit.isFormSubmitted = false;
          if (!res.error) {
            this.saveRndfCallback();
            this.toastr.success(res.message);
          }
        }, error => {
          this.rndfConfig.isFormSubmitted = false;
          this.rndfConfig.submit.isFormSubmitted = false;
        });
      }
    }
  }

  saveRndfCallback() {
    this.rndfConfig.formData = {
      title: '',
      file: null
    };
    this.getRndfFiles();
    this.rndfConfig.isUploadFile = false;
    this.rndfConfig.isUpdate = false;
    this.rndfConfig.updateData = {
      file_name: '',
      id: null
    };
  }

  // File Upload Selection
  selectFile(event): void {
    // this.rndfConfig.updateData.file_name = '';
    this.rndfConfig.formData.file = event.target.files.item(0);
  }

  // Get All RNDF Files
  getRndfFiles() {
    this.rndfConfig.isLoading = true;
    this.RndfService.getRndfConfiguration().subscribe((res) => {
      this.rndfConfig.configData = res && res.data ? res.data : [];
      this.rndfConfig.isLoading = false;
    }, error => {
      this.rndfConfig.isLoading = false;
    });
  }

  // Delete RNDF Files
  deleteRndf(config, index) {
    this.toastr.info('Please wait');
    this.rndfConfig.isUploadFile = false;
    this.RndfService.deleteRndfConfiguration(config).subscribe((res) => {
      this.toastr.success(res.message);
      this.rndfConfig.configData.splice(index, 1);
      this.getRndfFiles();
    });
  }

  // Set as Default RNDF
  setDefaultRndf(config_id) {
    this.toastr.info('Please wait');
    const data = { id: config_id, is_selected: true };
    this.RndfService.setDefaultRndfConfig(data).subscribe((res) => {
      this.toastr.success(res.message);
      this.getRndfFiles();
    });
  }

  uploadFiles() {
    this.rndfConfig.isFormSubmitted = false;
    this.rndfConfig.formData = {
      title: '',
      file: null
    }
    this.rndfConfig.isUpdate = false;
  }

  // Edit RNDF Config
  editRndfConfig(data) {
    this.rndfConfig.isUploadFile = true;
    this.rndfConfig.isUpdate = true;
    this.rndfConfig.formData.title = data.title;
    this.rndfConfig.updateData.file_name = data.file_name;
    this.rndfConfig.updateData.id = data.id;
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }

  /**
  * Retrive UAV/UGV Data
 */
  getUAVUGVData() {
    const uavdata = this.commonService.getApiCall('find-uav');
    const ugvdata = this.commonService.getApiCall('find-ugv');
    forkJoin([uavdata, ugvdata]).subscribe((results) => {
      const res: any = results;
      if (res && !res.error) {
        this.uavUgvData.uav = res[0].data;
        this.uavUgvData.ugv = res[1].data;
      }
    });
  }

  // Edit/Delete UAV
  deleteUAVUGV(item, operation, type, index) {
    const uavUgv: any = {};
    if (type === 'uav') {
      uavUgv.type = 'uav';
      uavUgv.id = item.uav_id;
    } else {
      uavUgv.type = 'ugv';
      uavUgv.id = item.ugv_id;
    }

    if (operation === 'delete') {
      this.commonService.deleteCall(uavUgv).subscribe((res) => {
        if (!res.error) {
          if (type === 'uav') {
            this.uavUgvData.uav.splice(index - 1, 1);
          } else {
            this.uavUgvData.ugv.splice(index - 1, 1);
          }
          this.toaster.success(res.message);
        } else {
          this.toaster.success(res.message);
        }
      });
    }
  }

  /**
   * Update UAV
   * @param template 
   * @param item 
   * @param isAddEdit 
   */
  editUAV(template: TemplateRef<any>, item: any = null, isAddEdit) {
    this.uavForm = this.fb.group({
      longitude: ['', Validators.required],
      latitude: ['', Validators.required],
      ipaddress: ['', Validators.required],
      current_status: [true],
      zone_id: ['', Validators.required],
      uav_id: '',
      is_assigned: null
    });

    if (isAddEdit && item) {
      this.uavForm.patchValue({
        longitude: item.rth_location.coordinates[0],
        latitude: item.rth_location.coordinates[1],
        ipaddress: item.ip,
        current_status: item.current_status,
        zone_id: item.zone_id,
        uav_id: item.uav_id,
        is_assigned: item.is_assigned
      });
    }

    this.modalRef = this.modalService.show(template, this.config);
  }

  get formControls() { return this.uavForm.controls; }

  /**
   * UAV Form Submit
   */
  uavFormsubmit() {
    this.uavUgvData.forms.isUAVormSubmitted = true;
    if (this.uavForm.invalid) {
      return;
    }
    this.uavUgvData.forms.isUAVormSubmitted = false;
    this.uavUgvData.forms.isLoading.uavForm = true;
    if (!this.uavUgvData.forms.isEditAdd.uav) {

      this.commonService.insertCall({ data: this.uavForm.value }, 'add-uav').subscribe((res) => {
        if (!res.error) {
          this.uavUgvData.forms.isLoading.uavForm = false;
          this.getUAVUGVData();
          this.toaster.success(res.message);
          this.modalRef.hide();
        } else {
          this.uavUgvData.forms.isLoading.uavForm = false;
          this.toaster.success(res.message);
        }
      });

    } else {
      this.commonService.updateCall({ data: this.uavForm.value }, 'update-uav').subscribe((res) => {
        if (!res.error) {
          this.getUAVUGVData();
          this.toaster.success(res.message);
          this.modalRef.hide();
          this.uavUgvData.forms.isLoading.uavForm = false;
        } else {
          this.toaster.success(res.message);
          this.uavUgvData.forms.isLoading.uavForm = false;
        }
      });
    }
  }



  /**
   * Update UGV
   * @param template 
   * @param item 
   * @param isAddEdit 
   */
  editUGV(template: TemplateRef<any>, item: any = null, isAddEdit) {
    this.ugvForm = this.fb.group({
      longitude: ['', Validators.required],
      latitude: ['', Validators.required],
      ipaddress: ['', Validators.required],
      current_status: [true],
      zone_id: ['', Validators.required],
      ugv_id: '',
      is_assigned: null
    });

    if (isAddEdit && item) {
      this.ugvForm.patchValue({
        longitude: item.base_location.coordinates[0],
        latitude: item.base_location.coordinates[1],
        ipaddress: item.ip,
        current_status: item.current_status,
        zone_id: item.zone_id,
        ugv_id: item.ugv_id,
        is_assigned: item.is_assigned
      });
    }

    this.modalRef = this.modalService.show(template, this.config);
  }

  get ugvFormControls() { return this.ugvForm.controls; }

  /**
   * UAV Form Submit
   */
  ugvFormsubmit() {
    this.uavUgvData.forms.isUGVormSubmitted = true;
    if (this.ugvForm.invalid) {
      return;
    }
    this.uavUgvData.forms.isLoading.ugvForm = true;
    if (!this.uavUgvData.forms.isEditAdd.ugv) {
      this.uavUgvData.forms.isUGVormSubmitted = false;
      this.commonService.insertCall({ data: this.ugvForm.value }, 'add-ugv').subscribe((res) => {
        if (!res.error) {
          this.getUAVUGVData();
          this.toaster.success(res.message);
          this.modalRef.hide();
          this.uavUgvData.forms.isLoading.ugvForm = false;
        } else {
          this.uavUgvData.forms.isLoading.ugvForm = false;
          this.toaster.success(res.message);
        }
      });

    } else {
      this.uavUgvData.forms.isUGVormSubmitted = false;
      this.uavUgvData.forms.isLoading.ugvForm = true;
      this.commonService.updateCall({ data: this.ugvForm.value }, 'update-ugv').subscribe((res) => {
        if (!res.error) {
          this.uavUgvData.forms.isLoading.ugvForm = false;
          this.getUAVUGVData();
          this.toaster.success(res.message);
          this.modalRef.hide();
        } else {
          this.uavUgvData.forms.isLoading.ugvForm = false;
          this.toaster.success(res.message);
        }
      });
    }
  }

  uploadFile(event) {
    let uploaded_file = event.target.files.item(0);
    const formData = new FormData();
    formData.append('file', uploaded_file);
    formData.append('file_name', 'sensors_template');
    this.alarmService.saveSensorsFileUpload(formData).subscribe((res) => {
      if (!res.error) {
        this.toastr.success(res.message);
        this.getSensorDetails();
      }
    }, error => {
      this.toastr.success(error.message);
    });
  }
}
