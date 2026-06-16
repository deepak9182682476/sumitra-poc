import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { experimentalStyled as styled } from '@mui/material/styles';
import {
  Box,
  Grid,
  Input,
  Paper,
  Select,
  FormControl,
  FormLabel,
  TextField
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiButton-root": {
      color: "#fff !important",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "83vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "88vh",
    },
    width: "100vw",
  },
  frmctrlCls: {
    display: 'block',
    textAlign: 'left !important',
    "& .MuiInput-root": {
      marginTop: '12px',
      marginLeft: '12px',
      width: '52%'
    },
    "& .MuiFormLabel-root": {
      fontSize: "13px !important",
      lineHeight: '3em !important'
    },
    "& .MuiOutlinedInput-root": {
      width: '279px',
      marginLeft: '7px'
    }
  }
}));

const fields_display = [{
  key_label: 'registration_num',
  plac_name: 'Registration Number',
  key_type: 'text'
}, 
{
  key_label: "junction_name",
  plac_name: "Select Junction",
  key_type: "select",
  key_list: [],
},
{
  key_label: "zone",
  plac_name: "Select zone",
  key_type: "select",
  key_list: [],
},
{
  key_label: "police_station",
  plac_name: "Select PS",
  key_type: "select",
  key_list: [],
},
{
  key_label: 'event_from_date',
  plac_name: 'Event Date From',
  key_type: 'date'
}, {
  key_label: 'event_to_date',
  plac_name: 'Event Date To',
  key_type: 'date'
}, 
// {
//   key_label: 'speed_less_than',
//   plac_name: 'Speed Less Than(Kmph)',
//   key_type: 'text'
// }, {
//   key_label: 'speed_more_than',
//   plac_name: 'Speed More Than(Kmph)',
//   key_type: 'text'
// },
//  {
//   key_label: 'time_from',
//   plac_name: 'Time From',
//   key_type: 'time'
// }, {
//   key_label: 'time_to',
//   plac_name: 'Time To',
//   key_type: 'time'
// }, 
// {
//   key_label: 'violation',
//   plac_name: 'Select violation',
//   key_type: 'select'
// }, 
{
  key_label: 'time_since_red',
  plac_name: 'Time Since Red(Seconds)',
  key_type: 'text'
}, {
  key_label: 'category',
  plac_name: 'Select Category',
  key_type: 'select'
}]

const AnprSearchContent = (props) => {
  const classes = useStyles();
  const current_theme = useTheme();
  const [search_form, setSearchForm] = useState({
    registration_num: null,
    location: null,
    event_from_date: null,
    event_to_date: null,
    speed_less_than: 0,
    speed_more_than: 0,
    violation: null,
    timeSinceRed: 0,
    category: null
  });

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const handleChange = (event) => {
    setSearchForm((oldValues) => ({
      ...oldValues,
      [event.target.name]: event.target.value
    }));
  };

  useEffect(() => {
    console.log('search_formsearch_form', search_form);
  },[search_form])

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {Array.from(fields_display).map((rec, index) => (
            <Grid item xs={2} sm={4} md={4} key={index}>
              <Item>
                {rec.key_type === 'text' ?
                  (<FormControl className={classes.frmctrlCls}>
                    <FormLabel>{rec.plac_name}</FormLabel>
                    <Input
                      placeholder={rec.plac_name}
                      name={rec.key_label}
                      value={search_form[rec.key_label] || ""}
                      onChange={handleChange}
                      required />
                  </FormControl>)
                  : rec.key_type === 'select' ? (
                    <FormControl className={classes.frmctrlCls}>
                      <FormLabel>{rec.plac_name}</FormLabel>
                      <Select size="small"></Select>
                    </FormControl>
                  )
                    : rec.key_type === 'date' ?
                      (
                        <FormControl className={classes.frmctrlCls}>
                          <FormLabel>{rec.plac_name}</FormLabel>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TextField
                              id="datetime-local-start"
                              type="datetime-local"
                              size="small"
                              sx={{ width: 250 }}
                              InputLabelProps={{
                                shrink: true,
                                maxDate: moment().format("YYYY-MM-DD")
                              }}
                              inputProps={{ max: "9999-12-31T23:59" }} 
                              value={search_form[rec.key_label]}
                              onChange={(newValue) => {
                                handleChange(newValue);
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      ) : null}
              </Item>
            </Grid>
          ))}
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export default AnprSearchContent;