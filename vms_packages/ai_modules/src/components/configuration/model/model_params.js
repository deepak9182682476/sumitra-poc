import { makeStyles, useTheme } from "@mui/styles";
import React, { useEffect, useState } from "react";
import ModelsService from "../../../services/models";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";
import useLoader from "../../../common/loader/useLoader";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import moment from "moment";
import ModelParamModel from "./model_param_model";
import _ from "lodash";
import { local_anpr_user } from "../../../config/config";
import NoAccess from "../../../common/NoAccess";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     "& ::-webkit-scrollbar": {
//       width: "3px",
//       height: "100%",
//       marginRight: "4px",
//       backgroundColor: "#3D81F5",
//     },
//     "&::-webkit-scrollbar-thumb": {
//       background: "red",
//       borderRight: "4px white solid",
//       height: "2px",
//     },
//     "& .MuiDataGrid-columnHeaderWrapper": {
//       borderRight: `1px solid ${
//         theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
//       }`,
//       backgroundColor: `${
//         theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
//       }`,
//       color: theme.palette.text.primary,
//     },
//     "& .MuiGridToolbarContainer-root": {
//       padding: "4px !important",
//     },
//     "& .MuiDataGrid-root, .MuiTypography-root": {
//       fontSize: "14px", //camera/camera header+sno.bar font
//     },
//     "& .MuiDataGrid-columnsContainer": {
//       minHeight: "auto !important",
//       maxHeight: "auto !important",
//     },
//     "& .MuiDataGrid-columnHeaders": {
//       backgroundColor: "#313131 !important",
//     },
//     "& .MuiButton-root": {
//       color: "#fff !important",
//       fontSize: "12px",
//     },
//     "& .MuiDivider-root": {
//       borderColor: "#fff",
//       margin: "6px 8px 6px 12px",
//     },
//     [theme.breakpoints.between(750, 1400)]: {
//       height: "83vh",
//       // paddingLeft: "7px",
//     },
//     [theme.breakpoints.up(1401)]: {
//       height: "88vh",
//     },
//     width: "83vw",
//     marginTop: "3.5rem",
//   },
//   tableCls: {
//     // padding: "10px 5px 0px !important",
//     padding: "8px 4px 0px 10px !important",
//   },
//   dataModelGridCls: {
//     // maxHeight: "300px",
//     // minHeight: "300px",
//     color: "#fff !important", //Cameras/no row
//     border: "none !important",
//     [theme.breakpoints.between(750, 1400)]: {
//       // height: "26vh !important",
//       maxHeight: "80vh",
//       minHeight: "80vh",
//     },
//     [theme.breakpoints.up(1401)]: {
//       // height: "50vh !important",
//       maxHeight: "91vh",
//       minHeight: "91vh",
//     },
//   },
// }));

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
    marginTop: "4.5rem",
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
    marginLeft: "55rem !important",
    width: "220px",
    height: "49px",
    backgroundColor: "#37720B !important",
    color: "#fff !important",
    "& .MuiLink-root": {
      color: "#fff !important",
    },
  },
}));
const ModelsParamsConfig = (props) => {
  const classes = useStyles();
  const [loader, showLoader, hideLoader] = useLoader();
  const [isSuccess, setAlertSuccess] = useState(false);
  const [dataGridRows, setDataGridRows] = useState([]);
  const [paramObj, setParamObj] = useState([]);
  const theme = useTheme();
  const [mode, setMode] = useState("add");
  const [open, setOpen] = React.useState(false);

  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });

  const [obj, setObj] = useState({
    id: null,
    type: null,
    key: null,
    value: null,
    name: null,
    label: null,
    options: null,
  });

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
        let index = dataGridRows.findIndex((rec) => rec.id === params.id);
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
            Label
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "type",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            Type
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "is_active",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            Active
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value.toString()}</Typography>;
      },
    },
    {
      field: "created_on",
      flex: 1,
      type: "date",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary }}>
            Created Date
          </Typography>
        );
      },
      renderCell: (params) => {
        return (
          <Typography>
            {moment(params.value).format("DD-MM-YYYY hh:mm:ss")}
          </Typography>
        );
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
              onClick={() => handleEditClick(params)}
            >
              <EditIcon title="Edit Camera" />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => handleDeleteClick(params)}
            >
              <DeleteIcon title="Delete" />
            </IconButton>
          </Typography>
        );
      },
    },
  ];

  const handleEditClick = (params) => {
    const gridIdx = dataGridRows.findIndex((rec) => rec.id === params.id);
    if (gridIdx !== -1) {
      const editObj = _.merge(obj, dataGridRows[gridIdx]);
      const setEditObj = [
        {
          id: editObj.id,
          type: editObj.type,
          key: editObj.key,
          value: editObj.value,
          name: editObj.name,
          label: editObj.label,
          options: editObj.options,
        },
      ];

      setParamObj(setEditObj);
      setMode("edit");
      setObj(editObj);
    }
    setOpen(true);
  };

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteModelParameters(params.id)
        .then((res) => {
          let content = "Deleted Successfully";
          getModelDefaultParams();
          setAlertSuccess(true);
          return setState({ ...state, alertOpen: true, alertContent: content });
        })
        .catch((err) => console.log("Violation Params delete", err));
    }
  };

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
          {" "}
          Analytics Params{" "}
        </Typography>
        {/* 
        <Divider orientation="vertical" variant="middle" flexItem />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector style={{ marginRight: "15px" }} /> */}
        {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
      </GridToolbarContainer>
    );
  }

  const handleOpenModelParams = () => {
    setMode("add");
    setObj({
      id: null,
      type: null,
      key: null,
      value: null,
      name: null,
      label: null,
      options: null,
    });
    setOpen(true);
  };

  const reloadPageData = () => {
    getModelDefaultParams();
  };

  useEffect(() => {
    getModelDefaultParams();
  }, []);

  const getModelDefaultParams = () => {
    showLoader();
    ModelsService.getModelParameters()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          if (data) {
            // const model_params_data = data.data.sort(
            //   (a, b) => new Date(b.created_on) - new Date(a.created_on)
            // );
            setDataGridRows(data);
          }
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

  const { alertOpen, vertical, horizontal, alertContent } = state;

  return local_anpr_user(
    "activity_info",
    "activity_name",
    "Violation Params Configuration"
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
        variant="contained"
        onClick={() => handleOpenModelParams()}
        sx={{ float: "right !important" }}
        className={classes.modelsBtn}
      >
        Add Analytics Params
      </Button>
      <Grid item xs={12}>
        <ModelParamModel
          setModelStatus={(open) => setOpen(open)}
          open={open}
          mode={mode}
          paramObj={paramObj}
          reloadPageData={() => reloadPageData()}
        />
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
              rows={dataGridRows}
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

export default ModelsParamsConfig;
