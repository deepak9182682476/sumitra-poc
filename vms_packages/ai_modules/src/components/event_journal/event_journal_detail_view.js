import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import React, { Fragment, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import { useHistory } from "react-router-dom";
import ArrowCircleLeftSharpIcon from "@mui/icons-material/ArrowCircleLeftSharp";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventJournalMap from "./event_journal_map";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import vehicles from "../../assets/images/logo/vechicles.png";
import StreamComponent from "../livesystem/streaming";
import EventJournalDetailMap from "./event_journal_detail_map";
import moment from "moment";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      height: "53vh",
      width: "81vw",
      marginLeft: "-1px",
      fontSize: "0.9rem !important",
      marginTop: "16px",
      paddingLeft: "16px !important",

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
        borderRadius: "5px",
      },
      "& :: -webkit-scrollbar-thumb": {
        borderRadius: "5px",
      },
    },

    cpd: {
      padding: "0px !important",
    },

    card: {
      backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
      height: "80vh",
      marginTop: "-16px",
      width: "100%",
      "& .MuiCardHeader-root": {
        padding: "2px 12px !important",
      },
      "& .MuiTypography-root": {
        fontSize: "13px !important",
        color: `${theme.palette?.primary?.title}`,
      },
      "& .MuiButton-root": {
        "&:hover": {
          backgroundColor: "inherit !important",
          color: "inherit !important",
          boxShadow: "none !important",
        },
      },
    },

    backArrow: {
      "& .MuiSvgIcon-root": {
        fontSize: "2rem !important",
      },
    },
    cpd: {
      padding: "0px  !important",
    },
    fontsize: {
      fontSize: "0.75rem !important",
    },
    appbar: {
      background: `#DCDCDC 0% 0% no-repeat padding-box !important`,
      color: "#707070 !important",
      boxShadow: "0px 3px 6px #00000029",
      opacity: "1",
      width: "98%",
    },
    toolbar: {
      minHeight: "35px",
      maxHeight: "35px",
    },
    liveframe: {
      marginTop: "4px",
      //   border: `1px solid ${theme.palette.primary.borderLive}`,
      boxShadow: "0px 3px 6px #00000029",
      borderRadius: "3px",
      height: "40vh",
      [theme.breakpoints.between(750, 1400)]: {
        height: "49vh !important",
      },
      [theme.breakpoints.up(1401)]: {
        height: "49vh !important",
      },
    },
    buttonRoot: {
      textTransform: "none !important",
      fontSize: "0.75rem !important",
      padding: "4px 12px !important",
      boxShadow: "none !important",
      "&:hover": {
        backgroundColor: "inherit !important",
        color: "inherit !important",
        boxShadow: "none !important",
      },
    },
  };
});

