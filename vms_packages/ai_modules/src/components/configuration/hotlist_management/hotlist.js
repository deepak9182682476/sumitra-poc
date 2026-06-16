import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Grid,
  Card,
  Typography,
  Button,
  TextField,
  Select,
  InputLabel,
  FormControl,
  AppBar,
  IconButton,
  Backdrop,
  Snackbar
} from "@mui/material";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block,
  Padding,
} from "@mui/icons-material";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";
import { CloseOutlined } from "@mui/icons-material";
import ModelsService from "../../../services/models";
import MenuItem from "@mui/material/MenuItem";
import { Fragment } from "react/cjs/react.development";
import Alert from '@mui/material/Alert';
import RbacService from "../../../services/rbac_service";
import { getLocalStorage } from "../../../utilities/common-util";


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
    "& .MuiButton-root": {
      color: "#fff !important",
    },
    "&:Mui-focused": {
      border: "none !important",
    },
    "& .MuiOutlinedInput-root": {
      border: "none !important",
    },

    "& .MuiGrid-root>.MuiGrid-item": {
      paddingTop: "17px !important",
    },

    "&.css-ue1caz-MuiInputBase-input-MuiFilledInput-input": {
      height: "1em",
      // padding: "2px",
    },

    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "47h",
    },
    width: "100vw",
  },
  inputmain: {
    // fontSize:"11px !important",
    "& .MuiInputLabel-root": {
      fontSize: "11px !important",
    },
  },

  titleCls: {
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  popupTitle: {
    width: "100%",
    fontSize: "16px",
    alignItems: "center",
    fontWeight: "bold",
    display: "flex",
    flexFlow: "row",
    justifyContent: "center",
    color: "#fff",
    backgroundColor: "#0D0D0D",
    Padding: "0px",
  },
  closeCls: {
    margin: "0px 0px 0px auto",
  },
  titleCls: {
    margin: "5px 0px auto auto",
  },
  fontsize: {
    fontSize: "0.75rem !important",
  },
  hotlistheader: {
    margin: "-13px 0px 19px",
  },
  gridspace: {
    paddingTop: "28px !important",
    backgroundColor: "transparent !important",
  },
  buttonmain: {
    paddingTop: "1px !important",
    margin: "-20px 0px 0px auto",
  },

  buttondiv: {
    display: "flex",
  },
  buttontext: {
    color: "#fff !important",
    fontSize: "12px",
  },
  span: {
    padding: "5px",
  },
  buttoncolor: {
    backgroundColor: "#343434",
    border: "1px solid #8D8D8D",

    color: "#fff !important",
    fontSize: "12px",
    "&:hover": { backgroundColor: "#343434" },
  },
  fetchbutton: {},
}));

const InputComponent = ({ inputRef, ...other }) => <div {...other} />;
const OutlinedDiv = ({ children, label }) => {
  return (
    <TextField
      variant="outlined"
      label={label}
      multiline
      InputLabelProps={{ shrink: true }}
      InputProps={{
        inputComponent: InputComponent,
      }}
      inputProps={{ children: children }}
      size="small"
      autoComplete="off"
    />
  );
};

