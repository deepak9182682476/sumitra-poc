import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  MobileStepper,
  Paper,
  Typography,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import { Box } from "@mui/system";
import React, { Fragment, useState } from "react";

const useStyles = makeStyles((theme) => ({
  boxRoot: {
    padding: "0px",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "27rem",
      overflowY: "scroll",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "45rem",
      overflowY: "scroll",
    },
  },
}));

const MatchView = (props) => {
  const classes = useStyles();
  const { matchData } = props;
  const [state, setState] = useState({
    openImageModal: false,
    selectedItem: null,
  });
  const [activeStep, setActiveStep] = React.useState(0);
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
  };

  const modalClose = () => {
    setActiveStep(0);
    setState({
      ...state,
      openImageModal: false,
      selectedItem: null,
    });
  };

  const { selectedItem } = state;
  const maxSteps = selectedItem?.data.length;

  return (
    <Fragment>
      <Grid container direction="column">
        <Typography sx={{ backgroundColor: "#141414", p: 1 }} noWrap>
          Models - Match
        </Typography>
        <Box
          className={classes.boxRoot}
          sx={{ flexGrow: 1, overflow: "hidden", px: 3 }}
        >
          {matchData &&
            matchData.map((item, index) => (
              <Fragment>
                <Paper
                  sx={{
                    backgroundColor: "#140f0f00",
                    maxWidth: "80%",
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
                        <Typography
                          component="span"
                          sx={{ fontSize: "12px"}}
                        >
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
                    >
                      <Typography
                        sx={{ fontSize: "12px", alignItems: "center" }}
                      >
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
                        alt={"img" + index}
                        loading="lazy"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Fragment>
            ))}
        </Box>
        <Dialog open={state.openImageModal} onClose={modalClose} size={"md"}>
          <DialogContent
            sx={{ p: 0, border: "1px solid #817d7d54", borderRadius: "5px" }}
          >
            <Box sx={{ minWidth: 400, flexGrow: 1, p: 0 }}>
              <Paper
                square
                elevation={0}
                sx={{
                  alignItems: "center",
                  bgcolor: "background.default",
                }}
              >
                <Box sx={{ minWidth: 400, flexGrow: 1, p: 1 }}>
                  <Grid
                    item
                    xs
                    sx={{ pb: 1, display: "flex", alignItems: "center" }}
                  >
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      Detected Name : {selectedItem?.data[activeStep]?.name}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs
                    sx={{ pb: 1, display: "flex", alignItems: "center" }}
                  >
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      Score :{" "}
                      {Math.round(selectedItem?.data[activeStep]?.score * 100)}
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
                    margin: "0 auto",
                    padding: "3px",
                    border: "1px solid #d0d0d0",
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
                      objectFit: "fill",
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
            </Box>
          </DialogContent>
        </Dialog>
      </Grid>
    </Fragment>
  );
};

export default MatchView;
