
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import AnprTrack from "./anpr_tracking";
import { Download as DownloadIcon } from "@mui/icons-material";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Snackbar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  Box,
  AppBar,
  CardMedia,
  DialogContent,
  ImageListItem,
  ImageList,
  Slide,
  IconButton,
  MenuItem,
  Menu,
} from "@mui/material";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";

import useLoader from "../../common/loader/useLoader";
import ModelsService from "../../services/models";
import NoAccess from "../../common/NoAccess";
import { local_anpr_user } from "../../config/config";
import SearchModel from "./search_model";
import AlertsService from "../../services/alerts";
import ViolationService from "../../services/violation";
import CameraService from "../../services/camera";

import AverageSpeedService from "../../services/average_speed";
import { CloseOutlined, Receipt } from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import moment from "moment";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';



const useStyles = makeStyles((theme) => ({
  root: {
   "& ::-webkit-scrollbar": {
            width: "8px",
            height: "100%",
            marginRight: "4px",
            backgroundColor: "#3D81F5",
        },
        "& ::-webkit-scrollbar-thumb": {
            background: "white",
            borderRight: "4px white solid",
            height: "2px",
        },
        "& :: -webkit-scrollbar-track": {
            borderRadius: '5px',
        },
        "& :: -webkit-scrollbar-thumb": {
            borderRadius: '5px'
        },

    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
        }`,
      backgroundColor: `${theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
        }`,
      color: theme?.palette?.text?.primary,
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
      // backgroundColor:"#0D0D0D"
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", //camera/camera header+sno.bar font
      // backgroundColor:"#0D0D0D",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important",
    },
    "& .MuiDataGrid-columnsContainer": {
      minHeight: "auto !important",
      maxHeight: "auto !important",
    },
    '& .MuiDataGrid-footerContainer': {
        height: '40px',
        minHeight: '40px',
    },
    "& .MuiButton-root": {
      color: "#fff !important",
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
      height: "92vh",
      padding: "4px"
    },
    width: "100vw",
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
  dataAnprGridCls: {
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
      maxHeight: "80vh",
      minHeight: "75vh",
    },
    [theme.breakpoints.up(1401)]: {
      // height: "50vh !important",
      maxHeight: "92vh",
      minHeight: "92vh",
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
    height: '85vh',
    padding: '0px 0px 0px 7px !important'
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
  inputField: {
    color: `${theme.palette?.text?.primary} !important`,
    background: 'none',
    border: 'none',
    outline: 'none',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const ImageTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const Anpr = (props) => {
  const classes = useStyles();
  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [isSuccess, setAlertSuccess] = useState(false);
  const [image, setImage] = useState();
  const [cropImage, setCropImage] = useState();
  const [open, setOpen] = React.useState(true);

  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [locationsList, setLocationsList] = useState([]);
  const [commisionerates, setAnprCommisionerates] = useState([]);

  const [caminfoList, setCamInfoList] = useState([]);

  const theme = useTheme();

  const [loader, showLoader, hideLoader] = useLoader();

  const [anprRowsList, setAnprRowsList] = React.useState([]);
  const [orgAnprRowsList, setOrgAnprRowsList] = React.useState([]);
  const [violationList, setViolationList] = useState([]);
  const [vehantData, seVehantData] = useState([]);
  const [trackItem, setTrackItem] = useState(null);

  const [imageDialog, setImageDialog] = useState({
    openImageDialog: false,
    selectedImage: "",
  });

  const [cellEdit, setCellEdit] = useState(-1);
  const [newCellValue, setNewCellValue] = useState("");
  const [licenseAlert, setLicenseAlert] = useState(false);
  const [licenseRowVal, setLicenseRowVal] = useState(null);
  const [trackModel, setTrackModel] =React.useState(false);
  const [dataForTracking,setDataForTracking]= useState([]);
  const [ sortedDataForTrack,setSortedDataForTrack]=useState([]);
  const [ searchFormData,setSearchFormData]=useState([]);

  const [cameraList, setCameraList] = useState(null);


  const filterAnprSearchData = async (search_form) => {
    if (search_form) {
      showLoader();
      setSearchFormData(search_form)
      let filter_list = [];
      const {
        hotlist_category,
        junction_name,
        police_station,
        registration_num,
        zone,
        commisionerate,
        camera_name,
        event_to_date,
        event_from_date,
        color,
        is_vehant,
        is_anpr_vehant,
        is_anpr
      } = search_form;

      const payload = {
        // page: pageNum,
        // perpage: 100
      };
      if (event_from_date && event_to_date) {
        payload.start_date = moment(event_from_date).format('YYYY-MM-DD HH:mm');
        payload.end_date = moment(event_to_date).format('YYYY-MM-DD HH:mm');
      }

      if (zone.length) {
        payload.zone = zone
      }

      if (commisionerate.length) {
        payload.commisionerate = commisionerate
      }

      if (junction_name.length) {
        payload.junction_name = junction_name
      }

      if (police_station.length) {
        payload.police_station = police_station
      }

      if (camera_name.length) {
        payload.camera_name = camera_name
      }

      if (hotlist_category.length) {
        payload.hotlist_category = hotlist_category
      }

      if (registration_num.length) {
        payload.registration_num = registration_num
      }

      if (color.length) {
        payload.color = color
      }

      if (registration_num) {
        payload.registration_num = registration_num
      }

      let list = [];
      if (is_vehant || is_anpr_vehant) {
        await ViolationService.getVehantViolationsList(payload).then((res) => {
          // console.log('res vehant', res);
          if (res && res.data && res.data.data) {
            const { TransactionList } = res.data.data?.Transactions;
            list = TransactionList && TransactionList.length ? TransactionList : []
            console.log('list', list);
            seVehantData(list);
          }
        }).catch((err) => { console.log('err', err); })
      }
      if (Object.keys(payload).length > 0) {
        await AlertsService.getAnprAlerts(payload).then((response) => {
          if (response) {
            const { data } = response?.data;
            if (data && data.length) {
              // let anpr_rows_list = data.filter(rec => rec.transaction_type === 'ANPR');
              hideLoader();
              //console.log('anpr_rows_list', anpr_rows_list);
              // eventInfo.forEach((rec, index) => (rec.id = index + 1));

              // setOrgAnprRowsList(data);
              if (list && list.length) {
                const obj_data = list.map((rec) => {
                  const { Violation, ...rest } = rec;
                  return ({ date_time: Violation.EventTime, ...rec });
                });
                const arr = [...obj_data, ...data];
                console.log('vehant Data', arr.length, '----', obj_data.length);

                const sorted_data = _.sortBy(arr, ['date_time']);
                console.log('sorted_data', sorted_data);

                setAnprRowsList(sorted_data);
              } else {
                setAnprRowsList(data);
              }

            } else {
              setAnprRowsList([]);
              hideLoader();
              setAlertStatus("No records found", true, "error");
            }
          }
        })
          .catch((err) => {
            hideLoader();
            setAlertStatus("Failed to fetch", true, "error");
            if (err.response) {
              console.log("error response", err);
            } else if (err.request) {
              console.log("error request", err);
            } else {
              console.log("error", err);
            }
          });
      } else {
        hideLoader();
        if (list && list.length) {
          const obj_data = list.map((rec) => {
            const { Violation, ...rest } = rec;
            return ({ date_time: Violation.EventTime, ...rec });
          });

          const sorted_data = _.sortBy(obj_data, ['date_time']);
          console.log('vehant sorted_data', sorted_data);

          setAnprRowsList(sorted_data);
        }
      }
    }
  }

  const [dialogState, setDialogState] = useState({
    dialogOpen: false,
    vertical: "top",
    horizontal: "center",
    params: null,
  });

  const columns = [
    {
      field: "serial_number",
      flex: 1,
      type: "string",
      maxWidth: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}>
            S. No
          </Typography>
        );
      },
      renderCell: (index) => {
       // let ridx = index.row?.alias_id ? index.api.getRowIndex(index.row.alias_id) : index.api.getRowIndex(index.row.Violation.TransId)
       // return <Typography>{ridx + 1}</Typography>;
       return   <Typography>{index.row?.serial_number} </Typography>;
      },
    },
    {
      field: "date_time",
      flex: 1,
      type: "string",
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}>
          
            Date Time
          </Typography>
        );
      },
      renderCell: (params) => {
        let dt_time = params.value ? moment(params.value).format('YYYY/MM/DD HH:mm:ss') :
          params?.row?.Violation?.EventTime ? moment(params.row.Violation.EventTime).format('YYYY/MM/DD HH:mm:ss') : ''
        return <Typography>{dt_time}</Typography>;
      },
    },
    {
      field: "license_number",
      flex: 1,
      type: "text",
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography  
          style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}>License Number</Typography>
        );
      },
      renderCell: (params) => {
        const originalValue = params.row?.license_number || params.row?.Violation?.LicenseNum;
        const handleBlur = (event) => {
          if(newCellValue !== originalValue){
            handleLicenseChange([params, newCellValue]);
          }
          else {
            setCellEdit(-1);
            setNewCellValue("");
          }
        };
        const handleSave = () => {
          handleLicenseChange([params, newCellValue]);
        };
        const handleEdit = () => {
          setCellEdit(params.row.event_id);
          setNewCellValue(params.row.license_number);
        }
        const handleKeyDown = (event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.stopPropagation();
          }
        };

        return (
          params.row.event_id === cellEdit ? (
            <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
              <input
                type="text"
                value={newCellValue}
                onChange={(event) => setNewCellValue(event.target.value)}
                onBlur={handleBlur}
                style={{ width: '80%', overflow: 'scroll', whiteSpace: 'nowrap'}} 
                className={classes.inputField}
                onKeyDown={handleKeyDown}
              />
              <SaveIcon 
                onClick={handleSave} 
                style={{ fontSize: '18px', cursor: 'pointer', alignSelf: 'center' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ width: '80%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <Typography
                  style={{
                    fontSize: 12,
                    textDecorationLine: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenDialog(params.row)}
                >
                  {params.row?.license_number || params.row?.Violation?.LicenseNum}
                </Typography>
              </span>
              <EditIcon 
                onClick={handleEdit} 
                style={{ fontSize: '18px', cursor: 'pointer', alignSelf: 'center' }}
              />
            </div>
          )
        )
      },
    },
    // {
    //   field: "lpimage",
    //   flex: 1,
    //   type: "text",
    //   maxWidth: 230,
    //   renderHeader: (params) => {
    //     return (
    //       <Typography style={{ fontWeight: "bold" }}>License Plate</Typography>
    //     );
    //   },
    //   renderCell: (params) => {
    //     return (
    //       <div>
    //         <img
    //           alt="lpimage"
    //           width={100}
    //           // src={params.row?.violations[0].lpimage}
    //           src={params.row?.image}
    //         />
    //       </div>
    //     );
    //   },
    // },
    {
      field: "junction_name",
      flex: 1,
      type: "string",
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Junction
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography style={{ overflowWrap: 'break-word' }}>{params.value || params.row?.Violation?.Location}</Typography>;
      },
    },
    {
      field: "camera_name",
      flex: 1,
      type: "string",
      maxWidth: 450,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Camera Name
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value || params.row?.Violation?.Site}</Typography>;
      },
    },
    {
      field: "police_station",
      flex: 1,
      type: "string",
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Police Station
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value || params.row?.Violation?.['Police Station']}</Typography>;
      },
    },
    {
      field: "zone",
      flex: 1,
      type: "string",
      maxWidth: 100,
      renderHeader: (params) => {
        return (
          <Typography
             style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Zone
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value || params.row?.Violation?.Zone}</Typography>;
      }
    },
    {
      field: "commisionerate",
      flex: 1,
      type: "string",
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Commissionerate
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value || params.row?.Violation?.Commissionerate}</Typography>;
      },
    },
    {
      field: "color",
      flex: 1,
      type: "string",
      maxWidth: 80,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Color
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "category",
      flex: 1,
      type: "string",
      maxWidth: 100,
      renderHeader: (params) => {
        return (
          <Typography
             style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Category
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value || params.row?.Violation?.VehicleCategory}</Typography>;
      },
    },
    {
      field: "transaction_type",
      flex: 1,
      type: "string",
      maxWidth: 130,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular" 
             }}
          >
            Transaction Type
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value || 'ANPR_TES'}</Typography>;
      },
    },
    // {
    //   field: "actions",
    //   flex: 1,
    //   type: "text",
    //   maxWidth: 550,
    //   renderHeader: (params) => {
    //     return <Typography style={{ fontWeight: "bold" }}>Actions</Typography>;
    //   },
    //   renderCell: (params) => {
    //     return (
    //       <div>
    //         <TextField
    //           style={{ margin: "5px 0" }}
    //           id={`vehicle-number-${params.row?.id}`}
    //           size="small"
    //           variant="standard"
    //           defaultValue={params.row?.license_number}
    //           value={params.row?.license_number}
    //         // onChange={(event) => setVehicleNumberState(event.target.value) }
    //         />
    //         <Button
    //           variant="outlined"
    //           size="small"
    //           style={{ margin: "3px 5px" }}
    //           endIcon={<Receipt />}
    //           onClick={() => echallanHandler(params.row)}
    //         >
    //           Send to E-Challan
    //         </Button>
    //       </div>
    //     );
    //   },
    // }
  ];

  const handleLicenseChange = (params) => {
    setLicenseAlert(true);
    setLicenseRowVal(params);
  }

  const handleLicenseChangeYes = () => {
    const rowIndex = anprRowsList.findIndex(row => row.event_id === licenseRowVal[0].row.event_id);
    const updatedRows = [...anprRowsList];
    updatedRows[rowIndex].license_number = licenseRowVal[1];
    setAnprRowsList(updatedRows);
    saveDetails(anprRowsList[rowIndex]);
    setCellEdit(-1);
    setNewCellValue("")
    setLicenseAlert(false);
    setLicenseRowVal(null);
  }

  const handleLicenseChangeNo = () => {
    const rowIndex = anprRowsList.findIndex(row => row.event_id === licenseRowVal[0].row.event_id);
    const updatedRows = [...anprRowsList];
    updatedRows[rowIndex].license_number = licenseRowVal[0].row.license_number;
    setAnprRowsList(updatedRows);
    setCellEdit(-1);
    setNewCellValue("")
    setLicenseAlert(false);
    setLicenseRowVal(null);
  }

  const renderAlertDialog = () => {
    return (
      <Dialog open={licenseAlert}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          {`On clicking 'Save Changes', License Number will change to ${licenseRowVal[1]}.`}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLicenseChangeNo} sx={{ color: '#ffffff' }}>No</Button>
          <Button onClick={handleLicenseChangeYes} autoFocus sx={{ color: '#ffffff' }} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const saveDetails = (params) => {
    console.log('params------------', params)
    let obj = {
      license_number: params.license_number,
      id: params.event_id,
    };
    AlertsService.updateEvent(obj)
      .then((res) => {
        if (res.status === 200) {
          setAlertStatus("Updated Successfully", true, "success");
          setAlertSuccess(true);
        }
      })
      .catch((err) => {
        setAlertStatus("update Failed", false, "error");
        setAlertSuccess(false);
        console.log("handleAcknowledge", err);
      });
  }
  const dataForTrackModel=()=>{
    const sortedData= anprRowsList.filter(item => item.license_number === trackItem.license_number);
    sortedData.slice().sort((a, b) => a.event_id - b.event_id);
    setSortedDataForTrack(sortedData)
    // console.log("sortedData1",sortedData)
    setTrackModel(true);
      }

  const echallanHandler = async (params) => {
    console.log("Echallan Done", params);
    // let base64_image = await imageUrlToBase64(params.violations[0].frontalimage);
    let obj = {
      vehicle_number: params.license_number,
      camera_id: params.camera_id,
      // vehicle_speed: Math.trunc(params.violations[0].speed),
      vehicle_speed: 0,
      speed_limit: 0,
      // timestamp: params.violations[0].timestamp,
      timestamp: params.timestamp,
      vioCode: params.vioCode,
      camera1_image: params.image,
      // camera2_image: params.violations[0].frontalimage[1],
      // camera1_location: params.violations[0].site_location.split("-")[0].trim(),
      // camera2_location: params.violations[0].site_location.split("-")[1].trim(),
      event_time1: params.date,
      // event_time2: params.violations[0].event_time2,
      // distance: params.violations[0].distance,
      // time_diff: params.violations[0].time_diff,
    };
    console.log("--obj--", obj);
    AverageSpeedService.generateEchallan(obj)
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data) {
            setAlertSuccess(true);
          }
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


  const handleCloseDialog = () => {
    setDialogState({ ...dialogState, dialogOpen: false, params: null });
    setImage(null);
    setCropImage(null);
  };

  const handleOpenDialog = (params) => {
    setDialogState({ ...dialogState, dialogOpen: true, params: params });
  };

  const resetfilters = () => {
    setAnprRowsList(orgAnprRowsList);
  }
  const showHotlistTrackModel = (params) => {
      
      setTrackModel(true);
      const filteredData = anprRowsList.filter(item => item.transaction_type === "ANPR");
      setDataForTracking(filteredData);
  }  

  function CustomToolbar() {
    const showSearchModel = () => {
      setOpen(true);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const exportOpen = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };


    const headers = ['S.No', 'Date & Time', 'License Number', 'Junction', 'Camera Name', 'Police Station', 'Zone', 'Commisionerate', 'Color', 'Category', 'Transaction Type'];
    const row_header = ['id', 'date_time', 'license_number', 'junction_name', 'camera_name', 'police_station', 'zone', 'commisionerate', 'color', 'category', 'transaction_type']

    const exportToXLS = () => {

      const formattedData = [];
      for (const [index, item] of anprRowsList.entries()) {
        let obj = {};
        obj = {
          'S.No': (index + 1).toString(),
          'Date & Time': moment(item.date_time).format('YYYY/MM/DD HH:mm:ss'),
          'License Number': item.license_number?.toString(),
          'Junction': item.junction_name?.toString(),
          'Camera Name': item.camera_name?.toString(),
          'Police Station': item.police_station?.toString(),
          'Zone': item.zone?.toString(),
          'Commisionerate': item.commisionerate?.toString(),
          'Color': item.color?.toString(),
          'Category': item.category?.toString(),
          'Transaction Type': item.transaction_type?.toString()
        };
        formattedData.push(obj);
      }

      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'Anpr - Search.xlsx');
    };
    

    const exportToCSV = () => {
      const csvRows = [];
      csvRows.push(headers.join(','));
      for (const [index, row] of anprRowsList.entries()) {
        const values = row_header.map(header => {
          const value = header === 'date_time' ?
            moment(row[header]).format('YYYY/MM/DD HH:mm:ss') :
            header === 'id' ? (index + 1).toString() :
              row[header];
          const escapedValue = ('' + value).replace(/"/g, '\\"');
          return `"${escapedValue}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvData = csvRows.join('\n');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Anpr - Search.csv';
      link.click();
    };

    const exportDataToPdf = () => {
      const pdf = new jsPDF({ orientation: 'landscape' });

      // Set document properties
      pdf.setProperties({
        title: "Anpr - Search"
      })


      pdf.setFontSize(10);
      pdf.setFont('custom', 'bold');
      pdf.text('Anpr - Search', 15, 15);

      // Line width in units (you can adjust this)
      pdf.setLineWidth(0.5);

      // Generate AutoTable for item details
      const itemDetailsRows = anprRowsList?.map((item, index) => [
        (index + 1).toString(),
        moment(item.date_time).format('YYYY/MM/DD HH:mm:ss'),
        item.license_number.toString(),
        item.junction_name?.toString(),
        item.camera_name?.toString(),
        item.police_station?.toString(),
        item.zone?.toString(),
        item.commisionerate?.toString(),
        item.color?.toString(),
        item.category?.toString(),
        item.transaction_type?.toString()
      ]);
      const itemDetailsHeaders = ['S.No', 'Date & Time', 'License Number', 'Junction', 'Camera Name', 'Police Station', 'Zone', 'Commisionerate', 'Color', 'Category', 'Transaction Type'];
      const columnWidths = [10, 30, 30, 30, 40, 30, 30, 30, 30, 30, 30]; // Adjust column widths as needed
      // Define table styles
      const headerStyles = {
        fillColor: [240, 240, 240],
        textColor: [0],
        fontFamily: 'Newsreader',
        fontStyle: 'bold',
      };

      pdf.setFont('Newsreader');
      const itemDetailsYStart = 18;


      pdf.autoTable({
        head: [itemDetailsHeaders],
        body: itemDetailsRows,
        startY: itemDetailsYStart, // Adjust the Y position as needed
        headStyles: {
          fillColor: headerStyles.fillColor,
          textColor: headerStyles.textColor,
          fontStyle: headerStyles.fontStyle,
          fontSize: 10, // Adjust the font size as needed
          font: 'Newsreader', // Set the font family
          halign: 'left',
        },
        styles: { overflow: 'linebreak', cellWidth: 'wrap', cellPadding: 1, fontSize: 6 },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Adjust column widths as needed
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 'auto' },
          6: { cellWidth: 'auto' },
          7: { cellWidth: 'auto' },
          8: { cellWidth: 'auto' },
          9: { cellWidth: 'auto' },
          10: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        bodyStyles: {
          fontSize: 10, // Adjust the font size for the body
          font: 'Newsreader', // Set the font family for the body
          cellPadding: { top: 1, right: 1, bottom: 1, left: 1 }, // Adjust cell padding
          textColor: [0, 0, 0], // Set text color for the body
          rowPageBreak: 'avoid', // Avoid row page breaks
        },
        margin: { top: 10, left: 5 },
      });

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.line(10, 283, 200, 283)
        pdf.setPage(i);
        pdf.setFont('Newsreader');
        pdf.text(
          `Page ${i} of ${totalPages}`,
          185,
          pdf.internal.pageSize.getHeight() - 5
        );
      }

      // Save the PDF 
      pdf.save(`Anpr Search.pdf`);
      return;
    };

    return (
      <>
        <GridToolbarContainer style={{ width: "100%" }}>
          <Typography
            style={{
              color: `${theme.palette?.text?.secondary}`,
              marginLeft: "10px",
              flexGrow: "1",
              fontSize: "14px",
            }}
          >
            {" "}
            ANPR{" "}
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => showSearchModel()}
          >
            ANPR Search
          </Button>
          
          <Button
            size="small"
            style={{
              marginLeft: "10px",
            }}
            variant="contained"
            onClick={() => resetfilters()}
          >
            Reset Filters{" "}
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => dataForTrackModel()}
            disabled={!isRowSelected}
            style={{
              marginLeft: "10px",
            }}
          >{" "}
            TRACK
          </Button>
          <Divider orientation="vertical" variant="middle" flexItem />
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
          <>
            <IconButton
            size="small"
            aria-label="settings"
            aria-controls="settings-menu"
            aria-haspopup="true"
            color="inherit"
            onClick={handleClick}
          >
            <DownloadIcon /><Typography
                  style={{
                    fontSize: "12px",
                    paddinG: "4px 5px",
                  }}
                >
                  EXPORT
                </Typography>
            

          </IconButton>
          </>
          {/* <GridToolbarExport printOptions={{ disableToolbarButton: true }} style={{ marginRight: "15px" }} /> */}
        </GridToolbarContainer>
        <Menu
          id="exp-anpr-menu"
          anchorEl={anchorEl}
          open={exportOpen}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'export-button',
          }}
        >
          <MenuItem onClick={() => exportDataToPdf()}>Download PDF</MenuItem>
          <MenuItem onClick={() => exportToCSV()}>Download CSV</MenuItem>
          <MenuItem onClick={() => exportToXLS()}>Download XLS</MenuItem>
        </Menu>
      </>
    );
  }

  useEffect(() => {
    AlertsService.getCamInfo().then((response) => {
      if (response) {
        const { data } = response?.data;
        setCamInfoList(data);
      }
    });
    CameraService.getCamerasList()
    .then((response) => {
      if (response) {
        const { data } = response;
        if (data && data.data) {
          const cameras_data = data.data.map((elem, index) => {
            const opt = _.merge(elem.camera_information, elem.model_settings);
            return opt;
          });
          setCameraList(cameras_data);
        }
      }
    })
    .catch((err) => console.log("getCameras", err));
    getLocationList();
    // getAnprPopupGroup();
    getViolationPopupGroup();
    gethotlistcategoryList();
  }, []);

  const getLocationList = () => {
    ViolationService.getLocationsList().then((response) => {
      if (response) {
        const { data } = response?.data;
        //const filter_anpr_data = data.filter(rec => rec.device_type.trim() === 'ANPR')
        setLocationsList(data);
      }
    });
    CameraService.getCamerasHierarchyTree()
    .then((response) => {
      if (response) {
        const { data } = response?.data;
        if (data) {
          setAnprCommisionerates(data);
        }
      }
    })
    .catch((err) => console.log("Anpr Camera hierarchy", err));
  };

  const getImage = (image) => {
    const image_details = image.split("_")
    const date = moment(image_details[2].split(" ")[0]).format(
      "DD-MM-YYYY"
    )
    ViolationService.getImage(image_details[0], image, date).then((response) => {
      if (response) {
        const { image_base64 } = response?.data;
        setImage("data:image/jpeg;base64," + image_base64)
      }
    });
    return;
  };

  const getCropImage = (image) => {
    const image_details = image.split("_")
    const date = moment(image_details[2].split(" ")[0]).format(
      "DD-MM-YYYY"
    )

    ViolationService.getImage(image_details[0], image, date).then((response) => {
      if (response) {
        const { image_base64 } = response?.data;
        setCropImage("data:image/jpeg;base64," + image_base64)
      }
    });
    return;

  };


  const gethotlistcategoryList = () => {
    ModelsService.getHotlistcategoryPopupGroup().then((response) => {
      if (response) {
        const { data } = response?.data;
        setCategoryList(data);
      }
    });
  };

  const [categoryList, setCategoryList] = useState([]);
  const [isRowSelected, setIsRowSelected] = useState(false);

  const getAnprPopupGroup = () => {
    showLoader();
    const pageNum = 1;

    const payload = {
      page: pageNum,
      perpage: 100
    };
    // ViolationService.getVehantViolationsList().then((res) => { console.log('res vehant', res); }).catch((err) => { console.log('err', err); })
    AlertsService.getAnprAlerts(payload).then((response) => {
      if (response) {
        const { data } = response?.data;
        if (data && data.length) {
          // let anpr_rows_list = data.filter(rec => rec.transaction_type === 'ANPR');
          hideLoader();
          //console.log('anpr_rows_list', anpr_rows_list);
          // eventInfo.forEach((rec, index) => (rec.id = index + 1));

          setOrgAnprRowsList(data);
          setAnprRowsList(data);

        }
      }
    });
  };

  const getViolationPopupGroup = () => {
    ModelsService.getViolationPopupGroup().then((response) => {
      if (response) {
        const { data } = response?.data;
        setViolationList(data);
      }
    });
  };

  function setDataGridData(currentPage, size) {
    return anprRowsList;
  }

  const handleImageClose = () => {
    setImageDialog({
      ...imageDialog,
      openImageDialog: false,
      selectedImage: "",
    });
  };

  const handleImageClick = (image) => {
    setImageDialog({
      ...imageDialog,
      openImageDialog: true,
      selectedImage: image,
    });
  };

  const setAlertStatus = (content, status, severity) => {
    setAlertState({
      ...alertstate,
      alertOpen: status,
      alertContent: content,
      severity: severity,
    });
  };

  const { alertOpen, vertical, horizontal, alertContent, severity } =
    alertstate;

  return local_anpr_user("activity_info", "activity_name", "AnprSearch") ? (

    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <SearchModel
        open={open}
        filterAnprSearchData={(search_form) =>
          filterAnprSearchData(search_form)
        }
        anprRowsList={anprRowsList}
        hotlistCategoryList={categoryList}
        violationList={violationList}
        locationsList={locationsList}
        caminfoList={caminfoList}
        anprCommisionerates={commisionerates}
        setOpen={setOpen}
      ></SearchModel>
       <AnprTrack
       setOpen={setTrackModel}
       open={trackModel}
       data={sortedDataForTrack} 
       camerasData={cameraList}
       search_form={searchFormData}
      >
      </AnprTrack>

      <Grid item xs={12} className={classes.tableCls}>
        {loader}
        <Card className={classes.card}>
          <CardContent component="div" className={classes.dataGridCpd}>
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={alertOpen}
              autoHideDuration={1000}
              onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
            >
              <Alert
                onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
                severity={isSuccess ? "success" : "error"}
              >
                {alertContent}
              </Alert>
            </Snackbar>
            <div style={{ width: "100%" }}>
              <DataGrid
                columns={columns}
                className={classes.dataAnprGridCls}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  // setDataGridData(currentPgIdx, newPageSize);
                }}
                rows={anprRowsList}
                getRowId={(row) => row?.serial_number}
                rowsPerPageOptions={[25,50,100]}
                onRowClick={(selectedItem)=>{
                  setTrackItem(selectedItem.row)
                  setIsRowSelected(true)}
                }
                rowHeight={35}
                headerHeight={40}
                components={{
                  Toolbar: CustomToolbar,
                }}
                getCellClassName={(params) => classes.cellsCls}
                onPageChange={(currentPageIdx) => {
                  setCurrentPgIdx(currentPageIdx);
                }}
                pagination
              />
              {licenseAlert && renderAlertDialog()}
              {dialogState.dialogOpen ? (
                <Dialog
                  open
                  onClose={handleCloseDialog}
                  fullScreen
                  TransitionComponent={Transition}
                >
                  <Box sx={{ width: "100%", border: "none" }}>
                    <AppBar
                      sx={{
                        backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
                        border: `1px solid ${theme.palette.mode === "light"
                          ? "#707070"
                          : "#404145 !important"
                          }, opacity: 1 `,
                        display: 'flex'
                      }}
                      className={classes.popupTitle}
                      position="static"
                    >
                      <div className={classes.titleCls} style={{ display: 'flex' }}>
                        Detail View
                        <div className={classes.closeCls} style={{ marginLeft: '4px' }}>
                          <CloseOutlined onClick={handleCloseDialog} />
                        </div>
                      </div>
                    </AppBar>
                    <Grid
                      container
                      spacing={1}
                      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                      sx={{ paddingLeft: "30px", marginTop: '10px' }}
                    >

                      {dialogState.params &&
                        dialogState.params.image ?
                        // dialogState.params.violations.map((violation) =>
                        // violation.cinfo.map((item, key, index) => (

                        // <Grid xs={6} key={dialogState.params.alias_id}>
                        <>
                          <Typography>
                            {!image ? getImage(dialogState.params.image) : null}
                            {!cropImage ? getCropImage(dialogState.params.cropped_image) : null}
                            {/* <img
                                  alt="plimage"
                                  width={640}
                                  height={480}
                                  src={image}
                                /> */}
                            {/* &nbsp;&nbsp;
                                {`${dialogState.params.camera_name +
                                  " - " +
                                  moment(dialogState.params.image.split("_")[2]).format(
                                    "DD/MM/YYYY HH:mm:ss"
                                  )
                                  }`} */}
                          </Typography>
                          <ImageList sx={{ width: '100%', height: '100%' }} cols={3} rowHeight={364}>
                            <ImageListItem >
                              <img
                                alt="image"
                                src={image || dialogState.params?.Violation?.TransactionFiles?.LPImage}
                                srcSet={image || dialogState.params?.Violation?.TransactionFiles?.LPImage}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#00000082' }}
                              // onClick={() => {
                              //   handleImageClick(item.images);
                              // }}
                              />
                            </ImageListItem>
                            <ImageListItem  >

                              <img
                                alt="image"
                                src={cropImage}
                                srcSet={cropImage}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#00000082' }}
                                loading="lazy"
                              />
                            </ImageListItem>
                          </ImageList>
                        </>

                        /* {<ImageList cols={3}>
                          {
                            // !is_vehant ? (
                            //   <ImageListItem key={index}>
                            //     <img
                            //       alt="image"
                            //       src={`${item.images}`}
                            //       srcSet={`${item.images}`}
                            //       loading="lazy"
                            //       onClick={() => {
                            //         handleImageClick(item.images);
                            //       }}
                            //     />
                            //   </ImageListItem>
                            // ) : (
                            // item.images.split(";").map((image, index) => (
                            //   <ImageListItem key={index}>
                            //     <img
                            //       alt="image"
                            //       src={`${image}`}
                            //       srcSet={`${image}`}
                            //       loading="lazy"
                            //       onClick={() => {
                            //         handleImageClick(image);
                            //       }}
                            //     />
                            //   </ImageListItem>
                            // ))
                            // )
                          }
                        </ImageList> }*/
                        // </Grid>
                        : ""
                      }
                    </Grid>

                    <Dialog
                      open={imageDialog.openImageDialog}
                      onClose={handleImageClose}
                      fullScreen
                      TransitionComponent={ImageTransition}
                    >
                      <DialogContent>
                        <Box sx={{ width: "100%", border: "none" }}>
                          <Grid container spacing={1}>
                            <Card>
                              <CardMedia
                                component="img"
                                alt="image"
                                image={imageDialog.selectedImage}
                                onClick={handleImageClose}
                              />
                            </Card>
                          </Grid>
                        </Box>
                      </DialogContent>
                    </Dialog>
                  </Box>
                </Dialog>
              ) : null}
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
export default Anpr;