const EventJounalDetailView = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { state } = props.location;
  const [showEvent, setShowEvent] = React.useState(true);
  const [vmsUrl, setVmsUrl] = useState(null);
  const [selectedView, setSelectedView] = useState("event");

  const handleView = (val) => {
    setSelectedView(val ? "event" : "map");
    setShowEvent(val);
  };

  useEffect(() => {
    console.log("state", state);
  }, [state]);
  return (
    <React.Fragment>
      <Box sx={{ display: "flex", marginTop: "3rem" }}>
        <IconButton
          size="large"
          edge="start"
          aria-label=" to redirect back"
          aria-controls="event-map"
          aria-haspopup="true"
          className={classes.backArrow}
          onClick={() => history.push("/journal")}
          color="inherit"
          sx={{ color: "#37720B" }}
        >
          <ArrowCircleLeftSharpIcon />
          <p style={{ fontSize: "16px" }}>Back</p>
        </IconButton>
      </Box>
      <h2 style={{ color: "#76B845", marginTop: -4 }}>{state?.camera_name}</h2>
      <AppBar className={classes.appbar} position="static">
        <Toolbar className={classes.toolbar}>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <IconButton
              size="small"
              edge="end"
              aria-label="map of current user"
              aria-controls="event-map"
              aria-haspopup="true"
              onClick={() => handleView(true)}
              color="inherit"
              sx={{
                fontSize: "14px !important",
                color: selectedView === "event" ? "#37720B" : "inherit",
                borderRadius: "0 !important",
                borderBottom:
                  selectedView === "event" ? "2px solid #37720B" : "none",
              }}
            >
              <CollectionsOutlinedIcon />
              Event
            </IconButton>
            <IconButton
              size="small"
              edge="end"
              aria-label="map of current user"
              aria-controls="event-map"
              aria-haspopup="true"
              onClick={() => handleView(false)}
              color="inherit"
              sx={{
                fontSize: "14px !important",
                color: selectedView === "map" ? "#37720B" : "inherit",
                borderRadius: "0 !important",
                borderBottom:
                  selectedView === "map" ? "2px solid #37720B" : "none",
              }}
            >
              <MapOutlinedIcon />
              Map View
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box>
        {showEvent ? (
          <>
            <Grid
              container
              justifyContent="space-evenly"
              className={classes.root}
              spacing={2.5}
            >
              <Grid item xs={6} className={classes.liveframe}>
                <video  width="640" height="360"  controls>
                  <source
                    src={`http://localhost:4000/video/${state.data_set.video_path}`}
                    type="video/mp4"
                  />
                </video>
                {/* <StreamComponent vmsUrl={vmsUrl} /> */}
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{ minWidth: '640px', maxHeight: '470px' }}
                  className={classes.card}
                >
                  <CardMedia
                    image={state.image}
                    title="green iguana"
                    component="img"
                    alt="image"
                  />
                </Card>
              </Grid>
            </Grid>
            <Grid container>
              <Grid
                item
                xs={6}
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  color: "#37720B !important",
                  fontSize: "0.75rem !important",
                  textTransform: "none !important",
                }}
              >
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    color="inherit"
                    sx={{
                      fontSize: "0.85rem",
                      textTransform: "none",
                    }}
                  >
                    Start
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DateRangeOutlinedIcon fontSize="small" />
                    <Typography
                      sx={{ fontSize: "0.75rem", textTransform: "none" }}
                    >
                      {moment(state.data_set.video_start_time).format("YYYY-MM-DD")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeOutlinedIcon fontSize="small" />
                    <Typography
                      sx={{ fontSize: "0.75rem", textTransform: "none" }}
                    >
                      {moment(state.data_set.video_start_time).format('HH:mm:ss')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    color="inherit"
                    sx={{ fontSize: "0.85rem", textTransform: "none" }}
                  >
                    End
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DateRangeOutlinedIcon fontSize="small" />
                    <Typography
                      sx={{ fontSize: "0.75rem", textTransform: "none" }}
                    >
                       {moment(state.data_set.video_end_time).format("YYYY-MM-DD")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeOutlinedIcon fontSize="small" />
                    <Typography
                      sx={{ fontSize: "0.75rem", textTransform: "none" }}
                    >
                       {moment(state.data_set.video_end_time).format('HH:mm:ss')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    color="inherit"
                    sx={{
                      fontSize: "0.85rem",
                      textTransform: "none",
                    }}
                  >
                    Event
                  </Typography>
                  <Button
                    sx={{
                      bgcolor: "#DD2725",
                      color: "#fff",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      padding: "2px 8px",
                    }}
                    className={classes.buttonRoot}
                  >
                    {state.model_name}
                  </Button>
                </Grid>

                {/* <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    color="inherit"
                    sx={{
                      fontSize: "0.85rem",
                      textTransform: "none",
                    }}
                  >
                    Class
                  </Typography>
                  <Button
                    sx={{
                      bgcolor: "#8653AC",
                      color: "#fff",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      padding: "2px 8px",
                    }}
                    className={classes.buttonRoot}
                  >
                    Truck
                  </Button>
                </Grid> */}
              </Grid>
              <Grid
                item
                xs={5.4}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  height: "30px !important",
                }}
              >
                <Button
                  sx={{
                    backgroundColor: "#37720B",
                    color: "#FFFFFF !important",
                    fontSize: "12px !important",
                  }}
                  className={classes.buttonRoot}
                >
                  Accept
                </Button>
                <Button
                  sx={{
                    backgroundColor: "#BB6A69",
                    color: "#FFFFFF !important",
                    fontSize: "12px !important",
                  }}
                  className={classes.buttonRoot}
                >
                  Decline
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <EventJournalDetailMap />
          </>
        )}
      </Box>
    </React.Fragment>
  );
};

export default EventJounalDetailView;
