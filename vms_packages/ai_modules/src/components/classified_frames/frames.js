
import React, { Fragment, useState, useEffect } from "react";
import {
  Grid,
  Dialog,
  DialogContent,
  Card,
  CardMedia
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import SingleSelect from "../../common/select";
// import { config_data } from "../../config/config";
// import data from "../model_stats/dummy_response.json";
// import ModelsService from "../../services/models";
import AlertsService from "../../services/alerts";
import { LABELS } from "../../config/tabs_constants/labels";
// import { useTheme } from "@emotion/react";

const useStyles = makeStyles((theme) => {
  return {
    main: {
      backgroundColor: theme.palette.primary.selectBg,
      color: theme.palette.primary.color,
    },

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
        minHeight: "33vh !important",
        maxHeight: "33vh !important",
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
    },
    cardImg: {
      width: "605px",
      objectFit: "fill",
      [theme.breakpoints.between(750, 1400)]: {
        height: "134px",
      },
      [theme.breakpoints.up(1401)]: {
        height: "290px",
      },
    },
    ".MuiCardContent-root:last-child": {
      paddingBottom: "0px !important",
    },
  };
});

const Frames = (props) => {
  // const theme = useTheme();
  const [state, setState] = useState({
    selectedCamera: null,
    openImageModal: false,
    selectedImage: "",
    imagesData: [],
    result: null,
    frameImg: "",
  });

  const [selectedFrameModel, setSelectedFrameModel] = useState('')

  const classes = useStyles();

  const handleImageClick = (image) => {
    setState({
      ...state,
      openImageModal: true,
      selectedImage: image,
    });
  };

  const modalClose = () => {
    setState({
      ...state,
      openImageModal: false,
      selectedImage: "",
      result: null,
    });
  };


  useEffect(() => {
    if (props.imagesData) {
      getAlertImage();
    }
  }, [props.imagesData]);

  useEffect(() => {
    if (selectedFrameModel) {
      getAlertImage();
    }
  }, [selectedFrameModel]);

  const getAlertImage = (() => {
     // let propImage = props.imagesData[props.imagesData.length - 1];
     const reverseArr = props.imagesData.reverse(); //to get latest
    //  const frameModelIdx = reverseArr.findIndex(rec => rec.model_id === selectedFrameModel);
    //  let propImage = props.imagesData[frameModelIdx];
     let propImage = reverseArr[0];


    //  console.log('propImage', reverseArr, 'frameModelIdx', state.selectedFrameModel, '88888888888888', frameModelIdx, propImage);
    // console.log('propImage', propImage);

     if (propImage) {
       setTimeout(() => {
         AlertsService.getImageOfAlert(propImage.cropped_image_filename, propImage.date, propImage.model_name)
           .then((res) => {
             if (res && res.data) {
               let base64Img = `data:image/png;base64,${res.data.image_base64}`;
               setState({
                 ...state,
                 frameImg: base64Img,
                 result: propImage,
               });
             }
           })
           .catch((err) => console.log("frames rendering", err));
       }, 2000);
     }
  });

  // useEffect(() => {
  //   if (props.selectedModel) {
  //     const { camera_id, time } = props.modelAlertInfo;

  //     AlertsService.getSocketFrame({ camera_id: camera_id, time: time })
  //       .then((res) => {
  //         if (res && res.data) {
  //           let base64Img = `data:image/png;base64,${res.data.image_base64}`;
  //           setState({
  //             ...state,
  //             frameImg: base64Img,
  //             // result: propImage,
  //           });
  //         }
  //         // console.log('res --- getSocket Frame', res.data.image_base64[0] );
  //       })
  //       .catch((err) => console.log("frames rendering", err));
  //   }
  // }, [props.selectedModel]);

  return (
    <Fragment>
      <Grid item pt={1} pb={0.5}>
        <Grid container justify="center">
          {/* <SingleSelect
            width={300}
            addDefault={true}
            label={LABELS.MODEL}
            size="small"
            options={props.selectedModel}
            propKey="id"
            setSelectVal={(val) => {
              setSelectedFrameModel(val);
              // if (typeof props.setFrameSelected === "function") {
              //   props.setFrameSelected(val);
              // }
            }}
          /> */}
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
          {/* {state.imagesData &&
            state.imagesData.length > 0 &&
            state.imagesData.map((rec, index) => {
              return (
                <Card
                  sx={{ display: "flex" }}
                  className={classes.card}
                  style={{ margin: "5px 5px 5px", border: "202124" }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ flex: "1 0 auto", padding: "0px" }}>
                      <Typography component="div" sx={{ padding: "4px" }}>
                        <Typography sx={{ fontSize: "10px" }}>
                          {new Date(rec?.datetime * 1000).toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: "10px" }}>
                          {rec?.data[0].name}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Box>



                  <CardMedia
                    component="img"
                    sx={{
                      width: theme.breakpoints.up(1401) ? 160 : 118,
                      padding: "5px #fff !important",
                    }}
                    test={console.log('rec', rec)}
                    image={`data:image/jpg;base64,${rec.result}`}
                    alt="image"
                    onClick={() => {
                      handleImageClick(rec);
                    }}
                  />
                </Card>
              );
            })} */}

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
                        {/* {getAlertInfo()}
                      </Typography>
                    }
                  </CardContent> */}
                </Card>
              </Grid>
            </DialogContent>
          </Dialog>

          <Card className={classes.card}>
            <CardMedia
              component="img"
              className={classes.cardImg}
              image={state.frameImg}
              alt="image"
              onClick={() => {
                handleImageClick(state.frameImg);
              }}
            />

            {/* <CardContent sx={{ padding: "8px", paddingBottom: "0px !important" }}>
          <Typography component="div" sx={{ padding: "4px" }}>
            <Typography sx={{ fontSize: "10px" }}>
              Date: {new Date(state.result?.datetime * 1000).toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: "10px" }}>
              Name:{" "} 
              display camera name, model name, camera ip and time
              {state.result && state.result.data && state.result.data.length
                ? state.result.data[0].name
                : null}
            </Typography>
            <Typography sx={{ fontSize: "10px" }}>
              IP: {state.result?.ip}
            </Typography>
          </Typography>
        </CardContent> */}
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Frames;
