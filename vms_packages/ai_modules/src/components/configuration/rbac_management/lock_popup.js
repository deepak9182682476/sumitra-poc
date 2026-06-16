import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Card,
  Typography,
  Button,
  AppBar,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { CloseOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
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
    backgroundColor: "#0D0D0D"
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
    padding: "8px"
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
    width: "85px"
  },
  buttoncolor: {
    backgroundColor: "#343434",
    border: "1px solid #8D8D8D",
    color: "#fff !important",
    fontSize: "12px",
    '&:hover': { backgroundColor: '#343434' }
  },
  span: {
    padding: "5px"
  },
}));

export default function LockPopup(props) {
  const classes = useStyles();
  const current_theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);

  const [userPwdFormData, setUserPwdFormPopupData] = useState({
    user_name: "",
    email_id: "",
    password: "",
  });

  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });


  const { selectedrecord } = props;

  useEffect(() => {
    if (selectedrecord) {
      setUserPwdFormPopupData({
        user_name: selectedrecord.user_name,
        email_id: selectedrecord.email_id,
        password: '',
      });
    }
  }, [props.selectedrecord]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClose = () => {
    if (typeof props.setModalStatus === "function") {
      props.setModalStatus(false);
    }
  };

  oncancel = () => {
    props.setModalStatus(false);
    props.resetSelectedRecord();
    setUserPwdFormPopupData({
      user_name: '',
      email_id: '',
      password: '',
    });
  };

  const handleSaveUserPwd = () => {
    if (selectedrecord && selectedrecord.id) {
      userPwdFormData.id = selectedrecord.id;
    }
    let userPwd = "";
    if (userPwdFormData.id) {
      userPwd = RbacService.updateUserPassword(userPwdFormData);
    }

    userPwd.then((response) => {
      if (response) {
        setUserPwdFormPopupData({
          user_name: "",
          email_id: "",
          password: "",
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

    setState({
      ...state,
      error: false,
      helperText: "",
    });
  };

  const handleChange = (event) => {
    setUserPwdFormPopupData({ ...userPwdFormData, [event.target.name]: event.target.value });
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 440,
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
                  Change Password
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
          >

          </Typography>
          <Card variant="contained">
            <table style={{ width: '100%' }}>
              <tr>
                <td>
                  <TextField
                    label="Username"
                    name="user_name"
                    autocomplete="off"
                    value={userPwdFormData.user_name}
                    variant="filled"
                    onChange={(e) => handleChange(e)}
                    fullWidth
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <TextField
                    label="Email ID"
                    name="email_id"
                    autocomplete="off"
                    value={userPwdFormData.email_id}
                    variant="filled"
                    onChange={(e) => handleChange(e)}
                    fullWidth
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <TextField
                    label="Password"
                    name="password"
                    autocomplete="off"
                    value={userPwdFormData.password}
                    variant="filled"
                    onChange={(e) => handleChange(e)}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment:
                        < InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                    }}
                  />
                </td>
              </tr>
            </table>
          </Card>

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
              <Button variant="contained"
                className={classes.buttontext}
                onClick={() => handleSaveUserPwd()}>
                {" "}
                Save{" "}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
