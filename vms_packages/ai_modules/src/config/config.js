import { isArray } from "lodash";
import moment from "moment";
import { getLocalStorage } from "../utilities/common-util";
import * as HELPERS from "./helpers";

export const config_data = {
  model: null,
  camera: null,
  confidence_threshold: 97
};

export const local_anpr_user = (key, permissionKey, permissionVal) => {
  if(permissionVal === 'Home'){
    return true;
  }
  let user = getLocalStorage('anpr_user');
  if (user) {
    let parsedUserJson = JSON.parse(user);
    let user_info = parsedUserJson.userInfo ? parsedUserJson.userInfo[0] : null;
    if (user_info) {
      if (isArray(user_info[key]) && user_info[key].length) {
        let idx = user_info[key].findIndex(rec => {
          if (rec && rec[permissionKey] && rec['is_active'] !== "0") {
            return rec[permissionKey].toLowerCase() === permissionVal.toLowerCase();
          }
          return;
        });
        if (idx !== -1) {
          return true;
        }
      }
    }
  }
  return false;
};

export const user_role_access = (key, permissionKey) => {
  let user = getLocalStorage('anpr_user');
  let permissionVal = 'Admin'
  if (user) {
    let parsedUserJson = JSON.parse(user);
    let user_info = parsedUserJson.userInfo ? parsedUserJson.userInfo[0] : null;
    if (user_info) {
      if (isArray(user_info[key]) && user_info[key].length) {
        let idx = user_info[key].findIndex(rec => {
          if (rec && rec[permissionKey]) {
            return rec[permissionKey].toLowerCase() === permissionVal.toLowerCase();
          }
          return;
        });
        if (idx !== -1) {
          return true;
        }
      }
    }
  }
  return false;
};

export const model_param_type_options = [
  { id: 1, name: 'text', label: 'Text' },
  { id: 2, name: 'select', label: 'Select' },
  { id: 3, name: 'boolean', label: 'Boolean' },
  { id: 4, name: 'date', label: 'Date' }
]

export const camera_type_options = [
  { id: 1, name: 'rtsp', label: 'RTSP' },
  { id: 2, name: 'vms', label: 'VMS' },
  { id: 3, name: 'video', label: 'Video' }
]

const initialState = {
  cameraList: [],
  filterProps: {
    startDate: moment().subtract(4, "hours").format(),
    endDate: moment().format(),
    interval: 21600,
    selectedCommissionerate: null,
    commissionerateIndex: -1,
    selectedZone: "",
    zoneIndex: -1,
    selectedPs: "",
    psIndex: -1,
  },
  violations: {},
  violationGraphData: [],
  violationsMapData: {
    type: "FeatureCollection",
    features: [],
  },
  cameraHeirarchyList: [],
  violationImages: [],
  analyticsData: {
    index: 0,
    violated_persons: 0,
    total_persons: 0,
  },
  analysisData: {
    models_count: 0,
    events_count: 0,
  },
  alerts: [],
  filteredAlerts: [],
};

export const configuredData = (data, filterparams, state = initialState) => {
  let obj = data;
  return {
    ...state,
    violationsMapData:
      obj.geo_data && obj.geo_data.length > 0
        ? HELPERS.getMapData(obj.geo_data)
        : state.violationsMapData,
    analyticsData:
      obj.time_series_data && obj.time_series_data.length > 0
        ? HELPERS.getAnalyticsData(obj.time_series_data, filterparams)
        : state.analyticsData,
    // violationsBarData:
    //   obj.time_series_data && obj.time_series_data.length > 0
    //     ? HELPERS.getBarGraphData(obj.time_series_data, filterparams)
    //     : [],
    // violationGraphData:
    //   obj.time_series_data && obj.time_series_data.length > 0
    //     ? HELPERS.getAnalyticsData(obj.time_series_data, filterparams)
    //     : state.analyticsData,
  };
};

export const DONUT_SERIES_CONFIG = {
  LAYOUT: {
    autosize: true,
    margin: {
      l: 55,
      r: 30,
      t: 30,
      b: 50,
    },
    legend: {
      font: {
        color: "#ffffff",
      },
    },
    paper_bgcolor: "#2B2A29",
    plot_bgcolor: "#2B2A29",
    colorway: ["#35ACD2", "#EB4343", "#44B453", "#D46606", "#D4CD06"],
    displayLogo: false,
    showlegend: true,
    annotations: [
      {
        font: {
          size: 18,
          color: "#fff",
        },
        showarrow: false,
        text: "Models",
        x: 0.37,
        y: 0.5,
      },
    ],
  },
  CONFIG: {
    displaylogo: false,
    responsive: true,
  },
  MAX_LAYOUT: {
    // width: 855,
    // height: 440,
    autosize: true,
    margin: {
      l: 55,
      r: 30,
      t: 30,
      b: 50,
    },
    legend: {
      font: {
        color: "#ffffff",
      },
    },
    paper_bgcolor: "#2B2A29",
    plot_bgcolor: "#2B2A29",
    colorway: ["#35ACD2", "#EB4343", "#44B453", "#D46606", "#D4CD06"],
    displayLogo: false,
    showlegend: true,
  },
};

export const BAR_GRAPH_CONFIG = {
  CONFIG: {
    displaylogo: false,
    responsive: true,
  },
  LAYOUT: {
    autosize: true,
    margin: {
      l: 55,
      r: 30,
      t: 30,
      b: 50,
    },
    xaxis: {
      title: {
        text: "Camera",
      },
      color: "#ffffff",
    },
    yaxis: {
      title: {
        text: "Events Count",
      },
      color: "#ffffff",
    },
    legend: {
      font: {
        color: "#ffffff",
      },
    },
    paper_bgcolor: "#2B2A29",
    plot_bgcolor: "#2B2A29",
    colorway: ["#35ACD2", "#EB4343", "#44B453", "#D46606", "#D4CD06"],
    displayLogo: false,
  },
  MAX_LAYOUT: {
    width: 855,
    height: 440,
    autosize: true,
    margin: {
      l: 55,
      r: 30,
      t: 30,
      b: 50,
    },
    xaxis: {
      title: {
        text: "Camera",
      },
      color: "#ffffff",
    },
    yaxis: {
      title: {
        text: "Events Count",
      },
      color: "#ffffff",
    },
    legend: {
      font: {
        color: "#ffffff",
      },
    },
    paper_bgcolor: "#2B2A29",
    plot_bgcolor: "#2B2A29",
    colorway: ["#35ACD2", "#EB4343", "#44B453", "#D46606", "#D4CD06"],
    displayLogo: false,
  },
};

export const severity = [
  {
    id: 1,
    label: "High",
    value: "High",
  },
  {
    id: 2,
    label: "Low",
    value: "Low",
  },
  {
    id: 3,
    label: "Medium",
    value: "Medium",
  },
];

export const schedule = [
  {
    id: 1,
    label: "9AM - 12AM",
    value: "9AM - 12AM",
  },
  {
    id: 2,
    label: "12AM - 3AM",
    value: "12am-3am",
  },
  {
    id: 3,
    label: "3AM - 6AM",
    value: "3AM - 6AM",
  },
];

export const framesPersec = [
  {
    id: 1,
    label: "6",
    key: "6",
    value: "6",
  },
  {
    id: 2,
    label: "12",
    key: "12",
    value: "12",
  },
  {
    id: 3,
    label: "24",
    key: "24",
    value: "24",
  },
];
