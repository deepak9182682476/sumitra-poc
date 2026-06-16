import axios from "axios";
import {
  SERVER_DEPLOYED_URL,
  SERVER_MODEL_DEPLOYED_URL,
  GET_EVENT_IMAGE_URL,
  EVENT_NOTIFICATION_URL
} from "../config/deployment";
import http from "./http-common";

import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));

const getFilteredAlerts = (payload) => {
  return http.post("/events/filteredevents", {
    start_date: payload.start_date,
    end_date: payload.end_date,
    selected_models: payload.selected_models,
    junction: payload.junction,
    zone: payload.zone,
    police_station: payload.police_station,
    camera: payload.camera
  });
};

const getImageOfAnAlert = (payload) => {
  return http.post("/models/getimage");
};

const getCamInfo = () => {
  return http.get("/cameras/cam-info");
};

const get360Alerts = (payload) => {
  return http.post("/events", payload);
};

const gethotlistAlerts = () => {
  return http.get("/hotlist/get-hotlist-alerts");

};

const getAnprAlerts = (payload) => {
  return http.post("/events/anprevents", {...payload,userAccount,action_type: "Create",module_type: "Search", sub_module_name:"ANPR Tracking"});
};

const getLiveEvents = () => {
  return http.get("/events/live21events");
};

const acknowledgeAlert = (id) => {
  return http.put(`/events/acknowledge/${id}`);
};

const updateEvent = (payload) => {
  return http.post("/events/update", payload);
};

const getImageOfAlert = (path, time, modelName) => {
  const URL = `${GET_EVENT_IMAGE_URL}/api/images/getimage?image_path=${path}&time=${time}&model_name=${modelName}`;
  return axios.get(URL);

  //return http.get(`/events/getimage?image_path=${path}`);
};

const getSocketFrame = (payload) => {
  const URL = `${SERVER_MODEL_DEPLOYED_URL}/api/socialdistance/getimage`;
  return axios.post(URL, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer " + JSON.parse(localStorage.getItem("anpr_user")).access_token,
    },
  });
};

const getRecentImages = (payload) => {
  return axios.get(`${SERVER_DEPLOYED_URL}/api/events/getrecentimages?model_id=${payload.model_id}`, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const sendServiceNotification = (payload) => {
  // const URL = `${EVENT_NOTIFICATION_URL}/api/fusion-notification-service/notification`;
  const URL = `${EVENT_NOTIFICATION_URL}/api/fusion-iccc-service/incident`;

  return axios.post(URL, payload, {
    headers: {
      "Content-Type": "application/json"
    }
  });
}

const getAnprSearchContent = (payload) => {
  return axios.get(`${SERVER_DEPLOYED_URL}/api/events/getrecentimages?model_id=${payload.model_id}`, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const getTrackingRoute = (payload) => {
  console.log('payload', payload)
  return http.post("/hotlist/get-tracking-route", payload);
};

const AlertsService = {
  getFilteredAlerts,
  getImageOfAnAlert,
  getCamInfo,
  get360Alerts,
  getAnprAlerts,
  acknowledgeAlert,
  updateEvent,
  getImageOfAlert,
  getSocketFrame,
  getRecentImages,
  sendServiceNotification,
  gethotlistAlerts,
  getLiveEvents,
  getTrackingRoute
};

export default AlertsService;