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
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import _ from "lodash";
import SingleSelect from "../../common/select";
import MultipleSelectAll from "../../common/multiselect_all";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
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
 //{
   // key_label: "is_vehant",
   // plac_name: "ITMS Cameras",
   // key_type: "boolean",
  //},
  {
    key_label: "is_anpr",
    plac_name: "ANPR Cameras",
    key_type: "boolean",
  },
 // {
  //  key_label: "is_anpr_vehant",
   // plac_name: "Both",
   // key_type: "boolean",
 // },
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
  {
    key_label: "commisionerate",
    plac_name: "Select Commisionerate",
    key_type: "multi-select",
    key_list: [],
  },
  {
    key_label: "zone",
    plac_name: "Select Zone",
    key_type: "multi-select",
    key_list: [],
  },
  {
    key_label: "police_station",
    plac_name: "Select PS",
    key_type: "multi-select",
    key_list: [],
  },
  {
    key_label: "junction_name",
    plac_name: "Select Junction",
    key_type: "multi-select",
    key_list: [],
  },
  {
    key_label: "camera_name",
    plac_name: "Select Camera",
    key_type: "multi-select",
    key_list: [],
  },
  {
    key_label: "hotlist_category",
    plac_name: "Select Hotlist Category",
    key_type: "multi-select",
    key_list: [],
  },
  // {
  //   key_label: "location",
  //   plac_name: "Select Location",
  //   key_type: "select",
  //   key_list: [],
  // },
 
  // {
  //   key_label: "violation",
  //   plac_name: "Select violation",
  //   key_type: "multi-select",
  //   key_list: [],
  // },
  // {
  //   key_label: "category",
  //   plac_name: "Select Category",
  //   key_type: "select",
  //   key_list: [],
  // },
  // {
  //   key_label: "speed_less_than",
  //   plac_name: "Speed Less Than(Kmph)",
  //   key_type: "text",
  // },
  // {
  //   key_label: "speed_more_than",
  //   plac_name: "Speed More Than(Kmph)",
  //   key_type: "text",
  // },
  {
    key_label: "color",
    plac_name: "Select Color",
    key_type: "multi-select",
    key_list: [
      { id: 1, label: "Black", name: "Black", key: "black" },
      { id: 2, label: "Blue", name: "Blue", key: "blue" },
      { id: 3, label: "Gray", name: "Gray", key: "gray" },
      { id: 4, label: "Green", name: "Green", key: "green" },
      { id: 5, label: "Orange", name: "Orange", key: "orange" },
      { id: 6, label: "Red", name: "Red", key: "red" },
      { id: 7, label: "White", name: "White", key: "white" },
      { id: 8, label: "Yellow", name: "Yellow", key: "yellow" }
    ],
  },
];

