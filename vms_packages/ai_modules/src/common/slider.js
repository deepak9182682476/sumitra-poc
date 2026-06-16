import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { InputLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";

const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 2,
    label: "2",
  },
  {
    value: 4,
    label: "4",
  },
  {
    value: 6,
    label: "6",
  },
  {
    value: 8,
    label: "8",
  },
  {
    value: 10,
    label: "10",
  },
];

function valuetext(value) {
  return value;
}

const useStyles = makeStyles((theme) => ({
  sliderCls: {
    "& .MuiSlider-thumb": {
      width: "5px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#1492E6"
    },
    "& .MuiSlider-rail": {
      backgroundColor: "#FFFFFF",
      opacity: 1
    }
  }
}));

const SliderView = (props) => {
  const classes = useStyles();
  const { params } = props;
  const onhandlechange = (e) => {
    if (typeof props.setSliderChange === "function") {
      return props.setSliderChange(e.target.value);
    }
  };
  return (
    <Box sx={{ width: "auto" }}>
      <InputLabel
        sx={{  fontWeight: "medium", fontSize: "14px", color: "#FFFFFF", characterSpacing: "0", lineSpacing: "18", marginTop: "15px !important" }}
        id={`slider-${params?.label}`}
      >
        {params?.label}
      </InputLabel>
      <Slider
        size="small"
        aria-label="Custom marks"
        defaultValue={params?.defaultValue}
        getAriaValueText={valuetext}
        step={1}
        valueLabelDisplay="auto"
        marks={marks}
        onChange={onhandlechange}
        min={0}
        max={10}
        sx={{ color: "#75E645", marginTop: "2px !important", marginBottom: "12px !important" }}
        className={classes.sliderCls}
      />
    </Box>
  );
};

export default SliderView;
