import React, { Fragment, useState, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { CloseOutlined } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import { themeSubjectService } from "../../utilities/theme-util";
import AlertsService from "../../services/alerts";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import LiveSystemService from "../../services/livesystem";
import CloseIcon from "@mui/icons-material/Close";
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import Tooltip from "@mui/material/Tooltip";
import MapTracking from "../map/MapTracking";
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';

import {
  Typography,
  Button,
  Modal,
  Alert,
  Card,
  Dialog,
  CardContent,
  CardActions,
  Snackbar,
  Box,
  AppBar,
  IconButton,
  Paper,
  FormControl,
  FormLabel,
  Grid,
  Input,
  TextField,
  Select,
  OutlinedInput,
  MenuItem,
  CardActionArea,
  
} from "@mui/material";
import Layer from "../map/layerlist";
import _, { forEach } from "lodash";
import SingleSelect from "../../common/select";

const useStyles = makeStyles((theme) => ({
    root: {
      "& .MuiButton-root": {
        color: "#fff !important",
      },
      [theme.breakpoints.between(750, 1400)]: {
        height: "83vh",
      },
      [theme.breakpoints.up(1401)]: {
        height: "88vh",
      },
      width: "100vw",
    },
    cpd: {
        padding: "0px  !important",
      },
    card: {
        backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
        border: "1px solid #868686 !important",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin:0,

      },
    cameraFramesSection: {
        width: "100%",
        [theme.breakpoints.between(750, 1400)]: {
          height: "10vh !important",
        },
        [theme.breakpoints.up(1401)]: {
          height: "25vh !important",
        },
    },
    historyRecordSection: {
      width: "100%",
      overflow: "auto",
      [theme.breakpoints.between(750, 1400)]: {
        height: "10vh !important",
      },
      [theme.breakpoints.up(1401)]: {
        height: "42vh !important",
      },
  },
  alertcls: {
    height:"100%",
    width: "100%",
    margin: "1px",
    padding: "1px",
    backgroundColor: `${theme.palette.primary?.alertsBgCntColor}`,
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
  timeCls: {
    fontSize: "0.8rem",
    color: theme.palette.primary.alertTimeColor,
    margin: '0px 8px'
  },
  imageListCLs: {
    // overflowY: "auto",
    margin: "4px",
    [theme.breakpoints.between(750, 1400)]: {
      height: "24.5vh !important",
      width: "42vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "25vh !important",
      width: "42vh",
    },
  },
  imageListItemCls: {
    border: "1px solid #d0d0d0",
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "24vh !important",
      margin: "3px",
    },
    "& .MuiImageListItem-img": {
      objectFit: "fill !important",
      height: '100%'
    },
  },
  itemListItemBar: {
    background: "rgba(0, 0, 0, 0) !important",
    "& .MuiImageListItemBar-title": {
      fontSize: "0px !important",
    },
    "& .MuiImageListItemBar-subtitle": {
      marginTop: "2px",
    },
    "& .MuiImageListItemBar-titleWrap": {
      padding: "2px !important",
    },
  },
  
    colorroot: {
      "& .MuiSelect-nativeInput, .MuiSelect-select .MuiBox-root": {
        display: "none",
      },
    },

    popupTitle: {
        // "& .css-fj0h64-MuiPaper-root-MuiAppBar-root":{
        //   // fontSize: "16px",
        //   // alignItems: "center",
        //   // fontWeight: "bold",
        //   // textTransform: "uppercase",
    
        // },
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        color: "#fff",
        width: "100%",
        height:"4vh",
        // margin: "0px 0px 10px",
        padding: '1vh',
      },
      closeCls: {
        margin: "0px 0px 0px auto",
      },
      frmctrlCls: {
        display: "block",
        textAlign: "left !important",
        "& .MuiInput-root": {
          marginTop: "12px",
          marginLeft: "12px",
          width: "50%",
        },
        "& .MuiFormLabel-root": {
          fontSize: "11px !important",
          lineHeight: "1em !important",
        },
        "& .MuiOutlinedInput-root": {
          width: "275px",
          marginLeft: "7px",
        },
        "& .MuiOutlinedInput-input": {
          width: "20px",
        },
      },
      titleCls: {
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "uppercase",
      },
      commonField: {
        width: "48%",
        padding: "1px 2px",
      },
      formFieldContent: {
        display: "flex",
        flexFlow: "row wrap",
        justifyContent: "space-between",
        alignItems: "center",
        width: "70%",
      },
      menuPaper: {
        maxHeight: "200px",
        overflow: "auto",
      },
    }));

const fields_display = [
       {
        key_label: "registration_num",
        plac_name: "Registration Number",
        key_type: "text",
      },
       {   
        key_label: "event_from_date",
        plac_name: "Event Date From",
        key_type: "date",
      },
      {
        key_label: "event_to_date",
        plac_name: "Event Date To",
        key_type: "date",
      },
    ];

const HotlistTrack = (props) => {
      const rowsParams = props.rowsParams;
      const [state, setState] = useState({
        data: null,
        imagesData: [],
      });
      const [open, setOpen] = React.useState(true);
      const [isSuccess, setSuccess] = useState(false);
      const classes = useStyles();
      const current_theme = useTheme();
      const [dataPageSizeRows, setDataPageSizeRows] = useState([]);
      const [layerlist, setLayerList] = useState([]);
      const [hotlistRecords, setHotlistRecords] = useState([]);
      const [themeUrl, setThemeUrl] = useState(
          "http://{????????a-c}????????.basemaps.cartocdn.com/dark_all/{????????z}????????/{????????x}????????/{????????y}????????.png"
        );
      const [isToggleOn, setIsToggleOn] = useState(false);
      const [search_form, setSearchForm] = useState({
        registration_num: "",
        event_from_date: null,
          event_to_date: null,
        });
      const [fieldsDisplayList, setFieldsDisplayList] = useState([]);
      const[points,setPoints] = useState([]);
      const[data,setData]=useState([]);
      const[locationDataMap, setLocationDataMap] =useState([]);
      const [selectedZone, setSelectedZone] = useState([]);
      const [alertstate, setAlertState] = React.useState({
        alertOpen: false,
        alertContent: "",
        vertical: "top",
        horizontal: "center",
        severity: "",
      });
      const style = {
          position: "absolute",
          top: "54%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "auto",
          bgcolor: `${current_theme.palette.mode === "light" ? "background.paper" : "#313131"
            }`,
          border: "2px solid #404145",
          boxShadow: "#00000029",
          color: "#FFF",
      };
      
          
      useEffect(() => {
        setFieldsDisplayList(fields_display);
        if (props.open) {
          const { registration_num, event_to_date, event_from_date } = search_form;
          setSearchForm({
            registration_num: rowsParams,
          });
          if ( registration_num || event_from_date || event_to_date) {
      
            setSearchForm({
              registration_num: rowsParams,
              event_from_date: null,
              event_to_date: null,
            });
          }
        }
        else {
          // Reset data when modal is closed
          setData([]);
        }

      }, [props.open]);
      const [maximizedImage, setMaximizedImage] = useState(null);
      const handleMaximize = (image) => {
        setMaximizedImage(image);
      };
    
      const handleImageClose = () => {
        setMaximizedImage(null);
      };
      const filterHotlistAlerts=(search_form)=>{
        if (search_form) {
          const fromDate = search_form?.event_from_date;
          const toDate = search_form?.event_to_date;
          const license_number =search_form?.registration_num;
          const payload = {
            fromDate: fromDate,
            toDate: toDate,
            license_number : license_number
          };
          
          LiveSystemService.getCamGeoDetails(payload)
          .then((res) => {
              const { data } = res; 
              if (data) {
                const dataaaa= data.data
                const sortedData = dataaaa.slice().sort((a, b) => a.event_id - b.event_id);
                setData(sortedData)
              }
            }
          )
          .catch((error) => {
              console.error('Error fetching data:', error);
            }
          );
        }
      };

      const handleChange = (event) => {
            setSearchForm((oldValues) => ({
              ...oldValues,
              [event.target.name]: event.target.value,
            }));
      };
        
      async function setFullImage(record) {
          if (record) {
            const date = new Date(record.date_time);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
            const day = String(date.getDate()).padStart(2, "0");
            const fullDate = `${day}-${month}-${year}`;
            await AlertsService.getImageOfAlert(record.full_image, fullDate, record.model).then((res) => {
              const { data } = res;
              if (data && data.image_base64) {
                record.full_64_image = `data:image/jpeg;base64,${data.image_base64}`;
              }
            })
            .catch((err) => console.log("get Image", err));
          }
          setDataPageSizeRows([record]);
      };
        
      const handleClose = () => {
            props.setOpen(false);
            setPoints([]);
            setData([]);
            setLocationDataMap([]);
            setDataPageSizeRows([]);
            setMaximizedImage(null);
            setIsToggleOn(false);
            if (typeof props.refreshContent == "function") {
              props.refreshContent(true);
          }
      };
        
      const searchHandler = () => {
          console.log(" alert search form", search_form);
          const { registration_num, event_to_date, event_from_date } = search_form;
          if (!registration_num &&
            !event_from_date &&
            !event_to_date) {
            return setAlertStatus("Select any field to search", true, "error");
          }
          if ((!event_from_date && event_to_date) || (event_from_date && !event_to_date)) {
            return setAlertStatus("Event From Date and Event To Date Both are required", true, "error");
          } else {
            if ((moment(event_from_date).isSame(moment(event_to_date))) ||
              (moment(event_from_date).isAfter(moment(event_to_date))) ||
              (moment(event_to_date).isBefore(moment(event_from_date)))) {
              return setAlertStatus("Start Date should be before End Date", true, "error");
            }
          }
            // registration_num = registration_num.toUpperCase()
            filterHotlistAlerts(search_form);
            // setCamMapData(search_form);
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

return(
           <Fragment>
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
                         <Modal
                           open={props.open}
                           onClose={(_, reason) => {
                             if (reason !== "backdropClick") {
                               handleClose();
                             }
                           }}
                           aria-labelledby="add-modal-title"
                           aria-describedby="add-modal-description"
                         >
                           <Grid container spacing={1} sx={{ ...style, width: "95%", height: "85%", border: "none" }}>
                             <AppBar
                               sx={{
                                 backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
                                 border: `1px solid ${current_theme.palette.mode === "light" ? "#707070" : "#404145 !important"}`,
                                 opacity: 1,
                               }}
                               position="static"
                             >
                               <Grid container className={classes.popupTitle}>
                                 <Grid item xs={10} >
                                   <Typography className={classes.titleCls}>
                                     Hotlist Tracking
                                   </Typography>
                                 </Grid>
                                 <Grid item xs={2} sx={{mt:-1.25}} textAlign="right">
                                   <IconButton onClick={() => handleClose()}>
                                     <CloseOutlined />
                                   </IconButton>
                                 </Grid>
                               </Grid>
                             </AppBar> 
            <Grid item xs={9} >
            <Grid container spacing={1} direction="column" sx={{ mt: 0.15, mb: 0.15 }}>
              <Grid item container spacing={1} alignItems="center" justifyContent="space-between" mb={0.2}>
                {fieldsDisplayList.length > 0 &&
                  fieldsDisplayList.map((rec, index) => (
                    <Fragment key={index}>
                      {rec.key_type === "text" && (
                        <Grid item xs={3}>
                          <TextField
                            variant="outlined"
                            size="small"
                            fullWidth
                            label={rec.plac_name}
                            id={rec.key_label}
                            name={rec.key_label}
                            defaultValue={search_form[rec.key_label] || ""}
                            onChange={(e) => handleChange(e)}
                          />
                        </Grid>
                      )}

                      {rec.key_type === "date" && (
                        <Grid item xs={3}>
                          <FormControl fullWidth>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <TextField
                                id="datetime-local-start"
                                type="datetime-local"
                                size="small"
                                label={rec.plac_name}
                                fullWidth
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{ max: "9999-12-31T23:59" }}
                                name={rec.key_label}
                                value={search_form[rec.key_label]}
                                onChange={(newValue) => {
                                  handleChange(newValue);
                                }}
                              />
                        </LocalizationProvider>
                      </FormControl>
                    </Grid>
                  )}
                </Fragment>
              ))}  
            <Grid container  item xs={3} sx={{ display: "flex", borderTop: "1px solid #3131317a" }}>
                      <Grid item >
                        <Button color="primary" variant="outlined" onClick={() =>  handleClose()} sx={{ mr: 1 }}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid item xs >
                        <Button color="primary" variant="contained" onClick={searchHandler}>
                          Search
                        </Button>
                      </Grid>
                      <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>Track</Typography>
                  <Switch
                    {...label}
                    
                    // checked={isToggleOn}
                    onChange={() => setIsToggleOn(!isToggleOn)}
                  />
                  
                </Stack>
                    </Grid>                
                    </Grid>
                    <Grid item container sx={{ borderTop: "1px solid #3131317a", paddingTop: 1 }} alignItems="center">
                      <Grid item sx={{ flex: "1 1 auto", color: "#000" }}>
                      </Grid>
                      <Grid item xs={12} width="70%">
                    <Grid container sx={{ border: "2px solid #e0e0e0", borderRadius: 2, overflow: "hidden", height: "72vh", margin: "2px" , width:"100%"}}>
                      {/* <MapTracking points = {points} /> */}
                      {/* <MapTracking key={JSON.stringify(points)} points={points} /> */}
                      <MapTracking data={data} checked= {isToggleOn} event_id={locationDataMap} camerasData={props.camerasData} /> 
                    </Grid>
                  </Grid>
                </Grid>
                
              </Grid>

              </Grid>
              <Grid item xs={2.94} mt ={1} marginRight={0.5} >
              <Grid item xs={12} >
              <Card variant="outlined" className={classes.card}>
                  <CardContent component="div" className={classes.historyRecordSection}>
                    <AppBar
                      sx={{
                        backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
                        border: `1px solid ${current_theme.palette.mode === "light" ? "#707070" : "#404145 !important"}`,
                        opacity: 1,
                      }}
                      position="static"
                    >
                      <Grid container className={classes.popupTitle}>
                        <Grid item xs={10}>
                          <Typography className={classes.titleCls}>Hotlist Records</Typography>
                        </Grid>
                      </Grid>
                    </AppBar>
      
                    {data.map((item, index) => (
                      <Card key={index}>
                        <CardActionArea onClick={() => { 
                          console.log('Clicked item:', item);
                          setLocationDataMap(item.event_id)
                          setFullImage(item);
                          
                        }}>
                          <CardContent>
                            <Typography variant="body2"> {index+1}{"."} License Number: {item.license_number} </Typography>
                            <Typography variant="body3"> Date: {moment(item.date_time.replace('Z','')).format('DD/MM/YYYY HH:mm:ss')} </Typography><br></br>
                            <Typography variant="body3">Camera Name: {item.camera_name}</Typography><br></br>
                            <Typography variant="body3">Police Station: {item.police_station}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
            
                </Grid>
              <Grid item xs={12} mt ={1}>
                  <Card variant="outlined" className={classes.card}>
                    <CardContent
                      component="div"
                      className={classes.cameraFramesSection}
                    >
                      <Typography
                        style={{
                          fontSize: "1rem",
                          margin: "-5px 10px -10px",
                          border: "202124",
                          color: "#fff"
                        }}
                      >
                        ALERTS - MEDIA
                      </Typography>
                      <ImageList className={classes.imageListCLs} cols={1}>
                        {dataPageSizeRows &&
                          dataPageSizeRows.length ? dataPageSizeRows.map((rec, index) => (
                            <ImageListItem
                              key={"alertimg" + index}
                              className={classes.imageListItemCls}
                            >
                              <img
                                sx={{ border: "202124", width: 'auto' }}
                                src={`${rec?.full_64_image}`}
                                srcSet={`${rec?.full_64_image}`}
                                alt={"Image Not Available"}
                                loading="lazy"
                                  />
                            <ImageListItemBar
                              className={classes.itemListItemBar}
                              title={`ID: ${rec?.license_number}`}
                              position="top"
                              actionIcon={
                                <Tooltip
                                  title="Full Image"
                                  placement="bottom"
                                  sx={{ backgroundColor: "black", color: "white" }}
                                >
                                  <IconButton
                                    sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                                    aria-label={`info about`}
                                    onClick={() => handleMaximize(rec.full_64_image)}
                                  >
                                    <CropOriginalIcon />
                                  </IconButton>
                                </Tooltip>
                              }
                            />
                            <ImageListItemBar
                              className={classes.itemListItemBar}
                              title={`${rec?.model?.toString()}`}
                              position="bottom"
                            />
                                    </ImageListItem>
                                  )) : null}
                              </ImageList>
                              {maximizedImage && (
                                <AppBar position="fixed">
                                  <Dialog open={true} onClose={handleImageClose} 
                                  sx={{
                                    "& .MuiDialog-container": {
                                      "& .MuiPaper-root": {
                                        width: "100%",
                                        maxWidth: "1200px",  
                                      },
                                    },
                                  }}>
                                    <img src={maximizedImage} alt="Image Not Available" />
                                    <IconButton
                                      sx={{ position: "absolute", top: 0, right: 0 }}
                                      onClick={handleImageClose}>
                                      <CloseIcon />
                                    </IconButton>
                                  </Dialog>
                                </AppBar>
                              )}
                              </CardContent>
                          </Card>
                        </Grid>
                        </Grid>
                         </Grid>
                         </Modal>
                       </Fragment>
                     ); 
            };


export default HotlistTrack;