export default function Hotlist(props) {
  const classes = useStyles();
  const current_theme = useTheme();

  const handleClose = () => {
    if (
      typeof props.setModalStatus === "function" &&
      typeof props.refreshContent === "function"
    ) {
      props.setModalStatus(false);
      props.refreshContent(true);
      props.resetSelectedRecord();
      setGroupFormData({
        registration_number: "",
        make: "",
        model: "",
        owner_name: "",
        phone_no: "",
        address: "",
        crime_number: "",
        commissionerate: "",
        police_station: "",
        description: "",
        source: "",
        color: "",
        category: "",
        user: "",
        email_id: "",
        valid_upto:"",
        insurance_validity:"",
      });
    }
  };

  const [groupFormData, setGroupFormData] = useState({
    registration_number: "",
    make: "",
    model: "",
    owner_name: "",
    phone_no: "",
    address: "",
    crime_number: "",
    commissionerate: "",
    police_station: "",
    description: "",
    source: "",
    color: "",
    category: {},
    user: "",
    email_id: "",
    valid_upto:"",
    insurance_validity:"",
  });

  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });

  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    ModelsService.gethotlistGroup()
      .then((response) => response.json())
      .then((data) => setNames(data))
      .catch((error) => console.error(error));
  }, []);

  const handleInputChange = (e, key) => {
    const { value } = e.target;
    setGroupFormData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
    if (key === "category") {
      let category_Id = hotListCategoryList.filter(
        (ele) => ele.id === value.id
      );
      setGroupFormData((prevState) => ({
        ...prevState,
        [key]: category_Id[0],
      }));
    }
  };


  const oncancel = () => {
    props.setModalStatus(false);
    props.resetSelectedRecord();
    setGroupFormData({
      registration_number: "",
      make: "",
      model: "",
      owner_name: "",
      phone_no: "",
      address: "",
      crime_number: "",
      commissionerate: "",
      police_station: "",
      description: "",
      source: "",
      color: "",
      category: "",
      user: "",
      email_id: "",
      valid_upto:"",
      insurance_validity:"",
    });
    // props.setflag(true);
    //  props.gethotlistGroup();
  };

  const { selectedrecord, hotListCategoryList, selectedItem } = props;
  useEffect(() => {
    if (selectedrecord && selectedrecord.id) {
      setGroupFormData({
        registration_number: selectedrecord.registration_number,
        make: selectedrecord.make,
        model: selectedrecord.model,
        color: selectedrecord.color,
        category: selectedrecord.category,
        user: selectedrecord.user,
        description: selectedrecord.description,
        crime_number: selectedrecord.crime_number,
        source: selectedrecord.source,
        police_station: selectedrecord.police_station,
        commissionerate: selectedrecord.commissionerate,
        owner_name: selectedrecord.owner_name,
        phone_no: selectedrecord.phone_no,
        address: selectedrecord.address,
        email_id: selectedrecord.email_id,
        valid_upto:selectedrecord.valid_upto,
        insurance_validity:selectedrecord.insurance_validity,
      });
    }
  }, [props.selectedrecord]);

  useEffect(() => {
    if (selectedItem.name) {
      // If the selected record has an existing category value,
      // don't update it with the selected item.
      // console.log("selecteditemname 123", selectedrecord, hotListCategoryList);
      if (groupFormData.category) {
        setGroupFormData({
          ...groupFormData,
          category: selectedItem,
        });
      }
    }
  }, [selectedItem]);

  const [mode, setMode] = useState(null);
  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [error, setError] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });

  const [modelGroupPopup, setModelGroupPopup] = React.useState(false);

  const handleFetchOwnerDetails = () => {
    if (groupFormData.registration_number) {
      ModelsService.getRTAData(groupFormData.registration_number)
        .then(({ data }) => {
          const rtaData = data?.data?.RTAddress
            ? data?.data?.RTAddress.length > 0 && data?.data?.RTAddress[0]
            : data?.data;

          if (!rtaData ||
            (rtaData.Owner_Name === "NA" &&
              rtaData.Address === "NA" &&
              rtaData.Phone_No === "NA" &&
              rtaData.EmailId === "NA" &&
              rtaData.Model_Desc === "NA" &&
              rtaData.Maker_Name === "NA" &&
              rtaData.Color === "NA"&&
              rtaData.Valid_Upto=== "NA"&&
              rtaData.Insurance_validity==="NA"
               )) {
            throw new Error("Data not fetched");
          }

          setGroupFormData({
            ...groupFormData,
            owner_name: rtaData.Owner_Name || "NA",
            address: rtaData.Address || "NA",
            phone_no: rtaData.Phone_No || "NA",
            email_id: rtaData.EmailId || "NA",
            make: rtaData.Maker_Name || "NA",
            model: rtaData.Model_Desc || "NA",
            color: rtaData.Color || "NA",
            valid_Upto: rtaData.Valid_Upto|| "NA",
            insurance_validity:rtaData.Insurance_validity||"NA",
          });
        })
        .catch((error) => {
          console.error("Error fetching owner details:", error);
          if (error.message === "Data not fetched") {
            setAlertStatus("Failed to fetch ", true, "error");
          }
        });
    }
  };



  const handleAddGroup = (e) => {
    e.preventDefault();
    if (selectedrecord && selectedrecord.id) {
      groupFormData.id = selectedrecord.id;
    } else {
      groupFormData.id = "";
    }

    const isValidated = checkValidation(groupFormData);
    if (isValidated) {
    RbacService.getUsers()
      .then(({ data }) => {
        console.log("dataaaaaaaaa", data);
        setGroupFormData({
          ...groupFormData,
          user: data.user_name,

        });
      })
      .catch((error) => {
        console.error("Error fetching owner details:", error);
      });



    //API call
    let Hotlist = "";

    const userAccount = JSON.parse(getLocalStorage("anpr_user"));
    let obj = {
      registration_number: groupFormData.registration_number,
      make: groupFormData.make,
      model: groupFormData.model,
      owner_name: groupFormData.owner_name,
      phone_no: groupFormData.phone_no,
      address: groupFormData.address,
      crime_number: groupFormData.crime_number,
      commissionerate: groupFormData.commissionerate,
      police_station: groupFormData.police_station,
      description: groupFormData.description,
      source: groupFormData.source,
      color:  groupFormData.color,
      category: groupFormData.category.name,
      user: groupFormData.user,
      valid_upto :groupFormData.valid_upto,
      insurance_validity:groupFormData.insurance_validity,
      // console.log("useraccountAS", userAccount);
      email_id: groupFormData.email_id,
    };

    //   user:  userAccount.userInfo[0].user_name,

    // if (groupFormData.category && groupFormData.category.name) {
    //   obj.category = groupFormData.category.name;
    // }
    if (groupFormData.category.length > 0) {
      if (typeof groupFormData.category == "object") {
        obj.category = groupFormData.category.name;
      } else {
        obj.category = groupFormData.category;
      }
    }

    if (groupFormData.id) {
      //PUT
      Hotlist = ModelsService.updateHotlistGroup(groupFormData.id, obj);
    } else {
      //POST

      Hotlist = ModelsService.createHotlistGroup(obj);
    }

    Hotlist.then((response) => {
      if (response) {
        // window.location.reload(true);
        props.setflag(true);
        const { data } = response?.data;
        setGroupFormData({
          registration_number: "",
          make: "",
          model: "",
          owner_name: "",
          phone_no: "",
          address: "",
          crime_number: "",
          commissionerate: "",
          police_station: "",
          description: "",
          source: "",
          color: "",
          category: "",
          user: "",
          email_id: "",
          valid_upto:"",
          insurance_validity:""
        });
        if (
          typeof props.setModalStatus === "function" &&
          typeof props.refreshContent === "function"
        ) {
          props.setModalStatus(false);
          props.refreshContent(true);
        }
      }
    }).catch((err) => {
      setAlertStatus("Failed to Add", true, "error");
      if (err.response) {
        console.log("error response", err);
      } else if (err.request) {
        console.log("error request", err);
      } else {
        console.log("error", err);
      }
    });

    setMode("submit");
    setIsActionDisabled(true);

    setState({
      ...state,
      error: false,
      helperText: "",
    });
    setModelGroupPopup(true);
  } else {
    setAlertStatus("Fill Required fields", true, "warning");
  }
  };

  const checkValidation = (obj) => {
    let isValid = true;
    const keys = ['registration_number', 'crime_number', 'commissionerate', 'police_station', 'owner_name', 'category','phone_no']
    console.log('validation', obj);
    keys.map(rec => {
      if (obj[rec] === '' && rec !== 'category') {
        return isValid = false;
      }
      if (rec === 'category') {
        if( obj[rec]  === 'undefined'){
          return isValid = false;
        }
        if(typeof obj[rec] === 'string' && obj[rec].trim() === ''){
          return isValid = false;
        }
        if (typeof obj[rec] === 'object' && Object.keys(obj[rec]).length && (!obj[rec].name || obj[rec].name === '')) {
          return isValid = false;
        }
      }
      return isValid;
    })

    return isValid

  }

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1020,
    height: 420,
    bgcolor: "background.paper",
    border: "none",
    boxShadow: 24,
    padding: "0px 5px !important",
    p: 2,
    "&:focus-visible": {
      border: "none !important",
    },
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

  return (
    <div>

      <Modal
        open={props.open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >

        <Box sx={style}>
          <AppBar
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
              border: `1px solid ${current_theme.palette.mode === "light"
                ? "#707070"
                : "#404145 !important"
                }, opacity: 1 `,
            }}
            // className={classes.popupTitle}
            position="static"
          >
            <Box className={classes.popupTitle}>
              <Box
                sx={{
                  padding: "10px 5px",
                }}
              >
                {" "}
                <Typography className={classes.titleCls}>
                  Hotlist Management
                </Typography>
              </Box>
              <div className={classes.closeCls}>
                <IconButton onClick={() => handleClose()}>
                  <CloseOutlined />
                </IconButton>
              </div>
            </Box>
          </AppBar>

          <Grid container rowSpacing={2} sx={{ margin: "35px 5px" }}>
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

            <Grid item xs={6}>

              <OutlinedDiv label={"Vehicle Details"}>
                <Card
                  variant="outlined"
                  className={classes.cardMain}
                  style={{ height: "146px", width: "470px", padding: "2px" }}
                >
                  <Typography>
                    <form>
                      <table style={{ width: "100%" }}>
                        <tr>
                          {/* <td style={{ fontSize:"11px"}}>Registration Number : </td> */}
                          <td style={{ paddingRight: "10px" }}>
                            <TextField
                              className={classes.inputmain}
                              // id="outlined-required"
                              fullWidth
                              size="small"
                              label="Registration Number"
                              name="registration_number"
                              value={groupFormData.registration_number}
                              
                              variant="filled"
                              onChange={(e) =>
                                handleInputChange(e, "registration_number")
                              }
                              required
                              autoComplete="off"
                            ></TextField>
                            {/* <span className={classes.span}> </span> */}
                          </td>

                          <td>
                            <TextField
                              className={classes.inputmain}
                              // id="outlined-required"
                              label="Model"
                              name="model"
                              size="small"
                              value={groupFormData.model}
                              variant="filled"
                              onChange={(e) => handleInputChange(e, "model")}
                              fullWidth
                              autoComplete="off"
                            />
                          </td>
                        </tr>

                        <tr>
                          {/* <td style={{ fontSize:"11px"}}>Make : </td> */}
                          <td style={{ paddingRight: "10px" }}>
                            <TextField
                              className={classes.inputmain}
                              // id="outlined-required"
                              label="Make"
                              name="make"
                              size="small"
                              value={groupFormData.make}
                              variant="filled"
                              onChange={(e) => handleInputChange(e, "make")}
                              fullWidth
                              autoComplete="off"
                            ></TextField>
                          </td>

                          {/* <td style={{ fontSize:"11px"}}>Category : </td> */}
                          <td>
                            {/* {selectedrecord && selectedrecord.id !=='' ? "true": "false" } */}
                            {selectedrecord && selectedrecord.id !== "" ? (
                              <TextField
                                select
                                className={classes.inputmain}
                                // id="outlined-required"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Category"
                                name="category"
                                size="small"
                                value={
                                  typeof groupFormData.category == "object"
                                    ? groupFormData.category.name
                                    : groupFormData.category
                                }
                                fullWidth
                                readOnly
                                variant="filled"
                                onChange={(e) =>
                                  handleInputChange(e, "category")
                                }
                                required
                                SelectProps={{
                                  renderValue: (value) => value,
                                }}
                                //  disabled={true}
                                autoComplete="off"
                              >
                                {hotListCategoryList.map((item, idx) => {
                                  if (item?.name != undefined) {
                                    return (
                                      <MenuItem key={idx} value={item}>
                                        {item.name}
                                      </MenuItem>
                                    );
                                  }
                                })}
                              </TextField>
                            ) : (
                              <TextField
                                select
                                className={classes.inputmain}
                                // id="outlined-required"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Category"
                                name="category"
                                size="small"
                                value={groupFormData.category}
                                fullWidth
                                variant="filled"
                                onChange={(e) =>
                                  handleInputChange(e, "category")
                                }
                                required
                                autoComplete="off"
                              >
                                {hotListCategoryList.map((item, idx) => {
                                  if (item?.name != undefined) {
                                    return (
                                      <MenuItem key={idx} value={item}>
                                        {item.name}
                                      </MenuItem>
                                    );
                                  }
                                })}
                              </TextField>
                            )}
                          </td>
                        </tr>

                        <tr>
                          
                          <td style={{ paddingRight: "10px" }}>
                            <TextField
                              className={classes.inputmain}
                              // id="outlined-required"
                              label="Color"
                              name="color"
                              size="small"
                              value={groupFormData.color}
                              variant="filled"
                              onChange={(e) => handleInputChange(e, "color")}
                              fullWidth
                              autoComplete="off"
                            ></TextField>
                          </td>
                          <td style={{ paddingRight: "10px" }}>
                            <TextField
                              className={classes.inputmain}
                              label="Registration Validity Upto"
                              name="valid_upto"
                              size="small"
                              value={groupFormData.valid_upto}
                              variant="filled"
                              onChange={(e) => handleInputChange(e, "valid_upto")}
                              fullWidth
                              autoComplete="off"
                            ></TextField>
                          </td>

                        </tr>
                        <tr>
                          <td>

                          </td>
                        </tr>
                      </table>
                    </form>
                  </Typography>
                </Card>
              </OutlinedDiv>
            </Grid>
            <Grid item xs={6}>
              <OutlinedDiv
                className={classes.fetchbutton}
                label={"Owner Details"}
                style={{ backgroundColor: "red" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingBottom: "5px",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleFetchOwnerDetails}
                    className={classes.buttontext}
                    disabled={!groupFormData.registration_number}
                  >
                    Fetch owner details
                  </Button>

                </div>
                <Card
                  variant="outlined"
                  style={{ height: "114px", width: "450px", paddingTop: "2px" }}
                >

                  <form>
                  
                    <table style={{ width: "100%" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <tr>

                        {/* <td style={{ fontSize:"11px"}}>Name.:</td> */}
                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            autoComplete="off"
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="Owner_Name"
                            key="Owner_Name"
                            name="owner_name"
                            size="small"
                            value={groupFormData.owner_name}
                            variant="filled"
                            onChange={(e) => handleInputChange(e, "owner_name")}
                            fullWidth
                            readOnly
                            InputLabelProps={{ shrink: !!groupFormData.owner_name }}
			    required
                          ></TextField>
                          <span className={classes.span}> </span>
                        </td>
                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            autoComplete="off"
                            label="Phone No"
                            key="Phone No"
                            name="phone_no"
                            size="small"
                            value={groupFormData.phone_no}
                            variant="filled"
                            onChange={(e) => handleInputChange(e, "phone_no")}
                            fullWidth
                            readOnly
			    required
                            InputLabelProps={{ shrink: !!groupFormData.phone_no }}
                          ></TextField>
                        </td>
                      </tr>
                      </div>
                      <tr>
                        {/* <td style={{ fontSize:"11px"}}>Contact : </td> */}
                        <td>
                          <TextField
                            autoComplete="off"
                            className={classes.inputmain}
                            // width="5vh"
                            // id="outlined-required"
                            label="Address"
                            key="Address"
                            name="address"
                            size="small"
                            value={groupFormData.address}
                            variant="filled"
                            onChange={(e) => handleInputChange(e, "address")}
                            fullWidth
                            readOnly
                            InputLabelProps={{ shrink: !!groupFormData.address }}
                          ></TextField>
                        </td>


                        {/* <td style={{ fontSize:"11px"}}>Emp Id/Org : </td> */}
                        {/* <td>
                          <TextField
                            autoComplete="off"
                            className={classes.inputmain}
                            label="Email ID"
                            key="Email ID"
                            name="email_id"
                            size="small"
                            value={groupFormData.email_id}
                            variant="filled"
                            onChange={(e) => handleInputChange(e, "email_id")}
                            fullWidth
                            readOnly
                            InputLabelProps={{ shrink: !!groupFormData.email_id }}
                          ></TextField>
                        </td> */}
                      </tr>
                    </table>
                  </form>
                </Card>
              </OutlinedDiv>
              {openAlert && (
                <Alert severity="error" onClose={() => setOpenAlert(false)}>
                  Data not fetched
                </Alert>
              )}
            </Grid>
            {/* </TabPanel> */}

            {/* <TabPanel value={value} index={2}> */}

            <Grid item xs={12} className={classes.gridspace}>
              <OutlinedDiv label={"Other Details"}>
                <Card
                  variant="outlined"
                  style={{
                    height: "102px",
                    width: "961px",
                    backgroundColor: "transparent !important",
                  }}
                >
                  <form>
                    <table style={{ width: "100%" }}>
                      <tr>
                        {/* <td style={{ fontSize:"11px"}}>Crime Number:</td> */}
                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="Crime Number"
                            name="crime_number"
                            value={groupFormData.crime_number}
                            variant="filled"
                            size="small"
                            onChange={(e) =>
                              handleInputChange(e, "crime_number")
                            }
                            required
                            fullWidth
                            autoComplete="off"
                          ></TextField>
                          <span className={classes.span}> </span>
                        </td>

                        {/* <td style={{ fontSize:"11px"}}>Police station : </td> */}
                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="Commissionerate"
                            name="commissionerate"
                            value={groupFormData.commissionerate}
                            variant="filled"
                            size="small"
                            onChange={(e) =>
                              handleInputChange(e, "commissionerate")
                            }
                            required
                            fullWidth
                            autoComplete="off"
                          ></TextField>
                          <span className={classes.span}> </span>
                        </td>

                        {/* <td style={{ fontSize:"11px"}}>Source : </td> */}
                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="Police Station"
                            name="police_station"
                            value={groupFormData.police_station}
                            variant="filled"
                            size="small"
                            onChange={(e) =>
                              handleInputChange(e, "police_station")
                            }
                            required
                            fullWidth
                            autoComplete="off"
                          ></TextField>
                        </td>
                      </tr>
                      <tr>
                        {/* <td style={{ fontSize:"11px"}}>Commisionerate : </td> */}

                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="User"
                            name="user"
                            value={groupFormData.user}
                            variant="filled"
                            size="small"
                            onChange={(e) => handleInputChange(e, "user")}
                           
                            fullWidth
                            autoComplete="off"
                          ></TextField>
                        </td>

                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="Source"
                            name="source"
                            value={groupFormData.source}
                            variant="filled"
                            size="small"
                            onChange={(e) => handleInputChange(e, "source")}
                           
                            fullWidth
                            autoComplete="off"
                          ></TextField>
                        </td>

                        {/* <td style={{ fontSize:"11px"}}>Description : </td> */}
                        <td style={{ paddingRight: "10px" }}>
                          <TextField
                            className={classes.inputmain}
                            // id="outlined-required"
                            label="Description"
                            name="description"
                            value={groupFormData.description}
                            variant="filled"
                            size="small"
                            fullWidth
                            onChange={(e) =>
                              handleInputChange(e, "description")
                            }
                            autoComplete="off"
                          ></TextField>
                        </td>
                      </tr>
                      <tr></tr>
                    </table>
                  </form>
                </Card>
              </OutlinedDiv>
            </Grid>
          </Grid>

          <div className={classes.buttondiv}>
            <div className={classes.buttonmain}>
              <Button
                variant="contained"
                className={classes.buttoncolor}
                //  onClick={()=>setValue(value-1)}
                onClick={() => oncancel()}
              >
                {" "}
                Cancel{" "}
              </Button>
              <span className={classes.span}> </span>
              <Button
                variant="contained"
                className={classes.buttontext}
                // disabled={isActionDisabled}
                onClick={(e) => handleAddGroup(e)}
              >
                {" "}
                {selectedrecord && selectedrecord.id ? "update" : "Submit"}{" "}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}