const SearchModel = (props) => {
  const [isSuccess, setSuccess] = useState(false);
  const classes = useStyles();
  const current_theme = useTheme();

  const [search_form, setSearchForm] = useState({
    registration_num: "",
    is_vehant: false,
    is_anpr: true,
    is_anpr_vehant: false,
    junction_name: [],
    police_station: [],
    camera_name: [],
    zone: [],
    // location: null,
    event_from_date: null,
    event_to_date: null,
    // speed_less_than: 0,
    // speed_more_than: 0,
    // violation: [],
    // category: null,
    commisionerate: [],
    hotlist_category: [],
    color: [],
  });

  const [fieldsDisplayList, setFieldsDisplayList] = useState([]);
  const [selectedComm, setSelectedComm] = useState([]);
  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });

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

  useEffect(() => {
    if (props.open) {
      const { hotlist_category, junction_name, police_station, registration_num, zone, camera_name, event_to_date, event_from_date, color, commisionerate } = search_form;
      if (hotlist_category.length || junction_name.length || police_station.length || zone.length || commisionerate.length || camera_name.length || color.length || registration_num || event_from_date || event_to_date) {
        setSearchForm({
          registration_num: "",
          is_vehant: false,
          is_anpr: true,
          is_anpr_vehant: false,
          junction_name: [],
          police_station: [],
          camera_name: [],
          zone: [],
          event_from_date: null,
          event_to_date: null,
          commisionerate: [],
          hotlist_category: [],
          color: [],
        });
      }
    }
  }, [props.open]);

  //set key list on select field
  useEffect(() => {
    const { is_vehant, is_anpr } = search_form;
    if (props?.hotlistCategoryList || props.locationsList) {
      fields_display.map((i, idx) => {
        const { locationsList, anprCommisionerates } = props;
        if (i.key_label === "commisionerate") {
          let arr = [];
          if (locationsList && locationsList.length && is_vehant) {
            _.uniqBy(locationsList, 'commissionerate').map(rec => {
              arr.push({
                id: rec.id,
                key: rec.commissionerate,
                label: rec.commissionerate,
                name: rec.commissionerate
              })
            })
          } if (is_anpr) {
            arr = anprCommisionerates;
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
                label: rec.name,
                name: rec.name
              })
            })
          }
          fields_display[idx]["key_list"] = arr;
        }
      });
      setFieldsDisplayList(Object.assign([], fields_display));
    }

  }, [props, selectedComm, search_form.is_vehant, search_form.is_anpr]);


  const setFieldOptions = (i, rec) => {
    const { anprCommisionerates, caminfoList } = props;
    console.log('rec', rec, search_form);

    if (rec.key_label === "commisionerate" && anprCommisionerates && anprCommisionerates.length) {
      rec.key_list = anprCommisionerates;
    } else if (rec.key_label === "zone" && anprCommisionerates.length) {
      if (search_form['commisionerate'] && search_form['commisionerate'].length) {
        let filter_list = [];
        anprCommisionerates.filter(rec => {
          if (search_form['commisionerate'].includes(rec.name)) {
            filter_list.push(...rec.children);
          }
        });
        rec.key_list = filter_list;
      } else {
        let filter_list = [];
        anprCommisionerates.filter(rec => {
          filter_list.push(...rec.children);
        });
        rec.key_list = filter_list;
      }
    } else if (rec.key_label === "police_station" && anprCommisionerates.length) {
      if (search_form['zone'] && search_form['zone'].length) {
        let filter_list = [];
        anprCommisionerates.map(rec =>
          rec.children.filter(crec => {
            if (search_form['zone'].includes(crec.name)) {
              filter_list.push(...crec.children);
            }
          }));
        rec.key_list = filter_list;
      } else {
        let filter_list = [];
        anprCommisionerates.filter(rec => {
          rec.children.filter(crec => {
            filter_list.push(...crec.children);
          })
        });
        rec.key_list = filter_list;
      }
    } else if (rec.key_label === "junction_name" && caminfoList) {
      let arr = [];
      if (caminfoList && caminfoList.length) {
        if (search_form['police_station'] && search_form['police_station'].length) {
          let filter_list = [];
          caminfoList.map(rec => {
            if (search_form['police_station'].includes(rec.police_station)) {
              let obj = {
                id: rec.id,
                key: rec.junction_name,
                label: rec.junction_name,
                name: rec.junction_name
              }
              filter_list.push(obj);
            }
          });
          rec.key_list = _.uniqBy(filter_list, 'key');
        } else {
          _.uniqBy(caminfoList, 'junction_name').map(rec => {
            arr.push({
              id: rec.id,
              key: rec.junction_name,
              label: rec.junction_name,
              name: rec.junction_name
            })
          })
          rec.key_list = arr
        }
      }
    } else if (rec.key_label === "camera_name" && caminfoList) {
      let arr = [];
      if (caminfoList.length) {
        if (search_form['junction_name'] && search_form['junction_name'].length) {
          let filter_list = [];
          caminfoList.map(rec => {
            if (search_form['junction_name'].includes(rec.junction_name)) {
              let obj = {
                id: rec.id,
                key: rec.camera_name,
                label: rec.camera_name,
                name: rec.camera_name
              }
              filter_list.push(obj);
            }
          });
          rec.key_list = filter_list;
        } else {
          _.uniqBy(caminfoList, 'camera_name').map(rec => {
            arr.push({
              id: rec.id,
              key: rec.camera_name,
              label: rec.camera_name,
              name: rec.camera_name
            })
          })
          rec.key_list = arr
        }
      }
    }
    return rec.key_list;
  };

  const getVehantOptions = (idx, rec) => {
    const { key_label } = rec;
    const { locationsList, anprCommisionerates } = props;
    const { is_vehant, is_anpr, is_anpr_vehant } = search_form;

    if (key_label === 'commisionerate') {
      return fields_display[idx]["key_list"];
    }

    if (selectedComm.length) {
      let filter_list = [];

      if (is_vehant) {
        filter_list = locationsList.filter(rec => {
          if (selectedComm.includes(rec.commissionerate)) {
            return rec;
          }
        });
      }

      if (key_label === "junction_name") {
        const zone_arr = [];

        if (is_vehant) {
          _.uniqBy(filter_list, 'junction').map(rec => {
            zone_arr.push({
              id: rec.id,
              key: rec.junction,
              label: rec.junction
            })
          })
        } else {
          _.uniqBy(filter_list, 'junction_name').map(rec => {
            if (!zone_arr.filter(arec => arec.key === rec.junction_name).length) {
              zone_arr.push({
                id: rec.id,
                key: rec.junction_name,
                label: rec.junction_name
              })
            }
          });
        }
        return fields_display[idx]["key_list"] = zone_arr;
      }
      if (key_label === "police_station") {
        const ps_arr = [];

        if (is_vehant) {
          _.uniqBy(filter_list, 'l_o_ps').map(rec => {
            ps_arr.push({
              id: rec.id,
              key: rec.l_o_ps,
              label: rec.l_o_ps
            })
          })
        } else {
          _.uniqBy(filter_list, 'police_station').map(rec => {
            if (!ps_arr.filter(arec => arec.key === rec.police_station).length) {
              ps_arr.push({
                id: rec.id,
                key: rec.police_station,
                label: rec.police_station
              })
            }
          });
        }

        return fields_display[idx]["key_list"] = ps_arr;
      }
      if (key_label === "camera_name") {
        const cam_arr = [];

        if (is_vehant) {
          _.uniqBy(filter_list, 'camera').map(rec => {
            cam_arr.push({
              id: rec.id,
              key: rec.cam_id,
              label: rec.cam_id
            })
          })
        } else {
          _.uniqBy(filter_list, 'camera_name').map(rec => {
            if (!cam_arr.filter(arec => arec.key === rec.camera_name).length) {
              cam_arr.push({
                id: rec.id,
                key: rec.camera_name,
                label: rec.camera_name
              })
            }
          });
        }
        return fields_display[idx]["key_list"] = cam_arr;
      }
      if (key_label === "zone") {
        const comm_arr = [];
        // if (is_vehant) {
          _.uniqBy(filter_list, 'zone').map(rec => {
            comm_arr.push({
              id: rec.id,
              key: rec.zone,
              label: rec.zone,
              name: rec.zone
            })
          })
        // }
        //  else {
        //   _.uniqBy(filter_list, 'zone').map(rec => {
        //     if (!comm_arr.filter(arec => arec.key === rec.zone).length) {
        //       comm_arr.push({
        //         id: rec.id,
        //         key: rec.zone,
        //         label: rec.zone
        //       })
        //     }
        //   });
        // }
        return fields_display[idx]["key_list"] = comm_arr;
      }
    } else {
      if (key_label === "junction_name") {
        const zone_arr = [];
        if (is_vehant) {
          _.uniqBy(locationsList, 'junction').map(rec => {
            zone_arr.push({
              id: rec.id,
              key: rec.junction,
              label: rec.junction,
              name: rec.junction
            })
          })
        }
        return fields_display[idx]["key_list"] = zone_arr;
      }
      if (key_label === "police_station") {
        const ps_arr = [];
        if (is_vehant) {
          _.uniqBy(locationsList, 'l_o_ps').map(rec => {
            ps_arr.push({
              id: rec.id,
              key: rec.l_o_ps,
              label: rec.l_o_ps,
              name: rec.l_o_ps
            })
          })
        }
        return fields_display[idx]["key_list"] = ps_arr;
      }
      if (key_label === "camera_name") {
        const cam_arr = [];
        if (is_vehant) {
          _.uniqBy(locationsList, 'cam_id').map(rec => {
            cam_arr.push({
              id: rec.id,
              key: rec.cam_id,
              label: rec.cam_id,
              name: rec.cam_id
            })
          })
        }
        return fields_display[idx]["key_list"] = cam_arr;
      }
      if (key_label === "zone") {
        const comm_arr = [];
        // if (is_vehant) {
          _.uniqBy(locationsList, 'zone').map(rec => {
            comm_arr.push({
              id: rec.id,
              key: rec.zone,
              label: rec.zone,
              name: rec.zone
            })
          })
        // }
        return fields_display[idx]["key_list"] = comm_arr;
      }
    }
    return fields_display[idx]["key_list"];
  }

  const handleChange = (event) => {
    setSearchForm((oldValues) => ({
      ...oldValues,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCheckChange = (event) => {
    const { name, checked } = event.target;
    const { is_vehant, is_anpr, is_anpr_vehant } = search_form;
    if (!checked) {
      if (name === 'is_vehant' && !is_anpr && !is_anpr_vehant) {
        return setAlertStatus("Atleast one check is mandatory", true, "warning");
      } else if (name === 'is_anpr' && !is_vehant && !is_anpr_vehant) {
        return setAlertStatus("Atleast one check is mandatory", true, "warning");
      } else if (name === 'is_anpr_vehant' && !is_vehant && !is_anpr) {
        return setAlertStatus("Atleast one check is mandatory", true, "warning");
      }
    }

    setSearchForm((oldValues) => ({
      ...oldValues,
      junction_name: [],
      police_station: [],
      camera_name: [],
      zone: [],
      commisionerate: [],
      is_vehant: event.target.name === 'is_vehant' ? event.target.checked : false,
      is_anpr_vehant: event.target.name === 'is_anpr_vehant' ? event.target.checked : false,
      is_anpr: event.target.name === 'is_anpr' ? event.target.checked : false,
    }));
  };

  const handleClose = () => {
    props.setOpen(false);
    if (typeof props.refreshContent == "function") {
      props.refreshContent(true);
    }
  };



  const searchHandler = () => {
    console.log(" anpr search form", search_form);
    const { is_vehant, is_anpr, is_anpr_vehant, hotlist_category, junction_name, police_station, registration_num, zone, commisionerate, camera_name, event_to_date, event_from_date, color } = search_form;
    if (!hotlist_category.length &&
      !junction_name.length &&
      !police_station.length &&
      !zone.length &&
      !camera_name.length &&
      !commisionerate.length &&
      !color.length &&
      !registration_num &&
      !event_from_date &&
      !event_to_date) {
      return setAlertStatus("Select any field to search", true, "error");
    }
    if ((!event_from_date && event_to_date) || (event_from_date && !event_to_date)) {
      return setAlertStatus("Event From Date and Event To Date Both are required", true, "error");
    } else {
      if ((moment(event_from_date).isSame(moment(event_to_date))) ||
        (moment(event_from_date).isAfter(moment(event_to_date))) ||
        (moment(event_to_date).isBefore(moment(event_from_date)))) {
        return setAlertStatus("Start Date should be before End Date", true, "error");
      }
    }

    props.filterAnprSearchData(search_form);
    props.setOpen(false);
  };

  const setAlertStatus = (content, status, severity) => {
    setAlertState({
      ...alertstate,
      alertOpen: status,
      alertContent: content,
      severity: severity,
    });
  };

  const setFormFieldVals = (vals, selected, key) => {
    let selected_vals = selected.map(rec => rec.name);
    if (key === 'commisionerate') {
      setSelectedComm(selected_vals);
    }
    setSearchForm((oldValues) => ({ ...oldValues, [key]: selected_vals }));
  };

  const handleSelectChange = (vals, key_label) => {
    if (key_label === 'commisionerate') {
      const keys = vals.map(rec => rec.key);
      setSelectedComm(keys);
    }
  };

  const getOptVal = (recKey, rec) => {
    let returnVal = [];
    const { anprCommisionerates, caminfoList } = props;
    const { is_anpr, is_vehant } = search_form;

    if (recKey === "commisionerate") {
      let data = rec.key_list.filter((comm) => search_form[recKey].includes(comm.name));
      returnVal = data;
    } else if (recKey === "zone" && is_anpr) {
      let data = [];
      rec.key_list.filter(
        (rec) => {
          if (search_form.zone.includes(rec.name)) {
            data.push(rec)
          }
        });
      returnVal = data
    } else if (recKey === "police_station" && is_anpr) {
      let data = [];
      rec.key_list.filter(
        (rec) => {
          if (search_form.police_station.includes(rec.name)) {
            data.push(rec)
          }
        });
      returnVal = data
    } else if ((recKey === "camera_name" || recKey === "junction_name") && caminfoList.length) {
      let data = rec.key_list.filter((comm) => search_form[recKey].includes(comm.name));
      returnVal = data;
    } else if (recKey === "color") {
      let data = [];
      rec.key_list.filter(
        (rec) => {
          if (search_form.color.includes(rec.name)) {
            data.push(rec)
          }
        });
      returnVal = data
    } else if (recKey === "hotlist_category") {
      let data = [];
      rec.key_list.filter(
        (rec) => {
          if (search_form.hotlist_category.includes(rec.name)) {
            data.push(rec)
          }
        });
      returnVal = data
    }
    return returnVal;
  };

  const getAnprVehantOptions = (idx, rec) => {
    const { key_label } = rec;
    const { anprCommisionerates, locationsList } = props;
    if (key_label === 'commisionerate') {
      const arr = [...anprCommisionerates, ...fields_display[idx]["key_list"]]
      return arr;
    }
    if (key_label === "zone") {
      const comm_arr = [];
      _.uniqBy(locationsList, 'zone').map(rec => {
        comm_arr.push({
          id: rec.id,
          key: rec.zone,
          label: rec.zone,
          name: rec.zone
        })
      })

      let filter_list = [];
      // anprCommisionerates.filter(rec => {
      //   if (search_form['commisionerate'].includes(rec.name)) {
      //     filter_list.push(...rec.children);
      //   }
      // });
      anprCommisionerates.filter(rec => {
        filter_list.push(...rec.children);
      });

      const arr = _.uniqBy([...filter_list, ...comm_arr], 'name')
      return rec["key_list"] = arr;
    }
    if (key_label === "police_station") {
      const comm_arr = [];
      _.uniqBy(locationsList, 'police_station').map(rec => {
        comm_arr.push({
          id: rec.id,
          key: rec.zone,
          label: rec.zone,
          name: rec.zone
        })
      })

      let filter_list = [];
      // anprCommisionerates.filter(rec => {
      //   if (search_form['commisionerate'].includes(rec.name)) {
      //     filter_list.push(...rec.children);
      //   }
      // });
      anprCommisionerates.filter(rec => {
        rec.children.filter(crec => {
          filter_list.push(...crec.children);
        })
      });

      const arr = _.uniqBy([...filter_list, ...comm_arr], 'name')
      console.log('8888888888888888888888888888', filter_list, comm_arr);
      return rec["key_list"] = arr;
    }
    return [];
  }

  const getOptionsState = (rec, index) => {
    const { is_vehant, is_anpr_vehant, is_anpr } = search_form;
    if (is_anpr) {
      return setFieldOptions(index, rec);
    } else if (is_vehant) {
      return getVehantOptions(index, rec);
    } else if (is_anpr_vehant) {
      return getAnprVehantOptions(index, rec);
    }
  }

  const getOptLabel = (comm, rec) => {
    return comm.name
  }

  const { alertOpen, vertical, horizontal, alertContent, severity } =
    alertstate;

  return (
    <Fragment>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={alertOpen}
        autoHideDuration={1000}
        onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
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
                  Anpr Search
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
                                  sx={{
                                    backgroundColor: "#3C3D40",
                                    color: "#fff !important",
                                    fontSize: "14px",
                                    opacity: "100%"
                                  }}
                                  defaultValue={
                                    search_form[rec.key_label] || ""
                                  }
                                  inputProps={{ maxLength: 15, style: { textTransform: "uppercase" } }}
                                  onChange={(e) => handleChange(e)}
                                // required
                                />
                              </Box>
                            )}
                            {rec.key_type === "multi-select" && (
                              <Box className={classes.commonField}>
                                <Autocomplete
                                  multiple
                                  id={rec.key_label}
                                  name={rec.key_label}
                                  key={`${rec.key_label}-${index + 1}`}
                                  value={getOptVal(rec.key_label, rec)}
                                  disableCloseOnSelect
                                  onChange={(e, values) => setFormFieldVals(e, values, rec.key_label)}
                                  options={getOptionsState(rec, index)}
                                  className={classes.selectFldCls}
                                  getOptionLabel={comm => getOptLabel(comm, rec)}
                                  renderOption={(props, option, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                      <li key={key} {...optionProps}>
                                        <Checkbox
                                          icon={icon}
                                          checkedIcon={checkedIcon}
                                          style={{ marginRight: 8 }}
                                          checked={selected}
                                        />
                                        {getOptLabel(option, rec)}
                                      </li>
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      autoComplete="off"
                                      InputLabelProps={{ className: classes.selectLabel }}
                                      label={rec.plac_name}
                                      key={`${rec.key_label}-textfield-${index + 1}`}
                                      name={rec.key_label}
                                      variant="filled"
                                      required
                                    />
                                  )}
                                />
                                {/* <MultipleSelectAll
                                  variant="contained"
                                  size="small"
                                  width="100%"
                                  addDefault={true}
                                  options={(rec.key_label === 'hotlist_category' || rec.key_label === 'color') ? (rec.key_list || []) : getOptions(index, rec.key_label)}
                                  label={rec.plac_name}
                                  name={rec.key_label}
                                  filterOpts={true}
                                  setModel={(vals) => {
                                    setFormFieldVals(vals, rec.key_label);
                                    handleSelectChange(vals, rec.key_label);
                                  }}
                                  classes={{ root: classes.colorroot }}
                                ></MultipleSelectAll> */}

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
                              // <Box className={classes.commonField}>
                              //   <SingleSelect
                              //     width="100%"
                              //     addDefault={false}
                              //     label={rec.plac_name}
                              //     size="small"
                              //     options={getVehantOptions(index, rec.key_label) || []}
                              //     propKey="label"
                              //     setSelectVal={(val) => {
                              //       if (val) {
                              //         setSearchForm({ ...search_form, [rec.key_label]: val })
                              //         handleSelectChange(val, rec.key_label);
                              //       }
                              //     }}
                              //   />
                              // </Box>
                              <></>
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
                                      sx={{
                                        backgroundColor: "#3C3D40",
                                        color: "#fff !important",
                                        fontSize: "14px",
                                        opacity: "100%"
                                      }}
                                      InputLabelProps={{
                                        shrink: true,
                                        maxDate: moment().format(
                                          "YYYY-MM-DD hh:mm"
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

                            {rec.key_type === "boolean" && (
                              <Box className={classes.commonField}>
                                <FormControl fullWidth sx={{ flexDirection: 'row' }}>
                                  <FormControlLabel
                                    control={<Checkbox
                                      onChange={(evt) => handleCheckChange(evt)}
                                      name={rec.key_label}
                                      checked={search_form[rec.key_label]}
                                      inputProps={{ 'aria-label': 'controlled' }}
                                    />}
                                    label={rec.plac_name}
                                    name={rec.key_label}
                                    labelPlacement="start" />
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

export default SearchModel;