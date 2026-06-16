import ActivityManagement from "../../components/configuration/rbac_management/activity_management";
import Roles_main from "../../components/configuration/rbac_management/RolesManagement";
import UserManagement from "../../components/configuration/rbac_management/UserManagement";

export const vms_tab_data = {
    gridContentSize: "2,2",
    frames_detections: []
}

export const tabsMenu = [
  {
    id: 1,
    label: "User",
    component: <UserManagement />,
    url: "/users",
  },
  {
    id: 2,
    label: "Role",
    component: <Roles_main/>,
    url: "/roles",
  },
  {
    id: 3,
    label: "Activity",
    component: <ActivityManagement/>,
    url: "/activity",
  }
];
