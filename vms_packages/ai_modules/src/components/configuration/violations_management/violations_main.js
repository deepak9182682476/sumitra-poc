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
  Popover,
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useLoader from "../../../common/loader/useLoader";
// import Hotlist from "./hotlist";
import ViolationsPopup from "./violationspopup";
import ModelsService from "../../../services/models";
import Pagination from "@mui/material/Pagination";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { Check as CheckIcon, Receipt } from "@mui/icons-material";
import NoAccess from "../../../common/NoAccess";
import { local_anpr_user } from "../../../config/config";

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
      // backgroundColor:"#0D0D0D"
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", //camera/camera header+sno.bar font
      color: "#000000",

      // backgroundColor:"#0D0D0D",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#285705 !important",
    },
    "& .MuiDataGrid-virtualScrollerContent": {
      backgroundColor: theme.palette.text.primary,
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
    "& .MuiDataGrid-footerContainer": {
      height: "40px",
      minHeight: "40px",
      backgroundColor: "#285705",
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
      height: "92vh",
    },
    width: "84vw",
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  card: {
    // backgroundColor: ` ${theme?.palette?.primary?.compHeader}  0% 0% no-repeat padding-box !important`, //cameras/background
    backgroundColor: "#0D0D0D",
    color: "#fff !important",
    border: "1px solid #868686 !important", //cameras/border
    opacity: "1",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0px !important",
    marginTop: "4px !important",
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
  dataViolationGridCls: {
    // maxHeight: "120px",
    // minHeight: "120px",
    color: "#fff !important", //Cameras/no row
    border: "none !important",
    [theme.breakpoints.between(350, 749)]: {
      // height: "26vh !important",
      maxHeight: "90vh",
      minHeight: "70vh",
    },
    [theme.breakpoints.between(750, 1400)]: {
      // height: "26vh !important",
      maxHeight: "90vh",
      minHeight: "83vh",
    },
    [theme.breakpoints.between(1400, 1800)]: {
      // height: "26vh !important",
      maxHeight: "95vh",
      minHeight: "79vh",
    },
    [theme.breakpoints.up(1800)]: {
      // height: "50vh !important",
      maxHeight: "95vh",
      minHeight: "79vh",
    },
  },
  cellsCls: {
    color: "#fff !important", // cameras/rows words
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
    // padding: "25px 24px 0px !important",
    // height: "300px",
    padding: "8px 4px 0px 12px !important",
    height: "91vh",
  },
  buttoncolor: {
    backgroundColor: "#343434",
    border: "1px solid #8D8D8D",

    color: "#fff !important",
    fontSize: "12px",
    "&:hover": { backgroundColor: "#343434" },
  },

  buttontext: {
    color: "#fff !important",
    fontSize: "12px",
  },

  cancelButton: {
    color: "#fff !important",
    border: "none !important",
    marginRight: "8px",
    backgroundColor: "#4A4A4A",
    "&:hover": {
      backgroundColor: "#333 !important",
      border: "none !important",
    },
  },
  deleteButton: {
    backgroundColor: "#3275E9",
    "&:hover": {
      backgroundColor: "#3275E9 !important",
      border: "none !important",
    },
  },
}));

