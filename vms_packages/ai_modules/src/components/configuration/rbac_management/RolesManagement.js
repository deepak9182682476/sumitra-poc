
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Popover,
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import { Edit as EditIcon } from "@mui/icons-material";
import useLoader from "../../../common/loader/useLoader";

import RolesPopup from "./Roles_popup";
import SettingsIcon from '@mui/icons-material/Settings';
import RbacService from "../../../services/rbac_service";
import ActivityRolePopup from "./activity_role_popup";

const useStyles = makeStyles((theme) => ({
  root: {
    "& ::-webkit-scrollbar": {
            width: "8px",
            height: "100%",
            marginRight: "4px",
            backgroundColor: "#3D81F5",
        },
        "& ::-webkit-scrollbar-thumb": {
            background: "white",
            borderRight: "4px white solid",
            height: "2px",
        },
        "& :: -webkit-scrollbar-track": {
            borderRadius: '5px',
        },
        "& :: -webkit-scrollbar-thumb": {
            borderRadius: '5px'
        },

    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
        }`,
      backgroundColor: `${theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
        }`,
      color: theme.palette.text.primary,
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
      backgroundColor: "#0D0D0D"
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", //camera/camera header+sno.bar font
      backgroundColor: "#0D0D0D",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important",
    },
    "& .MuiDataGrid-columnsContainer": {
      minHeight: "auto !important",
      maxHeight: "auto !important",
    },
    "& .MuiButton-root": {
      color: "#fff !important",
      fontSize: "12px",
      top: "-1.75px"
    },
    '& .MuiDataGrid-footerContainer': {
        height: '40px',
        minHeight: '40px',
    },
    "& .MuiDivider-root": {
      borderColor: "#fff",
      margin: "6px 8px 6px 12px",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh",
      // paddingLeft: "7px",
    },
    [theme.breakpoints.up(1401)]: {
      height: "42vh",
    },
    width: "100vw",
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  card: {
    // backgroundColor: ` ${theme?.palette?.primary?.compHeader}  0% 0% no-repeat padding-box !important`, //cameras/background
    backgroundColor: '#0D0D0D',
    color: "#fff !important",
    border: "1px solid #868686 !important", //cameras/border
    opacity: "1",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0px!important",
  },
  uploadscard: {
    backgroundColor: "#313131 !important",
    color: "#fff !important",
    // border: "1px solid #868686 !important",
    border: "none !important",
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "52vh !important",
      minHeight: "52vh !important",
      overflowY: "scroll",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "58vh !important",
      minHeight: "58vh !important",
      overflowY: "scroll",
    },
  },
  fontsize: {
    fontSize: "0.75rem !important",
  },
  dataRoleGridCls: {
    maxHeight: "120px",
    minHeight: "120px",
    color: "#fff !important", //Cameras/no row
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      // height: "26vh !important",
      maxHeight: "400px",
      minHeight: "75vh",
    },
    [theme.breakpoints.between(1400, 1800)]: {
      // height: "26vh !important",
      maxHeight: "91vh",
      minHeight: "91vh",
    },
    [theme.breakpoints.up(1800)]: {
      // height: "50vh !important",
      maxHeight: "91vh",
      minHeight: "91vh",
    },
  },
  cellsCls: {
    color: "#fff !important", // cameras/rows words
    backgroundColor: "#0D0D0D",
  },
  stepperCls: {
    "& .Mui-active": {
      color: "#a79c53 !important,",
    },
    // color: "inherit !important",
    // "& .MuiStepIcon-root .Mui-active": {
    //   color: "#a79c53 !important",
    // },
  },
  addcameraCls: {
    display: "flex",
    padding: "0px !important",
  },
  tableCls: {
    // padding: "25px 24px 0px !important",
    // height: "300px",
    padding: "4px 4px 0px 12px !important",
    height: "91vh",
  },
  buttoncolor: {
    backgroundColor: "#343434",
    border: "1px solid #8D8D8D",

    color: "#fff !important",
    fontSize: "12px",
    "&:hover": { backgroundColor: "#343434" },
  },

  buttontext: {
    color: "#fff !important",
    fontSize: "12px",
  },

  iconButton: {
    color: theme.palette.primary.main,
  },
}));

const Roles_main = (props) => {
  const [dataGridRows, setDataGridRows] = useState([]);
  const classes = useStyles();
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  // eslint-disable-next-line no-unused-vars
  const [isSuccess, setAlertSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);

  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [mode, setMode] = useState("add");
  const theme = useTheme();

  const [loader, showLoader, hideLoader] = useLoader();

  const [rolesList, setRolesList] = React.useState([]);
  const [paramObj, setParamObj] = useState([]);
  const [flag, setflag] = useState(false)

  const [selectedrecord, setSelectedrecord] = useState(null);
  const [selectedActivityRecord, setSelectedActivityRecord] = useState(null);


  const columns = [
    {
      field: "s.no",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography 
          style={{ 
            color: theme.palette?.text?.primary,
            backgroundColor:"#313131",
            fontsize:"14px" ,
              fontWeight: "regular",
           }}>
            S.No
          </Typography>
        );
      },
      renderCell: (params) => {
        let index = rolesList.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "role_name",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography style={{ 
            color: theme.palette?.text?.primary,
            backgroundColor:"#313131",
            fontsize:"14px" ,
              fontWeight: "regular",
           }}>
            ROLE NAME
          </Typography>
        ); 
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "role_code",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography style={{ 
            color: theme.palette?.text?.primary,
            backgroundColor:"#313131",
            fontsize:"14px" ,
              fontWeight: "regular",
           }}>
            ROLE CODE
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
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography style={{ 
            color: theme.palette?.text?.primary,
            backgroundColor:"#313131",
            fontsize:"14px" ,
              fontWeight: "regular",
           }}>
            STATUS
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
          <Typography style={{ 
            color: theme.palette?.text?.primary,
            backgroundColor:"#313131",
            fontsize:"14px" ,
              fontWeight: "regular",
           }}>
            OPTIONS
          </Typography>
        );
      },
      renderCell: (params) => {
        return (
          <>
            <IconButton
              aria-label="edit"
              title="Edit Camera" 
              onClick={() => handleEditClick(params)}
            >
              <EditIcon />
            </IconButton>

            <IconButton
              aria-label="Manage Activity"
              title="Manage Activity"
              onClick={() => handleActivity(params)}
            >
              <SettingsIcon  />
            </IconButton>
          </>
        );
      },
    },
  ];

  function CustomToolbar() {

    const showRolePopup = () => {
      setOpen(true);
    };

    return (
      <GridToolbarContainer style={{ width: "100%" }}>
        <Typography
          style={{
            color: `${theme.palette?.text?.secondary}`,
            marginLeft: "10px",
            flexGrow: "1",
            fontSize: "14px",
          }}
        >
          {" "}
          Roles List{" "}
        </Typography>
        <Button size="small" variant="contained" onClick={() => showRolePopup()}>
          ADD ROLE
        </Button>
        <Divider orientation="vertical" variant="middle" flexItem />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
        {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
      </GridToolbarContainer>
    );
  }

  useEffect(() => {
    RbacService.getRoles()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          if (data) {
            hideLoader();
            setRolesList(data);
          }
        }
      })
      .catch((err) => console.log("Roles Management", err));
  }, []);

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const getRoles = () => {
    showLoader();
    RbacService.getRoles()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          setRolesList(data);
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

  const handleEditClick = (params) => {
    const gridIdx = rolesList.findIndex((rec) => rec.id === params.row.id);
    console.log(gridIdx);
    if (gridIdx !== -1) {
      const rec = rolesList[gridIdx];
      setOpen(true);
      setSelectedrecord(rec);
      setParamObj('edit');
      setMode("update");
    }
  };

  const handleActivity = (params) => {
    const gridIdx = rolesList.findIndex((rec) => rec.id === params.row.id);
    console.log(gridIdx);
    if (gridIdx !== -1) {
      const rec = rolesList[gridIdx];
      setActivityOpen(true);
      setSelectedActivityRecord(rec);
      setParamObj('activity');
      setMode("update");
    }
  };

  function setDataGridData(currentPage, size) {
    showLoader();
    const pageNum = currentPage || 1;
    const pageLimit = size || 10;

    // const payload = {
    //   page: pageNum,
    //   perpage: pageLimit
    // };
    // ModelsService.getHotlistcategoryPopupGroup(payload)
    // .then((response) => {
    //   if (response) {
    //     hideLoader();
    //     const { data } = response?.data;
    //     setState1(data);
    //     let eventInfo = data.data;
    //     eventInfo.forEach((rec, index) => (rec.id = index + 1));

    //     if (eventInfo && eventInfo.length) {
    //       let data = eventInfo;
    //       setState1(data, pageLimit, pageNum);
    //       setDataGridRows(data);
    //     }

    //     // const rows = data.map((rec) => createData(rec.key, rec.models));
    //     // setGroupsList(rows);
    //   }
    // })
    // .catch((err) => {
    //   if (err.response) {
    //     console.log("error response", err);
    //   } else if (err.request) {
    //     console.log("error request", err);
    //   } else {
    //     console.log("error", err);
    //   }
    // });
  };

  return (
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <RolesPopup
        setModalStatus={(open) => setOpen(open)}
        open={open} 
        selectedrecord={selectedrecord}
        resetSelectedRecord={() => setSelectedrecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            getRoles();
            setSelectedrecord(null);
          }
        }}
      />

      <ActivityRolePopup
        setModalStatus={(val) => setActivityOpen(val)} 
        open={activityOpen} 
        selectedrecord={selectedActivityRecord}
        resetSelectedRecord={() => setSelectedActivityRecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            getRoles();
            setSelectedActivityRecord(null);
          }
        }}
      />
      
      <Grid item xs={12} className={classes.tableCls}>
        {loader}
        <Card className={classes.card}>
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
            <div style={{ width: "100%" }}>
              <DataGrid
                columns={columns}
                className={classes.dataRoleGridCls}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  // setDataGridData(currentPgIdx, newPageSize);
                }}
                rows={rolesList}
                rowsPerPageOptions={[20,50]}
                rowHeight={35}
                headerHeight={40}
                components={{
                  Toolbar: CustomToolbar,
                }}
                getCellClassName={(params) => classes.cellsCls}
                onPageChange={(currentPageIdx) => {
                  setCurrentPgIdx(currentPageIdx);
                  // setDataGridData(currentPageIdx, pageSize);
                  // setDataForImages(dataGridRows, pageSize, currentPageIdx);
                }}
                pagination
              />
            </div>
          </CardContent>
        </Card>
      </Grid>
      {/* </Grid> */}
    </Grid>
  );
};

export default Roles_main;
