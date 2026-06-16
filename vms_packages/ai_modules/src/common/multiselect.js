
import React, { useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { makeStyles } from "@mui/styles";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { config_data } from "../config/config";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(val, option, theme) {
  return {
    fontWeight:
      option.indexOf(val) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const useStyles = makeStyles((theme) => ({
  main: {
    // backgroundColor: "#1B1B1B !important",
    // color: "#fff !important",
    //fusion CSS start
    color: theme.palette.primary.color,
  },
  //fusion CSS stop
  formCtrlCLs: {
    flexGrow: "0.7",
  },
  checkedMultiSelect: {
      color: theme.palette.text.primary,
  }
}));

const MultipleSelect = (props) => {
  const theme = useTheme();
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);

  useEffect(() => {
    if (props.options && props.options.length && !props.addDefault) {
      if (selected.length === 0) {
        setSelected([props.options[0]?.label]);
        config_data.model = [props.options[0]];
        if (typeof props.setModel === "function") {
          props.setModel(config_data.model);
        }
      }
    }
    if (props.options && props.options.length === 0 && selected.length && props.filterOpts) {
      return setSelected([]);
    } else if (props.options && props.options.length && selected.length && props.filterOpts) {
      if (props.name === 'camera_name' || props.name === 'junction_name' || props.name === 'police_station') {
        let arr = [];
        let selected_arr = [];
        props.options.filter(prec => {
          if (selected.includes(prec.key)) {
            selected_arr.push(prec);
            arr.push(prec.key)
          }
        }
        );
        if (arr.length !== selected.length) {
          if (typeof props.setModel === "function") {
            props.setModel(selected_arr);
          }
          return setSelected(arr);
        }
      }
    }
  }, [props.options, props.cameraList, props.addDefault]);

  useEffect(() => {
    if (props.selectedModel && props.selectedModel.length === 0) {
      setSelected([]);
    }else if(selected && !selected.length && props.selectedModel && props.selectedModel.length){
      setSelected(props.selectedModel);
    }
  }, [props.selectedModel]);


  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    if (
      props.selectedModel &&
      props.selectedModel.length === 1 &&
      value.length === 0
    ) {
      if (typeof props.setAlertStatus === "function") {
        return props.setAlertStatus("Atleast one model is required", true);
      }
    }

    setSelected(
      // On autofill we get a the stringified value.
      typeof value === "string" ? value.split(",") : value
    );
    let recs = value.map((val) =>
      props.options.find((rec) => rec.label === val)
    );

    if (!props.addDefault) {
      config_data.model = recs;
    }
    if (typeof props.setModel === "function") {
      props.setModel(recs);
    }
  };

  return (
    <FormControl variant="filled" sx={{ width: props.width }} className={classes.formCtrlCLs}>
      <InputLabel id={`multi-${props.label}`}>{props.label}</InputLabel>
      <Select
        labelId={`${props.label}-label`}
        id={`multiselect-${props.label}`}
        multiple
        value={selected}
        onChange={handleChange}
        className={classes.main}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={MenuProps}
        label={props.label}
        name={props.name || props.label}
        size={props?.size}
      >
        {props.options &&
          props.options.map((option) => (
            <MenuItem
              key={option.key}
              value={option.label}
              style={getStyles(option, selected, theme)}
            >
              <Checkbox className={classes.checkedMultiSelect} checked={selected.indexOf(option.label) > -1} />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default MultipleSelect;
