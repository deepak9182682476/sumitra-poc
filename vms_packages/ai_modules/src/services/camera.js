import { VMS_URL } from "../config/deployment";
import http from "./http-common";
import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));
const addCameras = (data) => {
  return http.post("/cameras/add-camera", {...data,userAccount,action_type: "Create",module_type: "Camera Configuration", sub_module_name:"Camera Information"});
};

const saveCameras = (data) => {
  return http.post("/cameras/save-camera-settings", {...data,userAccount,action_type: "Create",module_type: "Camera Configuration", sub_module_name:"Camera Settings"});
};

const updateCameras = (data) => {
  return http.post("/cameras/update-camera-settings", {...data,userAccount,action_type: "Update",module_type: "Camera Configuration", sub_module_name:"Camera"});
};

const deleteCameras = (data) => {
  return http.post("/cameras/delete-camera", {...data,userAccount,action_type: "Delete",module_type: "Camera Configuration", sub_module_name:"Camera"});
};

const getCamerasList = () => {
  return http.get("/cameras");
};

const getCameraImage = (ip_address) => {
  return http.get(`${VMS_URL}/get_image?ip=${ip_address}`);
};

const getCamerasHierarchyTree = () => {
  return http.get("/cameras/get-hierarchy-view");
};

const CameraService = {
  addCameras,
  deleteCameras,
  saveCameras,
  updateCameras,
  getCamerasList,
  getCamerasHierarchyTree,
  getCameraImage
};

export default CameraService;
