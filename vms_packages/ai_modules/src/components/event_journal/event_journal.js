import * as React from "react";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import { makeStyles } from "@mui/styles";
import EventJournalMap from "./event_journal_map";
import EventJounalView from "./event_journal_view";
import ArrowCircleLeftSharpIcon from "@mui/icons-material/ArrowCircleLeftSharp";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "75vh",
    width: "81vw",
    marginLeft: "-1px",
    fontSize: "0.9rem !important",
    marginTop: "0px",
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
    marginTop: -8,
    background: `${theme.palette?.primary?.appBarBg} 0% 0% no-repeat padding-box !important`,
    boxShadow: "0px 3px 6px #00000029",
    opacity: "1",
    width: "96%",
  },
  toolbar: {
    minHeight: "35px",
    maxHeight: "35px",
    backgroundColor: "#DCDCDC",
    color: "#4A4A4A",
  },
}));

const EventJounal = () => {
  const classes = useStyles();
  const [showList, setShowList] = React.useState(true);
  const [selectedView, setSelectedView] = React.useState("");

  const handleMapView = () => {
    setSelectedView("map");
    setShowList(!showList);
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", mt: 5 }}>
        {!showList ? (
          <IconButton
            size="large"
            edge="start"
            aria-label=" to redirect back"
            aria-controls="event-map"
            aria-haspopup="true"
            className={classes.backArrow}
            onClick={handleMapView}
            color="inherit"
            style={{ color: "#76B845" }}
          >
            <ArrowCircleLeftSharpIcon />
          </IconButton>
        ) : null}
        <h2 style={{ color: "#76B845" }}>Event Journal</h2>
      </Box>
      <AppBar className={classes.appbar} position="static">
        <Toolbar className={classes.toolbar}>
          <Box>
            <div>Events List</div>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="small"
              edge="end"
              aria-label="map of current user"
              aria-controls="event-map"
              aria-haspopup="true"
              onClick={handleMapView}
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
        {showList ? (
          <>
            <EventJounalView />
          </>
        ) : (
          <>
            <EventJournalMap />
          </>
        )}
      </Box>
    </React.Fragment>
  );
};

export default EventJounal;
