/* eslint-disable no-loop-func */
import { Add, Edit, Close, CloseOutlined } from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  createFilterOptions,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Modal,
  Snackbar,
  TextField,
  Typography
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import React, { Fragment, useEffect, useState } from "react";
import * as data from "../../../common/configuration/model_params.json";
import { model_param_type_options } from "../../../config/config";
import ModelsService from "../../../services/models";

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: `${theme.palette.mode === "light" ? "#ffffff12" : "#1f202280"
      } !important`,
    color: "#fff !important",
    border: "1px solid #868686 !important",
    flexDirection: "row",
    marginBottom: "10px",
  },
  cardcontent: {
    paddingBottom: "9px !important",
  },
  closeCls: {
    margin: '0px 0px 0px auto'
  },
  titleCls: {
    margin: '5px 0px 10px auto'
  },
  popupTitle: {
    width: '100%',
    margin: '0px 0px 10px',
    padding: '0px',
    fontSize: '16px',
    alignItems: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'center',
    color: '#fff'
  },
}));

const ModelParamModel = (props) => {
  const classes = useStyles();
  const { params } = data?.default;
  const [state, setState] = React.useState({
    alertOpen: false,
    alertStatus: "error",
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });
  const [paramList, setParamList] = useState([{
    id: null,
    name: null,
    key: null,
    label: null,
    type: null,
    options: null,
    value: null,
    created_on: new Date(),
    showOpt: false
  }]);

  const [optList, setoptList] = useState([
    {
      key: "",
      value: "",
      label: "",
    },
  ]);

  const current_theme = useTheme();

  useEffect(() => {
    if (props.paramObj && props.paramObj.length && props.mode === 'edit') {

      let obj;
      if (props.paramObj.filter(rec => rec.type === 'select')) {
        let obj1 = { showOpt: true };
        obj = [Object.assign(...props.paramObj, obj1)];
      } else {
        obj = props.paramObj;
      }

      setParamList([
        ...obj,
        {
          id: null,
          name: null,
          key: null,
          label: null,
          type: null,
          options: null,
          value: null,
          created_on: new Date(),
          showOpt: false,
        },
      ]);
    } else if (props.paramObj && props.paramObj.length && props.mode === 'add') {
      setParamList([
        {
          id: null,
          name: null,
          key: null,
          label: null,
          type: null,
          options: null,
          value: null,
          created_on: new Date(),
          showOpt: false
        }
      ])
    }
  }, [props.paramObj, props.mode]);

  const setAlertStatus = (content, status, statusType) => {
    setState({ ...state, alertOpen: status, alertStatus: statusType, alertContent: content });
  };

  const handleRemoveClick = (recIdx) => {
    const currentList = paramList[recIdx];
    if (currentList && currentList.id) {
      ModelsService.deleteModelParameters(currentList.id).then((res) => {
        const list = [...paramList];
        list.splice(recIdx, 1);
        setParamList(list);
        setAlertStatus("Successfully removed", true, "success");
      })
      .catch((err) => {
        if (err.response) {
          setAlertStatus("Failed to remove Params", true, "error");
        }
      });
    }
  };

  const handleAddClick = (recIdx) => {
    let keys = [
      "name",
      "label",
      "type",
      "options",
      "created_on"
    ];
    let idx;
    const currentParamsList = [paramList[recIdx]];

    for (var i = 0; i < keys.length; i++) {
      // eslint-disable-next-line array-callback-return
      idx = currentParamsList.findIndex((rec) => {
        if (keys[i] === 'type' && rec[keys[i]] === 'select') {
          return rec['options'] === null
        } else if (keys[i] === 'type' && rec[keys[i]] !== 'select') {
          return rec[keys[i]] === null || rec[keys[i]] === " "
        }
      });
      if (idx !== -1) {
        return setAlertStatus("Please fill all fields to proceed", true, "warning");
      }
    }
    ModelsService.saveModelParameters(paramList[recIdx])
      .then((res) => {
        if (res && res.data) {
          const { id } = res.data;
          currentParamsList[0].id = id;
          paramList[recIdx] = currentParamsList[0];
          setParamList([
            ...paramList,
            {
              id: null,
              name: null,
              key: null,
              label: null,
              type: null,
              options: null,
              value: null,
              created_on: new Date(),
              showOpt: false
            }
          ]);
          setAlertStatus("Successfully Added", true, "success");
        }
      })
      .catch((err) => {
        if (err.response) {
          setAlertStatus("Failed to add Params", true, "error");
        }
      });
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...paramList];
    list[index][name] = value;
    if (name === 'name') {
      list[index]['key'] = value;
    }
    setParamList(list);
  };

  const handleSelectChange = (rec, e, index) => {
    const { textContent } = e.target;
    const { name } = rec;

    const list = [...paramList];
    list[index][name] = textContent;

    if (name === 'type') {
      const show_opt = textContent === 'select';
      list[index].showOpt = show_opt;
    }
    setParamList(list);
  };

  const handleOptionsChange = (rec, e, newValue, i) => {
    if (newValue && newValue.inputValue) {
      let obj = {
        key: newValue.inputValue,
        label: newValue.inputValue,
        value: newValue.inputValue
      };
      setoptList([...optList, obj]);
      const opts = [...optList.filter(rec => rec.label), obj];
      paramList[i].options = opts;
      setParamList(paramList);
    } else {
      let idx = optList.findIndex(rec => rec.key === newValue.key);
      if (idx === -1) {
        let obj = {
          key: newValue,
          label: newValue,
          value: newValue
        };
        setoptList([...optList, obj]);
        const opts = [...optList.filter(rec => rec.label), obj]
        paramList[i].options = opts;
        setParamList(paramList);
      }
    }
  };

  const handleClose = () => {
    if (typeof props.setModelStatus === "function") {
      props.setModelStatus(false);
      if (typeof props.reloadPageData === "function") {
        return props.reloadPageData();
      }
    }
  };

  const handleCheckboxChange = () => { };

  const handleUpdateClick = (recIdx) => {
    let keys = [
      "name",
      "label",
      "type",
      "options",
      "created_on"
    ];
    let idx;
    const currentParamsList = [paramList[recIdx]];

    for (var i = 0; i < keys.length; i++) {
      // eslint-disable-next-line array-callback-return
      idx = currentParamsList.findIndex((rec) => {
        if (keys[i] === 'type' && rec[keys[i]] === 'select') {
          return rec['options'] === null
        } else if (keys[i] === 'type' && rec[keys[i]] !== 'select') {
          return rec[keys[i]] === null || rec[keys[i]] === " "
        }
      });
      if (idx !== -1) {
        return setAlertStatus("Please fill all fields to proceed", true, "warning");
      }
    }
    ModelsService.updateModelParameters(paramList[recIdx])
      .then((res) => {
        if (res && res.data) {
          const { id } = res.data;
          currentParamsList[0].id = id;
          paramList[recIdx] = currentParamsList[0];
          setParamList(paramList);
          setAlertStatus("Successfully Updated", true, "success");
        }
      })
      .catch((err) => {
        if (err.response) {
          setAlertStatus("Failed to update Params", true, "error");
        }
      });
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
    color: "#FFF"
  };
  const filter = createFilterOptions();

  const getOptVal = (recVal, recName, currentobj) => {
    let returnVal = null;
    if (recName === 'type') {
      let mpIdx = model_param_type_options.findIndex(
        (mpRec) => mpRec.name === recVal
      );
      if (mpIdx !== -1) {
        returnVal = model_param_type_options[mpIdx];
        return returnVal;
      }
    }
    return returnVal;
  };

  const getStepContent = (x, i) =>
    params.map((rec, idx) => {
      return rec && rec.type.toLowerCase() === "text" ? (
        <Fragment>
          <Grid item xs={4} key={`${rec.name}-text-grid-${i}`} >
            <TextField
              autoComplete="off"
              name={rec.name}
              key={`${rec.name}-${idx + 1}`}
              label={rec.label}
              placeholder="Enter Name"
              value={x[rec.name]}
              variant="filled"
              // helperText={getHelperStatus(rec, rec.name)}
              // error={getValidateStatus(rec, rec.name)}
              sx={{
                width: "100%",
                backgroundColor: current_theme.palette.primary.filledInpt,
                color: "#fff !important",
                fontSize: "14px",
                opacity: "100%"
              }}
              // disabled={x.isAdd}
              className={classes.iptTxtFldCls}
              onChange={(e) => handleInputChange(e, i)}
            // onBlur={(e) => onFieldBlur(e, rec, x[rec.name])}
            />
          </Grid>
        </Fragment >
      ) : rec && rec.type.toLowerCase() === "select" && rec.name === 'type' ? (
        <Grid item xs={4} key={`${rec.name}-select-grid-${i}`}>
          <Autocomplete
            id={rec.label}
            name={rec.name}
            key={`${rec.name}-${idx + 1}`}
            onChange={(e) => handleSelectChange(rec, e, i)}
            value={getOptVal(x[rec.name], rec.name, x)}
            disabled={x.isAdd}
            options={model_param_type_options}
            className={classes.selectFldCls}
            getOptionLabel={(comm) => comm.name}
            renderInput={(params) => (
              <TextField
                {...params}
                autoComplete="off"
                InputLabelProps={{ className: classes.selectLabel }}
                label={rec.label}
                key={`${rec.name}-select-${idx + 1}`}
                name={rec.name}
                variant="filled"
              />
            )}
          />
        </Grid>
      ) : rec && x['type'] && x['type'].toLowerCase() === "select" && rec.name === 'options' && x['showOpt'] ? (
        <Grid item xs={4} key={`${rec.name}-select-grid-${i}`}>
          <Autocomplete
            id={rec.label}
            name={rec.name}
            key={`${rec.name}-${idx + 1}`}
            onChange={(e, newValue) => handleOptionsChange(rec, e, newValue, i)}
            value={getOptVal(x[rec.name], rec.name, x)}
            disabled={x.isAdd}
            options={x[rec.name] || optList}
            renderOption={(props, option) => <li {...props}>{option.label}</li>}
            className={classes.selectFldCls}

            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some((option) => inputValue === option.label);
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  label: `Add "${inputValue}"`,
                });
              }
              return filtered;
            }}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option.label;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoComplete="off"
                InputLabelProps={{ className: classes.selectLabel }}
                label={rec.label}
                key={`${rec.name}-select-${idx + 1}`}
                name={rec.name}
                variant="filled"
              />
            )}
          />
        </Grid>
      ) : rec && rec.type.toLowerCase() === "boolean" ? (
        <Grid item xs={3}
          key={`${rec.name}-boolean-grid-${i}`}>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={rec.name}
              onChange={(e) => handleCheckboxChange(rec, e, i)}
              inputProps={{ 'aria-label': 'controlled' }} />} label={rec.label} />
          </FormGroup>
        </Grid>
      ) : null;
    });

  const { vertical, horizontal, alertOpen, alertStatus, alertContent } = state;

  return (
    <Fragment>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={alertOpen}
        autoHideDuration={1000}
        onClose={(_, reason) => setState({ ...state, alertOpen: false })}
      >
        <Alert
          onClose={() => setState({ ...state, alertOpen: false })}
          severity={alertStatus}
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
        <Box sx={{ ...style, width: "70%", border: "none" }}>
          <AppBar
            sx={{
              backgroundColor: `${current_theme?.palette?.primary?.compHeader} !important`,
              border: `1px solid ${current_theme.palette.mode === "light"
                ? "#707070"
                : "#404145 !important"
                }, opacity: 1 `,

            }}
            className={classes.popupTitle}
            position="static"
          >
            <div className={classes.titleCls}>Add Analytics Params</div>
            <div className={classes.closeCls}><IconButton onClick={() => handleClose()}><CloseOutlined /></IconButton></div>
          </AppBar>
          <Typography id="create-modal" component="div" sx={{
            padding: 3, maxHeight: '430px',
            overflowY: 'scroll'
          }}>
            {paramList.map((x, i) => {
              return (
                <Card
                  variant="outlined"
                  key={`${i + 1}-madel-param-card`}
                  className={classes.card}
                >
                  <CardContent className={classes.cardcontent} component="div">
                    <Grid container key={`${i + 1}-camera-grid`}>
                      <Grid container direction="row"
                        justifyContent="flex-start"
                        alignItems="flex-start" spacing={1}>
                        {getStepContent(x, i)}
                      </Grid>
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-end"
                        spacing={2}
                        mt={1}
                        mb={0}
                      >
                        <Grid>
                          {props.mode === "add"
                            ? paramList.length !== 1 && paramList.length - 1 !== i &&(
                              <Button
                                variant="contained"
                                onClick={() => handleRemoveClick(i)}
                                startIcon={<Close />}
                              >
                                Remove
                              </Button>
                            )
                            : null}
                          {props.mode === "edit"
                            ? paramList.length !== 1 && paramList.length - 1 !== i && (
                              <Button
                                variant="contained"
                                onClick={() => handleUpdateClick(i)}
                                startIcon={<Edit />}
                              >
                                Update
                              </Button>
                            )
                            : null}
                          {paramList.length - 1 === i && (
                            <Button
                              variant="contained"
                              onClick={() => handleAddClick(i)}
                              startIcon={<Add />}
                              sx={{ marginLeft: '5px' }}
                            >
                              Add
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Typography>
        </Box>
      </Modal>
    </Fragment>
  );
};

export default ModelParamModel;
