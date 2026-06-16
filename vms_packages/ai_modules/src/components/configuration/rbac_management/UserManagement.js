
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
  Snackbar,
  IconButton,
  Divider
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

import UserPopup from "./User_popup";
import AdminPopup from "./admin_popup";
import ModelsService from "../../../services/models";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AccountTreeSharpIcon from '@mui/icons-material/AccountTreeSharp';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockPopup from "./lock_popup";
import RbacService from "../../../services/rbac_service";

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
      // backgroundColor: `${theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
      //   }`,
      backgroundColor: "#285705",
      color: theme.palette.text.primary,
    },
    "& .MuiSvgIcon-root": {
      fontSize: '1rem !important',
      padding: '0px !important'
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
      backgroundColor: "#0D0D0D",
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px",
      backgroundColor: "#0D0D0D",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important",
    },
    "& .MuiDataGrid-columnsContainer": {
      minHeight: "auto !important",
      maxHeight: "auto !important",
    },
    '& .MuiDataGrid-footerContainer': {
        height: '40px',
        minHeight: '40px',
    },
    "& .MuiButton-root": {
      color: "#fff !important",
      fontSize: "12px",
      top: "-1.75px",
    },
    "& .MuiDivider-root": {
      borderColor: "#fff",
      margin: "6px 8px 6px 12px",
    },
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh",
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
    backgroundColor: '#0D0D0D',
    color: "#fff !important",
    border: "1px solid #868686 !important",
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
  dataUserGridCls: {
    maxHeight: "120px",
    minHeight: "120px",
    color: "#fff !important",
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "400px",
      minHeight: "75vh",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "91vh",
      minHeight: "91vh",
    },
  },
  cellsCls: {
    color: "#fff !important",
    backgroundColor: "#0D0D0D",
  },
  stepperCls: {
    "& .Mui-active": {
      color: "#a79c53 !important,",
    },
  },
  addcameraCls: {
    display: "flex",
    padding: "0px !important",
  },
  tableCls: {
    padding: "4px 4px 0px 12px !important",
    height: "91vh",
    // padding: "25px 24px 0px !important",
    // height: "300px",
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

  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const UserManagement = (props) => {
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
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [lockUpOpen, setLockUpOpen] = React.useState(false);


  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [mode, setMode] = useState("add");
  const theme = useTheme();

  const [loader, showLoader, hideLoader] = useLoader();

  const [usersList, setUsersList] = React.useState([]);
  const [paramObj, setParamObj] = useState([]);

  const [selectedrecord, setSelectedrecord] = useState(null);
  const [adminSelectedrecord, setAdminSelectedrecord] = useState(null);


  const columns = [
    {
      field: "s.no",
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            S.No
          </Typography>
        );
      },
      renderCell: (params) => {
        let index = usersList.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "user_name",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            USERNAME
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "first_name",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            FIRST NAME
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "last_name",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            LAST NAME
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "dob",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            D.O.B
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "gender",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            GENDER
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "address",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            ADDRESS
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "doj",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            D.O.J
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "phone_number",
      flex: 1,
      type: "string",
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            PHONE NUMBER
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
      width: 50,
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontsize:"14px" ,
              fontWeight: "regular"
            }}
          >
            ACTIONS
          </Typography>
        );
      },
      renderCell: (params) => {
        return (
          <>
            <IconButton
              aria-label="edit"
              onClick={() => handleEditClick(params)}
              size="small"
              title="Edit User"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              className={classes.iconButton}
              aria-label="manage Roles"
              onClick={() => handleAdminPopup(params)}
              size="small"
              title="Manage Roles"
            >
              <PeopleAltRoundedIcon />
            </IconButton>

            <IconButton
              className={classes.iconButton}
              aria-label="manage organization"
              // onClick={() => handleAdminPopup(params)}
              size="small"
              title="Manage Organization"
            >
              <AccountTreeSharpIcon />
            </IconButton>

            <IconButton
              className={classes.iconButton}
              aria-label="Change Password"
              onClick={() => handleLockPopup(params)}
              size="small"
              title="Change Password"
            >
              <LockRoundedIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  function CustomToolbar() {
    const showUserPopup = () => {
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
          User Management{" "}
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={() => showUserPopup()}
        >
          Add User
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
    RbacService.getUsers()
      .then((response) => {
        if (response) {
          const { data } = response?.data;
          if (data) {
            hideLoader();
            setUsersList(data);
          }
        }
      })
      .catch((err) => console.log("User Management", err));
  }, []);

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const getUsers = () => {
    showLoader();
    RbacService.getUsers()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          setUsersList(data);
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
    const gridIdx = usersList.findIndex((rec) => rec.id === params.row.id);
    if (gridIdx !== -1) {
      const rec = usersList[gridIdx];
      setOpen(true);
      setSelectedrecord(rec);

      setParamObj("edit");
      setMode("update");
    }
  };

  const handleAdminPopup = (params) => {
    const gridIdx = usersList.findIndex((rec) => rec.id === params.row.id);
    if (gridIdx !== -1) {
      const rec = usersList[gridIdx];
      setAdminOpen(true);
      setAdminSelectedrecord(rec);

      setParamObj("manageRoles");
      setMode("update");
    }
  };

  const handleLockPopup = (params) => {
    const gridIdx = usersList.findIndex((rec) => rec.id === params.row.id);
    if (gridIdx !== -1) {
      const rec = usersList[gridIdx];
      setLockUpOpen(true);
      setSelectedrecord(rec);

      setParamObj("pwd");
      setMode("update");
    }
  };

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteViolation_managementParameters(params.id)
        .then((response) => {
          // setViolationList(
          //   violationList.filter((item) => item.id !== params.id)
          // );

          setAlertSuccess(true);
          setState({
            ...state,
            alertOpen: true,
            alertContent: "Deleted Successfully",
          });
        })
        .catch((err) => console.log("Hotlist delete", err));
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
    //   } els e if (err.request) {
    //     console.log("error request", err);
    //   } else {
    //     console.log("error", err);
    //   }
    // });
  }

  // CameraService.getCamerasList()
  //   .then((response) => {
  //     if (response) {
  //       hideLoader();
  //       const { data } = response;
  //       if(data && data.data){
  //         let cameras_data = data.data.map((elem, index) => {
  //           return {
  //             ...elem.camera_information,
  //             model_settings: elem.model_settings,
  //             rule_settings: elem.rule_settings,
  //           };
  //         });
  //         cameras_data = cameras_data.sort(
  //           (a, b) => new Date(b.created_on) - new Date(a.created_on)
  //         );
  //         setDataGridRows(cameras_data);
  //       }
  //     }
  //   })
  //   .catch((err) => console.log("getCameras", err));

  return (
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <UserPopup
        setModalStatus={(open) => setOpen(open)}
        open={open}
        selectedrecord={selectedrecord}
        resetSelectedRecord={() => setSelectedrecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            getUsers();
            setSelectedrecord(null);
          }
        }}
      />
      <AdminPopup
        setModalStatus={(val) => setAdminOpen(val)}
        open={adminOpen}
        selectedrecord={adminSelectedrecord}
        resetSelectedRecord={() => setAdminSelectedrecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            getUsers();
            setAdminSelectedrecord(null);
          }
        }}
      />

      <LockPopup
        setModalStatus={(val) => setLockUpOpen(val)}
        open={lockUpOpen}
        selectedrecord={selectedrecord}
        resetSelectedRecord={() => setSelectedrecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            getUsers();
            setSelectedrecord(null);
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
                className={classes.dataUserGridCls}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  // setDataGridData(currentPgIdx, newPageSize);
                }}
                rows={usersList}
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

export default UserManagement;
