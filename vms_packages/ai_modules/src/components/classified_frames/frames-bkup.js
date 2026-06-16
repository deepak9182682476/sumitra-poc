import React, { Fragment, useState, useEffect } from "react";
import {
  Grid,
  Dialog,
  DialogContent,
  Card,
  CardMedia,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import SingleSelect from "../../common/select";
import { LABELS } from "../../config/tabs_constants/labels";

const useStyles = makeStyles((theme) => {
  return {
    container: {
      height: "90vh",
      display: "flex",
      flexWrap: "nowrap",
    },
    imageContainer: {
      display: "flex",
      flexGrow: 1,
      flexWrap: "wrap",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      minHeight: "20vh",
      maxHeight: "20vh",
      [theme.breakpoints.between(750, 1400)]: {
        minHeight: "20vh !important",
        maxHeight: "20vh !important",
      },
      [theme.breakpoints.up(1401)]: {
        minHeight: "29vh !important",
        maxHeight: "29vh !important",
      },
    },
    image: {
      maxWidth: "100%",
    },
    moduletitle: {
      width: "100%",
      textAlign: "center",
      borderBottom: "1px solid #606060",
      lineHeight: "0.1em",
      margin: "10px 0 20px",
    },
    modulespan: {
      padding: "0 10px",
      backgroundColor: "#141414",
    },
    detailscls: {
      margin: "2px",
      position: "absolute",
      backgroundColor: "#00000073",
      opacity: "0.8",
    },
    card: {
      backgroundColor: "#202124 !important",
      color: "#fff !important",
      border: "1px solid #868686 !important",
      height: "100%",
      maxHeight: "100%",
      margin: "2px 1px",
    },
    ".MuiCardContent-root:last-child": {
      paddingBottom: "0px !important",
    },
    imageModal: {
      "& .MuiDialogContent-root": {
        padding: "10px !important",
      },
    },
  };
});

const Frames = (props) => {
  const theme = useTheme();
  const [state, setState] = useState({
    selectedCamera: null,
    openImageModal: false,
    selectedImage: "",
    imagesData: [],
  });

  const classes = useStyles();

  const handleImageClick = (image) => {
    setState((prevstate) => ({
      ...prevstate,
      openImageModal: true,
      selectedImage: `data:image/png;base64,${image}`,
    }));
  };

  const modalClose = () => {
    setState((prevstate) => ({
      ...prevstate,
      openImageModal: false,
      selectedImage: "",
    }));
  };

  useEffect(() => {
    if (props.imagesData) {
      setState({ ...state, imagesData: props.imagesData });
    }
  }, [props.imagesData]);

  return (
    <Fragment>
      <Grid item pt={1} pb={0.5}>
        <Grid container justify="center">
          <SingleSelect
            width={270}
            addDefault={true}
            label={LABELS.MODEL}
            size="small"
            options={props.selectedModel}
            propKey="id"
            setSelectVal={(val) => {
              if (typeof props.setFrameSelected === "function") {
                props.setFrameSelected(val);
              }
            }}
          />
        </Grid>
      </Grid>
      <Grid item>
        <Grid
          className={classes.imageContainer}
          container
          justifyContent="flex-start"
          alignItems="flex-start"
          direction="row"
        >
          {state.imagesData &&
            state.imagesData.length > 0 &&
            state.imagesData.map((rec, index) => {
              return (
                <Card
                  sx={{ display: "flex" }}
                  className={classes.card}
                  style={{ margin: "5px 5px 5px", border: "202124" }}
                >
                  {/* <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ flex: "1 0 auto", padding: "0px" }}>
                      <Typography component="div" sx={{ padding: "4px" }}>
                        <Typography sx={{ fontSize: "10px" }}>
                          {/* {new Date(rec?.datetime * 1000).toLocaleString()} 
                        </Typography>
                        <Typography sx={{ fontSize: "10px" }}>
                          {/* {rec?.data[0].name}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Box> */}
                  <CardMedia
                    component="img"
                    sx={{
                      width: theme.breakpoints.up(1401) ? 160 : 118,
                      padding: "5px #fff !important",
                    }}
                    image={`data:image/jpg;base64,${rec}`}
                    alt="image"
                    onClick={() => {
                      handleImageClick(rec);
                    }}
                  />
                </Card>
              );
            })}
          <Dialog
            classes={{ paper: classes.imageModal }}
            open={state.openImageModal}
            onClose={modalClose}
            size={"md"}
          >
            <DialogContent>
              <Grid container>
                <Card>
                  <CardMedia
                    component="img"
                    alt="image"
                    image={state.selectedImage}
                  />
                  {/* <CardContent>
                              <Typography gutterBottom variant="body2" component="a"
                                onClick={() => setState((prevState) => ({ ...prevState, alertToggle: !state.alertToggle }))}>
                                More Info
                              </Typography>
                              {
                                state.alertToggle &&
                                <Typography variant="body2" color="text.secondary">
                                  {getAlertInfo()}
                                </Typography>
                              }
                            </CardContent> */}
                </Card>
              </Grid>
            </DialogContent>
          </Dialog>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Frames;
