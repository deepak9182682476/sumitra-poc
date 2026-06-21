import Alerts360Degree from "../../components/360alerts/360alerts";
import AverageSpeed from "../../components/average_speed/average_speed";
import Dashboard from "../../components/dashboard/dashboard";
import Layout from "../../components/vms/layout";
// import { getLocalStorage } from "../../utilities/common-util";
// import { local_anpr_user } from "../config";
import Anpr from "../../components/average_speed/anpr";
// import DashboardFrame from "../../components/dashboard/dashboard_frames";
import HotlistSearch from "../../components/search/hotlist_search";
import EventDashboard from "../../components/events_dashboard/events_dashboard";
import EventJounal from "../../components/event_journal/event_journal";
import Informations from "../../components/information/informations";
import Configurations from "../../components/configurations/configurations";
import CamerasConfig from "../../components/configuration/camera/camera";
import ModelsConfig from "../../components/configuration/model/model";
import Violations_main from "../../components/configuration/violations_management/violations_main";

export const vms_tab_data = {
  gridContentSize: "2,2",
  frames_detections: [],
};

export const tabsMenu = [
  // {
  //   id: 1,
  //   label: "Home",
  //   key: "Home",
  //
  //   component: <Dashboard />,
  //   url: "/home",
  // },
  // {
  //   id: 1,
  //   label: "Dashboard",
  //   key: "dashboard",
  //   // access: local_anpr_user('activity_info', 'activity_name', 'Home'),
  //   component: <EventDashboard />,
  //   url: "/home",
  // },
  // {
  //   id: 2,
  //   label: "Event Journal",
  //   key: "eventjournal",
  //   // access: local_anpr_user('activity_info', 'activity_name', 'Home'),
  //   component: <EventJounal />,
  //   url: "/journal",
  // },
  {
    id: 1,
    label: "Video Wall",
    key: "videowall",
    // access: local_anpr_user('activity_info', 'activity_name', 'Videos'),
    component: (
      <Layout
        tab_data={vms_tab_data}
        setGridContentSize={(val) => (vms_tab_data.gridContentSize = val)}
      />
    ),
    url: "/videowall",
  },
  {
    id: 2,
    label: "Configuration",
    key: "configuration",
    // access: local_anpr_user('activity_info', 'activity_name', '360Alerts'),
    component: <Configurations />,
    url: "/configuration",
  },
  // {
  //   id: 5,
  //   label: "Informations",
  //   key: "informations",
  //   // access: local_anpr_user('activity_info', 'activity_name', 'Videos'),
  //   component: <Informations />,
  //   url: "/information",
  // },

  // {
  //   id: 4,
  //   label: "Violations",
  //   key: "Violations",
  //   // access: local_anpr_user('activity_info', 'activity_name', 'Violations'),
  //   component: <AverageSpeed />,
  //   url: "/average-speed",
  // },
  // {
  //   id: 5,
  //   label: "Search",
  //   key: "AnprSearch",
  //   // access: local_anpr_user('activity_info', 'activity_name', 'Anpr'),
  //   component: <Anpr />,
  //   url: "/search",
  // },
  // {
  //   id: 6,
  //   label: "Dashboard",
  //   // access: local_anpr_user('activity_info', 'activity_name', 'Violations'),
  //   component: <DashboardFrame />,
  //   url: "/average-speed",
  // },
  // {
  // id: 7,
  // label: "Hotlist Search",
  // key: "Hotlist Search",
  // access: local_anpr_user('activity_info', 'activity_name', 'Anpr'),
  //component: <HotlistSearch />,
  //url: "/hotlist-search",
  //}
];

export const configurationTabsMenu = [
  {
    id: 1,
    label: "CAMERAS CONFIGURATION",
    key: "cameras",
    component: <CamerasConfig />,
    url: "/cameras",
  },
  {
    id: 2,
    label: "ANALYTICS CONFIGURATION",
    key: "violations",
    component: <ModelsConfig />,
    url: "/violations",
  },
  {
    id: 3,
    label: "ANALYTICS MANAGEMENT",
    key: "violation",
    component: <Violations_main />,
    url: "/violation",
  },
];
