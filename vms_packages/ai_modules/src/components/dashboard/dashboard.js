import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CardHeader,
  IconButton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Alerts from "../alerts/alerts";
import LiveSystem from "../livesystem/livesystem";
import Frames from "../classified_frames/frames";
import Analytics from "../analytics/analytics";
import LiveSystemService from "../../services/livesystem";
import { Controls, FullScreenControl, ZoomInOutControl } from "../map/controls";
import { CamerasLayer, DensityLayer, Layers, TileLayer, CommisionerateLayer, PSLayer, CamerasListLayer, AlertsLayer, ClusterLayer } from "../map/layers";
import Map from "../map/map";
import { MAP_CONFIG } from "../../config/map/map";
import ModelsService from "../../services/models";
import CameraService from "../../services/camera";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import { themeSubjectService } from "../../utilities/theme-util";
import { socket_client } from "../../services/socket";
import _ from "lodash";
import AlertTranscationPopup from "../layout/AlertTranscationPopup";
import NoAccess from "../../common/NoAccess";
import { local_anpr_user } from "../../config/config";
import AlertsService from "../../services/alerts";
import { getLocalStorage } from "../../utilities/common-util";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      height: "75vh",
      width: "100vw",
      marginLeft: "-1px",
      fontSize: "0.9rem !important",
      marginTop: "2px",
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
    },
    camerafeedSection: {
      height: "90vh",
      padding: '0px !important',
      flex: 1,
    },
    camerafeedSectionCommonOne: {
      height: "48vh",
      padding: "0px 0px",
      marginBottom: "4px"
    },
    camerafeedSectionCommonTwo: {
      height: "38.75vh",
      padding: "3px 0px",
      [theme.breakpoints.up(1401)]: {
        height: "42.4vh !important",
      },
    },
    alertsSection: {
      height: "100vh",
      flex: 1,
      padding: '0px 0px 0px 0px !important',
      [theme.breakpoints.up(1401)]: {
        height: "90.5vh !important",
      },
    },
    imagesData: {
      height: "50vh",
    },

    framesSection: {
      height: "36vh",
      [theme.breakpoints.between(750, 1400)]: {
        height: "36h !important",
      },
      [theme.breakpoints.up(1401)]: {
        height: "42vh !important",
      },
    },
    cpd: {
      padding: "0px !important",
    },
    mapCpd: {
      padding: "0px !important",
      // border: "#fff !important",
    },
    btmcpd: {
      padding: "0px !important",
    },
    topcpd: {
      padding: "2px !important",
      height: "50%",
    },
    analyticsCls: {
      paddingInlineStart: "7px !important",
    },
    card: {
      backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
      border: "1px solid #868686 !important",
      height: "100%",
      maxHeight: "100%",
      width: "100%",
      "& .MuiCardHeader-root": {
        padding: "2px 12px !important",
      },
      "& .MuiTypography-root": {
        fontSize: "13px !important",
        color: `${theme.palette?.primary?.title}`,
      },
    },
    liveSystemcard: {
      backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
      border: "1px solid #868686 !important",
      height: "100%",
      maxHeight: "100%",
      width: "100%",
      "& .MuiCardHeader-root": {
        padding: "2px 12px !important",
      },
      "& .MuiTypography-root": {
        fontSize: "13px !important",
        color: `${theme.palette?.primary?.title}`,
      },
    },
    maincontent: {
      display: "flex !important",
      width: "100% !important",
      height: "100%",
      maxHeight: "100%",
    },
    selections: {
      display: "flex",
    },
  };
});


