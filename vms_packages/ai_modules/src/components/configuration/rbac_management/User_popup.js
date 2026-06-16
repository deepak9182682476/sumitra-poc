
import React, { useEffect, useState } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Grid,
  Typography,
  Button,
  AppBar,
  IconButton,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Snackbar,
  Alert
} from "@mui/material";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

import { CloseOutlined } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import RbacService from "../../../services/rbac_service";

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
    backgroundColor: "#0D0D0D",
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
    border: "1px solid #8D8D8D",
    color: "#fff !important",
    fontSize: "12px",
    "&:hover": { backgroundColor: "#343434" },
  },
  span: {
    padding: "5px",
  },
}));

export default function UserPopup(props) {
  const classes = useStyles();
  const current_theme = useTheme();

  const handleClose = () => {
    if (typeof props.setModalStatus === "function") {
      oncancel();
      handleCloseSnackbar();
    }
  };

  const [userFormData, setUserFormData] = useState({
    user_name: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email_id: "",
    phone_number: "",
    is_active: 1,
    dob: new Date(),
    doj: new Date(),
    gender: "",
    address: "",
    designation: "",
    user_image: ""
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };


  const handleInputChange = (e, key) => {
    e.preventDefault();
    const { value } = e.target;
    setUserFormData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const { selectedrecord } = props;

  useEffect(() => {
    if (selectedrecord) {
      // console.log('selectedrecord', selectedrecord);
      setUserFormData({
        group: selectedrecord.group,
        user_name: selectedrecord.user_name,
        first_name: selectedrecord.first_name,
        middle_name: selectedrecord.middle_name,
        last_name: selectedrecord.last_name,
        email_id: selectedrecord.email_id,
        phone_number: selectedrecord.phone_number,
        is_active: 1,
        dob: selectedrecord.dob,
        doj: selectedrecord.doj,
        gender: selectedrecord.gender,
        address: selectedrecord.address,
        designation: selectedrecord.designation,
        user_image: selectedrecord.user_image
      });
    }
  }, [props.selectedrecord]);

  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });

  const handleAddUser = () => {
    if (selectedrecord && selectedrecord.id) {
      userFormData.id = selectedrecord.id;
    } else {
      // userFormData.id = "";
    }

    if (!userFormData.first_name || !userFormData.last_name || !userFormData.email_id || !userFormData.phone_number || !userFormData.user_name) {
      return setOpenSnackbar(true);
    }

    let user_form = "";

    if (userFormData.id) {
      //PUT
      user_form = RbacService.updateUser(userFormData);
    } else {
      //POST
      user_form = RbacService.saveUser(userFormData);
    }


    user_form.then((response) => {
      if (response) {
        setUserFormData({
          user_name: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          email_id: "",
          phone_number: "",
          is_active: 1,
          dob: new Date(),
          doj: new Date(),
          gender: "",
          address: "",
          designation: "",
          user_image: ""
        });
        if (typeof props.setModalStatus === "function" && typeof props.refreshContent === 'function') {
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
  };

  const handleChange = (event) => {
    setUserFormData({ ...userFormData, [event.target.name]: event.target.value });
  };

  const handleDateChange = (name, date) => {
    setUserFormData({ ...userFormData, [name]: date });
  };

  const oncancel = () => {
    props.setModalStatus(false);
    props.resetSelectedRecord();
    handleCloseSnackbar();
    setUserFormData({
      user_name: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email_id: "",
      phone_number: "",
      is_active: 1,
      dob: new Date(),
      doj: new Date(),
      gender: "",
      address: "",
      designation: "",
      user_image: ""
    });
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 840,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
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
              backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
              border: `1px solid ${current_theme.palette.mode === "light"
                ? "#0D0D0D"
                : "#404145 !important"
                }, opacity: 1 `,
            }}
            // className={classes.popupTitle}
            position="static"
          >
            <Box className={classes.popupTitle}>
              <Box
                sx={{
                  padding: "10px 15px",
                }}
              >
                {" "}
                <Typography className={classes.titleCls}>
                {selectedrecord && selectedrecord.id ? "Update" : "Add"}  User</Typography>
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
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Username"
                name="user_name"
                value={userFormData.user_name}
                onChange={handleChange}
                variant="filled"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="First Name"
                name="first_name"
                value={userFormData.first_name}
                onChange={handleChange}
                variant="filled"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Middle Name"
                name="middle_name"
                value={userFormData.middle_name}
                onChange={handleChange}
                variant="filled"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Last Name"
                name="last_name"
                value={userFormData.last_name}
                onChange={handleChange}
                fullWidth
                variant="filled"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Phone No."
                name="phone_number"
                value={userFormData.phone_number}
                onChange={handleChange}
                fullWidth
                variant="filled"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Email"
                name="email_id"
                value={userFormData.email_id}
                onChange={handleChange}
                fullWidth
                variant="filled"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Address"
                name="address"
                value={userFormData.address}
                onChange={handleChange}
                fullWidth
                variant="filled"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Designation"
                name="designation"
                value={userFormData.designation}
                onChange={handleChange}
                fullWidth
                variant="filled"
              />
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  name="dob"
                  value={userFormData.dob}
                  onChange={(date) => handleDateChange("dob", date)}
                  fullWidth
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Joining"
                  name="doj"
                  value={userFormData.doj}
                  onChange={(date) => handleDateChange("doj", date)}
                  fullWidth
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  aria-label="status"
                  name="status"
                  value={userFormData.gender}
                  onChange={(e) => handleInputChange(e, "gender")}
                  sx={{ flexDirection: 'row' }}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="other" control={<Radio />} label="Others" />
                </RadioGroup>

              </FormControl>
            </Grid>

          </Grid>

          <div className={classes.buttondiv}>
            <div className={classes.buttonmain}>
              <Button
                variant="contained"
                className={classes.buttoncolor}
                onClick={() => oncancel()}
              >
                {" "}
                Cancel{" "}
              </Button>
              <span className={classes.span}> </span>
              <Button
                variant="contained"
                className={classes.buttontext}
                onClick={() => handleAddUser()}
              >
                {" "}
                {selectedrecord && selectedrecord.id ? "  update  " : "  Add  "}
                {" "}
              </Button>
            </div>
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
                severity="error"
                sx={{ width: "100%" }}
              >
                Please Fill All Mandatory Details to Proceed!
              </Alert>
            </Snackbar>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
