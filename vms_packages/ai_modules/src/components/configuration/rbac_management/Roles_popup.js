import React, { useEffect, useState } from "react";
import _ from "lodash";
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
} from "@mui/material";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { CloseOutlined } from "@mui/icons-material";
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
    "&:hover": { backgroundColor: "#343434" },
  },
  span: {
    padding: "5px"
  },
}));

export default function RolesPopup(props) {
  const classes = useStyles();
  const current_theme = useTheme();

  const handleClose = () => {
    if (typeof props.setModalStatus === "function" && typeof props.refreshContent === 'function') {
      props.setModalStatus(false);
      props.refreshContent(true);
}
  };

  const [roleFormData, setRoleFormData] = useState({
    role_name: "",
    role_code: "",
    is_active: 1,
    created_by: '',
    updated_by: ""
  });


  const handleInputChange = (e, key) => {
    e.preventDefault();
    const { value } = e.target;
    setRoleFormData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const oncancel = () => {
    props.setModalStatus(false);
    props.resetSelectedRecord();
    setRoleFormData({
      role_name: "",
      role_code: "",
      is_active: 1,
      created_by: '',
      updated_by: ""
    });

  }
  const { selectedrecord } = props;

  useEffect(() => {
    if (selectedrecord) {
      setRoleFormData({
        role_name: selectedrecord.role_name,
        role_code: selectedrecord.role_code,
        is_active: selectedrecord.is_active,
        created_by: '',
        updated_by: ""
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

  const handleAddGroup = () => {
    if (selectedrecord && selectedrecord.id) {
      roleFormData.id = selectedrecord.id;
    } else {
      // roleFormData.id = "";
    }

    //API call
    let role_call = "";
    if (roleFormData.id) {
      //PUT
      role_call = RbacService.updateRole(roleFormData);
    } else {
      //POST
      role_call = RbacService.saveRole(roleFormData);
    }

    role_call.then((response) => {
      if (response) {
        const { data } = response?.data;
        setRoleFormData({
          role_name: "",
          role_code: "",
          is_active: 1,
          created_by: '',
          updated_by: ""
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
                  {selectedrecord && selectedrecord.id ? "Update" : "Create"} Role
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
          <Grid container rowSpacing={2} sx={{ margin: "0px 5px" }}>
            <Grid item xs={6} sx={{ pr: 2 }}>
              <TextField
                autoComplete="off"
                label="Role Name"
                name="role_name"
                value={roleFormData.role_name}
                variant="filled"
                onChange={(e) => handleInputChange(e, "role_name")}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                autoComplete="off"
                label="Role Code"
                name="role_code"
                value={roleFormData.role_code}
                variant="filled"
                onChange={(e) => handleInputChange(e, "role_code")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Status</FormLabel>
                <RadioGroup
                  aria-label="status"
                  name="is_active"
                  value={roleFormData.is_active}
                  onChange={(e) => handleInputChange(e, "is_active")}
                  sx={{ flexDirection: 'row' }}
                >
                  <FormControlLabel value="1" control={<Radio />} label="Active" />
                  <FormControlLabel value="0" control={<Radio />} label="Inactive" />
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
              <Button variant="contained"
                className={classes.buttontext}
                onClick={() => handleAddGroup()}>
                {" "}
                {selectedrecord && selectedrecord.id ? "  Update  " : "  Save  "}{" "}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
