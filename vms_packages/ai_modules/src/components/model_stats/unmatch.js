import {
  Button,
  Dialog,
  DialogContent,
  MobileStepper,
  Grid,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

import React, { Fragment, useState } from "react";
import { Box, styled } from "@mui/system";
import { makeStyles, useTheme } from "@mui/styles";
import ModelsService from "../../services/models";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  boxRoot: {
    overflowY: "scroll",
    padding: "0px",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "27rem !important",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "45rem !important",
    },
  },
  "& .MuiFormControlLabel-root": {
    marginLeft: "0px !important",
  },
}));

// eslint-disable-next-line no-unused-vars
const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const UnMatchView = (props) => {
  const classes = useStyles();
  const { unmatchData } = props;
  const [state, setState] = useState({
    openImageModal: false,
    selectedItem: null,
  });
  const [activeStep, setActiveStep] = React.useState(0);
  // eslint-disable-next-line no-unused-vars
  const [checked, setChecked] = React.useState(false);
  const [saveEnable, setSaveEnable] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleChange = (event, item) => {
    setSaveEnable(false);
    item.checked = event.target.checked;
    setChecked(event.target.checked);
  };
  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageClick = (item) => {
    setState({
      ...state,
      openImageModal: true,
      selectedItem: item,
    });
    setChecked(false);
  };

  const modalClose = () => {
    setActiveStep(0);
    setState({
      ...state,
      openImageModal: false,
      selectedItem: null,
    });
  };

  const ConfirmSwitch = styled(Switch)(({ theme }) => ({
    padding: 8,
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      "&:before, &:after": {
        content: '""',
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 16,
        height: 16,
      },
      "&:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main)
        )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      "&:after": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main)
        )}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "none",
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  const { selectedItem } = state;
  const maxSteps = selectedItem?.data.length;

  const handleConfirmUnmatch = (item) => {
    let params = { id: item.id };
    if (item?.checked) {
      setSaveEnable(true);
      setLoading(true);
      ModelsService.setModelsConfidence(params)
        .then((res) => {
          if (res.status === 200) {
            props.setUnmatchDataRes(false);
            setAlertStatus("Confirmed Successfully", true, "success");
            setLoading(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          setAlertStatus("Confirmed Failed", true, "success");
          console.log("handleConfirmUnmatch", err);
        });
    }
  };

  const setAlertStatus = (content, status, severity) => {
    setAlertState({
      ...alertstate,
      alertOpen: status,
      alertContent: content,
      severity: severity,
    });
  };

  const BootstrapDialogTitle = (props) => {
    const { children, onClose, ...other } = props;

    return (
      <DialogTitle
        sx={{ m: 0, fontSize: "0.95rem", padding: "8px 16px 8px 24px" }}
        {...other}
      >
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  };

  const { alertOpen, vertical, horizontal, alertContent, severity } =
    alertstate;

  return (
    <Fragment>
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
      <Grid container direction="column">
        <Typography sx={{ backgroundColor: "#141414", p: 1 }} noWrap>
          Models - UnMatch
        </Typography>
        <Box
          className={classes.boxRoot}
          sx={{ flexGrow: 1, overflow: "hidden", px: 3 }}
        >
          {unmatchData &&
            unmatchData.map((item, index) => (
              <Fragment>
                <Paper
                  sx={{
                    backgroundColor: "#140f0f00",
                    maxWidth: "100%",
                    my: 1,
                    mx: "auto",
                    p: 1,
                  }}
                >
                  <Grid container wrap="nowrap" spacing={3}>
                    <Grid item xs sx={{ alignItems: "center" }}>
                      <Typography
                        sx={{
                          display: "flex",
                          fontSize: "0.85rem",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{ marginRight: "4px" }}
                        >
                          {index + 1} -{" "}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: "12px" }}>
                          {item.data && item.data.length
                            ? item.data[0].name.length > 20 ? item.data[0].name.substring(0, 20) + '...' : item.data[0].name
                            : ""}
                        </Typography>
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ marginLeft: "1.5rem", float:'left', fontSize: "10px" }}
                      >
                        Score:{" "}
                        {item.data && item.data.length
                          ? Math.round(item.data[0].score * 100)
                          : ""}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs
                      sx={{ display: "flex", alignItems: "center" }}
                      zeroMinWidth
                      direction="row"
                    >
                      <Typography sx={{ fontSize: "12px" }}>
                        {new Date(item.datetime).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs sx={{ height: "60px", width: "30px" }}>
                      <img
                        src={"data:image/png;base64," + item.image}
                        onClick={() => {
                          handleImageClick(item);
                        }}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "contain",
                        }}
                        alt={"img" + item.name + index}
                        loading="lazy"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Fragment>
            ))}
        </Box>
        <Dialog
          onBackdropClick="false"
          open={state.openImageModal}
          onClose={modalClose}
          size={"md"}
        >
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={modalClose}
          >
            Detected Frames
          </BootstrapDialogTitle>
          <DialogContent>
            <Box sx={{ maxWidth: 400, flexGrow: 1 }}>
              <Paper
                square
                elevation={0}
                sx={{
                  alignItems: "center",
                  bgcolor: "background.default",
                }}
              >
                <Box sx={{ maxWidth: 400, flexGrow: 1, p: 2 }}>
                  <Grid
                    item
                    xs
                    sx={{ pb: 1, display: "flex", alignItems: "center" }}
                  >
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      Detected Name : {selectedItem?.data[activeStep]?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      Score :{" "}
                      {Math.round(selectedItem?.data[activeStep]?.score * 100)}
                    </Typography>
                  </Grid>
                  <Grid item xs sx={{ alignItems: "center" }}>
                    <Typography sx={{ display: "flex", fontSize: "0.85rem" }}>
                      <Typography sx={{ mr: 4, fontSize: "0.85rem" }}>
                        <FormControlLabel
                          control={
                            <ConfirmSwitch
                              checked={
                                selectedItem?.data[activeStep]?.checked || false
                              }
                              onChange={(event) =>
                                handleChange(
                                  event,
                                  selectedItem?.data[activeStep]
                                )
                              }
                            />
                          }
                          labelPlacement="start"
                          label={
                            <Typography
                              sx={{
                                fontSize: "0.85rem",
                                marginLeft: "0px !important",
                              }}
                            >
                              Confirm Name
                            </Typography>
                          }
                        />
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        <Button
                          onClick={() =>
                            handleConfirmUnmatch(selectedItem?.data[activeStep])
                          }
                          disabled={saveEnable}
                          variant="contained"
                          color="primary"
                          size="small"
                        >
                          SAVE
                        </Button>
                      </Typography>
                    </Typography>
                  </Grid>
                </Box>
                <Grid
                  item
                  xs
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 255,
                    maxWidth: 360,
                    width: "100%",
                    margin: "0 16px",
                  }}
                >
                  <img
                    src={
                      "data:image/png;base64," +
                      selectedItem?.data[activeStep]?.image
                    }
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    alt={"img" + activeStep}
                    loading="lazy"
                  />
                </Grid>
              </Paper>

              <MobileStepper
                variant="text"
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                  <Button
                    size="small"
                    onClick={handleNext}
                    disabled={activeStep === maxSteps - 1}
                  >
                    Next
                    {theme.direction === "rtl" ? (
                      <KeyboardArrowLeft />
                    ) : (
                      <KeyboardArrowRight />
                    )}
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    {theme.direction === "rtl" ? (
                      <KeyboardArrowRight />
                    ) : (
                      <KeyboardArrowLeft />
                    )}
                    Back
                  </Button>
                }
              />
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "green[500]",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Grid>
    </Fragment>
  );
};

export default UnMatchView;
