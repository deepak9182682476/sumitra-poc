import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import moment from "moment";
import ModelsService from "../../../services/models";
import CameraStepsModel from "./camera_steps_model";
import CameraService from "../../../services/camera";
import useLoader from "../../../common/loader/useLoader";
import { local_anpr_user } from "../../../config/config";
import NoAccess from "../../../common/NoAccess";

const useStyles = makeStyles((theme) => ({
  root: {
    "& ::-webkit-scrollbar": {
      width: "8px",
      height: "100%",
      marginRight: "4px",
      // backgroundColor: "#3D81F5",
    },
    "& ::-webkit-scrollbar-thumb": {
      background: "white",
      borderRight: "4px white solid",
      height: "2px",
    },
    "& :: -webkit-scrollbar-track": {
      borderRadius: "5px",
    },
    "& :: -webkit-scrollbar-thumb": {
      borderRadius: "5px",
    },
    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${
        theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
      }`,
      backgroundColor: "#285705",
      color: theme.palette.text.primary,
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", //camera/camera header+sno.bar font
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#285705 !important",
    },
    "& .MuiDataGrid-virtualScrollerContent": {
      backgroundColor: theme.palette.text.primary,
    },
    "& .MuiDataGrid-footerContainer": {
      height: "40px",
      minHeight: "40px",
      backgroundColor: "#285705",
    },
    "& .MuiDataGrid-columnsContainer": {
      minHeight: "auto !important",
      maxHeight: "auto !important",
    },
    "& .MuiButton-root": {
      color: "#37720B",
      fontSize: "12px",
      top: "-1.75px",
    },
    "& .MuiDivider-root": {
      borderColor: "#fff",
      margin: "6px 8px 6px 12px",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh",
      // paddingLeft: "7px",
    },
    [theme.breakpoints.up(1401)]: {
      // height: "83vh",
      height: "95vh",
      padding: "0px",
    },
    width: "84vw",
    padding: "0px !important",
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  card: {
    backgroundColor: "#0D0D0D",
    color: "#fff !important",
    border: "1px solid #868686 !important", //cameras/border
    opacity: "1",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0px!important",
  },
  uploadscard: {
    backgroundColor: "#313131 !important",
    color: "#fff !important",
    // border: "1px solid #868686 !important",
    border: "none !important",
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "52vh !important",
      minHeight: "52vh !important",
      overflowY: "scroll",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "58vh !important",
      minHeight: "58vh !important",
      overflowY: "scroll",
    },
  },
  fontsize: {
    fontSize: "0.75rem !important",
  },
  dataCamGridCls: {
    // maxHeight: "300px",
    // minHeight: "300px",
    color: "#fff !important", //Cameras/no row
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      // height: "26vh !important",
      maxHeight: "80vh",
      minHeight: "75vh",
    },
    [theme.breakpoints.up(1401)]: {
      // height: "50vh !important",
      maxHeight: "95vh",
      minHeight: "79vh",
    },
  },
  cellsCls: {
    color: "#000000 !important", // cameras/rows words
    // backgroundColor: "#0D0D0D",
  },
  stepperCls: {
    "& .Mui-active": {
      color: "#a79c53 !important,",
    },
    // color: "inherit !important",
    // "& .MuiStepIcon-root .Mui-active": {
    //   color: "#a79c53 !important",
    // },
  },
  addcameraCls: {
    display: "flex",
    padding: "0px !important",
  },
  tableCls: {
    height: "95vh",
    padding: "8px 4px 0px 12px !important",
  },
  addCameraButton: {
    backgroundColor: "#37720B !important",
    color: "#FFFFFF !important",
    marginLeft: "984px",
    width: "220px",
    height: "49px",
  },
}));

const CamerasConfig = (props) => {
  const [dataGridRows, setDataGridRows] = useState([]);
  const classes = useStyles();
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  // eslint-disable-next-line no-unused-vars
  const [isSuccess, setAlertSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [camerasList, setCamerasList] = React.useState([]);
  const [ipRtspList, setIpRtspList] = useState({ ip: [], rtsp: [] });
  const [aliasIdList, setAliasIdList] = useState([]);
  const [modelsData, setModelsData] = useState([]);
  const [modelsGroup, setModelsGroup] = useState([]);
  const [commisionerates, setCommisionerates] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState("add");
  const theme = useTheme();
  const [objList, setObjList] = useState([]);

  const [loader, showLoader, hideLoader] = useLoader();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);

  const camera_settings_params = {
    coverage: [],
    direction: [],
    model_id: null,
    model_name: null,
    camera_id: null,
    day_time: {
      day_time: false,
      default: false,
      resize_factor: 0,
      contrast: 0,
      brightness: 0,
      gamma_correction: 0,
      histogram_equalizer: 0,
    },
    night_time: {
      day_time: false,
      default: false,
      resize_factor: 0,
      contrast: 0,
      brightness: 0,
      gamma_correction: 0,
      histogram_equalizer: 0,
    },
  };
  // Save camera object based camera Ip.
  const [obj, setObj] = useState({
    camera_id: null,
    camera_information: null,
    camera_settings: [],
    model_settings: {
      model_name: "",
      model_id: "",
      model_group_name: "",
      model_group_id: "",
      model_ids: [],
      models_group: [],
      model_input_params: [],
    },
    rule_settings: {
      rules: [],
    },
  });

  const columns = [
    {
      field: "s.no",
      flex: 1,
      type: "string",
      maxWidth: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            S.No
          </Typography>
        ); //CAMERAS/s.no.
      },
      renderCell: (params) => {
        let index = dataGridRows.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "created_on",
      flex: 1,
      type: "date",
      maxWidth: 200,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Date & Time
          </Typography>
        ); //CAMERAS/Date & Time
      },
      renderCell: (params) => {
        const localDate = new Date(params.value);
        const utcTimestamp = Date.UTC(
          localDate.getFullYear(),
          localDate.getMonth(),
          localDate.getDate(),
          localDate.getHours(),
          localDate.getMinutes(),
          localDate.getSeconds()
        );

        const istTime = new Date(utcTimestamp).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return <Typography>{istTime}</Typography>;
      },
    },
    {
      field: "ip_address",
      flex: 1,
      type: "string",
      maxWidth: 200,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Camera IP
          </Typography>
        ); //CAMERAS/Camera Id
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "camera_name",
      flex: 1,
      type: "string",
      maxWidth: 500,

      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Camera Name
          </Typography>
        ); //CAMERAS/Camera Name
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "model",
      flex: 1,
      type: "string",
      maxWidth: 200,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Analytic Type
          </Typography>
        );
      },
      renderCell: (params) => {
        return (
          <Typography>
            {params.row.model_settings
              ? params.row.model_settings.model_name ||
                params.row.model_settings.model_group_name
              : ""}
          </Typography>
        );
      },
    },
    {
      field: "address",
      flex: 1,
      type: "string",
      maxWidth: 400,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Address
          </Typography>
        ); //CAMERAS/Address
      },
      renderCell: (params) => {
        return (
          <Typography>
            {`${params.row.commisionerate} > ${params.row.zone} > ${params.row.police_station}`}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      flex: 1,
      type: "string",
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Actions
          </Typography>
        );
      },
      renderCell: (params) => {
        return (
          <Typography>
            <IconButton
              aria-label="edit"
              onClick={() => handleEditClick(params)}
            >
              <EditIcon title="Edit Camera" />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => handleDeletePromptClick(params)}
            >
              <DeleteIcon title="Delete" />
            </IconButton>
          </Typography>
        );
      },
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ width: "100%", backgroundColor: "#CCDCC1" }}
      >
        <Typography
          style={{
            color: `${theme.palette?.text?.secondary}`,
            marginLeft: "10px",
            flexGrow: "1",
            fontSize: "16px",
            backgroundColor: "inherit",
          }}
        >
          {" "}
          CAMERAS{" "}
        </Typography>

        <Divider orientation="vertical" variant="middle" flexItem />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
        {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
      </GridToolbarContainer>
    );
  }

  useEffect(() => {
    ModelsService.getModels()
      .then((response) => {
        if (response) {
          const { data } = response.data;
          if (data && data.length) {
            setModelsData(data);
          }
        }
      })
      .catch((err) => console.log("Models error", err));
    ModelsService.getModelGroups()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          setModelsGroup(data);
        }
      })
      .catch((err) => console.log("ModelGroups error", err));
    CameraService.getCamerasHierarchyTree()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          if (data) {
            setCommisionerates(data);
          }
        }
      })
      .catch((err) => console.log("Camera hierarchy", err));
  }, []);

  const handleOpenStepsModel = () => {
    setMode("add");
    setObj({
      cam_id: null,
      camera_information: null,
      camera_settings: [],
      model_settings: {
        model_name: "",
        model_id: "",
        model_group_name: "",
        model_group_id: "",
        model_ids: [],
        model_input_params: [],
      },
      rule_settings: {
        rules: [],
      },
    });
    setOpen(true);
  };

  const setData = (data) => {
    if (data) {
      setObj(data);
    }
  };

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const handleEditClick = (params) => {
    console.log(params);
    const gridIdx = dataGridRows.findIndex((rec) => rec.id === params.id);
    if (gridIdx !== -1) {
      var editObj = _.merge(obj, dataGridRows[gridIdx]);
      console.log(editObj);
      editObj.camera_alias_id = editObj.camera_id;
      editObj.camera_id = dataGridRows[gridIdx].id;
      editObj.camera_settings = dataGridRows[gridIdx].camera_settings;
      editObj.origModel = editObj.model_settings.model_name;

      console.log("dataGridRows", dataGridRows[gridIdx], editObj);
      const setCamerasEditObj = [
        {
          id: editObj.id,
          camera_alias_id: editObj.camera_alias_id,
          camera_name: editObj.camera_name,
          camera_ip: editObj.ip_address,
          latitude: editObj.geolocation.coordinates[1],
          longtitude: editObj.geolocation.coordinates[0],
          rtsp: editObj.rtsp,
          commisionerate: editObj.commisionerate,
          zone: editObj.zone,
          police_station: editObj.police_station,
          junction_name: editObj.junction_name,
          check_rta_mismatch: editObj.check_rta_mismatch,
          isAdd: true,
        },
      ];
      editObj = [editObj];

      // editObj.model_settings.model_name = editObj?.models.model_name;
      // editObj.model_settings.model_id = editObj?.models.model_id;

      // editObj.model_settings.model_group_name = editObj?.models.group_name;
      // editObj.model_settings.model_group_id = editObj?.models.group_id;

      // const model_ipt_params = editObj.model_settings.model_input_params;

      setCamerasList(setCamerasEditObj);
      setMode("edit");
      setObj(editObj[0]);
      setObjList(editObj);
      console.log("edit merge obj", editObj);
    }
    setOpen(true);
  };

  const handleDeletePromptClick = (params) => {
    setSelectedCamera(params);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedCamera && selectedCamera.id) {
      const model = modelsData.find(
        (val) => val.id === selectedCamera.row.model_settings.model_id
      );
      const model_data = selectedCamera.row.model_settings.model_name
        ? [
            {
              name: selectedCamera.row.model_settings.model_name,
              server_ip: model.server_ip,
            },
          ]
        : [];
      CameraService.deleteCameras({ id: selectedCamera.id })
        .then((res) => {
          if (model_data && model_data.length) {
            ModelsService.modelRestart({ model_data })
              .then((restartResponse) => {
                console.log("Model restart successful", restartResponse);
              })
              .catch((restartError) => {
                console.error("Error restarting models", restartError);
              });
          }
          let content = "Deleted Successfully";
          setDataGridData();
          const ipNew = ipRtspList.ip.filter(
            (val) => selectedCamera.ip_address !== val
          );
          const rtspNew = ipRtspList.rtsp.filter(
            (val) => selectedCamera.rtsp !== val
          );
          const aliasIdListNew = aliasIdList.filter(
            (val) => selectedCamera.camera_id !== val
          );
          setIpRtspList({ ip: ipNew, rtsp: rtspNew });
          setAliasIdList(aliasIdListNew);
          setAlertSuccess(true);
          setDeleteDialogOpen(false);
          setSelectedCamera(null);
          return setState({ ...state, alertOpen: true, alertContent: content });
        })
        .catch((err) => console.log("camera delete", err));
      setDeleteDialogOpen(false);
      setSelectedCamera(null);
    }
  };

  useEffect(() => {
    setDataGridData();
  }, []);

  function setDataGridData() {
    showLoader();
    CameraService.getCamerasList()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response;
          if (data && data.data) {
            const rtspList = data.data.map(
              (item) => item.camera_information.rtsp
            );
            const ipList = data.data.map(
              (item) => item.camera_information.ip_address
            );
            setIpRtspList({
              ip: ipList,
              rtsp: rtspList,
            });
            const aliasIdList = data.data.map((item) => {
              if (item.camera_information.camera_id) {
                return item.camera_information.camera_id;
              }
            });
            setAliasIdList(aliasIdList);
            let cameras_data = data.data.map((elem, index) => {
              return {
                ...elem.camera_information,
                model_settings: elem.model_settings,
                rule_settings: elem.rule_settings,
                camera_settings: elem.camera_settings,
              };
            });
            cameras_data = cameras_data.sort(
              (a, b) => new Date(b.created_on) - new Date(a.created_on)
            );
            setDataGridRows(cameras_data);
          }
        }
      })
      .catch((err) => console.log("getCameras", err));
  }

  return local_anpr_user(
    "activity_info",
    "activity_name",
    "Cameras Configuration"
  ) ? (
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
      style={{ marginTop: -10 }}
    >
      {" "}
      <Button
        size="small"
        variant="contained"
        className={classes.addCameraButton}
        onClick={() => handleOpenStepsModel()}
      >
        Add Cameras
      </Button>
      <Grid item xs={12}>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          className={classes.deleteDialog}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this camera?
              {selectedCamera && (
                <div style={{ marginTop: "8px" }}>
                  Camera Name: {selectedCamera.row.camera_name}
                  <br />
                  IP Address: {selectedCamera.row.ip_address}
                </div>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteClick} variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <CameraStepsModel
          setData={(data) => setData(data)}
          setModelStatus={(open) => setOpen(open)} //same
          open={open} //same
          camerasList={camerasList}
          cameraIpRtsp={ipRtspList}
          setCameraIpRtsp={(ipRtspList) => setIpRtspList(ipRtspList)}
          aliasIdList={aliasIdList}
          setAliasIdList={(aliasIdList) => setAliasIdList(aliasIdList)}
          modelsData={modelsData}
          modelsGroup={modelsGroup}
          commisionerates={commisionerates}
          setCamerasList={(list) => {
            if (list) {
              setCamerasList(list);
            }
          }}
          activeStep={activeStep}
          setStepActiveState={(activeStep) => {
            setActiveStep(activeStep);
          }}
          refreshContent={(isContentRefresh) => {
            if (isContentRefresh) {
              setDataGridData();
            }
          }}
          currentObj={obj}
          cameraSettingsParams={camera_settings_params}
          mode={mode}
          objList={objList}
          setObjList={(list) => setObjList(list)}
        />
      </Grid>
      <Grid item xs={12} className={classes.tableCls}>
        {loader}
        <Card className={classes.card}>
          <CardContent component="div" className={classes.dataGridCpd}>
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={alertOpen}
              autoHideDuration={1000}
              onClose={() => {
                setAlertSuccess(false);
                setState({ ...state, alertOpen: false });
              }}
            >
              <Alert
                onClose={() => {
                  setAlertSuccess(false);
                  setState({ ...state, alertOpen: false });
                }}
                severity="error"
                variant="filled"
              >
                {alertContent}
              </Alert>
            </Snackbar>
            <DataGrid
              columns={columns}
              className={classes.dataCamGridCls}
              rows={dataGridRows}
              rowHeight={35}
              headerHeight={40}
              components={{
                Toolbar: CustomToolbar,
              }}
              getCellClassName={(params) => classes.cellsCls}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ) : (
    <Grid>
      <NoAccess />
    </Grid>
  );
};

export default CamerasConfig;
