import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Snackbar,
  AppBar,
  IconButton,
  TextField,
} from "@mui/material";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";

import { CloseOutlined } from "@mui/icons-material";
import ModelsService from "../../../services/models";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  // border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiButton-root": {
      color: "#fff !important",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "42vh",
    },
    width: "100vw",
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
    backgroundColor: "#CCDCC1",
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
    padding: "8px",
  },

  buttonmain: {
    paddingTop: "17px !important",
    margin: "0px 0px 0px auto",
  },

  buttondiv: {
    display: "flex",
  },
  buttontext: {
    color: "#fff !important",
    fontSize: "12px",
    width: "85px",
  },
  buttoncolor: {
    backgroundColor: "#343434",
    // border: "1px solid #8D8D8D",
    color: "#fff !important",
    fontSize: "12px",
    "&:hover": { backgroundColor: "#343434" },
  },
  span: {
    padding: "5px",
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
}));

export default function ViolationsPopup(props) {
  const classes = useStyles();
  const current_theme = useTheme();

  const handleClose = () => {
    if (
      typeof props.setModalStatus === "function" &&
      typeof props.refreshContent === "function"
    ) {
      props.setModalStatus(false);
      props.refreshContent(true);

      setGroupFormPopupData({
        name: "",
        code: "",
      });
    }
  };

  const [groupFormPopupData, setGroupFormPopupData] = useState({
    name: "",
    code: "",
  });
  // const toggleTab = () => {
  //   console.log("22222222222")
  //   props = {index:2,value:1}
  //   TabPanel(props)

  // };

  const handleInputChange = (e, key) => {
    e.preventDefault();
    const { value } = e.target;
    console.log(value);
    setGroupFormPopupData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
    console.log({ groupFormPopupData });
  };

  const handleButtonClick = (event) => {
    event.preventDefault();
    const { registration_number, description, model_ids } = groupFormPopupData;
  };

  const oncancel = () => {
    props.setModalStatus(false);
    props.resetSelectedRecord();
    setGroupFormPopupData({
      name: "",
      code: "",
    });
  };

  const { selectedrecord } = props;
  useEffect(() => {
    if (selectedrecord) {
      setGroupFormPopupData({
        name: selectedrecord.name,
        code: selectedrecord.code,
      });
    }
  }, [props.selectedrecord]);

  const [mode, setMode] = useState(null);
  const [isActionDisabled, setIsActionDisabled] = useState(false);

  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });

  const [modelGroupPopup, setModelGroupPopup] = React.useState(false);

  const handleAddGroup = () => {
    if (selectedrecord && selectedrecord.id) {
      groupFormPopupData.id = selectedrecord.id;
    } else {
      groupFormPopupData.id = "";
    }

    console.log({ groupFormPopupData });
    //API call
    let Violation = "";
    if (groupFormPopupData.id) {
      console.log("groupFormPopupData.id", groupFormPopupData.id);
      //PUT
      Violation = ModelsService.updateViolationPopupGroup(groupFormPopupData);
    } else {
      //POST
      Violation = ModelsService.createViolationPopupGroup(groupFormPopupData);
    }

    Violation.then((response) => {
      if (response) {
        // window.location.reload(true);
        props.setflag(true);

        const { data } = response?.data;
        setGroupFormPopupData({
          name: "",
          code: "",
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
  };

  const [value, setValue] = React.useState(0);
  function TabPanel(props) {
    console.log(props);
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  // function TabPanel(props) {
  //   const { children, value, index, ...other } = props;
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "#FFFFFF",
    // border: "2px solid #000",
    boxShadow: 24,
    height: "20%",
    p: 3,
  };
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
              // backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
              // border: `1px solid ${
              //   current_theme.palette.mode === "light"
              //     ? "#0D0D0D"
              //     : "#404145 !important"
              // }, opacity: 1 `,
            }}
            // className={classes.popupTitle}
            position="static"
          >
            {/* <div className={classes.titleCls}>Anpr Search</div>
            <div className={classes.closeCls}>
              <IconButton onClick={() => handleClose()}>
                <CloseOutlined />
              </IconButton>
            </div> */}
            <Box className={classes.popupTitle}>
              <Box
                sx={{
                  padding: "10px 15px",
                }}
              >
                {" "}
                <Typography className={classes.titleCls}>
                  {selectedrecord && selectedrecord.id ? "Edit" : "Add"}{" "}
                  Violations
                </Typography>
              </Box>
              <div className={classes.closeCls}>
                <IconButton onClick={() => handleClose()}>
                  <CloseOutlined />
                </IconButton>
              </div>
            </Box>
          </AppBar>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            className={classes.hotlistheader}
          ></Typography>
          {/* <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="" {...a11yProps(0)} />
             
            </Tabs>
          </Typography> */}
          {/* </Box> */}
          {/* <TabPanel value={value} index={0}> */}
          {/* {<FormInput/>} */}
          <Card
            variant="contained"
            sx={{
              display: "flex",
              gap: 3,
              mt: 4,
              bgcolor: "#FFFFFF !important",
            }}
          >
            <TextField
              // id="outlined-required"
              label="Violation Name"
              name="name"
              value={groupFormPopupData.name}
              variant="filled"
              onChange={(e) => handleInputChange(e, "name")}
              fullWidth
            />

            {/* {JSON.stringify(selectedrecord)}
              {JSON.stringify(groupFormPopupData)} */}

            <TextField
              // id="outlined-required"
              label="Violation Code "
              name="code"
              value={groupFormPopupData.code}
              variant="filled"
              onChange={(e) => handleInputChange(e, "code")}
              fullWidth
            />
          </Card>

          <div className={classes.buttondiv}>
            <div className={classes.buttonmain}>
              <Button
                variant="contained"
                className={classes.cancelButton}
                //  onClick={()=>setValue(value-1)}
                onClick={() => oncancel()}
              >
                {" "}
                Cancel{" "}
              </Button>
              <span className={classes.span}> </span>
              <Button
                variant="contained"
                className={classes.continueButton}
                onClick={() => handleAddGroup()}
              >
                {" "}
                {selectedrecord && selectedrecord.id
                  ? "  update  "
                  : "  Add  "}{" "}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
