import React, { useEffect } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { InputLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";

const useStyles = makeStyles((theme) => ({
  main: {
    color: "#FFFFFF",
  },
  formCtrlCLs: {
    flexGrow: "0.7",
  },
  selectCtrlCLs: {
    "& .MuiMenu-list": {
      maxHeight: "200px",
    },
  },
}));

const SingleSelect = (props) => {
  const [selected, setSelected] = React.useState("");
  const classes = useStyles();
  const theme = useTheme();
  // const label = props.optionlabel;

  const handleChange = (event) => {
    const { propKey } = props;
    setSelected(event.target.value);
    if (typeof props.setSelectVal === "function") {
      let idx = props.options.findIndex(
        (rec) => rec.label === event.target.value
      );
      if (idx !== -1 && propKey) {
        if (propKey === "id_label") {
          props.setSelectVal(props.options[idx]);
        } else {
          props.setSelectVal(props.options[idx][propKey]);
        }
      }
    }
  };

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

  useEffect(() => {
    const { propKey } = props;
    if (
      props.addDefault &&
      props.options &&
      props.options.length &&
      !selected
    ) {
      setSelected(props.options[0]?.label);
      if (typeof props.setSelectVal === "function" && propKey) {
        if (propKey === "id_label") {
          props.setSelectVal(props.options[0]);
        } else {
          props.setSelectVal(props.options[0][propKey]);
        }
      }
    }
    if (!selected && props.selectedVal && props.options.length) {
      if (propKey === "id" || propKey === "id_label") {
        let idx = props.options.findIndex(
          (rec) => rec.id === props.selectedVal
        );
        if (idx !== -1) {
          setSelected(props.options[idx].label);
        }
      } else {
        setSelected(props.selectedVal);
      }
    }
    // if (!props.selectedVal && selected) {
    //   setSelected(" ");
    // }
  }, [props.addDefault, props.options]);

  function getStyles(val, selVal, theme) {
    return {
      fontWeight:
        selVal.indexOf(val) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }
  return (
    <div>
      <FormControl
        variant="filled"
        disabled={props.disabled}
        className={classes.formCtrlCLs}
        sx={{
          m: 0,
          borderRadius: "5px",
          minWidth: props.width || 120,
        }}
      >
        <InputLabel
          sx={{
            fontFamily: "montserrat",
            fontWeight: "regular",
            fontSize: "10px",
          }}
          id={`select-${props.label}`}
        >
          {props.label}
        </InputLabel>
        <Select
          width="300"
          size={props.size}
          labelId={`${props.label}-label`}
          id={`select-${props.label}`}
          value={selected}
          className={classes.selectCtrlCLs}
          sx={{
            fontFamily: "montserrat",
            fontWeight: "Regular",
            fontSize: "14px",
            lineSpacing: "12px",
          }}
          label={props.label}
          MenuProps={MenuProps}
          onChange={handleChange}
        >
          {props.options &&
            props.options.length &&
            props.options.map((option) => (
              <MenuItem
                key={option.key}
                value={option.label}
                style={{
                  ...getStyles(option, selected, theme),
                  color: "#000000",
                }}
              >
                {option.label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default SingleSelect;
