import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  main: {
    // backgroundColor: "#1B1B1B !important",
    //fusion CSS start
    backgroundColor: theme.palette.primary.dropDwnBgColor,
    color: theme.palette.primary.color,
    //fusion CSS stop
    font: theme.palette.text.font,
    border: "none !important",
    flexGrow: "0.3",
  },
  textFieldCls: {
    color: "#fff !important",
    border: "none !important",
  },
}));

const AutoCompleteNormal = (props) => {
  const classes = useStyles();
  const [selected, setSelected] = useState(null);
  const [selected_options, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (props.options && props.options.length) {
      setSelectedOptions(props.options);
    }
  }, [props.options]);

  const getOptionFormat = (option) => {
    return props.optionFormat ? `${option.camera_name} > ${option.ip_address}` : option.label;
  };

  const handleChange = (e, value) => {
    if (value) {
      setSelected(value);
      props.setSelectVal(value.id);
    }
  };

  return (
    <Autocomplete
      id={props.label}
      disableClearable
      value={selected}
      onChange={(e, val) => handleChange(e, val)}
      className={classes.main}
      options={selected_options}
      sx={{ width: props.width || 240 }}
      size="normal"
      getOptionLabel={(option) => getOptionFormat(option)}
      renderInput={(params) => (
        <TextField
          {...params}
          className={classes.textFieldCls}
          label={props.label}
          variant="outlined"
        />
      )}
    />
  );
};

export default AutoCompleteNormal;
