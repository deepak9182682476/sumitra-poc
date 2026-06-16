import React, { Fragment, useState } from "react";
import { makeStyles, useTheme } from "@mui/styles";

import {
  Typography,
  Button,
  Modal,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  Card,
  CardContent,
  AppBar,
  IconButton,
} from "@mui/material";
import { border, Box } from "@mui/system";
import CamerasInformation from "./cameras_information";
import SettingsMain from "./settings_main";
import CameraService from "../../../services/camera";
import { CloseOutlined } from "@mui/icons-material";
import ModelsService from "../../../services/models";

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
  },
  titleCls: {
    margin: "5px 0px auto auto",
  },
  uploadscard: {
    backgroundColor:
      theme.palette.mode === "light" ? "#FFFFFF" : "#313131 !important",
    color: "#fff !important",
    border: "none !important",
    borderRadius: "0px !important",
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
  cellsCls: {
    color: "#fff !important",
  },
  stepperCls: {
    "& .Mui-active": {
      color: "#37720B !important",
    },
    color: theme.palette.text.primary,
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
  continueButton: {
    backgroundColor: "#37720B",
    "&:hover": {
      backgroundColor: "#37720B !important",
      border: "none !important",
    },
  },
  confirmationText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: theme.palette.commomn.black,
    height: "100%",
    padding: 10,
  },
}));

