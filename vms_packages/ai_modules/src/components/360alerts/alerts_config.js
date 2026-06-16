// import { toLocalDateTime } from "../../utilities/common-util";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  // EditNotifications,
} from "@mui/icons-material";
import { Typography, Popover, Button } from "@mui/material";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";

const ConfirmDialog = (params) => {
  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div>
          <CheckIcon {...bindTrigger(popupState)} />
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography component="div" sx={{ p: 2 }}>
              Are you sure Acknowledge.?
            </Typography>
            <Button
              sx={{ ml: 2, mb: 1 }}
              variant="outlined"
              size="small"
              onClick={() => popupState.close()}
            >
              Cancel
            </Button>
            <Button
              sx={{ ml: 2, mb: 1 }}
              variant="contained"
              size="small"
              onClick={() => handleAcknowledge(popupState, params.data.row)}
            >
              Acknowledge
            </Button>
          </Popover>
        </div>
      )}
    </PopupState>
  );
};

const handleAcknowledge = (popupState, params) => {
  popupState.close();
  // const index = rows.findIndex(item => item.id == params.id);
  // rows.splice(index, 1);
};

export const columns = [
  {
    field: "s.no",
    flex: 1,
    type: "s.no",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          S.No
        </Typography>
      );
    },
    renderCell: (params) => {
      return <Typography>{params.id}</Typography>;
    },
  },
  {
    field: "alert_id",
    flex: 1,
    type: "text",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Alert Id
        </Typography>
      );
    },
  },
  {
    field: "date_time",
    flex: 1,
    type: "date",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Date & Time
        </Typography>
      );
    },
    renderCell: (params) => {
      let createdon = new Date(params.row?.created_on) || new Date();
      let createdon_date = createdon?.toLocaleString();
      return createdon_date;
    },
  },
  {
    field: "camera_id",
    flex: 1,
    type: "text",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Camera Id
        </Typography>
      );
    },
  },
  {
    field: "alertType",
    flex: 1,
    type: "text",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Alert Type
        </Typography>
      );
    },
    renderCell: (params) => {
      let data = params.row?.alert_type || "";
      return data.toString();
    },
  },
  {
    field: "location",
    flex: 1,
    type: "text",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Location
        </Typography>
      );
    },
    renderCell: (params) => {
      return 'Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072';
    },
  },
  {
    field: "actions",
    flex: 1,
    type: "text",
    align: "left",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Actions
        </Typography>
      );
    },
    renderCell: (params) => {
      return (
        <Typography sx={{ mx: 4 }}>
          <ConfirmDialog data={params} />
        </Typography>
      );
    },
  },
];

export const rows = [
  {
    id: 1,
    alert_id: "EGRTH365",
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    alertType: "Crowd Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
  {
    id: 2,
    alert_id: "ERGE35463",
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    alertType: "Vehicle Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
  {
    id: 3,
    alert_id: "GEFHETH56",
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    alertType: "Vehicle Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
  {
    id: 4,
    alert_id: "HRTER4635",
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    alertType: "Vehicle Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
  {
    id: 5,
    alert_id: "FGDF47656",
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    alertType: "Crowd Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
];
