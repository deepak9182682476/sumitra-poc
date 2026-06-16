import http from "./http-common";
import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));
// Sample to follow
// const getAll = () => {
//   return http.get("/tutorials");
// };

// const get = id => {
//   return http.get(`/tutorials/${id}`);
// };

// const update = (id, data) => {
//   return http.put(`/tutorials/${id}`, data);
// };

// const remove = id => {
//   return http.delete(`/tutorials/${id}`);
// };

// const removeAll = () => {
//   return http.delete(`/tutorials`);
// };

// const findByTitle = title => {
//   return http.get(`/tutorials?title=${title}`);
// };

const getModels = () => {
  return http.get("/models");
};

const getCamLinkedModels = () => {
  return http.get("/models/camlinkedmodels");
}

const createUpdateModel = (data) => {
  return http.post("/models/model-save-update", {...data,userAccount,module_type: "Analytic Configuration", sub_module_name:"Analytics"});
};

const getModelGroups = () => {
  return http.get("/models/groups");
  //  return http.get("/hotlist/get-hotlist");

};

const getModelsEmployeeInfo = () => {
  return http.get("/models/get-employee-info");
};

const createModelGroup = (data) => {
  return http.post("/models/group-create", {...data,userAccount,action_type: "Create",module_type: "Analytic Configuration", sub_module_name:"Analytics Groups"});
  // return http.post("/hotlist/save-hotlist", data);

};

const setModelsConfidence = (data) => {
  return http.post("/models/send-confidence-level", data);
};

const setSelectedModels = (data) => {
  return http.post("/models/send-selected-models", data);
};

const getModelParameters = () => {
  return http.get("/models/get-model-parameters");
};

const updateModelGroup = (data) => {
  return http.post("/models/group-update", {...data,userAccount,action_type: "Update",module_type: "Analytic Configuration", sub_module_name:"Analytics Groups"});
};

const saveModelParameters = (data) => {
  return http.post("/models/save-model-parameters",  {...data,userAccount,action_type: "Create",module_type: "Analytic Configuration", sub_module_name:"Analytics Params"});
};

const deleteModelParameters = (id) => {
  return http.post(`/models/delete-model-parameters/${id}`,{userAccount,action_type: "Delete",module_type: "Analytic Configuration", sub_module_name:"Analytics Params"} );
};

const updateModelParameters = (data) => {
  return http.post("/models/update-model-parameters", {...data,userAccount,action_type: "Update",module_type: "Analytic Configuration", sub_module_name:"Analytics Params"});
};

const deleteModel = (id) => {
  return http.post(`/models/delete/${id}`,{userAccount,action_type: "Delete",module_type: "Analytics Management", sub_module_name:"Analytic"} );
};

const createHotlistGroup = (data) => {
 console.log("service data>>",data)
  return http.post("/hotlist/save-hotlist", {...data,userAccount, action_type: "Create",module_type: "Hotlist Management", sub_module_name:"Vehcile"});

};

const createHotlistcategoryPopupGroup = (data) => {
  console.log("service data>>",data)
   return http.post("/hotlist/save-hotlist_category", {...data,userAccount, action_type: "Create",module_type: "Hotlist Management", sub_module_name:"Category"});
 
 };

 const updateHotlistcategoryPopupGroup = (data) => {
  console.log("service in put>>",data)
   return http.put("/hotlist/update-hotlist_category", {...data,userAccount, action_type: "Update",module_type: "Hotlist Management", sub_module_name:"Category"});
 
 };

 const updateHotlistGroup = (param,data) => {
  console.log("service in put>>",data)
   return http.put(`/hotlist/update-hotlist/${param}`, {...data,userAccount, action_type: "Update",module_type: "Hotlist Management", sub_module_name:"Vehicle"});
 };


const gethotlistGroup = () => {
     return http.get("/hotlist/get-hotlist");

};

const getHotlistcategoryPopupGroup = () => {
  return http.get("/hotlist/get-hotlist_category");

};

const createViolationPopupGroup = (data) => {
  console.log("service data>>",data)
   return http.post("/violation/save-violation",  {...data,userAccount, action_type: "Create",module_type: "Analytics Management", sub_module_name:"Analytic Type"});
 
 };

 const getViolationPopupGroup = () => {
  return http.get("/violation/get-violation");

};

const updateViolationPopupGroup = (data) => {
  console.log("service in put>>",data)
   return http.put("/violation/update-violation",  {...data,userAccount, action_type: "Update",module_type: "Analytics Management", sub_module_name:"Analytic Type"});
 
 };


const deleteHotlistParameters = (id) => {
  return http.post(`/hotlist/delete-hotlist/${id}`,{userAccount,action_type: "Delete",module_type: "Hotlist Management", sub_module_name:"Hotlist Vehicle"});
};

const deleteHotlist_categoryParameters = (id) => {
  console.log("id=====>>",id)
  return http.post(`/hotlist/delete-hotlist_category/${id}`, {userAccount,action_type: "Delete",module_type: "Hotlist Management", sub_module_name:"Hotlist Category"});
};

const deleteViolation_managementParameters = (id) => {
  console.log("id=====>>",id)
  return http.post(`/violation/delete-violation_management/${id}`,{userAccount,action_type: "Delete",module_type: "Analytic Management", sub_module_name:"Analytic Type"});
};


const getRTAData = (rtaId) => {
 return http.get(`/hotlist/get-rta/${rtaId}`);
};

const updateHotlistAlert = (data) => {
  console.log("service in put>>",data)
   return  http.put("/hotlist/update-hotlist_alert", {...data,userAccount,action_type: "Update",module_type: "Hotlist Alert", sub_module_name:"License Number"});
 };

 const updateHotlistAlertStatus = (data) => {
  console.log("service in put>>",data)
   return  http.put("/hotlist/update-hotlist-alert-status", {...data,userAccount,action_type: "Update",module_type: "Hotlist Alert", sub_module_name:"Alert Status"});
 };
 
 const modelRestart = (data) => {
  return http.post("/models/restart",  {...data,userAccount,action_type: "Restart",module_type: "Model"});
};
 const getLogs = (data) => {
  console.log("CheckSessionlog>>",data)
   return  http.post("hotlist/get-logs", data);
 };

const ModelsService = {
  getModels,
  getCamLinkedModels,
  createUpdateModel,
  getModelGroups,
  createModelGroup,
  getModelsEmployeeInfo,
  setModelsConfidence,
  setSelectedModels,
  getModelParameters,
  updateModelGroup,
  saveModelParameters,
  deleteModelParameters,
  updateModelParameters,
  deleteModel,
  createHotlistGroup,
  gethotlistGroup,
  createHotlistcategoryPopupGroup,
  getHotlistcategoryPopupGroup,
  updateHotlistcategoryPopupGroup,
  updateHotlistGroup,
  createViolationPopupGroup,
  getViolationPopupGroup,
  updateViolationPopupGroup,
  deleteHotlistParameters,
  deleteHotlist_categoryParameters,
  deleteViolation_managementParameters,
  getRTAData,
  updateHotlistAlert,
  updateHotlistAlertStatus,
  modelRestart,
  getLogs,
};

export default ModelsService;
