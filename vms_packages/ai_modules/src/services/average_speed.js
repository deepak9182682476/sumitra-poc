import axios from "axios";
import { SERVER_DEPLOYED_URL } from "../config/deployment";
import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));
const getSpeedAnalysis = (payload) => {
  return axios.get(`${SERVER_DEPLOYED_URL}/api/analysis`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const getAverageSpeed = (params) => {
  // const URL = `${SERVER_DEPLOYED_URL}/api/analysis/get-average-speed?startDate=${startDt}&endDate=${endDt}&type=${speedType}`;
  const URL = `${SERVER_DEPLOYED_URL}/api/analysis/get-average-speed?start_date=${params.start_date}&end_date=${params.end_date}&camera_id=${params.camera_id}&speed_limit=${params.speed_limit}`;
  return axios.get(URL);
};

const generateEchallan = (params) => {
  // const URL = `${SERVER_DEPLOYED_URL}/api/analysis/get-average-speed?startDate=${startDt}&endDate=${endDt}&type=${speedType}`;
  const URL = `${SERVER_DEPLOYED_URL}/api/echallan/generate-echallan`;
  return axios.post(URL, params, {
    headers: {
      "Content-Type": "application/json"
    }
  })
};

const AverageSpeedService = {
  getSpeedAnalysis,
  getAverageSpeed,
  generateEchallan
};

export default AverageSpeedService;
