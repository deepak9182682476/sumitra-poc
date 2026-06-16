import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Typography,
  Button,
  AppBar,
  IconButton,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
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

  buttoncolor: {
    backgroundColor: "#343434",
    border: "1px solid #8D8D8D",
    color: "#fff !important",
    fontSize: "12px",
    '&:hover': { backgroundColor: '#343434' }
  },
  rolesGrid: {
    padding: '20px 0px 5px',
    overflow: 'hidden',

    "& ::-webkit-scrollbar": {
      width: "3px",
      height: "100%",
      marginRight: "4px",
      backgroundColor: "#3D81F5",
    },
    "& ::-webkit-scrollbar-thumb": {
      background: "red",
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

  rolesItemGrid: {
    overflowY: 'auto',
    minHeight: '350px',
    maxHeight: '350px',
  }
}));

export default function AdminPopup(props) {
  const classes = useStyles();
  const current_theme = useTheme();

  const handleClose = () => {
    if (typeof props.setModalStatus === "function") {
      props.setModalStatus(false);
    }
  };

  const [rolesList, setRolesList] = useState([]);

  const [mode, setMode] = useState(null);
  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [modifiedRolesList, setModifiedRolesList] = useState([]);
  const [userRolesList, setUserRolesList] = useState([]);
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });

  const { selectedrecord } = props;

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 840,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    padding: '32px  0px  6px 25px',
  };

  useEffect(() => {
    RbacService.getUserRoles().then((response) => {
      if (response && response.data) {
        const { data } = response.data;
        if (data && data.length) {
          setUserRolesList(data);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (userRolesList.length && selectedrecord) {
      RbacService.getRoles().then((response) => {
        if (response && response.data) {
          const { data } = response.data;
          if (data && data.length) {
            const roleActiveList = data.filter(rec => {
              let is_available = userRolesList.filter(val => val.role_id === rec.id && val.user_id === selectedrecord.id).length > 0;
              if (rec.is_active === '1') {
                rec.is_checked = is_available;
                return rec;
              }
            });
            setRolesList(roleActiveList);
          }
        }
      })
    }
  }, [userRolesList, selectedrecord])

  const onCancel = () => {
    if (typeof props.setModalStatus === 'function') {
      props.setModalStatus(false);
    }
  };

  const handleRoleChange = (e) => {
    let idx = rolesList.findIndex(rec => rec.role_code === e.target.name);
    if (idx !== -1) {
      rolesList[idx].is_checked = e.target.checked;
      let modifiedIdx = modifiedRolesList.findIndex(rec => rec.id === rolesList[idx].id);
      if (modifiedIdx === -1) {
        modifiedRolesList.push(rolesList[idx]);
      } else if (modifiedIdx !== -1) {
        modifiedRolesList[modifiedIdx] = rolesList[idx];
      }

      setModifiedRolesList(modifiedRolesList);
      setRolesList(Object.assign([], rolesList));
    }
  };

  const handleAddUserRole = () => {
    if (!selectedrecord || !selectedrecord.id) {
      return;
    }

    let userrole = "";
    if (selectedrecord.id) {
      const payload = {
        user_id: selectedrecord.id,
        roles_list: rolesList,
        modifiedRolesList: modifiedRolesList
      }
      userrole = RbacService.saveUserRole(payload);
    }

    userrole.then((response) => {
      if (response) {
        const { data } = response?.data;
        if (typeof props.setModalStatus === "function") {
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
  };


  return (
    <div>
      <Modal
        open={props.open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }} aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className={{ root: classes.root }}>
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
                <Typography className={classes.titleCls}>
                  Manage Roles
                </Typography>
              </Box>
              <div className={classes.closeCls}>
                <IconButton onClick={() => handleClose()}>
                  <CloseOutlined />
                </IconButton>
              </div>
            </Box>
          </AppBar>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0}
            className={classes.rolesGrid}
          >
            <Grid item xs={12} className={classes.rolesItemGrid}>
              <FormControl component="fieldset">
                <FormGroup>
                  {
                    rolesList.map((rec) =>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rec.is_checked}
                            onChange={(e) => handleRoleChange(e)}
                            name={rec.role_code}
                          />
                        }
                        label={rec.role_name}
                      />
                    )
                  }
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Grid item xs={1.5}>
              <Button
                variant="contained"
                className={classes.buttoncolor}
                onClick={() => onCancel()}
              >
                {" "}
                Cancel{" "}
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained"
                className={classes.buttontext}
                onClick={() => handleAddUserRole()}>
                {" "}
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
