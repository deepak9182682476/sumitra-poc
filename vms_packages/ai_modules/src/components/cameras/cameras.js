import React, { Fragment, useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { columns, rows } from "./cameras_config";
import { makeStyles } from "@mui/styles";
import Map from "./map/map";
import { MAP_CONFIG } from "../../config/map/map";
import { layers } from "./map/layerlist";

import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
// import IconButton from "@mui/material/IconButton";
// import InfoIcon from "@mui/icons-material/Info";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import "./cameras.css";

const itemData = [
  {
    img: "/assets/images/traffic.jpg",
    title: "EGRTH365",
    model: "Crowd Detection",
    author: "@bkristastucchio",
  },
  {
    img: "/assets/images/traffic.jpg",
    title: "ERGE35463",
    model: "Vehicle Detection",
    author: "@rollelflex_graphy726",
  },
  {
    img: "/assets/images/traffic.jpg",
    title: "GEFHETH56",
    model: "Crowd Detection",
    author: "@helloimnik",
  },
  {
    img: "/assets/images/traffic.jpg",
    title: "HRTER4635",
    model: "Vehicle Detection",
    author: "@nolanissac",
    // cols: 2,
  },
  {
    img: "/assets/images/traffic.jpg",
    title: "FGEYF4575632",
    model: "Vehicle Detection",
    author: "@hjrc33",
  },
  {
    img: "/assets/images/traffic.jpg",
    title: "FGDF47656",
    model: "Crowd Detection",
    author: "@hjrc33",
  },
];

// const tableHeight = 50 * (window.innerHeight / 100);

function CustomToolbar() {
  return (
    <GridToolbarContainer style={{ width: "100%" }}>
      <Typography style={{ flexGrow: "1" }}> Cameras </Typography>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${
        theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
      }`,
      backgroundColor: "#313131",
    },
    "& .MuiDataGrid-root": {
      fontSize: "12px !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important"
    },
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  card: {
    backgroundColor: "#202124 !important",
    color: "#fff !important",
    border: "1px solid #868686 !important",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fontsize: {
    fontSize: "0.75rem !important",
  },
  dataCamGridCls: {
    color: "#fff !important",
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      // height: "26vh !important",
      maxHeight: "30vh",
      minHeight: "30vh",
    },
    [theme.breakpoints.up(1401)]: {
      // height: "50vh !important",
      maxHeight: "87vh",
      minHeight: "79vh",
    },
  },
  cellsCls: {
    color: "#fff !important",
  },
  cameraFramesSection: {
    width: "100%",
    [theme.breakpoints.between(750, 1400)]: {
      height: "26vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "50vh !important",
    },
  },
  imageListCLs: {
    overflowY: "scroll",
    margin: "0px",
    [theme.breakpoints.between(750, 1400)]: {
      height: "26vh !important",
      width: "98vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "50vh !important",
      width: "98vh",
    },
  },
  imageListItemCLs: {
    [theme.breakpoints.between(750, 1400)]: {
      height: "26vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "50vh !important",
    },
  },
  itemListItemBar: {
    "& .MuiImageListItemBar-title": {
      fontSize: "13px !important",
    },
    "& .MuiImageListItemBar-subtitle": {
      marginTop: "3px",
    },
  },
}));

const Cameras = (props) => {
  const classes = useStyles();
  const [state, setState] = useState({ layerlist: [] });

  useEffect(() => {
    setState({ layerlist: [layers] });
  }, []);

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card variant="outlined" className={classes.card}>
            <CardContent
              component="div"
              className={[classes.dataGridCpd, classes.root].join(' ')}
            >
              <DataGrid
                columns={columns}
                className={classes.dataCamGridCls}
                rows={rows}
                rowHeight={35}
                headerHeight={40}
                components={{
                  Toolbar: CustomToolbar,
                }}
                getCellClassName={(params) => classes.cellsCls}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined" className={classes.card}>
            <CardContent
              component="div"
              className={(classes.cpd, classes.cameraFramesSection)}
            >
              <Map
                mapProps={MAP_CONFIG.mapProps}
                layers={state.layerlist}
              ></Map>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined" className={classes.card}>
            <CardContent
              component="div"
              className={classes.cameraFramesSection}
            >
              <ImageList className={classes.imageListCLs} cols={4}>
                {itemData.map((item) => (
                  <ImageListItem key={item.img}>
                    <img
                      src={`${item.img}?w=248&fit=crop&auto=format`}
                      srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                      alt={item.title}
                      loading="lazy"
                    />
                    <ImageListItemBar
                      className={classes.itemListItemBar}
                      title={`ID: ${item.title}`}
                      subtitle={item.model && item.model.toUpperCase()}
                      position="top"
                      // actionIcon={
                      //   <IconButton
                      //     sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                      //     aria-label={`info about ${item.title}`}
                      //   >
                      //     <InfoIcon />
                      //   </IconButton>
                      // }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Cameras;
