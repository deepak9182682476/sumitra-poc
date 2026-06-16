import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CardActions,
  Snackbar,
  Alert,
  FormControl,
  FormLabel,
  Box,
  LinearProgress
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { ExpandMore as ExpandMoreIcon, Image as ImageIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import AlertsService from "../../services/alerts";
import _ from "lodash";
import { config_data } from "../../config/config";
// import * as data from "../../common/configuration/models_input_output.json";
import FilterListIcon from "@mui/icons-material/FilterList";
import LoadingButton from '@mui/lab/LoadingButton';
import SingleSelect from "../../common/select";
import ViolationService from "../../services/violation";
import useLoader from "../../common/loader/useLoader";
import MultipleSelect from "../../common/multiselect";

const useStyles = makeStyles((theme) => {
  return {
    //fusion CSS start
    main: {
      backgroundColor: theme.palette.primary.dropDwnBgColor,
      color: theme.palette.primary.color,
    },
    //fusion CSS stop
    tabscontainer: {
      display: "inline-block",
      paddingBottom: "0.25rem",
    },
    livetabcls: {
      display: "flex !important",
      alignItems: "center !important",
      flexDirection: "row !important",
      justifyContent: "space-evenly !important",
      fontSize: `${theme.palette.text.tabFont} !important`,
      padding: "0px",
    },
    tabcls: {
      display: "flex !important",
      alignItems: "center !important",
      flexDirection: "row !important",
      justifyContent: "space-evenly !important",
      fontSize: `${theme.palette.text.tabFont} !important`,
      padding: "7px 16px",
      "&  .MuiIconButton-root": {
        padding: "0px !important",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.3rem !important",
        padding: "2px !important",
        fill: theme.palette?.text?.primary,
      },
    },
    default_tab: {
      background: "transparent !important",
      color: `${theme.palette?.text?.primary} !important`,
    },
    active_tab: {
      color: `${theme.palette?.text?.secondary} !important`,
      background: `${theme.palette?.primary?.activeTab}  0% 0% no-repeat padding-box !important`,
      borderLeft: "1px solid #868686 !important",
      borderRight: "1px solid #868686 !important",
      "& .MuiSvgIcon-root": {
        fontSize: "1.3rem !important",
        padding: "2px !important",
        fill: theme.palette?.text?.secondary,
      },
    },
    boxcontainer: {
      width: "100%",
      overflowY: "auto",
      height: "100%",
    },
    liveContentHeight: {
      maxHeight: "14rem",
      overflowY: "scroll",
      [theme.breakpoints.between(750, 1400)]: {
        maxHeight: "30rem !important",
      },
      [theme.breakpoints.up(1401)]: {
        maxHeight: "51rem !important",
      },
    },
    filteredTabWidth: {
      padding: "0 1.75rem !important",
    },
    alertcls: {
      width: "100%",
      margin: "3px",
      padding: "3px",
      backgroundColor: `${theme.palette.primary?.alertsBgCntColor}`,
    },
    time: {
      fontSize: "0.8rem",
      color: theme.palette.primary.alertTimeColor,
      margin: '0px 8px'
    },
    accordiancls: {
      backgroundColor: `${theme.palette.primary?.alertsBgCntColor} !important`,
      color: "#FFFFFF !important",
      width: "100% !important",
      fontSize: "0.7rem",
    },
    accordianExpanded: {
      backgroundColor: "transparent !important",
      color: "#FFFFFF !important",
      width: "100% !important",
      fontSize: "0.7rem",
      minHeight: "35px !important",
    },
    hrcls: {
      borderBottom: "1px solid #868686 !important",
      margin: "0.25rem 0",
    },
    imageModal: {
      minWidth: "1000px",
    },
    popover: {
      color: "#fff !important",
      transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
      backgroundColor: "#3C3D40 !important",
    },
    datePicker: {
      maxWidth: "235px",
    },
    label: {
      margin: "0px",
    },
    cpd: {
      padding: "0 0.25rem 0.25rem 0.25rem !important",
    },
    accrdnDetails: {
      maxHeight: "14rem !important",
      overflowY: "scroll",
      width: "100%",
      marginTop: '-6px',
      padding: "0px 16px 16px 6px",
    },
    accrdnTitle: {
      maxHeight: "41px !important",
      minHeight: "41px !important",
    },
    accrdnTitleSpan: {
      fontSize: "14px",
    },
    classification: {
      display: "inline-block",
      fontSize: "0.8rem",
      float: "right",
      fontWeight: "bold",
      paddingRight: "8px",
      textTransform: 'uppercase'
    },
    regioncls: {
      padding: "8px 8px 0px",
      "& span": {
        fontSize: "1rem",
        color: "#fff"
      }
    },
    mainAlertInfo: {
      columns: "2 auto",
      fontSize: "13px !important"
    },
    accDetails: {
      padding: '4px 16px 16px !important'
    },
    accSummaryRoot: {
      minHeight: '33px !important',
      maxHeight: '33px',
      backgroundColor: '#706c6c',
      "& .MuiAccordionSummary-content.Mui-expanded": {
        margin: "0px !important"
      }
    },
    openBtn: {
      padding: '1px !important',
      "& .MuiButton-root": {
        color: '#fff',
        padding: "4px 6px !important",
        fontSize: "0.65rem",
        minWidth: "53px",
        margin: "0px 0px 0px auto",
      }
    },
    errcls: {}
  };
});

const Alerts = (props) => {
  const classes = useStyles();
  // const models = data?.default;
  const [state, setState] = useState({
    openImage: false,
    selectedImage: "",
    alertToggle: false,
    selectedAlertData: null,
    selectedTab: "live",
    expanded: false,
    openModal: false,
    startDate: moment().format("DD/MM/YYYY HH:mm"),
    endDate: moment().format("DD/MM/YYYY HH:mm"),
    liveData: [],
    filteredData: [],
    selected_models: [],
    location: "",
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    alertOpen: false
  });

  const [configModel, setConfigModel] = useState(null);
  const [modelsList, setModelsList] = useState([]);

  const [junctionList, setJunctionList] = useState([]);
  const [zoneList, setZoneList] = useState([]);
  const [psList, setPsList] = useState([]);
  const [camList, setCamList] = useState([]);

  const [locationsList, setLocationsList] = useState([]);
  const [clearValue, setClearValue] = useState(false);
  const [selected_junction, setSelJunction] = useState(null);
  const [selected_zone, setSelZone] = useState(null);
  const [selected_ps, setSelPs] = useState(null);
  const [selected_camera, setSelCam] = useState([]);
  const [caminfoList, setCamInfoList] = useState([]);

  const [openLoadingId, setOpenLoadingId] = useState(null);

  const [loader, showLoader, hideLoader] = useLoader();

  const [progress, setProgress] = React.useState(0);

  const setAlertStatus = (content, status) => {
    setState((prevstate) => ({
      ...prevstate,
      alertOpen: status,
      alertContent: content,
    }));
  };

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const handleTabChange = (event, newValue) => {
    setState({ ...state, selectedTab: newValue });
  };

  const handleExpandChange = (panel) => (event, isExpanded) => {
    setState({ ...state, expanded: isExpanded ? panel : false });
  };

  const handleModalClick = () => {
    setState({
      ...state,
      startDate: moment().subtract(4, "hours").format(),
      endDate: moment().format(),
      location: "",
      openModal: true,
    });
  };

  const handleModalClose = () => {
    setState({
      ...state,
      openModal: false,
    });
  };

  const handleAlertClick = (alert, key) => {
    // console.log('alert---------', alert);

    if (key == 'filtered') {
      setOpenLoadingId(alert.alias_id);
    }
    const model = key === 'live' ? alert.model_name : alert.model;
    const image = key === 'live' ? alert.full_image_filename : alert.image;

    AlertsService.getImageOfAlert(image, alert.date, model)
      .then((res) => {
        if (res && res.data) {
          setState({
            ...state,
            openImage: true,
            selectedAlertData:
            {
              DateTime: alert.timestamp,
              License_Number: alert.licence_number,
              Cropped_image_name: alert.cropped_image_filename,
              full_image_name: alert.full_image_filename,
              camera_name: alert.camera_name,
              color: alert.color
            },
            selectedImage: res.data.image_base64,
          });
          setOpenLoadingId(null)
        }
      })
      .catch((err) => {
        console.log("event alert click kkl", err);
        setAlertStatus("Failed to open image", true)
        setOpenLoadingId(null)
      });
  };

  const modalClose = () => {
    setState({
      ...state,
      openImage: false,
    });
  };

  const handleStartDateChange = (changedDate) => {
    const dt = changedDate.target.value;

    if (moment(dt).isSameOrBefore(state.endDate)) {
      setState({
        ...state,
        // startDate: moment(changedDate),
        startDate: dt,
        errorMessage: "",
      });
    } else {
      setState({
        ...state,
        errorMessage: "Start Date should be before End Date",
      });
    }
  };

  const handleEndDateChange = (changedDate) => {
    const dt = changedDate.target.value;

    if (moment(state.startDate).isSameOrBefore(dt)) {
      setState({
        ...state,
        endDate: dt,
        errorMessage: "",
      });
    } else {
      setState({
        ...state,
        errorMessage: "Start Date should be before End Date",
      });
    }
  };

  const handleApplyfilters = () => {
    handleModalClose();
    showLoader();
    let selected_models =
      configModel &&
      configModel.map((item) => {
        return item.id;
      });
    AlertsService.getFilteredAlerts({
      start_date: moment(state.startDate).format("YYYY-MM-DD HH:mm"),
      end_date: moment(state.endDate).format("YYYY-MM-DD HH:mm"),
      selected_models: selected_models,
      junction: selected_junction,
      zone: selected_zone,
      camera: selected_camera,
      police_station: selected_ps,
    })
      .then((response) => {
        hideLoader();
        if (response) {
          const { data } = response;

          let filteredDataArr = data.data || [];

          if (filteredDataArr.length > 100) {
            //retrieving lastest 100 records
            filteredDataArr = filteredDataArr.slice(
              filteredDataArr.length - 100,
              filteredDataArr.length
            );
          }

          let filteredData = filteredDataArr.filter((alerts) =>
            config_data.model.some(
              (cnf_model) => alerts.model === cnf_model.key
            )
          );

          let groupedData = _(filteredData)
            .groupBy((x) => x.model)
            .map((items, key) => {
              return { model: key, count: items.length, data: items };
            })
            .value();

          console.log("groupedData", groupedData);
          setState({ ...state, openModal: false, filteredData: groupedData });
        }
      })
      .catch((err) => {
        hideLoader();
        console.log("error", err);
      });
  };

  // useEffect(() => {
  //   if (props.selectedModel) {
  //     setConfigModel(props.selectedModel);
  //   }
  //   if (props.modelsList) {
  //     setModelsList(props.modelsList);
  //   }
  // }, [props.selectedModel, props.modelsList]);

  // useEffect(() => {
  //   AlertsService.getCamInfo().then((response) => {
  //     if (response) {
  //       const { data } = response?.data;
  //       setCamInfoList(data);
  //     }
  //   });

  //   if (!configModel) {
  //     setConfigModel(config_data.model);
  //   }
  //   getLocationList();

  // }, []);

  const getLocationList = () => {
    ViolationService.getLocationsList().then((response) => {
      if (response) {
        const { data } = response?.data;
        const filter_anpr_data = data.filter(rec => rec.device_type.trim() === 'ANPR')
        const arr = [];
        const zone_arr = [];

        if (filter_anpr_data && filter_anpr_data.length) {
          _.uniqBy(filter_anpr_data, 'zone').map(rec => {
            arr.push({
              id: rec.id,
              key: rec.zone,
              label: rec.zone
            })
          })
          if (caminfoList && caminfoList.length) {
            _.uniqBy(caminfoList, 'zone').map(rec => {
              if (!arr.filter(arec => arec.key === rec.zone).length) {
                zone_arr.push({
                  id: rec.id,
                  key: rec.zone,
                  label: rec.zone
                })
              }
            });
          }
          setLocationsList(filter_anpr_data);
          setZoneList([...arr, ...zone_arr]);
        }
      }
    });
  };

  // useEffect(() => {
  //   if (props.liveAlertsData) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       liveData: props.liveAlertsData,
  //     }));
  //   }
  // }, [props.liveAlertsData]);

  useEffect(() => {
    if (props.liveAlertsData.length > 0) {
      let liveDataArr = props.liveAlertsData;
      let liveDataArrRev = [];
      //console.log('liveDataArrliveDataArrliveDataArrliveDataArrliveDataArr',props.liveAlertsData[props.liveAlertsData.length-1], props.liveAlertsData.length);
      //// if (liveDataArr.length > 99) {
      //retrieving lastest records clearing first 10 records
      //liveDataArr = liveDataArr.slice(
      // liveDataArr.length - 10,
      // liveDataArr.length
      //);
      //   liveDataArr.splice(0,5);
      // console.log('arrrrrrrrr', liveDataArr.length)
      //liveDataArrRev = liveDataArr.slice(Math.max(liveDataArr.length - 1, 0));
      //} 
      //else {

      // liveDataArrRev = liveDataArr.reverse();
      // }

      // liveDataArr = liveDataArr.sort((a, b) => b.datetime - a.datetime);
      //  console.log('arrrrrrrrr', liveDataArr.length, liveDataArr[0].timestamp, liveDataArr[0].model_name);
      console.log('arrrrrrrrr', liveDataArr);

      setProgress(0);
      setTimeout(() => setProgress(100), 5000);
      setTimeout(() => setProgress(0), 1000);

      setState((prevState) => ({
        ...prevState,
        liveData: liveDataArr,
      }));

    }
  }, [props.liveAlertsData]);

  // useEffect(() => {
  //   if(state.liveData){
  //     setTimeout(() => setProgress(100), 5000);
  //   }
  // },[state.liveData])

  const GetAlertInfo = () => {
    // console.log('state.selectedAlertData', state.selectedAlertData);
    return state.selectedAlertData
      // eslint-disable-next-line array-callback-return
      ? //Object.keys(state.selectedAlertData).map((item, index) => {

      // if (item === state.selectedAlertData.model_name) {
      // eslint-disable-next-line array-callback-return
      Object.entries(state.selectedAlertData).map((alert, index) => {
        //  if (models.models[item].outputs.includes(alert[0])) {
        return (
          <div className="col-md-6 c-pd" key={index} >
            <span style={{ fontWeight: 'bold' }}> {alert[0].toUpperCase()} </span>: &nbsp;{alert[1]}
          </div>
        );
        // }
      })
      // }
      //  })
      : null
  };

  const getModelType = (key) => {
    if (modelsList && modelsList.length) {
      let filterValue =
        modelsList &&
        modelsList.find((evt) => {
          return evt.key === key ? evt.key : null;
        });
      return filterValue;
    }
  };

  const handleLocationChange = (value, key) => {
    const junction_arr = [];
    const ps_arr = [];
    const cam_arr = [];

    if (value && value.length && locationsList && locationsList.length) {
      const filter_list = locationsList.filter(rec => value.includes(rec[key]));
      _.uniqBy(filter_list, 'policestation').map(rec => {
        ps_arr.push({
          id: rec.id,
          key: rec.policestation,
          label: rec.policestation
        })
      })
      if (caminfoList && caminfoList.length) {
        _.uniqBy(caminfoList, 'police_station').map(rec => {
          if (!ps_arr.filter(arec => arec.key === rec.police_station).length) {
            ps_arr.push({
              id: rec.id,
              key: rec.police_station,
              label: rec.police_station
            })
          }
        });
      }
      _.uniqBy(filter_list, 'junction').map(rec => {
        junction_arr.push({
          id: rec.id,
          key: rec.junction,
          label: rec.junction
        })
      })
      if (caminfoList && caminfoList.length) {
        _.uniqBy(caminfoList, 'junction_name').map(rec => {
          if (!junction_arr.filter(arec => arec.key === rec.junction_name).length) {
            junction_arr.push({
              id: rec.id,
              key: rec.junction_name,
              label: rec.junction_name
            })
          }
        });
      }
      _.uniqBy(filter_list, 'camera').map(rec => {
        cam_arr.push({
          id: rec.id,
          key: rec.camera,
          label: rec.camera
        })
      })
      if (caminfoList && caminfoList.length) {
        _.uniqBy(caminfoList, 'camera_name').map(rec => {
          if (!cam_arr.filter(arec => arec.key === rec.camera_name).length) {
            cam_arr.push({
              id: rec.id,
              key: rec.camera_name,
              label: rec.camera_name
            })
          }
        });
      }

      setJunctionList(junction_arr);
      setPsList(ps_arr);
      setCamList(cam_arr)
    }
  }


  return (
    <Grid container direction="column" >
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={alertOpen}
        autoHideDuration={1000}
        onClose={() =>
          setState((prevstate) => ({ ...prevstate, alertOpen: false }))
        }
      >
        <Alert
          onClose={() =>
            setState((prevstate) => ({ ...prevstate, alertOpen: false }))
          }
          severity="error"
        >
          {alertContent}
        </Alert>
      </Snackbar>
      <Grid className={classes.tabscontainer} container >
        <Tabs
          variant="fullWidth"
          value={state.selectedTab}
          onChange={handleTabChange}
          selectionFollowsFocus
        >
          <Tab
            className={[
              classes.livetabcls,
              state.selectedTab === "live"
                ? classes.active_tab
                : classes.default_tab,
            ].join(" ")}
            label={<> LIVE EVENTS </>}
            value="live"
          />
          {/* <Tab
            className={[
              classes.tabcls,
              state.selectedTab === "filtered"
                ? classes.active_tab
                : classes.default_tab,
            ].join(" ")}
            label={
              <>FILTERED EVENTS {" "}
                <IconButton
                  aria-label={`info about`}
                  onClick={() => handleModalClick()}
                  size="small"
                >
                  <FilterListIcon />
                </IconButton>
              </>
            }
            value="filtered"
          /> */}
        </Tabs>
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      </Grid>
      < Grid
        role="tabpanel"
        hidden={state.selectedTab !== "live"}
        id={`wrapped-tabpanel-${state.selectedTab}`}
      >
        <Grid
          className={`${classes.cpd} ${classes.liveContentHeight}`}
          container
          justify="space-evenly"
        >
          {
            state.liveData.length > 0 &&
            state.liveData.map((alertRes, index) => {
              return (
                <Grid
                  className={classes.alertcls}
                  key={index}
                >

                  <Card >
                    <CardActions className={classes.openBtn}>
                      <Typography variant="body2" className={classes.regioncls}>
                        <span>{alertRes?.camera_name} {">"} {alertRes?.model_name}</span>
                      </Typography>
                      <Button variant="contained" size="small" color="primary" onClick={() => handleAlertClick(alertRes, 'live')}>
                        Open
                      </Button>
                    </CardActions>
                    <span
                      className={`${classes.classification}`}
                      style={{
                        color: `${getModelType(alertRes.model_name)?.color}`,
                      }}
                    >
                      {getModelType(alertRes.model_name)?.label}
                    </span>
                    <span className={classes.time}>
                      {alertRes?.license_number}&nbsp;&nbsp;&nbsp;{alertRes?.color}
                    </span>
                    <br></br>
                    <span className={classes.time}>
                      {/* {moment(alertRes?.time).format("MMM Do, h:mm a")} */}
                      {/* {moment.unix(alertRes?.time).format("MMM Do, h:mm a")} */}
                      {/* {alertRes.date} */}
                      {/* {new Date(alertRes.time / 1000).toLocaleString()} 
                       */}
                      {/* index - {index + 1} */}
                      {moment(alertRes?.timestamp).format('YYYY/MM/DD HH:mm:ss')}
                    </span>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
        < Dialog
          classes={{ paper: classes.imageModal }}
          open={state.openImage}
          onClose={modalClose}
          size={"lg"}
        >
          <DialogContent>
            <Grid container >
              <Card>
                <CardMedia
                  component="img"
                  alt="image"
                  image={`data:image/png;base64,${state.selectedImage}`}
                />
                {/* <CardContent>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                      className={classes.accSummaryRoot}
                    >
                      <Typography>More Info</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.accDetails}>
                      <Typography className={classes.mainAlertInfo}>
                        <GetAlertInfo />
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </CardContent> */}
              </Card>
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
      <Grid
        role="tabpanel"
        hidden={state.selectedTab !== "filtered"}
        id={`wrapped-tabpanel-${state.selectedTab}`}
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ padding: '7px' }}
        >
          {
            state.filteredData && state.filteredData.length ?
              state.filteredData.map((classification, index) => {
                return (
                  <Accordion
                    key={index}
                    className={
                      state.expanded
                        ? classes.accordianExpanded
                        : classes.accordiancls
                    }
                    expanded={state.expanded === "panel_" + index}
                    onChange={handleExpandChange("panel_" + index)}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon />}
                      aria-controls={"panel-content-" + index}
                      className={classes.accrdnTitle}
                      id={"panel-header-" + index}
                      key={index}
                    >
                      <Typography
                        key={index}
                        className={classes.accrdnTitleSpan}
                        component="div"
                      >
                        {getModelType(classification.model).label}(
                        {classification.count})
                      </Typography>
                    </AccordionSummary>
                    < AccordionDetails
                      key={index}
                      className={classes.accrdnDetails}
                    >
                      <hr className={classes.hrcls} />
                      < Typography key={index} component="div" >
                        {classification &&
                          classification.data.map((alert, index) => {
                            return (
                              <Grid
                                // onClick={() => handleAlertClick(alert)}
                                className={classes.alertcls}
                                key={index}
                              >
                                {/* <Typography variant="body2">{`${alert.camera_name}`}</Typography>
                              <p className={classes.time}>
                                {new Date(alert.created_on).toLocaleString()}
                              </p> */}
                                < Card >
                                  <Typography variant="body2" className={classes.regioncls} >
                                    <span>{alert?.camera_name} </span>
                                  </Typography>
                                  < span className={classes.time} >
                                    {new Date(alert.created_on).toLocaleString()}
                                  </span>
                                  < CardActions className={classes.openBtn} >
                                    <LoadingButton
                                      loading={openLoadingId === alert.alias_id}
                                      loadingPosition="start"
                                      variant="outlined"
                                      startIcon={< ImageIcon />}
                                      onClick={() => handleAlertClick(alert, 'filtered')}
                                    >
                                      {/* <Button variant="contained" size="small" color="primary" onClick={() => handleAlertClick(alert, 'filtered')}> */}
                                      Open
                                      {/* </Button> */}
                                    </LoadingButton>
                                  </CardActions>
                                </Card>
                              </Grid>
                            );
                          })}
                      </Typography>
                      < Dialog
                        classes={{ paper: classes.imageModal }}
                        open={state.openImage}
                        onClose={modalClose}
                        size={"lg"}
                      >
                        <DialogContent>
                          <Grid container >
                            <Card>
                              <CardMedia
                                component="img"
                                alt="image"
                                image={`data:image/png;base64,${state.selectedImage}`}
                              />
                              < CardContent >
                                <Accordion>
                                  <AccordionSummary
                                    expandIcon={
                                      <ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                    className={classes.accSummaryRoot}
                                  >
                                    <Typography>More Info </Typography>
                                  </AccordionSummary>
                                  < AccordionDetails className={classes.accDetails} >
                                    <Typography className={classes.mainAlertInfo}>
                                      <GetAlertInfo />
                                    </Typography>
                                  </AccordionDetails>
                                </Accordion>
                              </CardContent>
                            </Card>
                          </Grid>
                        </DialogContent>
                      </Dialog>
                    </AccordionDetails>
                  </Accordion>
                );
              }) :
              <div>No Data Found </div>
          }
        </Grid>
      </Grid>
      {
        state.openModal ? (
          <Dialog
            open={state.openModal}
            onClose={handleModalClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            size={"lg"}
          >
            <DialogContent>
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                spacing={1}
              >
                <Grid item xs={6} >
                  {/* <p className={classes.label}>From</p> */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      renderInput={(params) => <TextField size="small" {...params} />}
                      value={state.startDate}
                      onChange={(newValue) => {
                        handleStartDateChange(newValue);
                      }}
                    />
                  </LocalizationProvider>


                  {/*<FormControl className={classes.frmctrlCls}>
                    <FormLabel>From </FormLabel>
                    < LocalizationProvider dateAdapter={AdapterDateFns} >
                      <TextField
                        id="datetime-local-start"
                        type="datetime-local"
                        size="small"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                          maxDate: moment().format("YYYY-MM-DD HH:mm")
                        }}
                        value={state.startDate}
                        name="from-filter"
                        onChange={(newValue) => {
                          handleStartDateChange(newValue);
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl> */}
                </Grid>
                <Grid item xs={6} >
                  {/* <p className={classes.label}>To</p> */}
                  {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    renderInput={(params) => <TextField size="small" {...params} />}
                    value={state.endDate}
                    onChange={(newValue) => {
                      handleEndDateChange(newValue);
                    }}
                  />
                </LocalizationProvider> */}
                  <FormControl className={classes.frmctrlCls}>
                    <FormLabel>To </FormLabel>
                    < LocalizationProvider dateAdapter={AdapterDateFns} >
                      <TextField
                        id="datetime-local-start"
                        type="datetime-local"
                        size="small"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                          maxDate: moment().format("YYYY-MM-DD HH:mm:ss")
                        }}
                        inputProps={{ max: "9999-12-31T23:59" }} 
                        value={state.endDate}
                        name="to-filter"
                        onChange={(newValue) => {
                          handleEndDateChange(newValue);
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={6} >
                  <p className={classes.label}> zone </p>
                  < MultipleSelect
                    variant="contained"
                    size="small"
                    width="100%"
                    addDefault={true}
                    options={zoneList}
                    label={'zone'}
                    name={'zone'}
                    filterOpts={false}
                    setModel={(vals) => {
                      if (vals && vals.length) {
                        let arr = vals.map(rec => rec.key);
                        setSelZone(arr);
                        handleLocationChange(arr, 'zone');
                      }
                    }}
                    classes={{ root: classes.colorroot }}>
                  </MultipleSelect>
                </Grid >
                < Grid item xs={6} >
                  <p className={classes.label}> Police station </p>
                  <MultipleSelect
                    variant="contained"
                    size="small"
                    width="100%"
                    addDefault={true}
                    options={psList}
                    label={'police station'}
                    name={'police_station'}
                    filterOpts={true}
                    setModel={(vals) => {
                      if (vals && vals.length) {
                        let arr = vals.map(rec => rec.key);
                        setSelPs(arr);
                      }
                    }}
                    classes={{ root: classes.colorroot }}
                  >
                  </MultipleSelect>
                </Grid>
                < Grid item xs={6} >
                  <p className={classes.label}> Junction </p>
                  < MultipleSelect
                    variant="contained"
                    size="small"
                    width="100%"
                    addDefault={true}
                    options={junctionList}
                    label={'junction'}
                    name={'junction_name'}
                    filterOpts={true}
                    setModel={(vals) => {
                      if (vals && vals.length) {
                        let arr = vals.map(rec => rec.key);
                        setSelJunction(arr);
                      }
                    }}
                    classes={{ root: classes.colorroot }}
                  > </MultipleSelect>
                </Grid>
                < Grid item xs={6} >
                  <p className={classes.label}> Camera </p>
                  < MultipleSelect
                    variant="contained"
                    size="small"
                    width="100%"
                    addDefault={true}
                    options={camList}
                    label={'camera'}
                    name={'camera_name'}
                    filterOpts={true}
                    setModel={(vals) => {
                      if (vals && vals.length) {
                        let arr = vals.map(rec => rec.key);
                        setSelCam(arr);
                      }
                    }}
                    classes={{ root: classes.colorroot }}
                  > </MultipleSelect>
                </Grid>
                < Grid item xs={12} >
                  <Box sx={{ width: '100%', overflow: 'hidden', padding: '4px', border: '1px solid #d0d0d0' }}>
                    <Typography variant="h6" sx={{ fontSize: '16px' }} >
                      Selected Models
                    </Typography>
                    < Typography variant="body1" sx={{ width: '100%', fontSize: '13px', maxHeight: 50, minHeight: 50, overflowY: 'auto', scrollbarWidth: 'thin' }} gutterBottom >
                      {configModel && configModel.length ? configModel.map(rec => rec.label).join(',') : null}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            < DialogActions >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              < Button
                variant="contained"
                color="primary"
                onClick={handleApplyfilters}
                autoFocus
              >
                Apply Filters
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
    </Grid>
  );
};

export default Alerts;