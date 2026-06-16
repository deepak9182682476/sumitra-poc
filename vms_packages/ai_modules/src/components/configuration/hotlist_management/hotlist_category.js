
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
  Popover,
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

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useLoader from "../../../common/loader/useLoader";
// import Hotlist from "./hotlist";
import CategoryPopup from "./categorypopup";
import ModelsService from "../../../services/models";
import Pagination from "@mui/material/Pagination";
import Hotlist from "./hotlist";
import Hotlist_main from "./Hotlist_main";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { Check as CheckIcon, Receipt } from "@mui/icons-material";
import { user_role_access } from "../../../config/config";
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDataGrid-columnHeaderWrapper": {
      borderRight: `1px solid ${
        theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
      }`,
      backgroundColor: `${
        theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
      }`,
      color: theme.palette.text.primary,
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "4px !important",
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "14px", //camera/camera header+sno.bar font
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
      height: "45vh",
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
    backgroundColor:'#0D0D0D',
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
  dataHcatGridCls: {
    maxHeight: "100px",
    minHeight: "100px",
    color: "#fff !important", //Cameras/no row
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      // height: "26vh !important",
      maxHeight: "41vh",
      minHeight: "41vh",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "47vh",
      minHeight: "47vh",
    },
  },
  cellsCls: {
    color: "#fff !important", // cameras/rows words
    // backgroundColor: "#0D0D0D",
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
    padding: "6px 4px 0px 10px !important",
    height: "300px",
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
}));

