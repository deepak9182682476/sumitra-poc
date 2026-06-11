import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
  OnDestroy,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import { forkJoin, Subscription, interval } from "rxjs";
import { filter } from "rxjs/operators";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";
import { ThemeService } from "../../theme/theme.service";
import { PostAnalysisService } from "../../services/post-analysis.service";
import { AlarmService } from "../../services/alarm.service";
import { DocumentService } from "../../services/document.service";
import { DataService } from "../../services/data.service";
import { config } from "../../../config/config";
import { EventService } from "src/app/services/event.service";
import { now } from "moment";

export interface form {
  formGroup: FormGroup;
  metaData: any[];
  transactionalData: any[];
}

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  prefFormGroup: FormGroup;
  signInData = {
    isSubmitted: false,
    isLoading: false,
    loginFailed: false,
  };
  preferencesData = {
    isEditable: false,
  };

  getMode: any = "auto";
  searchAlarmFilter = "";
  enableFilterIcon = false;
  isFiltersToggled = false;
  dropDownDataSource = {
    alarmBackupData: [],
    zoneData: [],
    alarmData: [],
    savedSearchData: [],
  };
  searchObj = {
    filter: {
      zoneId: "",
      alarmId: "",
      startDate: "",
      endDate: "",
    },
    enableSearchBtn: false,
    enableLoader: false,
    isSaveSearchLoading: false,
    getSaveSearchLoading: false,
  };
  notificationSubscription: Subscription;
  getAutoManualModeSubscription: Subscription;
  getUserLoggedInSubscription: Subscription;

  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "popupModal",
  };
  isSignedIn = false;
  activeTheme: any;

  //Config User privileges
  userInfo: any = {};
  mccsUsers = {
    maintenanceUser: false,
    isOperator: false,
    isWatchTower: false,
    isSuperUser: false,
    isDeveloper: false,
  };
  iconsDetails: any[] = [];
  systemNotifications: any[] = [];
  minDate = new Date().toISOString().split("T")[0];
  @ViewChild("preferencesForm") preferencesForm: NgForm;

  //Added to get template reference in spec.ts file -- By kanaka lakshmi
  @ViewChild("template") templateRef: TemplateRef<any>;
  @ViewChild("sessionTimeout") stTemplateRef: TemplateRef<any>;

  translationLang: any = [];
  alarmsLimit: boolean = true;

  constructor(
    private postAnalysisService: PostAnalysisService,
    public router: Router,
    private dataService: DataService,
    private alarmService: AlarmService,
    private commonService: CommonService,
    public eventService: EventService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    public themeService: ThemeService,
    public documentService: DocumentService
  ) {
    this.eventService.emitter.subscribe((response: any) => {
      if (response.type == "alarms") {
        let message = {
          content: "Alarms Limit Exceeded!!",
          timestamp: now(),
        };
        this.systemNotifications.unshift(message);
        this.alarmsLimit = true;
      }
    });

    this.setTranslationOptions();

    if (this.router.url === "/post-analysis") {
      this.updateFilterData();
    } else {
      this.enableFilterIcon = true;
      this.searchAlarmFilter = "";
    }

    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.enableFilterIcon = true;
        this.searchAlarmFilter = event.url === "/maps" ? "" : "";
        if (event.url === "/post-analysis") {
          this.enableFilterIcon = false;
          this.updateFilterData();
        }
      });
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });

    this.prefFormGroup = this.formBuilder.group({
      id: [""],
      font_size: ["", [Validators.required]],
      language: [""],
    });

    this.getIconsData();
    this.getFilterData();
    this.getNotificationsData();
    this.updateMode();

    // creates an observable that emits an event every 2 minutes.
    this.getUserLoggedInSubscription = interval(2*60*1000).subscribe(x => {
      if(this.commonService.isTokenExpired()) {
        this.openSessionTimeoutModal();
      }
    });

    this.notificationSubscription = this.alarmService
      .getServerPushData()
      .subscribe((result) => {
        if (result && result.type == "notification") {
          const getSignedInData = this.getStoredData();
          const userInfo = getSignedInData
            ? JSON.parse(getSignedInData)
            : false;
          if (userInfo) {
            var icon = this.iconsDetails.filter(
              (icon) => icon.type == result.data.sensor_type
            )[0];
            var isAcknowledged =
              result.read_by && result.read_by.length > 0
                ? result.read_by.includes(userInfo.id)
                : false;
            var isCleared =
              result.cleared_by && result.cleared_by.length > 0
                ? result.cleared_by.includes(userInfo.id)
                : false;
            // var errMsg = this.getTranslationLang("camera_problem");
            var errMsg = result.data.error_data;

            if (!isCleared) {
              var data = {
                id: result.id,
                content: errMsg,
                isAck: isAcknowledged,
                isCleared: isCleared,
              };
              if (icon) {
                icon.messageList.unshift(data);
              }
            }
          }
        }
        if (result && result.type == "system_notification") {
          this.systemNotifications.unshift(result);
        }
      });

    // Check Signed In/Not
    const getSignedInData = this.getStoredData();
    if (
      getSignedInData &&
      JSON.parse(getSignedInData) &&
      JSON.parse(getSignedInData).role
    ) {
      this.isSignedIn = true;
      this.userInfo = JSON.parse(getSignedInData);
      if (this.userInfo && this.userInfo.theme) {
        this.switchTheme(null, this.userInfo.theme);
      } else {
        if (typeof this.themeService.getActiveTheme == "function") {
          this.switchTheme(null);
        }
      }
      if (this.userInfo && this.userInfo.selected_font) {
        this.getFont(this.userInfo.selected_font);
      } else {
        this.getFont();
      }

      if (this.userInfo && this.userInfo.language) {
        this.setTranslationLang(this.userInfo.language);
      } else {
        this.setTranslationLang(config.TRANSLATION_KEY);
      }

      this.mccsUsers = this.commonService.getUserRoles(
        JSON.parse(getSignedInData)
      );
    } else {
      if (typeof this.themeService.getActiveTheme == "function") {
        this.switchTheme(null);
      }
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Default setting translation options
   */
  setTranslationOptions() {
    let getTranslationData = config.translation && config.translation.length ?  config.translation[0] : '';
    if (getTranslationData) {
      let getConvertedData = getTranslationData;
      let transData = [];
      transData.push(getConvertedData.trans);
      for (var k in transData[0]) {
        this.translationLang.push(k);
      }
      this.translationLang.reverse();
    }
  }

  initiateOperatorLogin() {
    // Initiate Operator Login First
    if (!this.commonService.getLocalStorage("userInfo")) {
      this.loginForm.setValue({
        username: "operator",
        password: "12345",
      });
      this.signIn();
    }
  }

  toggleFilters(): void {
    this.isFiltersToggled = !this.isFiltersToggled;
  }

  getIconsData(): void {
    this.iconsDetails = this.alarmService.apiConfig.icons;
  }

  // Get Notifications Data
  getNotificationsData(): void {
    // Subscribe Notifications Data
    this.alarmService.getNotifications().subscribe((response) => {
      if (response) {
        let results = response.data;

        if (!results.error && !results.errorInfo) {
          const getSignedInData = this.getStoredData();
          const userInfo = getSignedInData
            ? JSON.parse(getSignedInData)
            : false;
          if (userInfo) {
            results.filter((element) => {
              var icon = this.iconsDetails.filter(
                (icon) => icon.type == element.data.sensor_type
              )[0];
              var isAcknowledged =
                element.read_by && element.read_by.length > 0
                  ? element.read_by.includes(userInfo.id)
                  : false;
              var isCleared =
                element.cleared_by && element.cleared_by.length > 0
                  ? element.cleared_by.includes(userInfo.id)
                  : false;
              var errMsg;
              //if (element.data.error_data == "Camera Problem") {
              errMsg = element.data.error_data;
              // }
              if (!isCleared) {
                var data = {
                  id: element.id,
                  content: errMsg,
                  isAck: isAcknowledged,
                  isCleared: isCleared,
                };
                if (icon) {
                  icon.messageList.unshift(data);
                }
              }
            });
          }
        }
      }
    });
  }

  updateStatus(index, iconInfo, status) {
    const userInfo = JSON.parse(this.commonService.getDecryptedUserData());
    let data = {
      id: iconInfo.messageList[index].id,
      user_id: userInfo.id,
      status: status,
    };
    this.alarmService.updateNotification(data).subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        if (status) {
          iconInfo.messageList[index].isAck = true;
        } else {
          iconInfo.messageList.splice(index, 1);
        }
      }
    });
  }

  updateSystemNotifyStatus(index, status) {
    if (status) {
      this.systemNotifications[index].isAck = true;
    } else {
      this.systemNotifications.splice(index, 1);
    }
  }

  /** Get Filter Data */
  getFilterData(): void {
    const zoneData = this.postAnalysisService.getFilterApi("zone");
    const alarmsData = this.postAnalysisService.getFilterApi("alarms");
    forkJoin([zoneData, alarmsData]).subscribe((res) => {
      if (!res[0].error) {
        this.dropDownDataSource.zoneData = res[0];
      }
      if (!res[1].error) {
        this.dropDownDataSource.alarmData = res[1];
        this.dropDownDataSource.alarmBackupData = res[1];
      }
      this.searchObj.enableSearchBtn = true;
    });
  }

  /** Get Alarm List */
  getAlarms(): void {
    this.dropDownDataSource.alarmData = [];
    this.postAnalysisService
      .getAlarmData(this.searchObj.filter.zoneId)
      .subscribe((res) => {
        if (!res.error) {
          this.dropDownDataSource.alarmData = res;
        }
      });
  }

  /** Get Post Analysis Data */
  getPostAnalysisData(): void {
    this.searchObj.enableLoader = false;
    this.searchObj.enableSearchBtn = false;
    if (!this.searchObj.filter.zoneId) {
      this.searchObj.filter.zoneId = "All";
    }
    if (!this.searchObj.filter.alarmId) {
      this.searchObj.filter.alarmId = "All";
    }
    localStorage.setItem(
      "postAnalysisFilter",
      JSON.stringify(this.searchObj.filter)
    );
    if (this.searchObj.filter.zoneId === "All") {
      this.searchObj.filter.zoneId = "";
    }
    if (this.searchObj.filter.alarmId === "All") {
      this.searchObj.filter.alarmId = "";
    }
    if (
      (this.searchObj.filter.startDate && !this.searchObj.filter.endDate) ||
      (!this.searchObj.filter.startDate && this.searchObj.filter.endDate)
    ) {
      this.searchObj.enableSearchBtn = true;
    } else {
      this.router.navigate(["/post-analysis"]);
    }

    this.searchObj.enableSearchBtn = true;
    this.notificationSubscription.unsubscribe();
  }

  // Update Search Filter Data
  updateFilterData(): void {
    if (localStorage.getItem("postAnalysisFilter")) {
      const getAnalysisData = JSON.parse(
        localStorage.getItem("postAnalysisFilter")
      );
      let getFilteredData = "";
      const filterTitle = {
        keys: ["zoneId", "alarmId", "startDate", "endDate"],
        titles: ["Zone ID", "Alarm ID", "Start Date", "End Date"],
      };
      Object.keys(getAnalysisData).forEach((elem) => {
        if (getAnalysisData[elem]) {
          if (getFilteredData) {
            getFilteredData += getAnalysisData[elem]
              ? "," +
              filterTitle.titles[filterTitle.keys.indexOf(elem)] +
              "=" +
              getAnalysisData[elem]
              : "";
          } else {
            getFilteredData =
              filterTitle.titles[filterTitle.keys.indexOf(elem)] +
              "=" +
              getAnalysisData[elem];
          }
        }
      });
      this.searchAlarmFilter = getFilteredData
        ? getFilteredData
        : `${this.getTranslationLang("zone_id")} = 
      ${this.getTranslationLang("all")} ,
      ${this.getTranslationLang("alarm_id")} =  ${this.getTranslationLang(
          "all"
        )}`;
    }
  }

  // Change Mode
  updateMode() {
    this.getAutoManualModeSubscription = this.commonService.getAutoManualMode.subscribe(
      (name) => {
        const getSignedInData = this.getStoredData();
        if (getSignedInData) {
          this.mccsUsers = this.commonService.getUserRoles(
            JSON.parse(getSignedInData)
          );
          if (name) {
            if (this.mccsUsers.isOperator || this.mccsUsers.isSuperUser) {
              this.getMode = name;
            } else {
              this.getMode = "auto";
            }
          }
        }
      }
    );

    const getModeName = this.commonService.getLocalStorage("mode");
    if (getModeName) {
      if (this.mccsUsers.isOperator || this.mccsUsers.isSuperUser) {
        this.getMode = getModeName;
      } else {
        this.getMode = "auto";
      }
    }
  }

  openModal(template: TemplateRef<any>, type, item: any = null) {
    if (type === "login") {
      this.signInData = {
        isSubmitted: false,
        isLoading: false,
        loginFailed: false,
      };
      this.loginForm.reset();
    } else if (type === "preferences") {
      if (this.userInfo && this.userInfo.selected_font) {
        this.prefFormGroup.setValue({
          id: this.userInfo.id,
          font_size: this.userInfo.selected_font,
          language: this.userInfo.language || config.TRANSLATION_KEY,
        });
        this.preferencesData.isEditable = true;
      }
    }
    this.modalRef = this.modalService.show(template, this.config);
  }

  setPreferences(form: any) {
    if (this.preferencesData.isEditable) {
      this.dataService.updateUserStatus(form).subscribe((res) => {
        if (!res.error && !res.errorInfo) {
          this.modalRef.hide();
          this.toastr.success(res.message);
        }
      });
    } else {
      this.dataService.updateUserStatus(form).subscribe((res) => {
        if (!res.error && !res.errorInfo) {
          this.modalRef.hide();
          this.toastr.success(res.message);
        }
      });
    }
    this.getFont(form.font_size);
    this.userInfo["selected_font"] = form.font_size;
    this.commonService.setTranslationLanguage(form.language);
    this.userInfo["language"] = form.language;
    const encrypted = this.commonService.encrypt(
      "123456$#@$^@1ERF",
      JSON.stringify(this.userInfo)
    );
    this.commonService.storeInLocalStorage("userInfo", encrypted, true);
  }

  getFonSizeValue(name): any {
    let value = null;
    switch (name) {
      case "Small":
        value = "0.0625rem";
        break;
      case "Medium":
        value = "0.125rem";
        break;
      case "Large":
        value = "0.188rem";
        break;
      default:
        value = "0.125rem";
        break;
    }
    return value;
  }

  signIn() {
    this.signInData.isSubmitted = true;
    this.signInData.loginFailed = false;
    if (this.loginForm.invalid) {
      return;
    }
    if (this.loginForm.valid) {
      this.signInData.isLoading = true;
      this.loginForm.value.password = this.encryptPassword(
        this.loginForm.value.password
      );
      this.commonService.signIn(this.loginForm.value).subscribe(
        (res) => {
          this.signInData.isSubmitted = false;
          this.signInData.isLoading = false;
          if (res.error) {
            this.signInData.loginFailed = true;
          } else {
            if (this.modalRef) {
              this.modalRef.hide();
            }
            const successMessage = this.getTranslationLang("sign_in_success");
            this.toastr.success(successMessage);
            this.checkSignIn(res);
            this.loginForm.reset();
          }
        },
        (err) => {
          this.signInData.isSubmitted = false;
          this.signInData.isLoading = false;
          this.signInData.loginFailed = true;
        }
      );
    }
  }

  checkSignIn(res) {
    this.switchTheme(null, res.data.theme);
    this.getFont(res.data.selected_font);
    this.mccsUsers = this.commonService.getUserRoles(res.data);
    const encrypted = this.commonService.encrypt(
      "123456$#@$^@1ERF",
      JSON.stringify(res.data)
    );
    this.commonService.storeInLocalStorage("userInfo", encrypted, true);
    this.isSignedIn = true;
    this.userInfo = res.data;
    this.eventService.broadcastMessage("isSignedIn", true);
    this.commonService.updateAuthendication({
      ...res.data,
      ...{ isSignedIn: true },
    });

    this.alarmService.getModeStatus().subscribe((results) => {
      if (this.mccsUsers.isOperator || this.mccsUsers.isSuperUser) {
        this.getMode = results.mode ? results.mode : "auto";
        this.commonService.sendModeData(this.getMode);
      }
    });

    if (res.data.role === 4) {
      this.router.navigate(["/diagnostics"]);
    }
  }

  logOut() {
    this.switchTheme(null, null, true);
    this.commonService.removeInLocalStorage("userInfo", false);
    this.eventService.broadcastMessage("isSignedIn", false);
    this.isSignedIn = false;
    const logOutMessage = this.getTranslationLang("log_out_success");
    this.toastr.success(logOutMessage);
    this.commonService.updateAuthendication({ isSignedIn: false });
    this.mccsUsers = this.commonService.getUserRoles("reset");
    this.router.navigate(["/maps"]);
  }

  /** Save Search */
  saveSearch(dropdownDom) {
    this.searchObj.isSaveSearchLoading = true;
    let getRole = "";
    const getSignedInData = this.getStoredData();
    if (
      getSignedInData &&
      JSON.parse(getSignedInData) &&
      JSON.parse(getSignedInData).role
    ) {
      getRole = JSON.parse(getSignedInData).role;
    }

    this.postAnalysisService
      .saveSearch({
        zoneId: this.searchObj.filter.zoneId
          ? this.searchObj.filter.zoneId
          : "All",
        alarmId: this.searchObj.filter.alarmId
          ? this.searchObj.filter.alarmId
          : "All",
        startDate: this.searchObj.filter.startDate,
        endDate: this.searchObj.filter.endDate,
        role: getRole,
      })
      .subscribe(
        (res) => {
          if (!res.error) {
            const saveMessage = this.getTranslationLang("saved_successfully");
            this.toastr.success(saveMessage);
            this.dropDownDataSource.savedSearchData = [];
            this.getSavedSearchData();
          } else {
            let errMessage;
            if (res.message == "Error occured.. Please try later") {
              errMessage = this.getTranslationLang("error_try_later");
            } else {
              errMessage = this.getTranslationLang("available_in_list");
            }
            this.toastr.error(errMessage);
          }
          this.searchObj.isSaveSearchLoading = false;
        },
        (err) => {
          this.searchObj.isSaveSearchLoading = false;
          this.toastr.error("Error occured.. Please try later");
        }
      );
  }

  // Get Save Search
  getSavedSearchData() {
    this.searchObj.getSaveSearchLoading = true;
    if (!this.dropDownDataSource.savedSearchData.length) {
      const getSignedInData = this.getStoredData();
      let role = "";
      if (
        getSignedInData &&
        JSON.parse(getSignedInData) &&
        JSON.parse(getSignedInData).role
      ) {
        role = JSON.parse(getSignedInData).role;
      }
      this.postAnalysisService.getSaveSearch(role).subscribe(
        (res) => {
          this.searchObj.getSaveSearchLoading = false;
          if (!res.error) {
            this.dropDownDataSource.savedSearchData = res;
          }
        },
        (error) => {
          this.searchObj.getSaveSearchLoading = false;
        }
      );
    }
  }

  // Delete Svaed Search
  deleteSavedSearch(index, item) {
    this.postAnalysisService.deleteSavedSearch(item).subscribe((res) => {
      this.searchObj.getSaveSearchLoading = false;
      if (!res.error) {
        this.dropDownDataSource.savedSearchData.splice(index, 1);
        const successMsg = this.getTranslationLang("delete_success");
        this.toastr.success(successMsg);
      }
      let errMsg =
        res.status == 501
          ? this.getTranslationLang("provide_valid_input")
          : this.getTranslationLang("error_try_later");
      this.toastr.error(errMsg);
    });
  }

  // Get Staored Data
  getStoredData() {
    return this.commonService.getDecryptedUserData();
  }

  // Filter Post Analysis
  filterPostAnalysis(data, saveSearchDropDown) {
    this.searchObj.filter = {
      zoneId: data.zone_id ? data.zone_id : "",
      alarmId: data.alarm_id,
      startDate: data.start_date,
      endDate: data.end_date,
    };
    saveSearchDropDown.hide();
    this.getPostAnalysisData();
  }

  // Update Mode
  setMode() {
    this.commonService.storeInLocalStorage("mode", this.getMode, false);
    this.commonService.sendModeData(this.getMode);
    this.alarmService.updateMode(this.getMode).subscribe((res) => {
      let successMsg =
        this.getMode == "auto"
          ? this.getTranslationLang("auto_mode_changed")
          : this.getTranslationLang("manual_mode_changed");
      this.toastr.success(successMsg);
    });
  }

  setTranslationLang(val) {
    return this.commonService.setTranslationLanguage(val);
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }

  switchTheme(event = null, selected_theme = null, logout = null) {
    if (logout) {
      const active = this.themeService.getActiveTheme();
      this.themeService.setTheme(active.name);
    } else {
      if (!event && !selected_theme) {
        this.themeService.setTheme("dark");
      } else {
        if (selected_theme) {
          this.themeService.setTheme(selected_theme);
        } else {
          const active = this.themeService.getActiveTheme();
          if (active.name === "light") {
            this.themeService.setTheme("dark");
          } else {
            this.themeService.setTheme("light");
          }
        }
      }

      this.activeTheme = this.themeService.getActiveTheme();
      const getSignedInData = this.commonService.getDecryptedUserData();
      const isLoggedIn = getSignedInData ? JSON.parse(getSignedInData) : false;
      if (event && isLoggedIn) {
        let setUserInfo = {
          id: this.userInfo.id,
          theme: this.activeTheme.name,
        };
        this.dataService.updateUserStatus(setUserInfo).subscribe((res) => {
          if (res.error && res.errorInfo) {
            console.log("---error in while setting theme---");
          }
        });
        this.userInfo["theme"] = this.activeTheme.name;
        const encrypted = this.commonService.encrypt(
          "123456$#@$^@1ERF",
          JSON.stringify(this.userInfo)
        );
        this.commonService.storeInLocalStorage("userInfo", encrypted, true);
      }
    }
  }

  getInitials(name) {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
  }

  // Encrypt the password
  encryptPassword(value) {
    value = value + "";
    let result = "";
    for (let i = 0; i < value.length; i++) {
      if (i < value.length - 1) {
        result += value.charCodeAt(i) + 10;
        result += "%";
      } else {
        result += value.charCodeAt(i) + 10;
      }
    }
    return result;
  }

  /**
   * Clear All Notification
   */
  clearAllNotification() {
    this.systemNotifications = [];
  }

  alarmFilter() {
    const getAlarmData = [];
    if (this.searchObj.filter.zoneId) {
      this.dropDownDataSource.alarmBackupData.forEach((elem) => {
        if (
          parseFloat(this.searchObj.filter.zoneId) === parseFloat(elem.zone_id)
        ) {
          getAlarmData.push(elem);
        }
      });
      this.dropDownDataSource.alarmData = getAlarmData;
      this.searchObj.filter.alarmId = "";
    } else {
      this.dropDownDataSource.alarmData = this.dropDownDataSource.alarmBackupData;
    }
  }

  ngOnDestroy() {
    this.getAutoManualModeSubscription.unsubscribe();
    // this.getUserLoggedInSubscription.unsubscribe();
  }

  getFont(name = null) {
    if (!name) {
      this.documentService.setCss(
        "html",
        "font-size",
        this.getFonSizeValue("Medium"),
        "0.9rem"
      );
    } else {
      this.documentService.setCss(
        "html",
        "font-size",
        this.getFonSizeValue(name),
        "0.9rem"
      );
    }
  }

  openSessionTimeoutModal() {
    this.modalRef = this.modalService.show(this.stTemplateRef, {
      keyboard: false,
      backdrop: true,
      ignoreBackdropClick: true,
      class: "popupModal"
    });
    this.logOut();
  }
}
