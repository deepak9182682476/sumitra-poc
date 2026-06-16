import React, { Fragment, useState, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { CloseOutlined } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import MultipleSelect from "../../common/multiselect";
import {
  Typography,
  Button,
  Modal,
  Alert,
  Snackbar,
  Box,
  AppBar,
  IconButton,
  Paper,
  FormControl,
  FormLabel,
  Grid,
  Input,
  TextField,
  Select,
  OutlinedInput,
  MenuItem,
} from "@mui/material";
import SingleSelect from "../../common/select";
import _ from "lodash";

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

  colorroot: {
    "& .MuiSelect-nativeInput, .MuiSelect-select .MuiBox-root": {
      display: "none",
    },
  },

  popupTitle: {
    // "& .css-fj0h64-MuiPaper-root-MuiAppBar-root":{
    //   // fontSize: "16px",
    //   // alignItems: "center",
    //   // fontWeight: "bold",
    //   // textTransform: "uppercase",

    // },
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    color: "#fff",
    width: "100%",
    // margin: "0px 0px 10px",
    // padding: '11px',
  },
  closeCls: {
    margin: "0px 0px 0px auto",
  },
  frmctrlCls: {
    display: "block",
    textAlign: "left !important",
    "& .MuiInput-root": {
      marginTop: "12px",
      marginLeft: "12px",
      width: "50%",
    },
    "& .MuiFormLabel-root": {
      fontSize: "11px !important",
      lineHeight: "1em !important",
    },
    "& .MuiOutlinedInput-root": {
      width: "275px",
      marginLeft: "7px",
    },
    "& .MuiOutlinedInput-input": {
      width: "20px",
    },
  },
  titleCls: {
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  commonField: {
    width: "48%",
    padding: "5px 2px",
  },
  formFieldContent: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  menuPaper: {
    maxHeight: "200px",
    overflow: "auto",
  },
}));

const fields_display = [
  {
    key_label: "registration_num",
    plac_name: "Registration Number",
    key_type: "text",
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
    key_label: "camera_name",
    plac_name: "Select Camera",
    key_type: "select",
    key_list: [],
  },
  {
    key_label: "hotlist_category",
    plac_name: "Select Hotlist Category",
    key_type: "select",
    key_list: [],
  },

  //   {
  //     key_label: "violation",
  //     plac_name: "Select violation",
  //     key_type: "multi-select",
  //     key_list: [],
  //   },
  // {
  //   key_label: "category",
  //   plac_name: "Select Category",
  //   key_type: "select",
  //   key_list: [],
  // },
  //   {
  //     key_label: "speed_less_than",
  //     plac_name: "Speed Less Than(Kmph)",
  //     key_type: "text",
  //   },
  //   {
  //     key_label: "speed_more_than",
  //     plac_name: "Speed More Than(Kmph)",
  //     key_type: "text",
  //   },
  {
    key_label: "color",
    plac_name: "Select Color",
    key_type: "multi-select",
    key_list: [
      { id: 1, label: "Black", key: "black" },
      { id: 2, label: "Blue", key: "blue" },
      { id: 3, label: "Gray", key: "gray" },
      { id: 4, label: "Green", key: "green" },
      { id: 5, label: "Orange", key: "orange" },
      { id: 6, label: "Red", key: "red" },
      { id: 7, label: "White", key: "white" },
      { id: 8, label: "Yellow", key: "yellow" }
    ],
  },
  {
    key_label: "event_from_date",
    plac_name: "Event Date From",
    key_type: "date",
  },
  {
    key_label: "event_to_date",
    plac_name: "Event Date To",
    key_type: "date",
  },
];