const Dashboard = (props) => {
  const [state, setState] = useState({
    data: null,
    layerlist: [],
    imagesData: [],
    liveAlertsData: [],
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    modelAlertInfo: []
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [cameraList, setCameraList] = useState(null);

  const [featureCollection, setFeatureCollection] = useState([]);
  const [selectedModel, setSelectedModel] = useState([]);
  const [themeUrl, setThemeUrl] = useState(
    // "http://115.244.46.177:6703/map/tile/10/733/462.png"
    // "http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    "http://10.66.40.60:6090/tile/{z}/{x}/{y}.png"
  );
  const [modelsData, setModelsData] = useState([]);
  const [frameSelectModelId, setFrameSelectModelId] = useState(null);
  const [isHotlistAlert, setHotlistAlert] = useState(false);
  const [hotlistAlertList, setHotlistAlertList] = useState([]);
  const [hotlistAlertData, setHotlistAlertData] = useState([]);
  const [hotlistAlerts, setHotlistAlerts] = useState([]);


  const [layerlist, setLayerList] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState({
    commissionerateLayer: true,
    psLayer: true,
    camerasLayer: true,
    hotlistAlertLayer: false,
    clusterLayer: true
  });

  const classes = useStyles();

  function setInitialData() {
    LiveSystemService.getAnalysisData()
      .then(async (response) => {
        if (response) {
          const { data } = response;
          // let configured_data = await configuredData(data, null);
          // let MapData = configured_data.violationsMapData;
          setState((prevstate) => ({ ...prevstate, data: data }));
          setAnalyticsData(data);
          if (data.geo_data) {
            setFeatureCollection(data.geo_data);
          }
        }
      })
      .catch((err) => console.log("err", err));
  }

  useEffect(() => {
    if (frameSelectModelId) {
      // getRecentImages();
    }
  }, [frameSelectModelId]);

  useEffect(() => {
    let hostlist_list = [];
    themeSubjectService.getThemeSubject().subscribe((mode) => {
      mode === "light"
        ? setThemeUrl(
          "http://10.66.40.86:5101/styles/osm-bright/{z}/{x}/{y}.png"
        )
        : setThemeUrl(
          // "http://115.244.46.177:6703/map/tile/10/733/462.png"
          // "http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          // "http://172.20.1.51:6090/tile/{z}/{x}/{y}.png"
          "http://10.66.40.60:6090/tile/{z}/{x}/{y}.png"
        );
    });
    ModelsService.gethotlistGroup()
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data && data.data) {
            let eventInfo = data.data;
            if (eventInfo && eventInfo.length) {
              let data = eventInfo;
              hostlist_list = data;
              setHotlistAlerts(data);
            }
          }
        }
      })
      .catch((err) => {
        console.log("hotalerts error", err);
      });
    ModelsService.getCamLinkedModels()
      .then((response) => {
        if (response) {
          const { data } = response.data;
          if (data && data.length) {
            setModelsData(data);
          }
        }
      })
      .catch((err) => console.log("error", err));
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
    setInitialData();
    // getRecentImages();

    AlertsService.gethotlistAlerts()
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data && data.data) {
            let eventInfo = data.data;
            eventInfo.forEach((rec, index) => {
              rec.id = index + 1;
              if (!rec.status) {
                rec.status = "New";
              }
            });
            const sortedData = eventInfo.slice().sort((a, b) => a.event_id - b.event_id);
            setHotlistAlertData(sortedData);
          }
        }
      })
      .catch((err) => console.log("error", err));

    // let count = 1;
    // const client = socket_client;

    // client.onopen = () => {
    //   client.send('{"topic": "subscribe", "to": "newPrices"}');
    // };

    // client.onmessage = (message) => {

    //   if (message.data) {
    //     const data = JSON.parse(message.data);
    //     //console.log('message', message.data);
    //     const data1 = { "model_id": 76, "model_name": "hyd-anpr", "camera_id": 290, "camera_name": "Pillar-no-23-Rethibowli-x-road4", "alert_type": "ANPR", "violation_type": "ANPR", "date": "18-06-2024", "time": "1718700187203480", "timestamp": "2024-06-18 08:43:07.203480", "full_image_filename": "hyd-anpr_Pillar-no-23-Rethibowli-x-road4_2024-06-18 08:43:07.203480_full.jpg", "cropped_image_filename": "hyd-anpr_Pillar-no-23-Rethibowli-x-road4_2024-06-18 08:43:07.203480_cropped.jpg", "license_number": "TS13EH0541", "ps_name": "Afzal gunj", "junction_name": "Pillar-no-23", "zone": "Central", "commisionerate": "Hyderabad", "color": "black" }

    //     if (data) {
    //       const alertInfo = {
    //         camera_id: data.camera_id,
    //         time: data.time,
    //       };


    //       setState((prevState) => ({
    //         ...prevState,
    //         liveAlertsData: [data, ...prevState.liveAlertsData],
    //         imagesData: [...prevState.imagesData, data],
    //         modelAlertInfo: alertInfo,
    //       }));
    //       // let configured_data = await configuredData({geo_data: [data]}, null);
    //       // let MapData = configured_data.violationsMapData;
    //       setFeatureCollection([data]);
    //       let is_hotlist = false;
    //       //console.log('hostlist_list', hostlist_list);
    //       let idx = hostlist_list.findIndex(rec => rec.registration_number === data.license_number);

    //       // if (idx !== -1 || count == 1) {
    //       //count = count + 1;
    //       if (idx !== -1) {

    //         is_hotlist = true;
    //       }
    //       if (is_hotlist) {
    //         console.log('hotlist alert !!');
    //         setHotlistAlert(true);
    //         const objAlert = Object.assign(data, { category: hostlist_list[idx]?.category || 'ANPR' })
    //         setHotlistAlertList([objAlert]);
    //         //setHotlistAlertList([data]);
    //       }
    //     }
    //   }
    // };

    // client.onclose = (reasonCode, description) => console.log("conn closed", reasonCode, description);

    // client.onerror = (err) => console.log("conn error", err);

    // const interval = setInterval(() => {
    fetchEventsData(hostlist_list);
    //  }, 5000);
    //  return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    console.log('state.liveAlertsData.length', state.liveAlertsData.length);
    if (state.liveAlertsData.length && state.liveAlertsData.length > 100) {
      const arr = state.liveAlertsData.slice(0, 20);
      // console.log('-------------------',arr.length);
      setState((prevState) => ({
        ...prevState,
        liveAlertsData: arr
      }));
    }
    setTimeout(() => {
      console.log('hotlistAlerts', hotlistAlerts)
      if (hotlistAlerts && hotlistAlerts.length) {
        console.log('called 1');
        fetchEventsData(hotlistAlerts);
      }
    }, 5000);
  }, [state.liveAlertsData])

  const fetchEventsData = async (hostlist_list) => {
    //console.log('typeof AlertsService.getLiveEvents', typeof AlertsService.getLiveEvents, AlertsService);
    if (typeof AlertsService.getLiveEvents === "function") {

      AlertsService.getLiveEvents()
        .then((res) => {
          const { data } = res?.data || [];
          const data_Set = data.map(rec => rec.data_set);
          console.log('datadata', data_Set);
          setState((prevState) => ({
            ...prevState,
            liveAlertsData: data_Set,
            // imagesData: [...prevState.imagesData, data],
            // modelAlertInfo: alertInfo,
          }));
          let is_hotlist = false;
          //       //console.log('hostlist_list', hostlist_list);
          let idx = hostlist_list.findIndex(rec => rec.registration_number === data.license_number);
          if (idx !== -1) {
            is_hotlist = true;
          }
          if (is_hotlist) {
            console.log('hotlist alert !!');
            setHotlistAlert(true);
            const objAlert = Object.assign(data, { category: hostlist_list[idx]?.category || 'ANPR' })
            setHotlistAlertList([objAlert]);
            //setHotlistAlertList([data]);
          }
        }
        ).catch((err) => {
          console.log(err);
          setTimeout(() => {
            console.log('called 2');
            fetchEventsData(hostlist_list);
          }, 5000);
        })
    }
  }

  const setModel = (model) => {
    setSelectedModel(model);
  };

  // eslint-disable-next-line no-unused-vars
  // const getCallbackData = (data) => {
  //   if (data) {
  //     let dataObj = data.slice(1, data.length - 1);
  //     let parsedDataObj = JSON.parse(dataObj);
  //     if (parsedDataObj) {
  //       setState((prevState) => ({
  //         ...prevState,
  //         // imagesData: res.data,
  //         liveAlertsData: [...prevState.liveAlertsData, data],
  //         imagesData: [...prevState.imagesData, data],
  //       }));
  //     }
  //   }
  // };

  // const getRecentImages = () => {
  //   const selected_id = frameSelectModelId
  //     ? frameSelectModelId
  //     : selectedModel.length
  //       ? selectedModel[0].id
  //       : "";
  //   if (selected_id) {
  //     AlertsService.getRecentImages({ model_id: selected_id }).then((res) => {
  //       if (res && res.data) {
  //         setState((prevstate) => ({
  //           ...prevstate,
  //           imagesData: res.data,
  //         }));
  //       }
  //     });
  //   }
  // };

  const setAlertStatus = (content, status) => {
    setState((prevstate) => ({
      ...prevstate,
      alertOpen: status,
      alertContent: content,
    }));
  };

  const { alertOpen, vertical, horizontal, alertContent } = state;

  /*const RenderMapComponent = () => {
    return useMemo(
      () => <DensityLayer features={featureCollection} />,
      [state.liveAlertsData, featureCollection]
    );
  };*/

  // eslint-disable-next-line no-unused-vars
  /*const RenderAnalyticsComponent = () => {
    return useMemo(
      () => (
        <Analytics
          cameraList={cameraList}
          analyticsData={analyticsData}
          selectedModel={selectedModel}
        />
      ),
      [state.liveAlertsData][state.imagesData]
    );
  }; */

  return (
    //local_anpr_user('activity_info', 'activity_name', 'Home') ? (
    <Grid
      container
      justifyContent="space-evenly"
      //salignItems="center"
      className={classes.root}
      spacing={0.5}
    >
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
      {isHotlistAlert && getLocalStorage('hotlist_view') && local_anpr_user('activity_info', 'activity_name', 'Hotlist Alert View') ?
        <AlertTranscationPopup
          alertList={hotlistAlertList}
          closeAlert={val => setHotlistAlert(val)} />
        : null
      }
      <Grid
        item
        xs={6}
        direction="column"
        className={classes.camerafeedSection}
      >
        <Grid item xs={12} className={classes.camerafeedSectionCommonOne}>
          <Card variant="outlined" className={classes.liveSystemcard}>
            <CardContent component="div" className={classes.topcpd}>
              <LiveSystem //react component
                cameraList={cameraList}
                modelsList={modelsData}
                setModel={(model) => setModel(model)}
                selectedModel={selectedModel}
                setAlertStatus={(content, status) =>
                  setAlertStatus(content, status)
                }
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} className={classes.camerafeedSectionCommonTwo}>
          <Card variant="outlined" className={classes.liveSystemcard}>
            <CardContent component="div" className={classes.mapCpd}>
              <Map
                center={MAP_CONFIG.mapProps.DefaultCenter}
                zoom={12}
                projection={MAP_CONFIG.mapProps.Projection}
                setSelectedLayers={setSelectedLayers} 
                selectedLayers={selectedLayers}
              >
                <Layers>
                  <TileLayer themeUrl={themeUrl} />
                  {/* <CamerasLayer layer={layerlist[0]} /> */}
                  <CommisionerateLayer geoJsonUrl='Commisionerate_Boundary.geojson' visibility={selectedLayers.commissionerateLayer}/>
                  <PSLayer geoJsonUrl='PS_Boundary.geojson' visibility={selectedLayers.psLayer}/>
                    {/* <CamerasListLayer camerasData={cameraList} visibility={selectedLayers.camerasLayer}/>
                    <AlertsLayer alertsData={hotlistAlertData} visibility={selectedLayers.hotlistAlertLayer}/> */}
                  <ClusterLayer camerasData={cameraList} alertsData={hotlistAlertData} cameraVisibility={selectedLayers.camerasLayer} alertVisibility={selectedLayers.hotlistAlertLayer} />
                </Layers>
                <Controls>
                  {/* <ZoomInOutControl /> */}
                  <FullScreenControl />
                </Controls>
              </Map>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={5.9} className={classes.alertsSection}>
        <Card variant="outlined" className={classes.card}>
          <CardContent component="div" className={classes.cpd}>
            <Alerts
              liveAlertsData={state.liveAlertsData}
              selectedModel={selectedModel}
              cameraList={cameraList}
              modelsList={modelsData}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* <Grid item xs={3} className={classes.imagesData}>
        <Card variant="outlined" className={classes.card}>
          <CardContent component="div" className={classes.mapCpd}>
            <Frames
              imagesData={state.imagesData}
              modelAlertInfo={state.modelAlertInfo}
              selectedModel={selectedModel}
              // setFrameSelected={(val) => {
              //   if (val) {
              //     setFrameSelectModelId(val);
              //   }
              // }}
            />
          </CardContent>
        </Card>
      </Grid> */}

      {/* <Grid item xs={12}>
        <Grid container direction="column">
          <Grid item className={classes.framesSection}>
            <Card variant="outlined" className={classes.card}>
              <CardContent component="div" className={classes.btmcpd}>
                <Grid container spacing={1.5}>

                  <Grid item xs={4}>
                    <CardHeader
                      action={
                        <IconButton aria-label="settings">
                          <OpenWithIcon />
                        </IconButton>
                      }
                      title="Map"
                    />
                    <CardContent component="div" className={classes.mapCpd}>
                      <Map
                        center={MAP_CONFIG.mapProps.DefaultCenter}
                        zoom={12}
                        projection={MAP_CONFIG.mapProps.Projection}
                      >
                        <Layers>
                          <TileLayer themeUrl={themeUrl} />
                          <CamerasLayer themeUrl={themeUrl} />
                          <RenderMapComponent />
                        </Layers>
                        <Controls>
                          <ZoomInOutControl />
                          <FullScreenControl />
                        </Controls>
                      </Map>
                    </CardContent>
                  </Grid>
                   <Grid item xs={8} className={classes.analyticsCls}>
                    <Analytics
                      cameraList={cameraList}
                      analyticsData={analyticsData}
                      selectedModel={selectedModel}
                    />
                  </Grid> 
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid> */}
    </Grid>
    //    ) : (
    //     <Grid>
    //       <NoAccess />
    //      </Grid>
    //   )
  );
};

export default Dashboard;