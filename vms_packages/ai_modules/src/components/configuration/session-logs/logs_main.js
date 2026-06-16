import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles,useTheme } from "@mui/styles";
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
  AppBar,
  CardActionArea,
  FormControl,
  TextField,

} from "@mui/material";
import Session_logs from "./session_logs";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useLoader from "../../../common/loader/useLoader";
import ModelsService from "../../../services/models";
import Pagination from '@mui/material/Pagination';
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { Check as CheckIcon, Receipt } from "@mui/icons-material";
import NoAccess from "../../../common/NoAccess";
import { local_anpr_user } from "../../../config/config";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Activity_logs from "./activity_logs";
import moment from "moment";
import { themeSubjectService } from "../../../utilities/theme-util";




const useStyles = makeStyles((theme) => ({
  root: {

    "& ::-webkit-scrollbar": {
      width: "3px",
      height: "100%",
      marginRight: "4px",
      backgroundColor: "#3D81F5",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "red",
      borderRight: "4px white solid",
      height: "2px"
    },

    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
        }`,
      backgroundColor: `${theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
        }`,
      color: theme.palette.text.primary,
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", 

    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important",
    },
    "& .MuiDataGrid-columnsContainer": {
      minHeight: "auto !important",
      maxHeight: "auto !important",
    },
    "& .MuiButton-root": {
      color: "#fff !important",
      fontSize: "12px",
      top: "-1.75px"
    },
    '& .MuiDataGrid-footerContainer': {
        height: '40px',
        minHeight: '40px',
    },
    "& .MuiDivider-root": {
      borderColor: "#fff",
      margin: "6px 8px 6px 12px",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "92vh",
    },
    width: "100vw",
  },
  popupTitle: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    color: "#fff",
    width: "100%",
    height:"4vh",
    padding: '1vh',
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  historyRecordSection: {
    width: "100%",
    overflow: "auto",
    [theme.breakpoints.between(750, 1400)]: {
      height: "10vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "87.5vh !important",
    },
},
 titleCls: {
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "uppercase",
      },
  card: {
    backgroundColor: '#0D0D0D',
    color: "#fff !important",
    border: "1px solid #868686 !important",
    opacity: "1",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0px !important",
    marginTop: '4px !important'
  },
  uploadscard: {
    backgroundColor: "#313131 !important",
    color: "#fff !important",
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
    // color: "#fff !important",
    // border: "none !important",
    [theme.breakpoints.between(350, 749)]: {
      maxHeight: "90vh",
      minHeight: "70vh",
    },
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "90vh",
      minHeight: "83vh",
    },
    [theme.breakpoints.between(1400, 1800)]: {
      maxHeight: "90vh",
      minHeight: "79vh",
    },
    [theme.breakpoints.up(1800)]: {
      maxHeight: "78vh",
      minHeight: "79vh",
    },
    marginTop :"10px"
  },
  cellsCls: {
    color: "#fff !important", 
  },
  stepperCls: {
    "& .Mui-active": {
      color: "#a79c53 !important,",
    },
  },
  addcameraCls: {
    display: "flex",
    padding: "0px !important",
  },
  tableCls: {
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

}));

const Logs_main = (props) => {
  const [dataGridRows, setDataGridRows] = useState([]);
  const classes = useStyles();
  const [selectedLogType, setSelectedLogType] = useState("Session Logs");
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  const [themeUrl, setThemeUrl] = useState(
    "http://{????????a-c}????????.basemaps.cartocdn.com/dark_all/{????????z}????????/{????????x}????????/{????????y}????????.png"
  );
  const current_theme = useTheme();
  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });
  
  const [isSuccess, setAlertSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [openSessionLogs, setOpenSessionLogs] = React.useState(false);
  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [mode, setMode] = useState("add");
  const [openActivity, setOpenActivity]= useState(false)
  const [dateRangeSelected, setDateRangeSelected] = useState(false); 
  const theme = useTheme();
  const [loader, showLoader, hideLoader] = useLoader();
  const [violationList, setViolationList] = React.useState([]);
  const [paramObj, setParamObj] = useState([]);
  const [flag, setflag] = useState(false)
  const [selectedrecord, setSelectedrecord] = useState(null);
  const currentDate = new Date();
  const startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  currentDate.setHours(currentDate.getHours() + 5);
  currentDate.setMinutes(currentDate.getMinutes() + 30);
  startDate.setHours(startDate.getHours() + 5); 
  startDate.setMinutes(startDate.getMinutes() + 30);
  const formattedStartDate = startDate.toISOString().slice(0, 16);
  const formattedEndDate = currentDate.toISOString().slice(0, 16); 

  const [search_form, setSearchForm] = useState({
      start_date: formattedStartDate,
      end_date: formattedEndDate
    });
  
  const sortedData=["Session Logs","Activity Logs"]

  const handleDateRangeSelection = () => {
    if (search_form.start_date && search_form.end_date) {
      setDateRangeSelected(true);
    } else {
      setDateRangeSelected(false);
    }
  };
  

useEffect(() => {
  handleDateRangeSelection();
}, [search_form.from_date, search_form.end_date]);

const handleChange = (event) => {
  setSearchForm((oldValues) => ({
    ...oldValues,
    [event.target.name]: event.target.value,
  }));
};

  function CustomToolbar() {
    const showViolationPopup = () => {
      setOpen(true);
    };

    useEffect(() => {

    }, []);

    return (
      <GridToolbarContainer style={{ width: "100%" }}>
        <Typography
          style={{
            color: `${theme.palette?.text?.secondary}`,
            marginLeft: "10px",
            flexGrow: "1",
            fontSize: "14pxt",
          }}
        >
          {" "}
          Session Logs{" "}
        </Typography>
        <Divider orientation="vertical" variant="middle" flexItem />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
        
      </GridToolbarContainer>
    );
  }


  // const { alertOpen, vertical, horizontal, alertContent } = state;


  const getViolationPopupGroup = () => {
    showLoader();
    ModelsService.getViolationPopupGroup()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          setViolationList(data);
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
  const handleEditClick = (params) => {
    const gridIdx = violationList.findIndex((rec) => rec.id === params.row.id);
    console.log(gridIdx);
    if (gridIdx !== -1) {
      const rec = violationList[gridIdx];
      setOpenSessionLogs(true)
      setOpen(true);
      setSelectedrecord(rec);
      setParamObj('edit');
      setMode("update");
    }
  };
  const handleReportsChange = (item) => {
    setSelectedLogType(item.row.name);
  };
  

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteViolation_managementParameters(params.id)
        .then((response) => {
          setViolationList(violationList.filter((item) => item.id !== params.id));
          setAlertSuccess(true);
          setState({ ...state, alertOpen: true, alertContent: "Deleted Successfully" });
        })
        .catch((err) => console.log("Hotlist delete", err));
    }
  };
  useEffect(() => {
    getViolationPopupGroup();

    setflag(false)
  }, [flag]);

  function setDataGridData(currentPage, size) {
    showLoader();
    const pageNum = currentPage || 1;
    const pageLimit = size || 10;

  };


  const searchHandler = (item) => {
    
    const { start_date, end_date } = search_form;
    if (!start_date &&
      !end_date) {
      return setAlertStatus("Select Date fields to see Reports", true, "error");
    }
    if ((!start_date && end_date) || (start_date && !end_date)) {
      return setAlertStatus("Start Date and End Date Both are required", true, "error");
    } else {
      if ((moment(start_date).isSame(moment(end_date))) ||
      (moment(start_date).isAfter(moment(end_date))) 
      ) {
        return setAlertStatus("Start Date should be before End Date", true, "error");
      }
    }
      handleReportsChange(item);
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
    useEffect(() => {        
      themeSubjectService.getThemeSubject().subscribe((mode) => {
        mode === "light"
          ? setThemeUrl(
            "http://10.66.40.86:5101/styles/osm-bright/{z}/{x}/{y}.png"
          )
          : setThemeUrl(
            // "http://136.233.45.154:6301/map/tile/{z}/{x}/{y}.png"
            "http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          );
      });
    }, []);
    const label = { inputProps: { 'aria-label': 'Switch demo' } };
  return (
    local_anpr_user('activity_info', 'activity_name', 'Violation Management') ?
      <Grid
        container
        spacing={0.5}
        direction="row"
        justifyContent="space-evenly"
        className={classes.root}
      >
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
                  <Grid item xs={2.98} mt ={0.5} mb={0.2} marginRight={0.2}>
                <Card variant="outlined"  className={classes.card}>
                <CardContent component="div" className={classes.historyRecordSection}>
                  <Grid item xs={12} mb ={0.2}>
                    <FormControl fullWidth>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <TextField
                                id="datetime-local-start"
                                type="datetime-local"
                                size="small"
                                label= "From Date"
                                fullWidth
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{ max: "9999-12-31T23:59" }}
                                name= "start_date"
                                value={search_form["start_date"]}
                                onChange={(newValue) => {
                                  handleChange(newValue);
                                }}
                              />
                        </LocalizationProvider>
                      </FormControl>
                    </Grid>
                      <Grid item xs={12} mb ={0.3} mt={0.7}>
                      <FormControl fullWidth>
                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TextField
                                  id="datetime-local-start"
                                  type="datetime-local"
                                  size="small"
                                  label= "To Date"
                                  fullWidth
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  inputProps={{ max: "9999-12-31T23:59" }}
                                  name="end_date"
                                  value={search_form["end_date"]}
                                  onChange={(newValue) => {
                                    handleChange(newValue);
                                  }}
                                />
                          </LocalizationProvider>
                        </FormControl>
                      </Grid>

          <DataGrid
              className={classes.dataViolationGridCls}
              hideFooter
              onRowClick={(item) => {
                
                 searchHandler(item)}}
              columns={[
                { field: "name", headerName: "Name", flex: 1 },
                
              ]}
              rows={sortedData.map((item, index) => ({
                id: index,
                name: item,
              }))}
              />
                    
              </CardContent> 
              </Card>
            </Grid>
            <Grid item xs={9} className={classes.tableCls}>
              {/* {loader}  */}
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
              
              {selectedLogType === "Session Logs" && <Session_logs search_form ={search_form} selectedLogType ={selectedLogType} />}
              {selectedLogType === "Activity Logs" && <Activity_logs search_form ={search_form}  selectedLogType ={selectedLogType} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid> 
      :
      (
        <Grid>
          <NoAccess />
        </Grid>
      )
  );
  
  
};

export default Logs_main;
