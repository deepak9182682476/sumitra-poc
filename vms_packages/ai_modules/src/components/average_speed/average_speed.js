import React, { Fragment, useEffect, useState } from "react";
import {
  Grid,
  Box,
  Dialog,
  DialogContent,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Alert,
  Snackbar,
  TextField,
  Stack,
  Button,
  AppBar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ImageList,
  ImageListItem,
  Slide,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { makeStyles, useTheme } from "@mui/styles";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  gridClasses,
} from "@mui/x-data-grid";
import AverageSpeedService from "../../services/average_speed";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
import { CloseOutlined, Receipt } from "@mui/icons-material";
import SearchModel from "./search_model";
import ModelsService from "../../services/models";
import NoAccess from "../../common/NoAccess";
import { local_anpr_user } from "../../config/config";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const ImageTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

function CustomToolbar() {
  const theme = useTheme();
  return (
    <GridToolbarContainer
      style={{
        width: "100%",
        height: "100%",
        background: "rgb(2 20 70 / 58%)",
      }}
    >
      <Typography
        style={{
          flexGrow: "1",
          marginLeft: "10px",
          fontSize: "14px",
          color: `${theme.palette?.text?.secondary}`,
        }}
      >
        Average SPEED - DETECTIONS
      </Typography>
      <GridToolbarColumnsButton />
      {/* <GridToolbarFilterButton /> */}
      <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
      {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
    </GridToolbarContainer>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
        }`,
      backgroundColor: theme?.palette?.primary?.subHeaderBg,
    },
    "& .MuiDataGrid-root": {
      fontSize: "12px !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important",
    },
    "& .MuiButton-root": {
      color: "#fff !important",
      fontSize: "12px",
    },
    "& .MuiDataGrid-toolbarContainer": {
      padding: "6px 4px 6px 0px !important",
    },
    [`& .${gridClasses.row}.even`]: {
      backgroundColor: "#3c3c3c",
      "&:hover, &.Mui-hovered": {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        "@media (hover: none)": {
          backgroundColor: "transparent",
        },
      },
    },
    "& .MuiImageList-root .MuiImageListItem-root": {
      width: "200px !important",
      height: "200px !important",
    },
    "& .MuiImageListItem-root .MuiImageListItem-img": {
      objectFit: "fill !important",
    },
  },
  cpd: {
    padding: "0px  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  card: {
    backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
    border: "1px solid #868686 !important",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dataAvgGridCls: {
    color: `${theme.palette?.text?.primary} !important`,
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "73vh",
      minHeight: "73vh",
    },
    [theme.breakpoints.between(1400, 1800)]: {
      // height: "26vh !important",
      maxHeight: "83vh",
      minHeight: "83vh",
    },
    [theme.breakpoints.up(1800)]: {
      // height: "50vh !important",
      maxHeight: "88vh",
      minHeight: "88vh",
    },
  },
  cellsCls: {
    color: `${theme.palette?.text?.primary} !important`,
    display: "block !important",
  },
  cameraFramesSection: {
    width: "100%",
    [theme.breakpoints.between(750, 1400)]: {
      height: "27vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "44vh !important",
    },
  },
  popupTitle: {
    width: "100%",
    margin: "0px 0px 10px",
    padding: "11px",
    fontSize: "16px",
    alignItems: "center",
    fontWeight: "bold",
    textTransform: "uppercase",
    display: "flex",
    flexFlow: "row",
    justifyContent: "center",
    color: "#fff",
  },
  closeCls: {
    margin: "0px 0px 0px auto",
    cursor: "pointer",
  },
  titleCls: {
    margin: "5px 0px auto auto",
  },
  fontsize: {
    fontSize: "0.75rem !important",
  },
}));

const AverageSpeed = (props) => {
  const theme = useTheme();
  const classes = useStyles();

  const [isSuccess, setAlertSuccess] = useState(false);
  const [is_vehant, setIsVehant] = useState(false);

  const [vehicleNumberState, setVehicleNumberState] = useState("");
  // let eDate = "Wed Jan 04 2023 14:03:00 GMT+0530 (India Standard Time)";
  // let sDate = "Thu Nov 03 2022 15:02:00 GMT+0530 (India Standard Time)";
  const [state, setState] = useState({
    startDate: new Date(),
    endDate: new Date(),
    camera_id: "K25,K54,L56,K58,K60",
    speed_limit: 40,
  });
  const [dialogState, setDialogState] = useState({
    dialogOpen: false,
    vertical: "top",
    horizontal: "center",
    params: null,
  });

  const [imageDialog, setImageDialog] = useState({
    openImageDialog: false,
    selectedImage: "",
  });

  const [data, setData] = useState({
    loading: false,
    rows: [],
    totalRows: 0,
    rowsPerPageOptions: [10, 20, 30, 50, 100],
    pageSize: 10,
    page: 1,
  });

  const updateData = (k, v) => setData((prev) => ({ ...prev, [k]: v }));

  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });


  const columns = [
    {
      field: "s.no",
      flex: 1,
      type: "text",
      maxWidth: 70,
      renderHeader: (params) => {
        return <Typography style={{ fontWeight: "bold" }}>S. No</Typography>;
      },
      renderCell: (params) => {
        return <Typography>{params.row?.id}</Typography>;
      },
    },
    {
      field: "vehicle_number",
      flex: 1,
      type: "text",
      maxWidth: 140,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontWeight: "bold" }}>Vehicle No</Typography>
        );
      },
      renderCell: (params) => {
        return (
          <Typography
            style={{
              fontSize: 12,
              textDecorationLine: "underline",
              cursor: "pointer",
            }}
            onClick={() => handleOpenDialog(params.row)}
          >
            {params.row?.vehicle_number}
          </Typography>
        );
      },
    },
    {
      field: "lpimage",
      flex: 1,
      type: "text",
      maxWidth: 160,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontWeight: "bold" }}>License Plate</Typography>
        );
      },
      renderCell: (params) => {
        return (
          <div>
            <img
              alt="lpimage"
              width={100}
              src={params.row?.violations[0].lpimage}
            />
          </div>
        );
      },
    },
    {
      field: "speed",
      flex: 1,
      type: "text",
      maxWidth: 140,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontWeight: "bold" }}>Speed (km/h)</Typography>
        );
      },
      renderCell: (params) => {
        return params.row?.violations && params.row?.violations.length > 1
          ? params.row?.violations[params.row?.violations.length - 1].speed
          : params.row?.violations.map((el) => el.speed);
      },
    },
    {
      field: "site_location",
      flex: 1,
      type: "text",
      maxWidth: 400,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontWeight: "bold" }}>Site Location</Typography>
        );
      },
      renderCell: (params) => {
        return params.row?.violations.map((el) => (
          <div>{el.site_location}</div>
        ));
      },
    },
    {
      field: "event_time",
      flex: 1,
      type: "date",
      maxWidth: 400,
      renderHeader: (params) => {
        return <Typography style={{ fontWeight: "bold" }}>Time</Typography>;
      },
      renderCell: (params) => {
        return params.row?.violations.map((el) => <div>{el.event_time}</div>);
      },
    },
    {
      field: "actions",
      flex: 1,
      type: "text",
      maxWidth: 550,
      renderHeader: (params) => {
        return <Typography style={{ fontWeight: "bold" }}>Actions</Typography>;
      },
      renderCell: (params) => {
        return (
          <div>
            <TextField
              style={{ margin: "5px 0" }}
              id={`vehicle-number-${params.row?.id}`}
              size="small"
              variant="standard"
              defaultValue={params.row?.vehicle_number}
              value={params.row?.vehicle_number}
            // onChange={(event) => setVehicleNumberState(event.target.value) }
            />
            <Button
              variant="outlined"
              size="small"
              style={{ margin: "3px 5px" }}
              endIcon={<Receipt />}
              onClick={() => echallanHandler(params.row)}
            >
              Send to E-Challan
            </Button>
          </div>
        );
      },
    },
  ];

  const echallanHandler = async (params) => {
    console.log("Echallan Done", params, vehicleNumberState);
    // let base64_image = await imageUrlToBase64(params.violations[0].frontalimage);
    let obj = {
      vehicle_number: params.vehicle_number,
      camera_id: params.violations[0].camera_id,
      vehicle_speed: Math.trunc(params.violations[0].speed),
      speed_limit: state.speed_limit,
      timestamp: params.violations[0].timestamp,
      camera1_image: params.violations[0].frontalimage[0],
      camera2_image: params.violations[0].frontalimage[1],
      camera1_location: params.violations[0].site_location.split("-")[0].trim(),
      camera2_location: params.violations[0].site_location.split("-")[1].trim(),
      event_time1: params.violations[0].event_time1,
      event_time2: params.violations[0].event_time2,
      distance: params.violations[0].distance,
      time_diff: params.violations[0].time_diff,
    };
    console.log("--obj--", obj);
    updateData("loading", true); // loading starts
    AverageSpeedService.generateEchallan(obj)
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data) {
            setVehicleNumberState("");
            updateData("loading", false);
            setAlertSuccess(true);
          }
        }
      })
      .catch((err) => {
        updateData("loading", false); // loading stops
        if (err.response) {
          console.log("error response", err);
        } else if (err.request) {
          console.log("error request", err);
        } else {
          console.log("error", err);
        }
      });
  };

  // const imageUrlToBase64 = async (url) => {
  //   const data = await fetch(url);
  //   const blob = await data.blob();
  //   return new Promise((resolve) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(blob);
  //     reader.onloadend = () => {
  //       let base64data = reader.result;
  //       base64data = base64data.split(",")[1];
  //       resolve(base64data);
  //     };
  //   });
  // };

  const handleStartDateChange = (event) => {
    if (moment(event.target.value).isSameOrBefore(state.endDate)) {
      setState({
        ...state,
        startDate: new Date(event.target.value),
        errorMessage: "",
      });
    } else {
      setState({
        ...state,
        errorMessage: "Start Date should be before End Date",
      });
    }
  };

  const handleEndDateChange = (event) => {
    if (moment(state.startDate).isSameOrBefore(event.target.value)) {
      setState({
        ...state,
        endDate: new Date(event.target.value),
        errorMessage: "",
      });
    } else {
      setState({
        ...state,
        errorMessage: "Start Date should be before End Date",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogState({ ...state, dialogOpen: false, params: null });
  };

  const handleOpenDialog = (params) => {
    setDialogState({ ...state, dialogOpen: true, params: params });
  };

  const handleImageClick = (image) => {
    setImageDialog({
      ...state,
      openImageDialog: true,
      selectedImage: image,
    });
  };

  const handleImageClose = () => {
    setImageDialog({
      ...state,
      openImageDialog: false,
      selectedImage: "",
    });
  };

  // const getServiceBase64Image = (rec, imgpath, key) => {
  //   if (imgpath) {
  //     console.log(imgpath);
  //     imgpath = imgpath.replace("10.20.62.157", "localhost");
  //     console.log(imgpath);
  //     axios.get(imgpath).then((res) => {
  //       if (key === "violations") {
  //         rec.violations[0].lpimage = res.data;
  //       }
  //       if (key === "images") {
  //         rec.images = res.data;
  //       }
  //       if (key === "lpimage") {
  //         rec.lpimage = res.data;
  //       }
  //     });
  //   }
  // };

  function setInitialData() {
    updateData("loading", true); // loading starts
    console.log('state.startDate', state.startDate, state.endDate);
    AverageSpeedService.getAverageSpeed({
      start_date: moment(state.startDate)
        .startOf("minute")
        .format("YYYYMMDDHHmmss"),
      end_date: moment(state.endDate).endOf("minute").format("YYYYMMDDHHmmss"),
      camera_id: state.camera_id,
      speed_limit: state.speed_limit,
    })
      .then((response) => {
        if (response) {
          if (state.camera_id == "V01,V02") {
            setIsVehant(false);
          } else {
            setIsVehant(true);
          }
          const { data } = response;
          if (data) {
            let violationInfo = data.data;
            violationInfo.forEach((rec, index) => (rec.id = index + 1));
            if (violationInfo && violationInfo.length) {
              setData((prevState) => ({
                ...prevState,
                rows: violationInfo,
                totalRows: violationInfo.length,
              }));
              updateData("loading", false);
            } else {
              setData((prevState) => ({
                ...prevState,
                rows: [],
                totalRows: 0,
              }));
              updateData("loading", false);
            }
          }
        }
      })
      .catch((err) => {
        updateData("loading", false); // loading stops
        if (err.response) {
          console.log("error response", err);
        } else if (err.request) {
          console.log("error request", err);
        } else {
          console.log("error", err);
        }
      });
  }

  useEffect(() => {
    updateData("loading", false);
  }, []);

  const onFilterSearch = () => {
    setData((prevState) => ({ ...prevState, rows: [], totalRows: 0 }));
    setInitialData();
  };

  // const setAlertStatus = (content, status, severity) => {
  //   setAlertState({
  //     ...alertstate,
  //     alertOpen: status,
  //     alertContent: content,
  //     severity: severity,
  //   });
  // };
  const { alertOpen, vertical, horizontal, alertContent, severity } =
    alertstate;

  return (
    local_anpr_user('activity_info', 'activity_name', 'Violations') ? (
      <Fragment>
        <Grid container spacing={2}>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={alertOpen}
            autoHideDuration={2000}
            onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
          >
            <Alert
              onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
              severity={severity}
            >
              {alertContent}
            </Alert>
          </Snackbar>

          <Grid
            direction="row"
            style={{ display: "flex" }}
            item
            xs={12}
            alignItems="center"
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction="row" spacing={2}>
                <TextField
                  id="datetime-local-start"
                  type="datetime-local"
                  defaultValue={state.startDate}
                  sx={{ width: 250 }}
                  InputLabelProps={{
                    shrink: true,
                    maxDate: moment().format("YYYY-MM-DD"),
                  }}
                  inputProps={{ max: "9999-12-31T23:59" }} 
                  onChange={(newValue) => {
                    handleStartDateChange(newValue);
                  }}
                />

                <TextField
                  id="datetime-local-end"
                  type="datetime-local"
                  defaultValue={state.endDate}
                  sx={{ width: 250 }}
                  InputLabelProps={{
                    shrink: true,
                    maxDate: moment().format("YYYY-MM-DD"),
                  }}
                  inputProps={{ max: "9999-12-31T23:59" }} 
                  onChange={(newValue) => {
                    handleEndDateChange(newValue);
                  }}
                />

                {/* <DateTimePicker
                renderInput={(params) => <TextField {...params} />}
                value={state.startDate}
                onChange={(newValue) => {
                  handleStartDateChange(newValue);
                }}
              />
              <DateTimePicker
                renderInput={(params) => <TextField {...params} />}
                value={state.endDate}
                onChange={(newValue) => {
                  handleEndDateChange(newValue);
                }}
              /> */}
              </Stack>
            </LocalizationProvider>
            <FormControl sx={{ px: 1, maxWidth: 250 }}>
              <InputLabel id="speed-limit-select-label">
                Stretch Location
              </InputLabel>
              <Select
                labelId="stretch-select-helper-label"
                id="stretch-select-helper"
                value={state.camera_id}
                label="Stretch Location"
                onChange={(event) => {
                  setState({ ...state, camera_id: event.target.value });
                }}
              >
                <MenuItem value="K25,K54,L56,K58,K60">
                  Indira Gandhi Statue to Sudha Home Comfort
                </MenuItem>
                <MenuItem value="C97,C98,D11,D12">
                  Rasoolpura X Roads to HPS, Begumpet
                </MenuItem>
                <MenuItem value="C21,C22,C91,C92">
                  Childern Park to Ambedkar Statue Tank Bund
                </MenuItem>
                <MenuItem value="C80,C81,C46,C47">
                  Narayanaguda X Roads to Street No. 5, Himayatnagar
                </MenuItem>
                <MenuItem value="K44,K45,K76,K77">100 Feet Rd to KPHB</MenuItem>
                <MenuItem value="K74,K75,K42,K43">KPHB to 100 Feet Rd</MenuItem>
                <MenuItem value="V01,V02">
                  Pingali Venkayya_JB 11 Right_Moqdoom Mohinuddin1 to
                  Annamacharya/JB 2_Nanayya2
                </MenuItem>
              </Select>
            </FormControl>
            {/* <Box>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              label="Violation Type"
              id="violation_type"
              name="violation_type"
              // defaultValue={search_form[rec.key_label] || ""}
              // onChange={handleChange}
              // required
              select
            >
            </TextField>
          </Box> */}
            <FormControl sx={{ px: 1, maxWidth: 100 }}>
              <TextField
                id="speed-limit-number"
                label="Speed Limit"
                type="number"
                value={state.speed_limit}
                onChange={(event) => {
                  setState({ ...state, speed_limit: event.target.value });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </FormControl>
            <Button onClick={() => onFilterSearch()}>Search</Button>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined" className={classes.card}>
              <CardContent
                component="div"
                className={[classes.dataGridCpd, classes.root]}
              >
                <Snackbar
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                  open={isSuccess}
                  autoHideDuration={2000}
                  onClose={() => {
                    setAlertSuccess(false);
                  }}
                >
                  <Alert severity="success" sx={{ width: "100%" }}>
                    Challan Sent Successfully
                  </Alert>
                </Snackbar>
                <DataGrid
                  columns={columns}
                  className={classes.dataAvgGridCls}
                  autoHeight={true}
                  headerHeight={45}
                  components={{
                    Toolbar: CustomToolbar,
                  }}
                  // getRowHeight={() => "auto"}
                  // getEstimatedRowHeight={() => 200}
                  getCellClassName={(params) => classes.cellsCls}
                  getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                  }
                  pagination
                  loading={data.loading}
                  rowCount={data.totalRows}
                  pageSize={data.pageSize}
                  rows={data.rows}
                  onPageSizeChange={(data) => {
                    updateData("page", 1);
                    updateData("pageSize", data.pageSize);
                  }}
                />
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
                        }}
                        className={classes.popupTitle}
                        position="static"
                      >
                        <div className={classes.titleCls}>Detail View</div>
                        <div className={classes.closeCls}>
                          <CloseOutlined onClick={handleCloseDialog} />
                        </div>
                      </AppBar>
                      <Grid
                        container
                        spacing={1}
                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                        sx={{ paddingLeft: "30px" }}
                      >
                        {dialogState.params &&
                          dialogState.params.violations &&
                          dialogState.params.violations.map((violation) =>
                            violation.cinfo.map((item, key, index) => (
                              <Grid item xs={6} key={key}>
                                <Typography>
                                  <img
                                    alt="plimage"
                                    width={150}
                                    src={item.lpimage}
                                  />
                                  &nbsp;&nbsp;
                                  {`${item.camera_name +
                                    " - " +
                                    moment(item.event_time).format(
                                      "DD/MM/YYYY HH:mm:ss"
                                    )
                                    }`}
                                </Typography>
                                <ImageList cols={3}>
                                  {!is_vehant ? (
                                    <ImageListItem key={index}>
                                      <img
                                        alt="image"
                                        src={`${item.images}`}
                                        srcSet={`${item.images}`}
                                        loading="lazy"
                                        onClick={() => {
                                          handleImageClick(item.images);
                                        }}
                                      />
                                    </ImageListItem>
                                  ) : (
                                    item.images.split(";").map((image, index) => (
                                      <ImageListItem key={index}>
                                        <img
                                          alt="image"
                                          src={`${image}`}
                                          srcSet={`${image}`}
                                          loading="lazy"
                                          onClick={() => {
                                            handleImageClick(image);
                                          }}
                                        />
                                      </ImageListItem>
                                    ))
                                  )}
                                </ImageList>
                              </Grid>
                            ))
                          )}
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    ) : (
      <Grid>
        <NoAccess />
      </Grid>
    )
  );
};

export default AverageSpeed;