const Hotlist_category = (props) => {
  const [dataGridRows, setDataGridRows] = useState([]);
  const classes = useStyles();
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  const label = { inputProps: { 'aria-label': 'Switch demo' } };
  // eslint-disable-next-line no-unused-vars
  const [isSuccess, setAlertSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);

  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [mode, setMode] = useState("add");
  const theme = useTheme();

  const [loader, showLoader, hideLoader] = useLoader();

  const [categoryList, setCategoryList] = React.useState([]);
  const [paramObj, setParamObj] = useState([]);
  const [flag, setflag] = useState(false);
  const [categoryEnable, setCategoryEnable] = useState(1);

  const [selectedrecord, setSelectedrecord] = useState(null);

  const columns = [
    {
      field: "s.no",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular"
            }}
          >
            S.No
          </Typography>
        ); //CAMERAS/s.no.
      },
      renderCell: (params) => {
        let index = categoryList.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "name",
      flex: 1,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular"
            }}
          >
            Name
          </Typography>
        ); //CAMERAS/Date & Time
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
          <Typography
            style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular"
            }}
          >
            Description
          </Typography>
        ); //CAMERAS/Camera Name
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
          <Typography
           style={{
              color: theme.palette?.text?.primary,
              backgroundColor: "#313131",
              fontSize:"14px" ,
              fontWeight: "regular"
            }}
          >
            Actions
          </Typography>
        );
      },
      renderCell: (params) => {
        return( <Typography>{params.row.is_active}</Typography>,
        <>
            {user_role_access('role_info', 'role_name') ? (            
              <>
                              <IconButton
              aria-label="edit"
              onClick={() => handleEditClick(params)}
            >
              <EditIcon title="Edit Camera" />
            </IconButton>
                <Stack direction="row" spacing={1} alignItems="center">
                  
                  <Switch
                    {...label}
                    defaultChecked ={(params.row.is_active) == 1}
                    onChange={(event) => {
                      const isChecked = event.target.checked ? 1 : 0;
                      setCategoryEnable(isChecked);
                      params.row.is_active = isChecked;
                      ModelsService.updateHotlistcategoryPopupGroup(params.row)
                      //.then(() => props.getSelectedItem(null));
                    }}
                  />
                  
                </Stack>

              </>
            ) : '-'}
          </>
        );
      
        
        
        // return (
        //   <>
        //   {user_role_access('role_info', 'role_name') ? (
        //    <>
        //    <Stack direction="row" spacing={1} alignItems="center">
        //    <Typography>Off</Typography>
        //     <Switch {...label} defaultChecked />
        //     <Typography>On</Typography>
        //     </Stack>
        //
        //     <PopupState variant="popover" popupId="demo-popover">
        //       {(popupState) => (
        //         <div>
        //           <IconButton aria-label="delete" {...bindTrigger(popupState)}>
        //             <DeleteIcon title="Delete" />
        //           </IconButton>
        //           <Popover
        //             {...bindPopover(popupState)}
        //             anchorOrigin={{
        //               vertical: "top",
        //               horizontal: "center",
        //             }}
        //             transformOrigin={{
        //               vertical: "top",
        //               horizontal: "center",
        //             }}
        //           >
        //             <Typography component="div" sx={{ p: 2 }}>
        //               Are you sure you want to disable this item?
        //             </Typography>
        //             <Button
        //               sx={{ ml: 2, mb: 1 }}
        //               variant="outlined"
        //               size="small"
        //               onClick={() => popupState.close()}
        //               className={classes.buttoncolor}
        //             >
        //               Cancel
        //             </Button>
        //             <Button
        //               sx={{ ml: 2, mb: 1 }}
        //               variant="contained"
        //               size="small"
        //               onClick={() => handleDeleteClick(params)}
        //               className={classes.buttontext}
        //             >
        //               Delete
        //             </Button>
        //           </Popover>
        //         </div>
        //       )}
        //     </PopupState>
        //      </>
        //     ) : '-'}
        //   </>
        // );
      },
    },
  ];

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const gethotlistcategoryPopupGroup = () => {
    showLoader();
    ModelsService.getHotlistcategoryPopupGroup()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          console.log("awesome===>>22", data);
          setCategoryList(data);
          if (data.length) {
            props.setHotListCategoryList(data);
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

  const handleEditClick = (params) => {
    //  console.log(params);
    const gridIdx = categoryList.findIndex((rec) => rec.id === params.row.id);
    console.log(gridIdx);
    if (gridIdx !== -1) {
      // console.log(editObj);
      const rec = categoryList[gridIdx];

      setOpen(true);
      setSelectedrecord(rec);

      setParamObj("edit");
      setMode("update");
      //  setObj(editObj);
    }
  };

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteHotlist_categoryParameters(params.id)
        .then((response) => {
          setCategoryList(categoryList.filter((item) => item.id !== params.id));
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

  useEffect(() => {
    gethotlistcategoryPopupGroup();
    setflag(false);
  }, [flag]);

  // function setDataGridData(currentPage, size) {
  //   showLoader();
  //   const pageNum = currentPage || 1;
  //   const pageLimit = size || 10;
  // }

  function CustomToolbar() {
    const showCategoryPopup = () => {
      setOpen(true);
    };

    console.log("categorylist", categoryList);

    return (
      <GridToolbarContainer style={{ width: "100%" }}>
        <Typography
          style={{
            color: `${theme.palette?.text?.secondary}`,
            marginLeft: "10px",
            flexGrow: "1",
            fontSize: "18px !important",
          }}
        >
          {" "}
          New Category{" "}
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={() => showCategoryPopup()}
        >
          Add Category
        </Button>
        <Divider orientation="vertical" variant="middle" flexItem />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
        {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
      </GridToolbarContainer>
    );
  }

  return (
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <CategoryPopup
        // setData={(data) => setData(data)}
        setModalStatus={(open) => setOpen(open)} //same
        open={open} //same
        selectedrecord={selectedrecord}
        resetSelectedRecord={() => setSelectedrecord(null)}
        refreshContent={(isContentRefresh) => {
          if (isContentRefresh) {
            gethotlistcategoryPopupGroup();
            setSelectedrecord(null);
          }
        }}
        setflag={setflag}
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
            <DataGrid
              columns={columns}
              className={classes.dataHcatGridCls}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                // setDataGridData(currentPgIdx, newPageSize);
              }}
              rows={categoryList}
              onRowClick={(selectedItem) => {
                props.getSelectedItem(selectedItem.row);
              }}
              rowsPerPageOptions={[10, 20]}
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
            />
          </CardContent>
        </Card>
      </Grid>
      {/* </Grid> */}
    </Grid>
  );
};

export default Hotlist_category;
