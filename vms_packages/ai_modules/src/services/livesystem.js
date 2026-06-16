import { VMS_SERVER_URL } from "../config/deployment";
import http from "./http-common";

const getAnalysisData = () => {
  return http.get("/analysis");
};

const getCameraAnalysisData = (payload) => {
  return http.post("/analysis/cam-analysis", payload);
};

const getLiveStreamData = (ip) => {
  return http.get(`${VMS_SERVER_URL}?ip=${ip}`);
};

const getStreamData = (ip) => {
  return http.get(`/stream?ip=${ip}`);
};

const getCamGeoDetails = (payload) => {
  return http.post("/analysis/cam-geo-details", payload);
};


const LiveSystemService = {
  getAnalysisData,
  getCameraAnalysisData,
  getLiveStreamData,
  getStreamData,
  getCamGeoDetails,
};

export default LiveSystemService;
