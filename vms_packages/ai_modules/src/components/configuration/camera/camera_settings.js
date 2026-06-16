import { Grid } from "@mui/material";
import React from "react";
import CheckboxLabel from "../../../common/checkbox_with_label";
import SingleSelect from "../../../common/select";
import SliderView from "../../../common/slider";
import {
  LABELS,
  leftCheckboxLabels,
  rightCheckboxLabels,
  sliderCameraSetting,
} from "../../../config/tabs_constants/labels";
import { makeStyles, useTheme } from "@mui/styles";


const resizeFactorOptions = () => {
  let factors = [];
  for (var i = 5; i <= 50; i++) {
    if (i % 5 === 0) {
      factors.push({ key: i, label: `${i}%` });
    }
  }
  return factors;
};
const useStyles = makeStyles((theme) => ({
  root:
  {
    [theme.breakpoints.between(2700, 600)]: {
      // width: "200px !important",
      height: "83vh",
    },
    [theme.breakpoints.up(1401)]: {
      // width: "400px !important",
      height: "88vh",
    },
    width: "100vw",
  },
}));

const CameraSettings = () => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const classes = useStyles();

  return (
    <Grid justifyContent="center" direction="row" container spacing={3}>
      <Grid
        key={1}
        container
        direction="row"
        style={{ overflow: "hidden" }}
        justifyContent="left"
        alignItems="center"
        item
        m={0}
        xs={6}
      >
        <Grid
          style={{
            // {display:'block',
            // position:'absolute',
            // left: "0px",
            // top: "0px",
            overflow: "auto",
            userSelect: "none",
            paddingRight: "5%",
            paddingBottom: "5%",
          }}
        >
          {leftCheckboxLabels.map((rec, i) => (
            <CheckboxLabel key={`chklabel-${i}`} params={rec} />
          ))}
        </Grid>
        <Grid>
          <SingleSelect
            width={theme.breakpoints.up(1401) ? 270 : 600}
            label={LABELS.RESIZE_FACTOR}
            addDefault={false}
            options={resizeFactorOptions()}
          />
          {sliderCameraSetting.map((rec, i) => (
            <SliderView key={`slider-cam-${i}`} params={rec} m={1} />
          ))}
        </Grid>
      </Grid>
      <Grid
        key={2}
        container
        direction="row"
        justifyContent="left"
        alignItems="center"
        item
        m={0}
        xs={6}
      >
        <Grid
          style={{
            left: "0px",
            top: "0px",
            overflow: "auto",
            userSelect: "none",
            paddingRight: "5%",
            paddingBottom: "5%",
          }}
        >
          {rightCheckboxLabels.map((rec, i) => (
            <CheckboxLabel key={`right-chklabel-${i}`} params={rec} />
          ))}
        </Grid>
        <Grid>
          <SingleSelect
            width={theme.breakpoints.up(1401) ? 270 : 600}
            label={LABELS.RESIZE_FACTOR}
            addDefault={false}
            options={resizeFactorOptions()}
          />
          {sliderCameraSetting.map((rec, i) => (
            <SliderView key={`right-slider-${i}`} params={rec} m={1} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CameraSettings;
