/* eslint-disable no-unused-vars */
import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CameraService from "../../../services/camera";
import * as data from "../../../common/configuration/camerasobj.json";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${
        theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
      }`,
      backgroundColor: "#313131",
    },
    "& .MuiDataGrid-root": {
      fontSize: "12px !important",
    },
    "& .MuiOutlinedInput-root": {
      fontSize: "12px !important",
    },
    "& .MuiButton-root": {
      color: "#fff !important",
      border: "none !important",
    },
  },
  card: {
    backgroundColor: `${
      theme.palette.mode === "light" ? "#ffffff12" : "#1f202280"
    } !important`,
    color: "#fff !important",
    border: "1px solid #868686 !important",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5px",
  },
  cardcontent: {
    paddingBottom: "9px !important",
  },
  iptTxtFldCls: {
    "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
      backgroundColor: "transparent !important",
    },
    "& .MuiOutlinedInput-input:-webkit-autofill": {
      boxShadow: `0 0 0 100px ${theme.palette.primary.filledInpt} inset !important`,
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.palette?.primary?.filledInpt} !important`,
      fontSize: "14px !important",
    },
    "& .MuiSelect-select": {
      color: "#aea256 !important",
    },
    "& .MuiOutlinedInput-input.Mui-disabled": {
      backgroundColor: `${theme.palette?.primary?.filledInpt} !important`,
    },
  },
  selectFldCls: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.palette?.primary?.filledInpt} !important`,
      fontSize: "14px !important",
    },
  },
}));

const CamerasInformation = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const { camera } = data?.default;
  const [camera_ip_validate_error, setIpValidateError] = useState(false);
  const [latitude_validate_error, setLatValidateError] = useState(false);
  const [longtitude_validate_error, setLonValidateError] = useState(false);

  const [camera_ip_helper_text, setIpHelperText] = useState(false);
  const [latitude_helper_text, setLatHelperText] = useState(false);
  const [longtitude_helper_text, setLonHelperText] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [inputList, setInputList] = useState([
    {
      id: null,
      // camera_id:"",
      camera_name: "",
      camera_ip: "",
      latitude: "",
      longtitude: "",
      rtsp: "",
      commisionerate: "",
      zone: "",
      police_station: "",
      junction_name: "",
      check_rta_mismatch: false,
      isAdd: false,
    },
  ]);

  const checkFieldsKeysEmpty = (inputList) => {
    let keys = [
      // "cam_id",
      "camera_name",
      "camera_ip",
      "latitude",
      "longtitude",
      "rtsp",
      "commisionerate",
      "zone",
      "police_station",
      "junction_name",
    ];
    let idx;

    for (var i = 0; i < keys.length; i++) {
      // eslint-disable-next-line no-loop-func
      idx = inputList.findIndex((rec) => rec[keys[i]] === "");
      return idx === -1 || inputList[idx].isAdd === false ? false : true;
    }
  };

  useEffect(() => {
    if (props.mode === "add") {
      if (props.camerasList && props.camerasList.length) {
        setInputList([...props.camerasList]);
      }
    }
    if (props.mode === "edit") {
      console.log(props.camerasList);
      setInputList(props.camerasList);
    }
  }, [props.mode, props.camerasList]);

  // useEffect(() => {
  //   if (props.camerasList && props.camerasList.length) {
  //     let checkfieldsempty = checkFieldsKeysEmpty(inputList);
  //     if (checkfieldsempty) {
  //       // setInputList([
  //       //   ...props.camerasList,
  //       //   {
  //       //     id: null,
  //       //     camera_name: "",
  //       //     camera_ip: "",
  //       //     latitude: "",
  //       //     longtitude: "",
  //       //     rtsp: "",
  //       //     commisionerate: "",
  //       //     zone: "",
  //       //     police_station: "",
  //       //     junction_name: "",
  //       //     isAdd: false,
  //       //   },
  //       // ]);
  //       // console.log('propscamerasList', props.camerasList)
  //       setInputList([
  //         ...props.camerasList
  //       ]);
  //     }
  //   }
  // }, [props.camerasList]);

  // useEffect(() => {
  //   if (props.mode === "add") {
  //     setInputList([
  //       {
  //         id: null,
  //         camera_name: "",
  //         camera_ip: "",
  //         latitude: "",
  //         longtitude: "",
  //         rtsp: "",
  //         commisionerate: "",
  //         zone: "",
  //         police_station: "",
  //         junction_name: "",
  //         isAdd: false,
  //       },
  //     ]);
  //   }
  // }, [props.mode]);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };

  const handleSelectChange = (rec, e, index) => {
    const { textContent } = e.target;
    const { name } = rec;
    const list = [...inputList];
    list[index][name] = textContent;
    if (name === "commisionerate") {
      list[index]["zone"] = "";
      list[index]["police_station"] = "";
    } else if (name === "zone") {
      list[index]["police_station"] = "";
    }
    setInputList(list);
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    const id = list[index].id;
    list.splice(index, 1);
    setInputList(list);
    const camList = list.filter((val) => val.isAdd && val.id);
    // let checkfieldsempty = checkFieldsKeysEmpty(inputList);
    if (typeof props.setList === "function") {
      // let camList = checkfieldsempty ? [] : list;
      props.setList(camList);
      props.setObjList(
        props.objList.filter((objItem) => objItem.camera_id !== id)
      );
    }
  };

  const handleAddClick = (recIdx) => {
    if (inputList[recIdx].isAdd) {
      setSnackbarSeverity("success");
      setSnackbarMessage("Camera Already Added");
      setOpenSnackbar(true);
      setInputList([
        ...inputList,
        {
          // cam_id:"",
          camera_name: "",
          camera_ip: "",
          latitude: "",
          longtitude: "",
          rtsp: "",
          commisionerate: "",
          zone: "",
          police_station: "",
          junction_name: "",
          check_rta_mismatch: false,
          isAdd: false,
        },
      ]);
      return;
    }
    let keys = [
      // "cam_id",
      "camera_name",
      "camera_ip",
      "latitude",
      "longtitude",
      "rtsp",
      "commisionerate",
      "zone",
      "police_station",
      "junction_name",
    ];
    let idx;
    const currentInputList = [inputList[recIdx]];
    for (var i = 0; i < keys.length; i++) {
      // eslint-disable-next-line no-loop-func
      idx = currentInputList.findIndex((rec) => rec[keys[i]] === "");
      if (idx !== -1 && typeof props.setAlertStatus === "function") {
        return props.setAlertStatus("Please fill all fields to proceed", true);
      }
    }

    const duplicateIP = props.cameraIpRtsp.ip.some(
      (ip) => ip === currentInputList[0].camera_ip
    );
    const duplicateRTSP = props.cameraIpRtsp.rtsp.some(
      (rtsp) => rtsp === currentInputList[0].rtsp
    );
    const duplicateNewIP = inputList.some(
      (item) => item.isAdd && item.camera_ip === currentInputList[0].camera_ip
    );
    const duplicateNewRTSP = inputList.some(
      (item) => item.isAdd && item.rtsp === currentInputList[0].rtsp
    );

    if (
      (duplicateIP || duplicateNewIP) &&
      (duplicateRTSP || duplicateNewRTSP)
    ) {
      if (typeof props.setAlertStatus === "function") {
        return props.setAlertStatus("Camera IP and RTSP already exists!", true);
      }
    }

    if (duplicateIP || duplicateNewIP) {
      if (typeof props.setAlertStatus === "function") {
        return props.setAlertStatus("Camera IP already exists!", true);
      }
    }

    if (duplicateRTSP || duplicateNewRTSP) {
      if (typeof props.setAlertStatus === "function") {
        return props.setAlertStatus("RTSP already exists!", true);
      }
    }

    if (idx === -1) {
      const params = {
        camera_information: {
          longtitude: currentInputList[0].longtitude,
          latitude: currentInputList[0].latitude,
          camera_ip: currentInputList[0].camera_ip,
          rtsp: currentInputList[0].rtsp,
          camera_name: currentInputList[0].camera_name,
          commisionerate: currentInputList[0].commisionerate,
          zone: currentInputList[0].zone,
          police_station: currentInputList[0].police_station,
          junction_name: currentInputList[0].junction_name,
          check_rta_mismatch: currentInputList[0].check_rta_mismatch,
          camera_id: getCameraId(),
        },
      };
      CameraService.addCameras(params)
        .then((res) => {
          if (res && res.data) {
            currentInputList[0].isAdd = true;
            const { id } = res.data;
            currentInputList[0].id = id;
            inputList[recIdx] = currentInputList[0];
            setSnackbarSeverity("success");
            setSnackbarMessage("Camera Added Successfully");
            setOpenSnackbar(true);
            if (typeof props.setList === "function") {
              props.setList(inputList);
            }
            var newObjList = [
              ...props.objList,
              {
                camera_id: id,
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
              },
            ];
            props.setObjList(newObjList);
            setInputList([
              ...inputList,
              {
                // cam_id:"",
                camera_name: "",
                camera_ip: "",
                latitude: "",
                longtitude: "",
                rtsp: "",
                commisionerate: "",
                zone: "",
                police_station: "",
                junction_name: "",
                check_rta_mismatch: false,
                isAdd: false,
              },
            ]);
          }
        })
        .catch((err) => {
          console.log("camera service", err);
          if (err && typeof props.setAlertStatus === "function") {
            return props.setAlertStatus(
              "Unable to Add camera!! Please try again",
              true
            );
          }
        });
    }
  };

  const setFieldOptions = (rec, i) => {
    const { commisionerates } = props;

    if (rec.name === "commisionerate" && commisionerates.length) {
      rec.options = commisionerates;
    } else if (rec.name === "zone" && commisionerates.length) {
      if (inputList[i].commisionerate) {
        let zone_options_index = commisionerates.findIndex(
          (rec) => rec.name === inputList[i].commisionerate
        );
        if (zone_options_index !== -1) {
          rec.options = commisionerates[zone_options_index].children;
        } else {
          rec.options = [];
        }
      } else {
        rec.options = [];
      }
    } else if (rec.name === "police_station" && commisionerates.length) {
      if (inputList[i].commisionerate) {
        let zone_options_index = commisionerates.findIndex(
          (rec) => rec.name === inputList[i].commisionerate
        );
        let zone_options = commisionerates[zone_options_index].children;
        if (zone_options && zone_options.length) {
          let ps_options_index = zone_options.findIndex(
            (rec) => rec.name === inputList[i].zone
          );
          if (ps_options_index !== -1) {
            rec.options = zone_options[ps_options_index].children;
          } else {
            rec.options = [];
          }
        } else {
          rec.options = [];
        }
      } else {
        rec.options = [];
      }
    }
    return rec.options;
  };

  const getOptVal = (recVal, recName, currentobj) => {
    let returnVal = null;
    const { commisionerates } = props;

    if (recName === "commisionerate" && commisionerates.length) {
      let idx = commisionerates.findIndex((comm) => comm.name === recVal);
      if (idx !== -1) {
        returnVal = commisionerates[idx];
        return returnVal;
      }
    } else if (recName === "zone" && commisionerates.length) {
      let idx = commisionerates.findIndex(
        (comm) => comm.name === currentobj["commisionerate"]
      );
      if (idx !== -1) {
        let zoneIdx = commisionerates[idx].children.findIndex(
          (zonee) => zonee.name === recVal
        );
        if (zoneIdx !== -1) {
          returnVal = commisionerates[idx].children[zoneIdx];
          return returnVal;
        }
      }
    } else if (recName === "police_station" && commisionerates.length) {
      let idx = commisionerates.findIndex(
        (comm) => comm.name === currentobj["commisionerate"]
      );
      if (idx !== -1) {
        let zoneIdx = commisionerates[idx].children.findIndex(
          (zonee) => zonee.name === currentobj["zone"]
        );
        if (zoneIdx !== -1) {
          let psIdx = commisionerates[idx].children[zoneIdx].children.findIndex(
            (ps) => ps.name === recVal
          );
          if (psIdx !== -1) {
            returnVal = commisionerates[idx].children[zoneIdx].children[psIdx];
            return returnVal;
          }
        }
      }
    }
    return returnVal;
  };

  const getValidateStatus = (rec, status) => {
    if (status && !rec.validated) {
      return `${status}_validate_error`;
    }
    return false;
  };

  const getCameraId = (x, rec, i) => {
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
        return `LTTS-ANPR-${randomString}`;
      }
    }
  };

  const getHelperStatus = (rec, errText) => {
    if (errText && !rec.validated) {
      switch (errText) {
        case "camera_ip":
          return camera_ip_helper_text;
        case "latitude":
          return latitude_helper_text;
        case "longtitude":
          return longtitude_helper_text;
        default:
          return false;
      }
    }
    return false;
  };

  const onFieldBlur = (e, rec, val) => {
    const { name, value } = e.target;

    const decimalRegexp = /^\d+\.\d{1,9}$/;
    const ip =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (name === "camera_ip" || name === "latitude" || name === "longtitude") {
      const regex = name === "camera_ip" ? ip : decimalRegexp;
      if (value && !value.match(regex)) {
        rec.validated = false;
        return name === "camera_ip"
          ? (setIpHelperText(`InCorrect Format!! hint: 192.168.0.1`),
            setIpValidateError(true))
          : name === "latitude"
          ? (setLatHelperText(`InCorrect Format!! hint: 72.34567`),
            setLatValidateError(true))
          : name === "longtitude"
          ? (setLonHelperText(`InCorrect Format!! hint: 76.78787`),
            setLonValidateError(true))
          : null;
      } else if (value) {
        rec.validated = true;
        return name === "camera_ip"
          ? (setIpHelperText(false), setIpValidateError(false))
          : name === "latitude"
          ? (setLatHelperText(false), setLatValidateError(false))
          : name === "longtitude"
          ? (setLonHelperText(false), setLonValidateError(false))
          : null;
      }
    }
  };

  const getStepContent = (x, i) =>
    camera.map((rec, idx) => {
      return rec && rec.type.toLowerCase() === "text" ? (
        <Fragment>
          <Grid item xs={4} key={`${rec.name}-text-grid-${i}`}>
            <TextField
              autoComplete="off"
              name={rec.name}
              key={`${rec.name}-${idx + 1}`}
              label={rec.label}
              placeholder="Enter Name"
              value={x[rec.name]}
              variant="filled"
              helperText={getHelperStatus(rec, rec.name)}
              error={getValidateStatus(rec, rec.name)}
              sx={{
                width: "100%",
                backgroundColor: theme.palette.primary.filledInpt,
                color: "#fff !important",
                fontSize: "14px",
                opacity: "100%",
              }}
              // disabled={x.isAdd}
              className={classes.iptTxtFldCls}
              onChange={(e) => handleInputChange(e, i)}
              onBlur={(e) => onFieldBlur(e, rec, x[rec.name])}
              required
            />
          </Grid>
        </Fragment>
      ) : rec && rec.type.toLowerCase() === "select" ? (
        <Grid item xs={4} key={`${rec.name}-select-grid-${i}`}>
          <Autocomplete
            id={rec.label}
            name={rec.name}
            key={`${rec.name}-${idx + 1}`}
            onChange={(e) => handleSelectChange(rec, e, i)}
            value={getOptVal(x[rec.name], rec.name, x)}
            // disabled={x.isAdd}
            options={setFieldOptions(rec, i)}
            className={classes.selectFldCls}
            getOptionLabel={(comm) => comm.name}
            renderInput={(params) => (
              <TextField
                {...params}
                autoComplete="off"
                InputLabelProps={{ className: classes.selectLabel }}
                label={rec.label}
                key={`${rec.name}-textfield-${idx + 1}`}
                name={rec.name}
                variant="filled"
                required
              />
            )}
          />
        </Grid>
      ) : rec && rec.type.toLowerCase() === "checkbox" ? (
        <Grid item xs={12} key={`${rec.name}-checkbox-grid-${i}`}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={() => onCheckBoxClick(rec, i)}
                  checked={x[rec.name]}
                />
              }
              label={rec.label}
            />
          </FormGroup>
        </Grid>
      ) : null;
    });

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const onCheckBoxClick = (rec, index) => {
    const { name } = rec;
    const list = [...inputList];
    console.log(rec, index, list[index][name]);
    list[index][name] = !list[index][name];
    setInputList(list);
  };

  return (
    <Fragment>
      {inputList.map((x, i) => {
        return (
          <Card
            variant="outlined"
            key={`${i + 1}-camera-card`}
            className={classes.card}
          >
            <CardContent className={classes.cardcontent} component="div">
              <Grid container key={`${i + 1}-camera-grid`}>
                <Grid container spacing={2}>
                  {getStepContent(x, i)}
                </Grid>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="flex-end"
                  spacing={2}
                  mt={1}
                  mb={1}
                >
                  <Grid>
                    {props.mode === "add"
                      ? inputList.length !== 1 && (
                          <Button
                            variant="contained"
                            onClick={() => handleRemoveClick(i)}
                            startIcon={<DeleteIcon />}
                          >
                            Remove
                          </Button>
                        )
                      : null}

                    {props.mode === "add" && inputList.length - 1 === i && (
                      <Button
                        variant="contained"
                        onClick={() => handleAddClick(i)}
                        startIcon={<AddIcon />}
                        sx={{ ml: 1 }}
                      >
                        Add
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
              >
                <Alert
                  onClose={handleCloseSnackbar}
                  severity={snackbarSeverity}
                  sx={{ width: "100%" }}
                >
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </CardContent>
          </Card>
        );
      })}
    </Fragment>
  );
};

export default CamerasInformation;
