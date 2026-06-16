import axios from "axios";
import http from "./http-common";
import { SERVER_DEPLOYED_URL,GET_EVENT_IMAGE_URL } from "../config/deployment";
import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));
// const getViolationsImages = () => {
//     return http.post("/models/getrecentimages");
//  };
 
 const getVehantViolationsList = (payload) => {
  const URL = `${SERVER_DEPLOYED_URL}/api/violation/get-vehant-violation`;
  return axios.post(URL, payload);
};

const getLocationsList = (params) => {
  const URL = `${SERVER_DEPLOYED_URL}/api/analysis/get-location`;
  return axios.get(URL);
};

const getImage = (model_name, path, date) => {
  console.log(model_name,path, date)
  const URL = `${GET_EVENT_IMAGE_URL}/api/images/getimage?model_name=${model_name}&image_path=${path}&time=${date}`;
  return axios.get(URL);
};


 const ViolationService = {
   getVehantViolationsList,
   getLocationsList,
   getImage
 };
 
 export default ViolationService;
 