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
    Checkbox,
    FormGroup,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    rolesItemGrid: {
        overflowY: 'auto',
        minHeight: '350px',
        maxHeight: '350px',
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
    }
}));

export default function ActivityRolePopup(props) {
    const classes = useStyles();
    const current_theme = useTheme();

    const [activityList, setActivityList] = useState([]);
    const [activityRolesList, setActivityRolesList] = useState([]);
    const [modifiedActivityList, setModifiedActivityList] = useState([]);

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

    const [dialogOpen, setDialogOpen] = useState(false);

    const [state, setState] = useState({
        alertOpen: false,
        alertContent: "",
        vertical: "top",
        horizontal: "center"
    });

    const [isSuccess, setSuccess] = useState(false);

    const handleClose = () => {
        if (typeof props.setModalStatus === "function") {
            props.setModalStatus(false);
        }
    };

    const onCancel = () => {
        if (typeof props.setModalStatus === 'function') {
            props.setModalStatus(false);
        }
    }

    const { selectedrecord } = props;

    const logout_dialog = () => {
        setDialogOpen(true);
    }

    const handleOk = () => {
        if (typeof props.setModalStatus === "function") {
            props.setModalStatus(false);
            props.refreshContent(true);
            setDialogOpen(false);
            setState({ ...state, alertOpen: true, alertContent: "Successfully Activity Saved" });
            setSuccess(true);
        }
    }

    const handleAddGroup = () => {
        if (!selectedrecord || !selectedrecord.id) {
            return;
        }

        let userRoleActivity = "";
        if (selectedrecord.id) {
            const payload = {
                role_id: selectedrecord.id,
                activity_list: activityList,
                modifiedActivityList: modifiedActivityList
            }
            userRoleActivity = RbacService.saveRoleActivity(payload);
        }

        // console.log('modifiedActivityList', modifiedActivityList);
        userRoleActivity.then((response) => {
            if (response) {
                const { data, error, statusCode } = response?.data;
                if (error && statusCode === 500) {
                    setState({ ...state, alertOpen: true, alertContent: "Failed to Save Activity" });
                    setSuccess(false);
                    return;
                }
                setDialogOpen(true);
                logout_dialog();

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

    const handleActivityRoleChange = (e, key) => {
        e.preventDefault();
        let idx = activityList.findIndex(rec => rec.activity_name === e.target.name);
        if (idx !== -1) {
            activityList[idx].is_checked = e.target.checked;
            let modifiedIdx = modifiedActivityList.findIndex(rec => rec.id === activityList[idx].id);
            if (modifiedIdx === -1) {
                modifiedActivityList.push(activityList[idx]);
            } else if (modifiedIdx !== -1) {
                modifiedActivityList[modifiedIdx] = activityList[idx];
            }

            setModifiedActivityList(modifiedActivityList);
            setActivityList(Object.assign([], activityList));
        }
    };

    useEffect(() => {
        if (activityRolesList.length && selectedrecord) {
            RbacService.getActvityList().then((response) => {
                if (response && response.data) {
                    const { data } = response.data;
                    if (data && data.length) {
                        const roleActiveList = data.filter(rec => {
                            let is_available = activityRolesList.filter(val => val.activity_id === rec.id && val.role_id === selectedrecord.id).length > 0;
                            if (rec.is_active === '1') {
                                rec.is_checked = is_available;
                                return rec;
                            }
                        });
                        setActivityList(roleActiveList);
                    }
                }
            })
        }
    }, [activityRolesList, selectedrecord]);

    useEffect(() => {
        RbacService.getActvityRolesList().then((response) => {
            if (response && response.data) {
                const { data } = response.data;
                if (data && data.length) {
                    setActivityRolesList(data);
                }
            }
        })
    }, [])

    const { alertOpen, vertical, horizontal, alertContent } = state;

    return (
        <div>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={alertOpen}
                autoHideDuration={1000}
                onClose={() => setState({ ...state, alertOpen: false })}
            >
                <Alert
                    onClose={() => setState({ ...state, alertOpen: false })}
                    severity={isSuccess ? 'success' : 'error'}
                >
                    {alertContent}
                </Alert>
            </Snackbar>
            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                maxWidth="xs"
                open={dialogOpen}
            >
                <DialogTitle>Activity Role Update</DialogTitle>
                <DialogContent>
                    <Box>
                        To Effect Activity to Role,
                        Please logout and login again!!
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOk}>Ok</Button>
                </DialogActions>
            </Dialog>
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
                                    Manage Activity
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
                                        activityList.map((rec) =>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={rec.is_checked}
                                                        onChange={(e) => handleActivityRoleChange(e)}
                                                        name={rec.activity_name}
                                                    />
                                                }
                                                label={rec.activity_name}
                                            />
                                        )
                                    }
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <div className={classes.buttondiv}>
                        <div className={classes.buttonmain}>
                            <Button
                                variant="contained"
                                className={classes.buttoncolor}
                                onClick={() => onCancel()}
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
