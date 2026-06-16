/* eslint-disable array-callback-return */
import React, { Fragment, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import Typography from "@mui/material/Typography";
import {
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Modal,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Snackbar,
  Alert,
  IconButton,
  Tab,
  Link,
} from "@mui/material";
import { border, Box, padding } from "@mui/system";

import Paper from "@mui/material/Paper";
import { LABELS } from "../../../config/tabs_constants/labels";
import MultipleSelect from "../../../common/multiselect";
import ModelsService from "../../../services/models";
import * as model_data from "../../../common/configuration/model_fields.json";
import SingleSelect from "../../../common/select";

import { getRandomColor } from "../../../utilities/common-util";
import EditIcon from "@mui/icons-material/Edit";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import usePagination from "../../../common/pagination";
import _ from "lodash";
import { Delete } from "@mui/icons-material";
import { local_anpr_user } from "../../../config/config";
import NoAccess from "../../../common/NoAccess";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import useLoader from "../../../common/loader/useLoader";

const useStyles = makeStyles((theme) => ({
  root: {
    "& ::-webkit-scrollbar": {
      width: "8px",
      height: "100%",
      marginRight: "4px",

      // backgroundColor: "#3D81F5",
    },
    "& ::-webkit-scrollbar-thumb": {
      background: "white",
      borderRight: "4px white solid",
      height: "2px",
    },
    "& :: -webkit-scrollbar-track": {
      borderRadius: "5px",
    },
    "& :: -webkit-scrollbar-thumb": {
      borderRadius: "5px",
    },
    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${
        theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
      }`,
      backgroundColor: "#285705",
      color: theme.palette.text.primary,
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", //camera/camera header+sno.bar font
    },
    "& .MuiDataGrid-columnsContainer": {
      minHeight: "auto !important",
      maxHeight: "auto !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#285705 !important",
    },
    "& .MuiButton-root": {
      color: "#37720B",
      fontSize: "12px",
      top: "-1.75px",
    },
    "& .MuiDivider-root": {
      borderColor: "#fff",
      margin: "6px 8px 6px 12px",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "83vh",
      // paddingLeft: "7px",
    },
    [theme.breakpoints.up(1401)]: {
      height: "88vh",
    },
    width: "82vw",
    margin: "0px",
    padding: "0px !important",
  },
  iptTxtFldCls: {
    "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
      backgroundColor: "#ffffff45 !important",
    },
    "& .MuiOutlinedInput-root": {
      fontSize: "14px !important",
    },
    "& .MuiSelect-select": {
      color: "#aea256 !important",
    },
  },
  selectFldCls: {
    "& .MuiOutlinedInput-root": {
      fontSize: "14px !important",
    },
  },

  dataModelGridCls: {
    // maxHeight: "300px",
    // minHeight: "300px",
    color: "#fff !important", //Cameras/no row
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      // height: "26vh !important",
      maxHeight: "80vh",
      minHeight: "80vh",
    },
    [theme.breakpoints.up(1401)]: {
      // height: "50vh !important",
      maxHeight: "91vh",
      minHeight: "79vh",
    },
  },
  cellsCls: {
    color: "#000000 !important", // cameras/rows words
    // backgroundColor: "#0D0D0D",
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  tableCls: {
    height: "95vh",
    padding: "8px 4px 0px 12px !important",
  },
  modelsBtn: {
    float: "selected_input_params",
    marginRight: "1rem",
    width: "220px",
    height: "49px",
    backgroundColor: "#37720B !important",
    color: "#fff !important",
    "& .MuiLink-root": {
      color: "#fff !important",
    },
  },
}));

const groupstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

// function createData(name, modelsArr) {
//   let models = modelsArr.toString();
//   return { name, models };
// }

const ModelsConfig = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  const { model_fields } = model_data?.default;
  const [modelPopup, setModelPopup] = React.useState(false);
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    model_name: "",
    label: "",
    description: "",
    input_url: "",
    output_url: "",
    violation_type: "",
    model_group_id: null,
    camera_id: null,
    color: "",
    is_update: false,
    server_ip: "",
    gpu_id: "",
  });
  const [copyRecord, setCopyRecord] = useState(null);
  const [copyDefaultParams, setCopyDefaultParams] = useState([]);
  const [checked, setChecked] = useState([]);

  const [default_input_params, setDefaultInputParams] = useState([]);
  const [selected_input_params, setSelectedInputParams] = useState([]);
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    error: false,
    helperText: "",
  });
  const [mode, setMode] = useState(null);
  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [restartPrompt, setRestartPrompt] = useState(false);
  const [origModelName, setOrigModelName] = useState("");

  const [loader, showLoader, hideLoader] = useLoader();

  const [violationList, setViolationList] = useState([]);

  const leftChecked = intersection(checked, default_input_params);
  const rightChecked = intersection(checked, selected_input_params);

  function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
  }

  function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
  }

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setSelectedInputParams(selected_input_params.concat(default_input_params));
    setDefaultInputParams([]);
  };

  const handleCheckedRight = () => {
    setSelectedInputParams(selected_input_params.concat(leftChecked));
    setDefaultInputParams(not(default_input_params, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setDefaultInputParams(default_input_params.concat(rightChecked));
    setSelectedInputParams(not(selected_input_params, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setDefaultInputParams(default_input_params.concat(selected_input_params));
    setSelectedInputParams([]);
  };

  useEffect(() => {
    getModels();
    getModelDefaultParams();
    getViolationsList();
  }, []);

  const getViolationsList = () => {
    ModelsService.getViolationPopupGroup().then((response) => {
      if (response) {
        const { data } = response?.data;
        if (data) {
          const arr = [];
          data.map((rec) => {
            arr.push({
              id: rec.id,
              key: rec.name,
              code: rec.code,
              label: rec.name,
            });
          });
          setViolationList(arr);
        }
      }
    });
  };

  const getModels = () => {
    ModelsService.getModels()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          setModels(data);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log("error response", err);
        } else if (err.request) {
          console.log("error request", err);
        } else {
          console.log("error", err);
        }
      });
  };

  const getModelDefaultParams = () => {
    ModelsService.getModelParameters()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          setDefaultInputParams(data);
          setCopyDefaultParams(data);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log("error response", err);
        } else if (err.request) {
          console.log("error request", err);
        } else {
          console.log("error", err);
        }
      });
  };

  const getModelFieldValue = (rec, formRecData) => {
    if (formRecData[rec.name]) {
      return formRecData[rec.name];
    } else if (rec.name === "model_name") {
      return (formRecData.model_name = rec.key);
    } else {
      return "";
    }
  };

  const handleAddModel = () => {
    setMode("add");
    setIsActionDisabled(false);

    setState({
      ...state,
      error: false,
      helperText: "",
    });
    const input_params = Object.assign([], copyDefaultParams);
    setSelectedInputParams([]);
    setChecked([]);
    setDefaultInputParams(input_params);
    setModelPopup(true);
  };

  const handleCloseModel = () => {
    setChecked([]);
    setSelectedInputParams([]);
    setMode(null);
    setModelPopup(false);
    setState({
      ...state,
      error: false,
      helperText: "",
    });
    setFormData({
      model_name: "",
      description: "",
      input_url: "",
      output_url: "",
      violation_type: "",
      model_group_id: null,
      camera_id: null,
      label: "",
      color: "",
      is_update: false,
      server_ip: "",
      gpu_id: "",
    });
    setRestartPrompt(false);
  };

  const handleModelAction = (mode) => {
    if (!restartPrompt) {
      setRestartPrompt(true);
      return;
    }
    setIsActionDisabled(true);
    setCopyRecord(null);
    if (mode === "add") {
      if (formData.model_name) {
        formData.color = getRandomColor();
        formData.is_update = false;
        formData.input_params = selected_input_params;
        // console.log('formDataformData', formData);
        ModelsService.createUpdateModel({ ...formData, action_type: "Create" })
          .then((res) => {
            setFormData({
              model_name: "",
              description: "",
              input_url: "",
              output_url: "",
              violation_type: "",
              model_group_id: null,
              camera_id: null,
              label: "",
              color: "",
              is_update: false,
              server_ip: "",
              gpu_id: "",
            });
            setModelPopup(false);
            setIsActionDisabled(false);
            setMode(null);
            getModels();
          })
          .catch((err) => {
            if (err) console.log(err);
          });
      }
    } else if (mode === "update") {
      if (formData.model_name) {
        formData.color = getRandomColor();
        formData.is_update = true;
        formData.input_params = selected_input_params;
        ModelsService.createUpdateModel({ ...formData, action_type: "Update" })
          .then((res) => {
            const model_name = formData.model_name;
            let obj = {};
            if (model_name === origModelName) {
              obj = {
                model_data: [
                  {
                    name: model_name,
                    server_ip: formData.server_ip,
                  },
                ],
              };
            } else {
              obj = {
                model_name_change: true,
                old_name: origModelName,
                new_name: model_name,
                server_ip: formData.server_ip,
                model_data: [
                  { name: model_name, server_ip: formData.server_ip },
                  { name: origModelName, server_ip: formData.server_ip },
                ],
              };
            }
            setFormData({
              model_name: "",
              description: "",
              input_url: "",
              output_url: "",
              violation_type: "",
              model_group_id: null,
              camera_id: null,
              label: "",
              color: "",
              is_update: false,
              server_ip: "",
              gpu_id: "",
            });
            setModelPopup(false);
            setMode(null);
            setIsActionDisabled(false);
            getModels();
            ModelsService.modelRestart(obj)
              .then((restartResponse) => {
                console.log("Model restart successful", restartResponse);
              })
              .catch((restartError) => {
                console.error("Error restarting models", restartError);
              });
          })
          .catch((err) => {
            if (err) console.log(err);
          });
      }
    }
    setRestartPrompt(false);
  };

  const onModalEditClick = (item) => {
    setMode("update");
    setIsActionDisabled(false);

    if (violationList && violationList.length) {
      let idx = violationList.findIndex(
        (rec) => rec.code === item["violation_type"]
      );
      if (idx !== -1) {
        item["violation_type"] = violationList[idx].label;
      }
    }
    setOrigModelName(item.model_name);

    console.log("itemmmmm", item);
    setFormData(item);
    setCopyRecord(item);
    const input_params = Object.assign([], copyDefaultParams);

    if (item.input_params && input_params) {
      item.input_params.map((rec) => {
        let idx = input_params.findIndex((paramRec) => paramRec.id === rec.id);
        if (idx !== -1) {
          _.remove(input_params, input_params[idx]);
        }
      });
      setSelectedInputParams(item.input_params);
    }

    setDefaultInputParams(input_params);
    setModelPopup(true);
  };

  const customList = (iptParams) => {
    return (
      <Paper sx={{ width: 300, height: 230, overflow: "auto" }}>
        <List dense component="div" role="list">
          {iptParams.map((item, idx) => {
            const labelId = `transfer-list-item-${idx}-label`;

            return (
              <ListItem
                key={idx + 1}
                role="listitem"
                button
                onClick={handleToggle(item)}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(item) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      "aria-labelledby": labelId,
                    }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={item.label} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Paper>
    );
  };

  const { vertical, horizontal, alertOpen, alertContent } = state;

  const AddModelPopup = () => (
    <Modal
      open={modelPopup}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          handleCloseModel();
        }
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={groupstyle}>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={alertOpen}
          autoHideDuration={1000}
          onClose={(_, reason) => setState({ ...state, alertOpen: false })}
        >
          <Alert
            onClose={() => setState({ ...state, alertOpen: false })}
            severity="error"
          >
            {alertContent}
          </Alert>
        </Snackbar>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Analytics
        </Typography>
        <Typography id="create-modal" component="div" sx={{ mt: 2 }}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            spacing={2}
          >
            {model_fields.map((rec, index) => {
              return rec && rec.type.toLowerCase() === "text" ? (
                <Grid item xs={6}>
                  <TextField
                    key={`model${index}`}
                    autoComplete="off"
                    error={rec.name === "model_name" ? state.error : false}
                    name={rec.name}
                    label={rec.label}
                    placeholder={`Enter ${rec.label}`}
                    variant="filled"
                    value={getModelFieldValue(rec, formData)}
                    sx={{
                      width: "100%",
                      fontSize: "14px",
                    }}
                    className={classes.iptTxtFldCls}
                    helperText={
                      rec.name === "model_name" ? state.helperText : false
                    }
                    onChange={(e) => {
                      setFormData((prevState) => ({
                        ...prevState,
                        [rec.name]: e.target.value,
                      }));
                      if (
                        rec.name === "model_name" &&
                        formData.model_name &&
                        models
                      ) {
                        // eslint-disable-next-line array-callback-return
                        let existIdx = models.findIndex((existsmdl) => {
                          if (
                            copyRecord &&
                            existsmdl.model_name.toLowerCase() !==
                              copyRecord.model_name.toLowerCase()
                          ) {
                            return (
                              existsmdl.model_name.toLowerCase() ===
                              e.target.value.toLowerCase()
                            );
                          } else {
                            return (
                              existsmdl.model_name.toLowerCase() ===
                              e.target.value.toLowerCase()
                            );
                          }
                        });
                        if (existIdx !== -1 && !state.error) {
                          setState({
                            ...state,
                            error: true,
                            helperText: "Already violation exists!!",
                          });
                          return;
                        } else if (state.error && state.helperText !== "") {
                          setState({
                            ...state,
                            error: false,
                            helperText: "",
                          });
                          return;
                        }
                      }
                    }}
                  />
                </Grid>
              ) : rec.type === "select" ? (
                <Grid item xs={6}>
                  <SingleSelect
                    width={340}
                    label={rec.label}
                    propKey="code"
                    options={violationList}
                    class={classes.selectFldCls}
                    selectedVal={getModelFieldValue(rec, formData)}
                    setSelectVal={(val) => {
                      if (val) {
                        setFormData((prevState) => ({
                          ...prevState,
                          [rec.name]: val,
                        }));
                      }
                    }}
                  />
                </Grid>
              ) : null;
            })}
          </Grid>
          <Typography component="div" sx={{ mt: 2 }}>
            {" "}
            Analytics Parameters{" "}
          </Typography>
          {!restartPrompt && (
            <Typography id="modal-param-list" component="div" sx={{ mt: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item>{customList(default_input_params)}</Grid>
                <Grid item>
                  <Grid container direction="column" alignItems="center">
                    <Button
                      sx={{ my: 0.5 }}
                      variant="outlined"
                      size="small"
                      onClick={handleAllRight}
                      disabled={default_input_params.length === 0}
                      aria-label="move all selected_input_params"
                    >
                      ≫
                    </Button>
                    <Button
                      sx={{ my: 0.5 }}
                      variant="outlined"
                      size="small"
                      onClick={handleCheckedRight}
                      disabled={leftChecked.length === 0}
                      aria-label="move selected selected_input_params"
                    >
                      &gt;
                    </Button>
                    <Button
                      sx={{ my: 0.5 }}
                      variant="outlined"
                      size="small"
                      onClick={handleCheckedLeft}
                      disabled={rightChecked.length === 0}
                      aria-label="move selected default_input_params"
                    >
                      &lt;
                    </Button>
                    <Button
                      sx={{ my: 0.5 }}
                      variant="outlined"
                      size="small"
                      onClick={handleAllLeft}
                      disabled={selected_input_params.length === 0}
                      aria-label="move all default_input_params"
                    >
                      ≪
                    </Button>
                  </Grid>
                </Grid>
                <Grid item>{customList(selected_input_params)}</Grid>
              </Grid>
            </Typography>
          )}
          {restartPrompt && (
            <Card variant="contained">
              <div>Are You Sure You Want To Update the Analytics?</div>
              <div>This might need Restarting the Analytics</div>
            </Card>
          )}
          <Box sx={{ flex: "1 1 auto", color: "#000", float: "right" }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={handleCloseModel}
              sx={{ mr: 1, mt: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={isActionDisabled}
              sx={{ mt: 2 }}
              onClick={() => handleModelAction(mode)}
            >
              {mode === "add" ? "Add" : "Update"}
            </Button>
          </Box>
        </Typography>
      </Box>
    </Modal>
  );

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ width: "100%", backgroundColor: "#CCDCC1" }}
      >
        <Typography
          style={{
            color: `${theme.palette?.text?.secondary}`,
            marginLeft: "10px",
            flexGrow: "1",
            fontSize: "18px !important",
            backgroundColor: "inherit",
          }}
        >
          Analytics
        </Typography>

        {/* <Divider orientation="vertical" variant="middle" flexItem />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector style={{ marginRight: "15px" }} /> */}
        {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
      </GridToolbarContainer>
    );
  }

  const columns = [
    {
      field: "s.no",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            S.No
          </Typography>
        ); //CAMERAS/s.no.
      },
      renderCell: (params) => {
        let index = models.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "label",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            Model Name
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "description",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            Description
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "actions",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            Actions
          </Typography>
        ); //CAMERAS/Action
      },
      renderCell: (params) => {
        return (
          <Typography>
            <IconButton
              aria-label="edit"
              onClick={() => onModalEditClick(params?.row)}
            >
              <EditIcon title="Edit Camera" />
            </IconButton>
          </Typography>
        );
      },
    },
  ];

  return local_anpr_user(
    "activity_info",
    "activity_name",
    "Violation Configuration"
  ) ? (
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <Button
        size="small"
        className={classes.modelsBtn}
        variant="contained"
        color="primary"
        sx={{ margin: "0px 0px 0px auto" }}
      >
        <Link href="/violationParams" underline="none">
          <Typography sx={{ fontSize: "12px !important", color: "#FFF" }}>
            Analytics Params Type
          </Typography>
        </Link>
      </Button>
      <Button
        size="small"
        className={classes.modelsBtn}
        color="primary"
        variant="contained"
        onClick={() => handleAddModel()}
      >
        Add Analytics
      </Button>
      <Grid item xs={12}>
        {modelPopup ? <Fragment>{AddModelPopup()}</Fragment> : null}
      </Grid>
      <Grid item xs={12} className={classes.tableCls}>
        {loader}
        <Card
          className={classes.card}
          sx={{ border: "1px solid #000", padding: "0px !important" }}
        >
          <CardContent component="div" className={classes.dataGridCpd}>
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={alertOpen}
              autoHideDuration={1000}
              onClose={() => {
                setAlertSuccess(false);
                setState({ ...state, alertOpen: false });
              }}
            >
              <Alert
                onClose={() => {
                  setAlertSuccess(false);
                  setState({ ...state, alertOpen: false });
                }}
                severity="error"
                variant="filled"
              >
                {alertContent}
              </Alert>
            </Snackbar>
            <DataGrid
              columns={columns}
              className={classes.dataModelGridCls}
              rows={models}
              rowHeight={35}
              headerHeight={40}
              components={{
                Toolbar: CustomToolbar,
              }}
              getCellClassName={(params) => classes.cellsCls}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ) : (
    <Grid>
      <NoAccess />
    </Grid>
  );
};

export default ModelsConfig;
