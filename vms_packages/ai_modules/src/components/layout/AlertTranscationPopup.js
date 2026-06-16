import React, { useState, Fragment, useEffect } from "react";
import {
  Box,
  Modal,
  Button,
  Typography,
  Card,
  CardMedia,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import { DataGrid } from "@mui/x-data-grid";
import AppBar from "@mui/material/AppBar";
import AlertsService from "../../services/alerts";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiButton-root": {
      color: "#fff !important",
    },
    [theme.breakpoints.between(350, 1400)]: {
      height: "42vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "42vh",
    },
    width: "100vw",
  },
  mainContent: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: 450,
    backgroundColor: `${theme.palette?.primary?.appBarBg} !important`,

    "&:hover,&:focus": {
      // cursor: "help",
      backgroundColor: "none",
      borderColor: "none",
    },
  },
  subHeader: {
    // width:"100%",
    display: "flex",
    flexFlow: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2px 2px",
    height: "40px",
  },
  imageContent: {
    display: "flex",
    flexFlow: "row",
    justifyContent: "space-between",
    // alignItems: "center",
  },
  leftImageContent: {
    width: "60%",
    height: "200px",
  },
  rightImageContent: {
    width: "40%",
    padding: "0px 5px",
  },
  dataGridContent: {
    width: "100%",
    backgroundColor: "red",
  },
  cellsCls: {
    color: `${theme.palette?.text?.primary} !important`,
    backgroundColor: "#0D0D0D",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  dataGrid: {
    maxHeight: "400 !important",
    height: "200 !important",
  },
}));

const columns1 = [
  {
    field: "s_no",
    headerName: "S. No",
    width: 60,
    sortable: false,
    renderCell: (index) => {
      let ridx = index.api.getRowIndex(index.row.license_number)
      return <Typography>{ridx + 1}</Typography>;
    },
  },
  {
    field: "license_number",
    headerName: "Licence Number",
    type: "number",
    width: 140,
    sortable: false,
    wrapText: true,
    autoHeight: true,
    resizable: true,
  },
  {
    field: "category",
    headerName: "Category",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 100,
  },
  {
    field: "date",
    headerName: "Date",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 120,
  },
  {
    field: "time",
    headerName: "Time",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 120,
  },
  {
    field: "commisionerate",
    headerName: "Commissionerate",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 150,
  },
  {
    field: "ps_name",
    headerName: "Police Station",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 140,
  },
  {
    field: "alert_type",
    headerName: "Alert Type",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 100,
  },
  {
    field: "junction_name",
    headerName: "Junction",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 100,
  },
];

function AlertTranscationPopup(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [redirectFlag, setRedirect] = useState(false);
  const [cropImg, setCropImg] = useState(null);
  const [fullImg, setFullImg] = useState(null);


  // const handleOpen = () => {
  //   setOpen(true);
  // };
  const [rows, setRows] = useState([]);
  const handleClose = () => {
    setOpen(false);
    if (typeof props.closeAlert === 'function') {
      props.closeAlert(false);
    }
  };

  const handleNavigate = () => {
    setRedirect(true);
  }

  useEffect(() => {
    const { alertList } = props;
    if (alertList && alertList.length) {
      setFullImage(alertList)
      setDataForCropImages(alertList)
      // setRows(alertList);
    }
  }, [props.alertList]);

  useEffect(() => {
    if (redirectFlag) {
      setRedirect(false);
    }
  }, [])

  async function setFullImage(record) {
    if (record) {
      await AlertsService.getImageOfAlert(record[0].full_image_filename, record[0].date, record[0].model_name).then((res) => {
        const { data } = res;
        if (data && data.image_base64) {
          record = `data:image/jpeg;base64,${data.image_base64}`;
          setFullImg(record);
        }
      });
    }
  }

  async function setDataForCropImages(dataRows) {
    try {
      if (dataRows.length) {
          await AlertsService.getImageOfAlert(dataRows[0].cropped_image_filename, dataRows[0].date, dataRows[0].model_name).then((res) => {
            const { data } = res;
            if (data && data.image_base64) {
              const clone_rec = `data:image/jpeg;base64,${data.image_base64}`;
              setCropImg(clone_rec);
            }
        })
        setRows(dataRows);
      }
    } catch (e) {
      console.log(e);
    }
  }

  // function setDataForImages(dataRows, pgSize, pgIdx) {
  //   // const perOptionsDiff = pgIdx > 0 ? pgSize : pgIdx;
  //   // const dataRows = data.slice(perOptionsDiff, pgSize + perOptionsDiff);
  //   const arr = [];

  //   if (dataRows.length) {
  //     for (const [i, v] of dataRows.entries()) {
  //       //Handled last iteration
  //       // if (i === dataRows.length - 1) {
  //       //   continue;
  //       // }
  //       console.log('v----', v);
  //       AlertsService.getImageOfAlert(v.image, v.date, v.model).then((res) => {
  //         const { data } = res;
  //         if (data && data.image_base64) {
  //           const clone_rec = Object.assign({}, v);
  //           clone_rec.image = `data:image/jpeg;base64,${data.image_base64}`;
  //           arr.push(clone_rec);
  //           if (arr.length === dataRows.length - 1) {
  //             setImage(arr);
  //           }
  //         }
  //       });
  //     }
  //   }
  // }

  const style = {
    width: "100%",
    backgroundColor: `${theme.palette.mode === "light" ? "background.paper" : "#313131"
      }`,
    boxShadow: "#00000029",
    color: "#FFF",
    padding: "2px 5px",
  };
  return (
    <Fragment>
      <Modal
        style={{ borderColor: "none" }}
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Card className={classes.mainContent}>
          <AppBar position="static" sx={{ ...style }}>
            <Box className={classes.subHeader}>
              <Button variant="contained">VIEW ALERTS</Button>
              <Box>
                <Button variant="contained" onClick={() => handleNavigate()}>
                  Navigate
                </Button>
                <Button variant="contained" sx={{marginLeft: '3px'}} onClick={() => handleClose()}>
                  DISMISS
                </Button>
              </Box>
            </Box>
          </AppBar>
          {redirectFlag ?  <Redirect to="/360Alerts" /> : null}
          <Box sx={{ padding: "2px 5px" }}>
            <Box sx={{ padding: "5px 0px" }}>
              <Typography>Alert Transcations</Typography>
            </Box>
            <Box className={classes.imageContent}>
              <Box className={classes.leftImageContent}>
                <CardMedia
                  sx={{ height: '100%', width: "100%" }}
                  image={fullImg}
                  title="green iguana"
                />
              </Box>
              <Box className={classes.rightImageContent}>
                <CardMedia
                  sx={{ height: "58%", width: "94%", backgroundSize: 'contain' }}
                  image={cropImg}
                  title="green iguana"
                />
                <Typography> Number plate</Typography>
              </Box>
            </Box>

            <Box sx={{ height: 200, width: "100%", position: "absolute" }}>
              <DataGrid
                rows={rows}
                columns={columns1}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowHeight={() => "auto"}
                getRowId={(row) => row.license_number}
                getEstimatedRowHeight={() => 200}
                disableSelectionOnClick
                disableColumnMenu
                experimentalFeatures={{ newEditingApi: true }}
                hideFooter
                sx={{
                  "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
                    py: "8px",
                  },
                  "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
                    py: "15px",
                  },
                  "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
                    py: "22px",
                  },
                }}
              />
            </Box>
          </Box>
        </Card>
      </Modal>
    </Fragment>
  );
}

export default AlertTranscationPopup;