const Violations_main = (props) => {
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

  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [mode, setMode] = useState("add");
  const theme = useTheme();

  const [loader, showLoader, hideLoader] = useLoader();

  // const [groupFormData, setGroupFormData] = useState({
  //   // group_name: "",
  //   // label: "",
  //   // description: "",
  //   // model_ids: [],
  //   // models: [],
  //   // selected_model: [],
  //   // color: ""

  //   group_name:null,
  //   lp_number: null,
  //   make:null,
  //   model:null,
  //   name:null,
  //   contact:null,
  //   address:null,
  //   fir:null,
  //   commissionerate:null,
  //   police_station:null,
  //   description: null,
  //   source:null,
  //   color:"red",
  //   category:" ",
  //   user:" "

  // });

  const [violationList, setViolationList] = React.useState([]);
  const [paramObj, setParamObj] = useState([]);
  const [flag, setflag] = useState(false);

  const [selectedrecord, setSelectedrecord] = useState(null);

  // const handleInputChange = (e, key) => {
  //     const { value } = e.target;
  //     setGroupFormData((prevState) => ({
  //       ...prevState,
  //       [key]: value,
  //     }));
  //   };

  const columns = [
    {
      field: "s.no",
      flex: 1,
      type: "string",
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
        let index = violationList.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "name",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Violation Name
          </Typography>
        ); //CAMERAS/Date & Time
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "code",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,

              fontSize: "14px",
              fontWeight: "regular",
            }}
          >
            Violation Code
          </Typography>
        ); //CAMERAS/Camera Name
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    // {
    //   field: "registration_date",
    //   flex: 1,
    //   type: "date",
    //   renderHeader: (params) => {
    //     return (
    //       <Typography style={{ color: theme.palette?.text?.primary }}>
    //         registration_date
    //       </Typography>
    //     ); //CAMERAS/Date & Time
    //   },
    //   renderCell: (params) => {
    //     return (
    //       <Typography>
    //         {moment(params.value).format("DD-MM-YYYY hh:mm:ss")}
    //       </Typography>
    //     );
    //   },
    // },
    // {
    //   field: "Modification_date",
    //   flex: 1,
    //   type: "date",
    //   renderHeader: (params) => {
    //     return (
    //       <Typography style={{ color: theme.palette?.text?.primary }}>
    //         Modification_date
    //       </Typography>
    //     ); //CAMERAS/Date & Time
    //   },
    //   renderCell: (params) => {
    //     return (
    //       <Typography>
    //         {moment(params.value).format("DD-MM-YYYY hh:mm:ss")}
    //       </Typography>
    //     );
    //   },
    // },

    {
      field: "actions",
      flex: 1,
      type: "string",
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
          <>
            <IconButton
              aria-label="edit"
              onClick={() => handleEditClick(params)}
            >
              <EditIcon title="Edit Camera" />
            </IconButton>
            <PopupState variant="popover" popupId="demo-popover">
              {(popupState) => (
                <div>
                  <IconButton aria-label="delete" {...bindTrigger(popupState)}>
                    <DeleteIcon title="Delete" />
                  </IconButton>
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
                      Are you sure you want to delete this item?
                    </Typography>
                    <Button
                      sx={{ ml: 2, mb: 1 }}
                      variant="outlined"
                      size="small"
                      onClick={() => popupState.close()}
                      className={classes.cancelButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      sx={{ ml: 2, mb: 1 }}
                      variant="contained"
                      size="small"
                      onClick={() => handleDeleteClick(params)}
                      className={classes.deleteButton}
                    >
                      Delete
                    </Button>
                  </Popover>
                </div>
              )}
            </PopupState>
          </>
        );
      },
    },
  ];
  const showViolationPopup = () => {
    setOpen(true);
  };
  function CustomToolbar() {
    useEffect(() => {}, []);

    return (
      <GridToolbarContainer
        style={{ width: "100%", backgroundColor: "#CCDCC1" }}
      >
        <Typography
          style={{
            color: `${theme.palette?.text?.secondary}`,
            marginLeft: "10px",
            flexGrow: "1",
            fontSize: "14px",
            backgroundColor: "inherit",
          }}
        >
          {" "}
          Violations{" "}
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
    // CameraService.getCamerasHierarchyTree()
    //   .then((response) => {
    //     if (response) {
    //       const { data } = response?.data;
    //       if (data) {
    //         setCommisionerates(data);
    //       }
    //     }
    //   })
    //   .catch((err) => console.log("Camera hierarchy", err));
  }, []);

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const getViolationPopupGroup = () => {
    showLoader();
    ModelsService.getViolationPopupGroup()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          setViolationList(data);

          // const rows = data.map((rec) => createData(rec.key, rec.models));
          // setGroupsList(rows);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log("error response", err);
        } else if (err.request) {
          console.log("error request", err);
        } else {
          console.log("error", err);
        }
      });
  };

  // const handleEditClick = (params) => {
  //   console.log(params);
  //   // const gridIdx = dataGridRows.findIndex((rec) => rec.id === params.id);
  //   // if (gridIdx !== -1) {

  //   //   const editObj = _.merge(obj, dataGridRows[gridIdx]);
  //   //   editObj.camera_id = dataGridRows[gridIdx].id;

  //   //   console.log('dataGridRows', dataGridRows[gridIdx], editObj);
  //   //   const setCamerasEditObj = [
  //   //     {
  //   //       id: editObj.id,
  //   //       camera_name: editObj.camera_name,
  //   //       camera_ip: editObj.ip_address,
  //   //       latitude: editObj.geolocation.coordinates[1],
  //   //       longtitude: editObj.geolocation.coordinates[0],
  //   //       rtsp: editObj.rtsp,
  //   //       commisionerate: editObj.commisionerate,
  //   //       zone: editObj.zone,
  //   //       police_station: editObj.police_station,
  //   //       isAdd: true,

  //   //     },
  //   //   ];

  //   //   // editObj.model_settings.model_name = editObj?.models.model_name;
  //   //   // editObj.model_settings.model_id = editObj?.models.model_id;

  //   //   // editObj.model_settings.model_group_name = editObj?.models.group_name;
  //   //   // editObj.model_settings.model_group_id = editObj?.models.group_id;

  //   //   // const model_ipt_params = editObj.model_settings.model_input_params;

  //   //   setCamerasList(setCamerasEditObj);
  //   //   setMode("edit");
  //   //   setObj(editObj);
  //   //   console.log("edit merge obj", editObj);
  //   // }
  //    setOpen(true);
  // };

  const handleEditClick = (params) => {
    //  console.log(params);
    const gridIdx = violationList.findIndex((rec) => rec.id === params.row.id);
    console.log(gridIdx);
    if (gridIdx !== -1) {
      // console.log(editObj);
      const rec = violationList[gridIdx];
      setOpen(true);
      setSelectedrecord(rec);

      setParamObj("edit");
      setMode("update");
      //  setObj(editObj);
    }
  };

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteViolation_managementParameters(params.id)
        .then((response) => {
          setViolationList(
            violationList.filter((item) => item.id !== params.id)
          );
          setAlertSuccess(true);
          setState({
            ...state,
            alertOpen: true,
            alertContent: "Deleted Successfully",
          });
        })
        .catch((err) => console.log("Hotlist delete", err));
    }
  };
  useEffect(() => {
    getViolationPopupGroup();

    setflag(false);
  }, [flag]);

  function setDataGridData(currentPage, size) {
    showLoader();
    const pageNum = currentPage || 1;
    const pageLimit = size || 10;

    // const payload = {
    //   page: pageNum,
    //   perpage: pageLimit
    // };
    // ModelsService.getHotlistcategoryPopupGroup(payload)
    // .then((response) => {
    //   if (response) {
    //     hideLoader();
    //     const { data } = response?.data;
    //     setState1(data);
    //     let eventInfo = data.data;
    //     eventInfo.forEach((rec, index) => (rec.id = index + 1));

    //     if (eventInfo && eventInfo.length) {
    //       let data = eventInfo;
    //       setState1(data, pageLimit, pageNum);
    //       setDataGridRows(data);
    //     }

    //     // const rows = data.map((rec) => createData(rec.key, rec.models));
    //     // setGroupsList(rows);
    //   }
    // })
    // .catch((err) => {
    //   if (err.response) {
    //     console.log("error response", err);
    //   } else if (err.request) {
    //     console.log("error request", err);
    //   } else {
    //     console.log("error", err);
    //   }
    // });
  }

  // CameraService.getCamerasList()
  //   .then((response) => {
  //     if (response) {
  //       hideLoader();
  //       const { data } = response;
  //       if(data && data.data){
  //         let cameras_data = data.data.map((elem, index) => {
  //           return {
  //             ...elem.camera_information,
  //             model_settings: elem.model_settings,
  //             rule_settings: elem.rule_settings,
  //           };
  //         });
  //         cameras_data = cameras_data.sort(
  //           (a, b) => new Date(b.created_on) - new Date(a.created_on)
  //         );
  //         setDataGridRows(cameras_data);
  //       }
  //     }
  //   })
  //   .catch((err) => console.log("getCameras", err));

  return local_anpr_user(
    "activity_info",
    "activity_name",
    "Violation Management"
  ) ? (
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <Button
        size="small"
        variant="contained"
        sx={{
          backgroundColor: "#37720B !important",
          color: "#FFFFFF !important",
          ml: 123,
          width: "220px",
          height: "49px",
        }}
        onClick={() => showViolationPopup()}
      >
        Add Violations
      </Button>
      <ViolationsPopup
        // setData={(data) => setData(data)}
        setModalStatus={(open) => setOpen(open)} //same
        open={open} //same
        selectedrecord={selectedrecord}
        resetSelectedRecord={() => setSelectedrecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            getViolationPopupGroup();
            setSelectedrecord(null);
          }
        }}
        setflag={setflag}

        // currentObj={obj}
        // cameraSettingsParams={camera_settings_params}
        // mode={mode}
      />

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
            <div style={{ width: "100%" }}>
              <DataGrid
                columns={columns}
                className={classes.dataViolationGridCls}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  // setDataGridData(currentPgIdx, newPageSize);
                }}
                rows={violationList}
                rowsPerPageOptions={[20, 50]}
                rowHeight={35}
                headerHeight={40}
                components={{
                  Toolbar: CustomToolbar,
                }}
                getCellClassName={(params) => classes.cellsCls}
                onPageChange={(currentPageIdx) => {
                  setCurrentPgIdx(currentPageIdx);
                  // setDataGridData(currentPageIdx, pageSize);
                  // setDataForImages(dataGridRows, pageSize, currentPageIdx);
                }}
                pagination
              />
            </div>
          </CardContent>
        </Card>
      </Grid>
      {/* </Grid> */}
    </Grid>
  ) : (
    <Grid>
      <NoAccess />
    </Grid>
  );
};

export default Violations_main;
