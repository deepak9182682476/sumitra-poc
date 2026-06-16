import http from "./http-common";

import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));

const getUsers = () => {
  return http.get("/rbac/get-users");
};

const saveUser = (payload) => {
  return http.post("/rbac/save-user", {...payload,userAccount,action_type: "Create",module_type: "User Management", sub_module_name:"User"});
};

const updateUser = (payload) => {
  return http.put("/rbac/update-user", {...payload,userAccount,action_type: "Update",module_type: "User Management", sub_module_name:"User"});
};

const getRoles = () => {
  return http.get("/rbac/get-roles");
};

const saveRole = (payload) => {
  return http.post("/rbac/save-role", {...payload,userAccount,action_type: "Create",module_type: "Role Management", sub_module_name:"Role"});
};

const updateRole = (payload) => {
  return http.put("/rbac/update-role", {...payload,userAccount,action_type: "Update",module_type: "Role Management", sub_module_name:"Role"});
};

const getUserRoles = () => {
  return http.get("/rbac/get-user-roles");
};

const saveUserRole = (payload) => {
  return http.post("/rbac/save-user-role", {...payload,userAccount,action_type: "Update",module_type: "User Management", sub_module_name:"User Role"});
};

const updateUserPassword = (payload) => {
  return http.put("/rbac/update-cred", {...payload,userAccount,action_type: "Update",module_type: "User Management", sub_module_name:"Password"});
};

const getActvityList = () => {
  return http.get("/rbac/get-activities");
};

const saveActivity = (payload) => {
  return http.post("/rbac/save-activity", {...payload,userAccount,action_type: "Create",module_type: "Activity Management", sub_module_name:"Activity"});
};

const updateActivity = (payload) => {
  return http.put("/rbac/update-activity", {...payload,userAccount,action_type: "Update",module_type: "Activity Management", sub_module_name:"Activity"});
};

const getActvityRolesList = () => {
  return http.get("/rbac/get-role-activity");
};

const saveRoleActivity = (payload) => {
  return http.post("/rbac/save-role-activity", {...payload,userAccount,action_type: "Create",module_type: "Role Management", sub_module_name:"Role Activity"});
};

const RbacService = {
  getUsers,
  updateUser,
  saveUser,
  getRoles,
  saveRole,
  updateRole,
  getUserRoles,
  saveUserRole,
  updateUserPassword,
  getActvityList,
  saveActivity,
  updateActivity,
  getActvityRolesList,
  saveRoleActivity
};

export default RbacService;