const HoltistSearchModel = (props) => {
  const [state, setState] = useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  const [isSuccess, setSuccess] = useState(false);
  const classes = useStyles();
  const current_theme = useTheme();

  const [search_form, setSearchForm] = useState({
    registration_num: "",
    junction_name: '',
    police_station: '',
    camera_name: '',
    zone: '',
    event_from_date: '',
    event_to_date: '',
    // speed_less_than: 0,
    // speed_more_than: 0,
    // violation: [],
    hotlist_category: '',
    color: [],
  });

  const [fieldsDisplayList, setFieldsDisplayList] = useState([]);

  //set key list on select field
  useEffect(() => {
    // if (props?.violationList || props?.hotlistCategoryList || props?.locationsList) {
    if (props?.hotlistCategoryList || props?.locationsList) {
      fields_display.map((i, idx) => {
        // if (i.key_label === "violation") {
        // const arr = [];
        // const { violationList } = props;
        //   if (violationList && violationList.length) {
        //     violationList.map(rec => {
        //       arr.push({
        //         id: rec.id,
        //         key: rec.name,
        //         label: rec.name
        //       })
        //     })
        //   }
        //   fields_display[idx]["key_list"] = arr;
        // }

        if (i.key_label === "junction_name") {
          const arr = [];
          const { locationsList } = props;
          if (locationsList && locationsList.length) {
            _.uniqBy(locationsList, 'junction').map(rec => {
              arr.push({
                id: rec.id,
                key: rec.junction,
                label: rec.junction
              })
            })
          }
          fields_display[idx]["key_list"] = arr;
        }
        if (i.key_label === "zone") {
          const arr = [];
          const { locationsList } = props;
          if (locationsList && locationsList.length) {
            _.uniqBy(locationsList, 'zone').map(rec => {
              arr.push({
                id: rec.id,
                key: rec.zone,
                label: rec.zone
              })
            })
          }
          fields_display[idx]["key_list"] = arr;
        }
        if (i.key_label === "police_station") {
          const arr = [];
          const { locationsList } = props;
          if (locationsList && locationsList.length) {
            _.uniqBy(locationsList, 'policestation').map(rec => {
              arr.push({
                id: rec.id,
                key: rec.policestation,
                label: rec.policestation
              })
            })
          }
          fields_display[idx]["key_list"] = arr;
        }
        if (i.key_label === "camera_name") {
          const arr = [];
          const { locationsList } = props;
          if (locationsList && locationsList.length) {
            _.uniqBy(locationsList, 'camera').map(rec => {
              arr.push({
                id: rec.id,
                key: rec.camera,
                label: rec.camera
              })
            })
          }
          fields_display[idx]["key_list"] = arr;
        }
        if (i.key_label === "hotlist_category") {
          const arr = [];
          const { hotlistCategoryList } = props;
          if (hotlistCategoryList && hotlistCategoryList.length) {
            hotlistCategoryList.map(rec => {
              arr.push({
                id: rec.id,
                key: rec.name,
                label: rec.name
              })
            })
          }
          fields_display[idx]["key_list"] = arr;
        }
        // if (i.key_label === "category") {
        //   fields_display[idx]["key_list"] = props?.categoryList;
        // }
      });
      // console.log('fields_display', fields_display);
      setFieldsDisplayList(fields_display);
    }
  }, [props]);

  const handleChange = (event) => {
    setSearchForm((oldValues) => ({
      ...oldValues,
      [event.target.name]: event.target.value,
    }));
  };

  const style = {
    position: "absolute",
    top: "51%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "auto",
    bgcolor: `${current_theme.palette.mode === "light" ? "background.paper" : "#313131"
      }`,
    border: "2px solid #404145",
    boxShadow: "#00000029",
    color: "#FFF",
  };

  const { alertOpen, alertContent, vertical, horizontal } = state;

  const handleClose = () => {
    props.setOpen(false);
    if (typeof props.refreshContent == "function") {
      props.refreshContent(true);
    }
  };

  const searchHandler = () => {
    const fields = ['junction_name', 'zone', 'police_station', 'camera_name', 'hotlist_category', 'color'];
    fields.map(rec => {
      if (!search_form[rec] || !search_form[rec].length) {
        let idx = fieldsDisplayList.findIndex(frec => frec.key_label === rec);
        if (idx !== -1 && typeof search_form[rec] != 'object') {
          search_form[rec] = fieldsDisplayList[idx].key_list[0].label
        }
      }
    })
    console.log("search form", search_form);

    props.filterAnprSearchData(search_form);
    props.setOpen(false);
  };

  const setFormFieldVals = (vals, key) => {
    search_form[key] = vals.map(rec => rec.key);
  };

  return (
    <Fragment>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={alertOpen}
        autoHideDuration={1000}
        onClose={() => setState({ ...state, alertOpen: false })}
      >
        <Alert
          onClose={() => setState({ ...state, alertOpen: false })}
          severity={isSuccess ? "success" : "error"}
        >
          {alertContent}
        </Alert>
      </Snackbar>
      <Modal
        open={props.open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        aria-labelledby="add-modal-title"
        aria-describedby="add-modal-description"
      >
        <Box sx={{ ...style, width: "80%", border: "none" }}>
          <AppBar
            sx={{
              backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
              border: `1px solid ${current_theme.palette.mode === "light"
                ? "#707070"
                : "#404145 !important"
                }, opacity: 1 `,
            }}
            position="static"
          >
            <Box className={classes.popupTitle}>
              <Box
                sx={{
                  padding: "10px 5px",
                }}
              >
                {" "}
                <Typography className={classes.titleCls}>
                  Hotlist Search
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleClose()}>
                  <CloseOutlined />
                </IconButton>
              </Box>
            </Box>
          </AppBar>
          <React.Fragment>
            <Typography sx={{ mt: 2, border: "none" }}>
              <React.Fragment>
                <Box sx={{ flexGrow: 1, padding: 2 }}>
                  <Box className={classes.formFieldContent}>
                    {fieldsDisplayList.length > 0 &&
                      fieldsDisplayList.map((rec, index) => {
                        return (
                          <Fragment key={index}>
                            {rec.key_type === "text" && (
                              <Box className={classes.commonField}>
                                <TextField
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  label={rec.plac_name}
                                  id={rec.key_label}
                                  name={rec.key_label}
                                  defaultValue={
                                    search_form[rec.key_label] || ""
                                  }
                                  onChange={(e) => handleChange(e)}
                                // required
                                />
                              </Box>
                            )}
                            {rec.key_type === "multi-select" && (
                              <Box className={classes.commonField}>
                                <MultipleSelect
                                  variant="contained"
                                  size="small"
                                  width="100%"
                                  addDefault={false}
                                  options={rec.key_list || []}
                                  label={rec.plac_name}
                                  setModel={(vals) => setFormFieldVals(vals, rec.key_label)}
                                  classes={{ root: classes.colorroot }}
                                ></MultipleSelect>
                                {/* <SingleSelect
                                  width={470}
                                  addDefault={true}
                                  label={rec.plac_name}
                                  size="small"
                                  options={rec.key_list || []}
                                  propKey="id"
                                  setSelectVal={(val) => {
                                    if (typeof props.setFrameSelected === "function") {
                                      props.setFrameSelected(val);
                                    }
                                  }}

                                /> */}
                              </Box>
                            )}
                            {rec.key_type === "select" && (
                              <Box className={classes.commonField}>
                                <SingleSelect
                                  width="100%"
                                  addDefault={true}
                                  label={rec.plac_name}
                                  size="small"
                                  options={rec.key_list || []}
                                  propKey="label"
                                  setSelectVal={(val) => {
                                    if (val) {
                                      setSearchForm({ ...search_form, [rec.key_label]: val })
                                    }
                                  }}
                                />
                              </Box>
                            )}

                            {rec.key_type === "date" && (
                              <Box className={classes.commonField}>
                                <FormControl fullWidth>
                                  <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                  >
                                    <TextField
                                      id="datetime-local-start"
                                      type="datetime-local"
                                      size="small"
                                      label={rec.plac_name}
                                      fullWidth
                                      InputLabelProps={{
                                        shrink: true,
                                        maxDate: moment().format(
                                          "YYYY-MM-DD hh:mm:ss"
                                        ),
                                      }}
                                      inputProps={{ max: "9999-12-31T23:59" }}
                                      name={rec.key_label}
                                      value={search_form[rec.key_label]}
                                      onChange={(newValue) => {
                                        handleChange(newValue);
                                      }}
                                    />
                                  </LocalizationProvider>
                                </FormControl>
                              </Box>
                            )}
                          </Fragment>
                        );
                      })}
                  </Box>
                </Box>
              </React.Fragment>
            </Typography>
            <Box
              sx={{
                display: "flex",
                backgroundColor:
                  current_theme.palette.mode === "light"
                    ? "#FAFAFA"
                    : "#313131",
                borderTop: "1px solid #3131317a",
                flexDirection: "row",
                p: 1,
              }}
            >
              <Box sx={{ flex: "1 1 auto", color: "#000" }} />
              <Button
                color="primary"
                variant="outlined"
                onClick={() => handleClose()}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={searchHandler}
              >
                Search
              </Button>
            </Box>
          </React.Fragment>
        </Box>
      </Modal>
    </Fragment>
  );
};

export default HoltistSearchModel;