const CameraStepsModel = (props) => {
  const [state, setState] = useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  const [isSuccess, setSuccess] = useState(false);

  const classes = useStyles();

  const { alertOpen, vertical, horizontal, alertContent } = state;
  const steps = [
    "Camera Information",
    "Model Selection",
    "Camera Settings",
    "Param Settings",
    "Confirmation",
  ];

  const handleNext = (isFinish) => {
    const { camerasList, currentObj, objList, activeStep, cameraIpRtsp } =
      props;

    if (isFinish) {
      let idx = camerasList.findIndex((rec) => rec.id === currentObj.camera_id);
      currentObj.camera_information = camerasList[idx];
      const params = currentObj;
      console.log("finish params", params);
      if (!params.camera_information.camera_alias_id) {
        const generateRandomChar = () => {
          const chars =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          return chars[Math.floor(Math.random() * chars.length)];
        };
        const generateRandomString = (length) => {
          let result = "";
          for (let i = 0; i < length; i++) {
            result += generateRandomChar();
          }
          return result;
        };
        while (true) {
          const randomString = generateRandomString(5);
          let idx = props.aliasIdList.findIndex(
            (val) => val === `LTTS-ANPR-${randomString}`
          );
          if (idx === -1) {
            const idList = props.aliasIdList;
            idList.push(`LTTS-ANPR-${randomString}`);
            props.setAliasIdList(idList);
            params.camera_information.camera_alias_id = `LTTS-ANPR-${randomString}`;
            break;
          }
        }
      }
      if (props.mode === "add") {
        CameraService.saveCameras(params)
          .then((res) => {
            if (res && res.data) {
              const { data, error, statusCode } = res.data;
              if (error && statusCode === 500) {
                setState({
                  ...state,
                  alertOpen: true,
                  alertContent: "Failed to Save Camera",
                });
                setSuccess(false);
                return;
              }
              const model = props.modelsData.find(
                (val) => val.id === params.model_settings.model_id
              );
              const model_data = [
                {
                  name: params.model_settings.model_name,
                  server_ip: model.server_ip,
                },
              ];
              if (model_data && model_data.length) {
                console.log(model_data);
                ModelsService.modelRestart({ model_data })
                  .then((restartResponse) => {
                    console.log("Model restart successful", restartResponse);
                  })
                  .catch((restartError) => {
                    console.error("Error restarting models", restartError);
                  });
              }
              setState({
                ...state,
                alertOpen: true,
                alertContent: "Successfully Camera Saved",
              });
              setSuccess(true);
              console.log("camera finish save response", data);

              handleClose();
            }
          })
          .catch((err) => {
            handleBack();
            setState({
              ...state,
              alertOpen: true,
              alertContent: "Failed to Save Camera",
            });
            console.log("camera finish service add", err);
          });
      } else if (props.mode === "edit") {
        CameraService.updateCameras(params)
          .then((res) => {
            if (res && res.data) {
              const { data, error, statusCode } = res.data;
              if (error && statusCode === 500) {
                setState({
                  ...state,
                  alertOpen: true,
                  alertContent: "Failed to Update Camera",
                });
                setSuccess(false);
                return;
              }
              const model = props.modelsData.find(
                (val) => val.id === params.model_settings.model_id
              );
              const model_data = [
                {
                  name: params.model_settings.model_name,
                  server_ip: model.server_ip,
                },
              ];
              if (params.model_settings.model_name !== params.origModel) {
                const oldModel = props.modelsData.find(
                  (val) => val.model_name === params.origModel
                );
                model_data.push({
                  name: params.origModel,
                  server_ip: oldModel.server_ip,
                });
              }
              if (model_data && model_data.length) {
                console.log(model_data);
                ModelsService.modelRestart({ model_data })
                  .then((restartResponse) => {
                    console.log("Model restart successful", restartResponse);
                  })
                  .catch((restartError) => {
                    console.error("Error restarting models", restartError);
                  });
              }
              setState({
                ...state,
                alertOpen: true,
                alertContent: "Successfully Camera Updated",
              });
              setSuccess(true);
              console.log("camera finish update response", data);

              handleClose();
            }
          })
          .catch((err) => {
            console.log("camera finish service edit", err);
            handleBack();
            setState({
              ...state,
              alertOpen: true,
              alertContent: "Failed to Save Camera",
            });
            setSuccess(true);
          });
      }
    }
    if (camerasList.length === 0) {
      let content = "Please fill all fields to proceed";
      setSuccess(false);
      return setState({ ...state, alertOpen: true, alertContent: content });
    }
    if (activeStep === 0) {
      // if (props.mode === "edit") {
      //   let keys = [
      //     "cam_id",
      //     "camera_name",
      //     "camera_ip",
      //     "latitude",
      //     "longtitude",
      //     "rtsp",
      //     "commisionerate",
      //     "zone",
      //     "police_station",
      //     "junction_name"
      //   ];
      //   for (var i = 0; i < keys.length; i++) {
      //     if(camerasList[0][keys[i]] === undefined && typeof props.setAlertStatus === "function") {
      //       return props.setAlertStatus("Please fill all fields to proceed", true);
      //     }
      //   }
      // }
      const ipExists = cameraIpRtsp.ip.includes(camerasList[0].camera_ip);
      const rtspExists = cameraIpRtsp.rtsp.includes(camerasList[0].rtsp);

      if (
        ipExists &&
        rtspExists &&
        currentObj.ip_address !== camerasList[0].camera_ip &&
        currentObj.rtsp !== camerasList[0].rtsp
      ) {
        let content = "Camera IP and RTSP already exists.";
        setSuccess(false);
        return setState({ ...state, alertOpen: true, alertContent: content });
      } else if (
        ipExists &&
        currentObj.ip_address !== camerasList[0].camera_ip
      ) {
        let content = "Camera IP already exists.";
        setSuccess(false);
        return setState({ ...state, alertOpen: true, alertContent: content });
      } else if (rtspExists && currentObj.rtsp !== camerasList[0].rtsp) {
        let content = "RTSP already exists.";
        setSuccess(false);
        return setState({ ...state, alertOpen: true, alertContent: content });
      }
    }
    if (currentObj.model_settings && activeStep === 1) {
      if (
        !currentObj.model_settings.model_id &&
        !currentObj.model_settings.model_group_id
      ) {
        let content = "Please select any violation to proceed";
        return setState({ ...state, alertOpen: true, alertContent: content });
      }
    }
    if (
      (typeof props.setStepActiveState === "function" && !isFinish) ||
      (typeof props.setStepActiveState === "function" && isFinish && isSuccess)
    ) {
      props.setStepActiveState((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (typeof props.setStepActiveState === "function") {
      props.setStepActiveState((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const setAlertStatus = (content, status) => {
    setState({ ...state, alertOpen: status, alertContent: content });
  };

  const getStepContent = (activeStep) => {
    // console.log("active step", activeStep);
    // eslint-disable-next-line default-case
    switch (activeStep) {
      case 0:
        return (
          <Card variant="outlined" className={classes.uploadscard}>
            <CardContent component="div">
              <CamerasInformation
                setAlertStatus={(content, status) =>
                  setAlertStatus(content, status)
                }
                camerasList={props.camerasList}
                cameraIpRtsp={props.cameraIpRtsp}
                setCameraIpRtsp={props.setCameraIpRtsp}
                aliasIdList={props.aliasIdList}
                setAliasIdList={props.setAliasIdList}
                mode={props.mode}
                modelsData={props.modelsData}
                commisionerates={props.commisionerates}
                setList={(list) => props.setCamerasList(list)}
                objList={props.objList}
                setObjList={(list) => props.setObjList(list)}
                obj={props.currentObj}
              />
            </CardContent>
          </Card>
        );
      case 1:
      case 2:
      case 3:
        return (
          <SettingsMain
            modelsData={props.modelsData}
            modelsGroup={props.modelsGroup}
            camerasList={props.camerasList}
            activeStep={props.activeStep}
            obj={props.currentObj}
            cameraSettingsParams={props.cameraSettingsParams}
            setObjData={(data) => props.setData(data)}
            objList={props.objList}
            setObjList={(list) => props.setObjList(list)}
          />
        );
      case 4:
        return (
          <div>
            <Card variant="contained" className={classes.confirmationText}>
              <div>Are You Sure You Want To Update the Analytics?</div>
              <div>This might need Restarting the Analytics</div>
            </Card>
          </div>
        );
    }
  };

  const handleClose = () => {
    if (typeof props.setStepActiveState === "function") {
      props.setStepActiveState(0);
    }
    if (typeof props.setModelStatus === "function") {
      props.setModelStatus(false);
    }
    if (typeof props.refreshContent == "function") {
      props.refreshContent(true);
    }
    if (typeof props.setCamerasList == "function") {
      props.setCamerasList([]);
    }
    if (typeof props.setObjList == "function") {
      props.setObjList([]);
    }
  };
  const current_theme = useTheme();

  const style = {
    position: "absolute",
    top: "51%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    bgcolor: `${
      current_theme.palette.mode === "light" ? "background.paper" : "#313131"
    }`,
    border: "2px solid #404145",
    boxShadow: "#00000029",
    color: "#FFF",
  };

  return (
    <Fragment>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={alertOpen}
        autoHideDuration={5000}
        onClose={() => setState({ ...state, alertOpen: false })}
      >
        <Alert
          onClose={() => setState({ ...state, alertOpen: false })}
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
        <Box sx={{ ...style, width: "70%", border: "none" }}>
          <AppBar
            sx={{
              backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
              border: `1px solid ${
                current_theme.palette.mode === "light"
                  ? "#707070"
                  : "#404145 !important"
              }, opacity: 1 `,
            }}
            className={classes.popupTitle}
            // style={{
            //   width: "100%",
            //   margin: "0px 0px 10px",
            //   padding: "8px",
            //   paddingLeft: "20px",
            // }}
            position="static"
          >
            <div className={classes.titleCls}>
              {props.mode === "add" ? "Add Camera" : "Edit Camera"}
            </div>
            <div className={classes.closeCls}>
              <IconButton onClick={() => handleClose()}>
                <CloseOutlined />
              </IconButton>
            </div>
          </AppBar>
          <Stepper
            sx={{
              paddingTop: "20px",
              opacity: 1,
            }}
            className={classes.stepperCls}
            activeStep={props.activeStep}
            alternativeLabel
          >
            {steps.map((label) => {
              const stepProps = {
                completed: false,
              };
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {props.activeStep === steps.length && isSuccess ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1, minHeight: "150px" }}>
                All steps completed Camera saved Successfully.
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Typography sx={{ mt: 2, border: "none" }}>
                {getStepContent(props.activeStep)}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  backgroundColor:
                    current_theme.palette.mode === "light"
                      ? "#FAFAFA"
                      : "#313131",
                  borderTop: "1px solid #3131317a",
                  flexDirection: "row",
                  p: 1,
                }}
              >
                <Button
                  color="primary"
                  variant="outlined"
                  disabled={props.activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>

                <Box sx={{ flex: "1 1 auto", color: "#000" }} />
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  className={classes.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.continueButton}
                  onClick={() =>
                    handleNext(props.activeStep === steps.length - 1)
                  }
                >
                  {props.activeStep === steps.length - 1
                    ? "Finish"
                    : "Continue"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Box>
      </Modal>
    </Fragment>
  );
};

export default CameraStepsModel;
