import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

const CheckboxLabel = (props) => {
  const { params } = props;

  const handleChange = (event) => {
    if (typeof props.setChecked === "function")
     return props.setChecked(event.target.checked);
  };

  return (
    <FormControl component="fieldset">
      <FormGroup aria-label="position" row>
        <FormControlLabel
          value={params?.value}
          control={
            <Checkbox checked={params?.checked} onChange={handleChange} />
          }
          label={params?.label}
          labelPlacement={params?.placement}
        />
      </FormGroup>
    </FormControl>
  );
};

export default CheckboxLabel;
