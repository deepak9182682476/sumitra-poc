// import { toLocalDateTime } from "../../utilities/common-util";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  // EditNotifications,
} from "@mui/icons-material";
import { Typography } from "@mui/material";

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
    field: "model",
    flex: 1,
    type: "text",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Model
        </Typography>
      );
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
  },
  {
    field: "actions",
    flex: 1,
    type: "text",
    renderHeader: (params) => {
      return (
        <Typography style={{ color: "#fff", fontWeight: "bold" }}>
          Actions
        </Typography>
      );
    },
    renderCell: (params) => {
      return (
        <Typography>
          {/* <EditIcon title="Edit Detail" /> */}
          <DeleteIcon title="Delete" />
        </Typography>
      );
    },
  },
];
export const rows = [
  {
    id: 1,
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    model: "Crowd, Vehicle Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
  {
    id: 2,
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    model: "Vehicle Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
  {
    id: 3,
    date_time: "2015-10-01 01:24:21",
    camera_id: "FGEYF4565634",
    model: "Crowd Detection",
    location: "Kphb Phase 1, Kukatpally, Hyderabad, Telangana, 500072",
    media: "image.png",
  },
];
