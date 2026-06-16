/* eslint-disable array-callback-return */

import React, { Fragment, useState, useEffect, useRef } from "react";
import { Card, Grid, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import SingleSelect from "../../../common/select";
import { LABELS } from "../../../config/tabs_constants/labels";
import CameraService from "../../../services/camera";
import IconButtons from "../../../common/position_icons";

const options = [
  {
    id: 1,
    label: "Polygon",
    key: "polygon",
  },
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

const CameraSettingsCoverage = (props) => {
  let clone_obj = Object.assign({}, props.objList[props.selectedIndex]);
  const clone_cameraSettingsParams = Object.assign(
    {},
    props.cameraSettingsParams
  );

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
  const [cameraFrame, setImage] = useState({
    image: null,
    image_data: null,
    width: 0,
    height: 0,
  });
  const [ctxx, setCTX] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [state, setState] = useState({
    canvasW: null,
    canvasH: null,
    startX: null,
    startY: null,
    endX: null,
    endY: null,
  });
  const [points, setPoints] = useState([]);

  const [positionIconsView, setPositionIconsView] = useState(false);

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
    if (canvas && cameraFrame && points.length > 0) {
      drawPolygon(ctxx);
    }
  }, [canvas, cameraFrame.image_data, points]);

  useEffect(() => {
    if (clone_obj && clone_obj.ip_address) {
      getImage(clone_obj.ip_address);
    }
  }, []);

  useEffect(() => {
    if (clone_obj && clone_obj.camera_settings.length) {
      clone_obj.camera_settings.map(rec => {
        if (rec.model_id === selected_model.model_id) {
          if (points && points.length) {
            const points_scaled = points.map((point) => {
              return [
                parseInt((point[0] * cameraFrame.width) / state.canvasW),
                parseInt((point[1] * cameraFrame.height) / state.canvasH),
              ];
            });
            rec.coverage = points_scaled;
          }
          if (coordinates && coordinates.length) {
            rec.coverage = coordinates;
          }
        }
      });
      props.setData(clone_obj);
      var newObjList = [...props.objList];
      newObjList[props.selectedIndex] = clone_obj;
      props.setObjList(newObjList);
    } else if (clone_obj && clone_obj.camera_settings.length === 0 && selected_model.model_id) {
      clone_cameraSettingsParams.model_id = selected_model.model_id;
      clone_cameraSettingsParams.model_name = selected_model.model_name;
      clone_cameraSettingsParams.camera_id = clone_obj.camera_id;
      if (points && points.length) {
        const points_scaled = points.map((point) => {
          return [
            parseInt((point[0] * cameraFrame.width) / state.canvasW),
            parseInt((point[1] * cameraFrame.height) / state.canvasH),
          ];
        });
        clone_cameraSettingsParams.coverage = points_scaled;
      }
      if (coordinates && coordinates.length) {
        clone_cameraSettingsParams.coverage = coordinates;
      }
      clone_obj.camera_settings.push(clone_cameraSettingsParams);
      props.setData(clone_obj);
      var newObjList = [...props.objList];
      newObjList[props.selectedIndex] = clone_obj;
      props.setObjList(newObjList);
    }
    if (
      (!points || points.length === 0) &&
      !coordinates &&
      selected_model.model_id
    ) {
     // if (props.selectedModelsList) {
      //  if (clone_obj && clone_obj.camera_settings) {
       //   clone_obj.camera_settings.map(rec => {
        //    if (rec.model_id === selected_model.model_id) {
        //      if (rec.coverage.length) {
         //     }
         //   }
        //  });
       // }
        // const camSettingsList = [];
        // props.selectedModelsList.forEach((rec) => {
        //   clone_cameraSettingsParams.coverage = [];
        //   clone_cameraSettingsParams.model_id = rec.id;
        //   clone_cameraSettingsParams.model_name = rec.label;
        //   clone_cameraSettingsParams.camera_id = clone_obj.camera_id;
        //   camSettingsList.push(Object.assign({}, clone_cameraSettingsParams));
        // });
        // clone_obj.camera_settings = camSettingsList;
        // props.setData(clone_obj);
      //}
    }
    // if (clone_obj && clone_obj.camera_settings) {
    //   // const { coverage } = clone_obj.camera_settings;
    //   // console.log("coverage, ", coverage);
    //   if (points && points.length) {
    //     // console.log(points, cameraFrame.width, cameraFrame.height,state.canvasW, state.canvasH)
    //     const points_scaled = points.map(point => {
    //       return [parseInt((point[0] * cameraFrame.width)/ state.canvasW), parseInt((point[1] * cameraFrame.height)/ state.canvasH)]
    //     })
    //     // console.log(points, pointsh)
    //     clone_obj.camera_settings.coverage = points_scaled;
    //     // console.log("clone_obj data rule", clone_obj);
    //     props.setData(clone_obj);
    //   }
    //   if (coordinates && coordinates.length) {
    //     clone_obj.camera_settings.coverage = coordinates;
    //     // console.log("clone_obj data rule", clone_obj);
    //     props.setData(clone_obj);
    //   }
    //   if (!points && !coordinates) {
    //     clone_obj.camera_settings.coverage = [];
    //     // console.log("clone_obj data rule", clone_obj);
    //     props.setData(clone_obj);
    //   }
    // }
    if (selected_model && selected_model.model_name !== "") {
      getPositionIndications();
    }
  }, [points, coordinates, selected_model, props.selectedModelsList, props.selectedIndex]);

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
      const { shapeType } = shapeObj;

      if (shapeType !== "Polygon") {
        setState((prevState) => ({
          ...prevState,
          startX: startX,
          startY: startY,
        }));
      }
    }
  };

  const handleMouseUp = (e) => {
    if (activeDrawing) {
      setActiveDrawing(false);
      canvas.current.style.cursor = "default";
      const { shapeType } = shapeObj;

      if (shapeType === "Polygon") {
        setPoints((prevState) => [
          ...prevState,
          [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
        ]);
      } else {
        setCoordinates({
          type: shapeType,
          sx: state.startX,
          sy: state.startY,
          ex: state.endX,
          ey: state.endY,
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    const { shapeType } = shapeObj;

    if (activeDrawing && shapeType !== "Polygon") {
      const [endX, endY] = getMousePosition(e);
      ctxx.clearRect(
        0,
        0,
        canvas.current.clientWidth,
        canvas.current.clientHeight
      );
      setState((prevState) => ({ ...prevState, endX: endX, endY: endY }));
      const width = endX - state.startX;
      const height = endY - state.startY;

      if (shapeType === "Rectangle") {
        drawRect(ctxx, state.startX, state.startY, width, height);
      } else if (shapeType === "Circle") {
        drawCircle(
          ctxx,
          state.startX,
          state.startY,
          state.endX,
          state.endY,
          width,
          height
        );
      }
    }
  };

  const drawRect = (ctx, sx, sy, w, h) => {
    ctx.beginPath();
    addImageToCanvas(ctx, cameraFrame.image_data);
    ctx.rect(sx, sy, w, h);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawCircle = (ctx, sx, sy, ex, ey, w, h) => {
    ctx.beginPath();
    addImageToCanvas(ctx, cameraFrame.image_data);
    ctx.moveTo(sx, sy + h / 2);
    ctx.bezierCurveTo(sx, sy, ex, sy, ex, sy + h / 2);
    ctx.bezierCurveTo(ex, ey, sx, ey, sx, sy + h / 2);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.closePath();
    ctx.stroke();
  };

  const drawPolygon = (ctx) => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    addImageToCanvas(ctx, cameraFrame.image_data);
    if (points.length > 0) {
      // console.log(points);
      ctx.beginPath();
      ctx.arc(points[0][0], points[0][1], 3, 0, 2 * Math.PI, false);
      ctx.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length; i++) {
        ctx.arc(points[i][0], points[i][1], 3, 0, 2 * Math.PI, false);
        ctx.fillStyle = "red";
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  // eslint-disable-next-line no-unused-vars
  const drawPoints = (ctx) => {
    ctx.strokeStyle = "#df4b26";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    for (var i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  };

  const clearData = () => {
    ctxx.clearRect(
      0,
      0,
      canvas.current.clientWidth,
      canvas.current.clientHeight
    );
    setCoordinates(null);
    setState({
      canvasW: null,
      canvasH: null,
      startX: null,
      startY: null,
      endX: null,
      endY: null,
    });
    setPoints([]);
    addImageToCanvas(ctxx, cameraFrame.image_data);
  };

  const getPositionIndications = () => {
    const { rule_settings } = clone_obj;
    if (rule_settings.length) {
      let idx = rule_settings.findIndex(rec => rec.model_id === selected_model.model_id);
      if (idx !== -1 && rule_settings[idx].rules && rule_settings[idx].rules.length) {
        const rulePosition = rule_settings[idx].rules.filter(rec => rec.key === "allowed_directions");
        if (rulePosition.length) {
          setPositionIconsView(true);
        }
      }
    }
  };

  const setRulePositionType = (posType) => {
    const { rule_settings } = clone_obj;
    if (rule_settings.length) {
      let idx = rule_settings.findIndex(rec => rec.model_id === selected_model.model_id);
      if (idx !== -1 && rule_settings[idx].rules.length) {
        const rulePosition = rule_settings[idx].rules.filter(rec => rec.key === "allowed_directions");
        if (rulePosition.length) {
          rulePosition[0].value = posType;
        }
      }
    }
  }

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
            setPositionIconsView(false);
            setSelectedModel({
              model_id: val.id,
              model_name: val.label,
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
        {positionIconsView ? <IconButtons setPosVal={(val) => setRulePositionType(val)} /> : null}
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

export default CameraSettingsCoverage;
