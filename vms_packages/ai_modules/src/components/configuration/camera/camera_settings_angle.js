
import React, { Fragment, useState, useEffect, useRef } from "react";
import { Card, Grid, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import SingleSelect from "../../../common/select";
import { LABELS } from "../../../config/tabs_constants/labels";
import CameraService from "../../../services/camera";
// import * as data from "../../../common/configuration/camerasobj.json";

const options = [
  {
    id: 1,
    label: "Line",
    key: "Line",
  }
];

const useStyles = makeStyles((theme) => {
  return {
    imageContainer: {
      // display: "flex",
      // flexGrow: 1,
      // flexWrap: "wrap",
      // width: "100%",
      // overflowY: "auto",
      // overflowX: "hidden",
      // minHeight: "10vh",
      // maxHeight: "10vh",
      [theme.breakpoints.between(750, 1400)]: {
        minHeight: "10vh !important",
        maxHeight: "10vh !important",
      },
      [theme.breakpoints.up(1401)]: {
        minHeight: "43vh !important",
        maxHeight: "43vh !important",
      },
    },
    image: {
      // maxWidth: "32%",
      // margin: "2px",
      // maxWidth: "100%",
      maxHeight: "43vh",
    },
    media: {
      position: "absolute",
      // position: "absolute",
      left: 0,
      top: 0,
      height: "100%", //auto
      // maxWidth:"100%"
      objectFit: "scale-down",
    },
  };
});

const CameraSettingsAngle = (props) => {
  let clone_obj = Object.assign({}, props.objList[props.selectedIndex]);
  const clone_cameraSettingsParams = Object.assign({}, props.cameraSettingsParams);
  // const selected_models = clone_obj?.model_settings;

  const classes = useStyles();
  const canvas = useRef();
  const [activeDrawing, setActiveDrawing] = useState(false);
  const [shapeObj, setShapeType] = useState({
    shapeType: "",
    prevShapeType: "",
  });
  const [selected_model, setSelectedModel] = useState({
    model_id: "",
    model_name: "",
  });
  //const [cameraFrame, setImage] = useState({ image: null, image_data: null });
  const [cameraFrame, setImage] = useState({
    image: null,
    image_data: null,
    width: 0,
    height: 0,
  });
  const [ctxx, setCTX] = useState(null);
  const [state, setState] = useState({
    canvasW: null,
    canvasH: null,
    startX: null,
    startY: null,
    endX: null,
    endY: null,
  });
  const getImage = (ip_address) => {
    CameraService.getCameraImage(ip_address)
      .then((res) => {
        if (res && res.data) {
          setImage((prevState) => ({
            ...prevState,
            image: res.data.data,
            width: res.data.width,
            height: res.data.height,
          }));
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  // initialize the canvas context
  useEffect(() => {
    const { shapeType, prevShapeType } = shapeObj;
    if (shapeType && shapeType !== prevShapeType) {
      if (ctxx) {
        clearData();
      }
    }

    if (cameraFrame && cameraFrame.image) {
      showImage();
    }
  }, [shapeObj.shapeType, cameraFrame.image]);

  useEffect(() => {
    if (clone_obj && clone_obj.ip_address) {
      getImage(clone_obj.ip_address);
    }
  }, []);

  useEffect(() => {
    if (props.selectedModelsList && props.selectedModelsList.length > 0 && props.selectedIndex && selected_model.model_id === "") {
      var modelList = props.selectedModelsList[props.selectedIndex];
      let obj = {
        model_id: modelList[0].id,
        model_name: modelList[0].label,
      };
      setSelectedModel(obj);
    }

  }, [props.selectedModelsList, props.selectedIndex]);

  useEffect(() => {
    if (state && state.endX && state.endY) {
      if (clone_obj && clone_obj.camera_settings.length) {
        clone_obj.camera_settings.map(rec => {
          if (rec.model_id === selected_model.model_id) {
            rec.direction = [
            [state.startX, state.startY],
            [state.endX, state.endY],
            ];
            rec.direction = [parseInt((state.startX) * cameraFrame.width / state.canvasW), parseInt((state.startY)* cameraFrame.width / state.canvasW)
            ,parseInt((state.endX)* cameraFrame.width / state.canvasW), parseInt((state.endY)* cameraFrame.width / state.canvasW)]
          }
        });
      }
      else if (clone_obj && clone_obj.camera_settings.length === 0 && selected_model.model_id) {
        clone_cameraSettingsParams.model_id = selected_model.model_id;
        clone_cameraSettingsParams.model_name = selected_model.model_name;
        clone_cameraSettingsParams.camera_id = clone_obj.camera_id;
        // clone_cameraSettingsParams.direction = [
        //   [state.startX, state.startY],
        //   [state.endX, state.endY],
        // ];
        clone_cameraSettingsParams.direction = [parseInt((state.startX) * cameraFrame.width / state.canvasW), parseInt((state.startY)* cameraFrame.width / state.canvasW)
        ,parseInt((state.endX)* cameraFrame.width / state.canvasW), parseInt((state.endY)* cameraFrame.width / state.canvasW)]
        clone_obj.camera_settings.push(clone_cameraSettingsParams);
      }
      props.setData(clone_obj);
      var newObjList = [...props.objList];
      newObjList[props.selectedIndex] = clone_obj;
      props.setObjList(newObjList);
    }
    if (!state.endX && !state.endY && selected_model.model_id) {
      if (props.selectedModelsList) {
        // const camSettingsList = [];
        // props.selectedModelsList.forEach((rec) => {
        //   clone_cameraSettingsParams.direction = [];
        //   clone_cameraSettingsParams.model_id = rec.id;
        //   clone_cameraSettingsParams.model_name = rec.model_name;
        //   clone_cameraSettingsParams.camera_id = clone_obj.camera_id;
        //   camSettingsList.push(Object.assign({}, clone_cameraSettingsParams));
        // });
        // clone_obj.camera_settings = camSettingsList;
        // props.setData(clone_obj);
      }
    }
  }, [state.endX, state.endY, selected_model]);

  const showImage = () => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = canvasEle.clientWidth;
    canvasEle.height = canvasEle.clientHeight;

    const ctx = canvasEle.getContext("2d");
    setCTX(ctx);
    let imageObj = new Image();
    imageObj.src = cameraFrame.image;
    imageObj.onload = () => {
      setState((prevState) => ({
        ...prevState,
        canvasW: canvasEle.clientWidth,
        canvasH: canvasEle.clientHeight,
      }));
      setImage((prevState) => ({ ...prevState, image_data: imageObj }));
      addImageToCanvas(ctx, imageObj);
    };
  };

  const addImageToCanvas = (ctx, imageObj) => {
    ctx.drawImage(
      imageObj,
      0,
      0,
      canvas.current.clientWidth,
      canvas.current.clientHeight
    );
  };

  const getMousePosition = (e) => {
    if (canvas && e) {
      var bounds = canvas.current?.getBoundingClientRect();
      return [e.clientX - bounds.left, e.clientY - bounds.top];
    } else {
      return [0.0, 0.0];
    }
  };

  const handleMouseDown = (e) => {
    if (!activeDrawing) {
      setActiveDrawing(true);
      canvas.current.style.cursor = "crosshair";
      const [startX, startY] = getMousePosition(e);
      // const { shapeType } = shapeObj;

      setState((prevState) => ({
        ...prevState,
        startX: startX,
        startY: startY,
      }));
    }
  };

  const handleMouseUp = (e) => {
    if (activeDrawing) {
      setActiveDrawing(false);
      canvas.current.style.cursor = "default";
    }
  };

  const handleMouseMove = (e) => {
    const { shapeType } = shapeObj;
    // eslint-disable-next-line eqeqeq
    if (activeDrawing && shapeType == "Line") {
      const [endX, endY] = getMousePosition(e);
      ctxx.clearRect(
        0,
        0,
        canvas.current.clientWidth,
        canvas.current.clientHeight
      );
      setState((prevState) => ({ ...prevState, endX: endX, endY: endY }));
      // const width = endX - state.startX;
      // const height = endY - state.startY;
      drawLine(ctxx, state.startX, state.startY, state.endX, state.endY);
    }
  };

  const drawLine = (ctx, sx, sy, ex, ey) => {
    addImageToCanvas(ctx, cameraFrame.image_data);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.fillStyle = "red";
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearData = () => {
    ctxx.clearRect(
      0,
      0,
      canvas.current.clientWidth,
      canvas.current.clientHeight
    );
    setState((prevState) => ({
      ...prevState,
      startX: null,
      startY: null,
      endX: null,
      endY: null,
    }));
    addImageToCanvas(ctxx, cameraFrame.image_data);
  };

  return (
    <Fragment>
      <Grid container justify="center">
        <SingleSelect
          width={220}
          size="small"
          label={LABELS.AREA_SELECTION_TOOL}
          options={options}
          addDefault={true}
          propKey="label"
          setSelectVal={(val) => {
            setShapeType((prevState) => ({
              ...prevState,
              shapeType: val,
              prevShapeType: prevState.shapeType,
            }));
          }}
        />
        <SingleSelect
          width={220}
          size="small"
          label={LABELS.SELECTED_MODEL}
          options={props.selectedModelsList[props.selectedIndex]}
          selectedIndex={props.selectedIndex}
          addDefault={true}
          camConfig={true}
          propKey="id_label"
          setSelectVal={(val) => {
            setSelectedModel({
              model_id: val.id,
              model_name: val.label
            });
          }}
        />
        <Button
          variant="text"
          color="secondary"
          size="small"
          onClick={() => clearData()}
        >
          Clear
        </Button>
      </Grid>
      <Grid className={classes.imageContainer} container>
        <Grid item>
          <Card>
            {/* <CardMedia
              component="img"
              className={classes.image}
              image="/assets/images/traffic.jpg"
              alt="Paella dish"
            /> */}
            <canvas
              ref={canvas}
              // width={state.canvasW} height={state.canvasH}
              width={420}
              height={280}
              onMouseDown={(event) => handleMouseDown(event)}
              onMouseMove={(event) => handleMouseMove(event)}
              onMouseUp={(event) => handleMouseUp(event)}
            ></canvas>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default CameraSettingsAngle;
