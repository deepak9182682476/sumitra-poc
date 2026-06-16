import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { makeStyles } from "@mui/styles";
import { config_data } from "../config/config";

const useStyles = makeStyles((theme) => ({
  main: {
    color: theme.palette.primary.color,
    font: theme.palette.text.font,
    border: "none !important",
    flexGrow: "0.3",
  },
  textFieldCls: {
    border: "none !important",
    "& .MuiSvgIcon-root":
    {color: `${theme.palette.primary.dark} !important`,
    }
  },
}));

const AutoComplete = (props) => {
  const classes = useStyles();
  const [selected, setSelected] = useState(null);
  const [selected_options, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (
      props.selectedModel &&
      props.selectedModel.length &&
      props.options &&
      props.options.length
    ) {
      const options = props.options.filter((o1) =>
        props.selectedModel.some((o2) => o1.model_name === o2.label)
      );
      const sortedOptions = options.sort((a, b) => {
        if (a.camera_name < b.camera_name) {
          return -1;
        } else if (a.camera_name > b.camera_name) {
          return 1;
        } else {
          return 0;
        }
      });
      setSelectedOptions(sortedOptions);
    }
  }, [props.options, props.selectedModel]);

  useEffect(() => {
  
    if (selected_options.length) {
      if (!selected) {
        setSelected(selected_options[0]);
        config_data.camera = selected_options[0];
        if (typeof props.setMediaContainer === "function") {
          props.setMediaContainer(selected_options[0]);
        }
      }
    }
  
  }, [selected_options]);

  const getOptionFormat = (option) => {
    return props.optionFormat
      ? `${option.camera_name} > ${option.ip_address}`
      : option.label;
  };

  const handleChange = (e, value) => {
    if (value) {
      setSelected(value);
      config_data.camera = value;

      if (typeof props.setMediaContainer === "function") {
        props.setMediaContainer(value);
      }
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
      sx={{ ml: 1, width: 250 }}
      size="small"
      getOptionLabel={(option) => getOptionFormat(option)}
      renderInput={(params) => (
        <TextField
          {...params}
          className={classes.textFieldCls}
          label={props.label}
          variant="filled"
        />
      )}
    />
  );
};

export default AutoComplete;
