
/* eslint-disable react/jsx-pascal-case */
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
  Divider,
  Popover,
  MenuItem,
  Menu,
} from "@mui/material";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useLoader from "../../../common/loader/useLoader";
import Hotlist from "./hotlist";
import ModelsService from "../../../services/models";
import Hotlist_category from "./hotlist_category";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import NoAccess from "../../../common/NoAccess";
import { local_anpr_user, user_role_access } from "../../../config/config";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from "moment";

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
      // backgroundColor:"#0D0D0D"
    },
    '& .MuiDataGrid-footerContainer': {
        height: '40px',
        minHeight: '40px',
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px",
      // backgroundColor: "#0D0D0D",
      padding: "5px",
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
      fontSize: "11px",
      top: "-4px",
    },
    "& .MuiDivider-root": {
      borderColor: "#fff",
      margin: "6px 8px 6px 12px",
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
    // backgroundColor: ` ${theme?.palette?.primary?.compHeader}  0% 0% no-repeat padding-box !important`,
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
  dataHmainGridCls: {
    maxHeight: "120px",
    minHeight: "120px",
    color: "#fff !important",
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "41vh",
      minHeight: "41vh",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "47.5vh",
      minHeight: "47.5vh",
    },


  },
  cellsCls: {
    color: "#fff !important",
    // backgroundColor: "#0D0D0D",
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
    // padding: "25px 24px 0px !important",
    padding: "6px 4px 0px 10px !important",
    margin: "25px 0px 0px 0px !important",
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
}));

const Hotlist_main = (props) => {
  const classes = useStyles();
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  const [open, setOpen] = React.useState(false);
  const [pageSize, setPageSize] = useState(10);

  const [selectedItem, setSelectedIem] = useState([]);

  const theme = useTheme();

  const [loader, showLoader, hideLoader] = useLoader();

  const [state1, setState1] = React.useState([]);

  const [selectedrecord, setSelectedrecord] = useState(null);
  const [filteredList, setFilteredList] = useState([]);
  const [hotListCategoryList, setHotListCategoryList] = useState([]);
  const [flag, setflag] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // console.log("filteredListfilteredList", filteredList);
  useEffect(() => {
    var filterArr = [];
    if (selectedItem.name) {
      for (let item = 0; item <= state1.length; item++) {
        const element = state1[item];
        if (element?.category !== undefined) {
          if (
            element.category.toLowerCase().trim() ===
            selectedItem.name.toLowerCase().trim()
          ) {
            filterArr.push(element);
          }
        }
      }
      if (state1.length && filterArr.length === 0) {
        setFilteredList([]);
      } else {
        setFilteredList(filterArr);
      }
    } else {
      setFilteredList(state1);
    }
  }, [selectedItem, state1]);

  const getSelectedItem = (selectedItem) => {
    setSelectedIem(selectedItem);
  };

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
        );
      },
      renderCell: (params) => {
        let index = state1.findIndex((rec) => rec.id === params.id);
        return <Typography>{index + 1}</Typography>;
      },
    },
    {
      field: "registration_number",
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
            Registration Number
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography
          sx={{
            backgroundColor: "transparent"
          }}
        >{params.value}</Typography>;
      },
    },
    {
      field: "make",
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
            Make
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "model",
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
            Model
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "color",
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
            Color
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    {
      field: "category",
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
            Category
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    {
      field: "user",
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
            User
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
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    {
      field: "crime_number",
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
            Crime Number
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    {
      field: "source",
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
            Source
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    {
      field: "police_station",
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
            Police_Station
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },

    {
      field: "commissionerate",
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
            Commissionerate
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
        return (
          <>
            {/*<IconButton
              aria-label="edit"
              onClick={() => handleEditClick(params)}
            >
              <EditIcon title="Edit Camera" />
            </IconButton>
            <PopupState variant="popover" popupId="demo-popover">
              {(popupState) => (
                <div>
                  <IconButton aria-label="delete" {...bindTrigger(popupState)}>
                    <DeleteIcon title="Delete" />
                  </IconButton>
                  <Popover
                    {...bindPopover(popupState)}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                  >
                    <Typography component="div" sx={{ p: 2 }}>
                      Are you sure you want to delete this item?
                    </Typography>
                    <Button
                      sx={{
                        ml: 2,
                        mb: 1,
                        color: "#343434",
                        border: "1px solid #8D8D8D",
                      }}
                      variant="outlined"
                      size="small"
                      onClick={() => popupState.close()}
                      className={classes.buttoncolor}
                    >
                      Cancel
                    </Button>
                    <Button
                      sx={{ ml: 2, mb: 1 }}
                      variant="contained"
                      size="small"
                      onClick={() => handleDeleteClick(params)}
                      className={classes.buttontext}
                    >
                      Delete
                    </Button>
                  </Popover>
                </div>
              )}
            </PopupState> */}
            {user_role_access('role_info', 'role_name','admin') ? (
              <>
                <PopupState variant="popover" popupId="demo-popover">
                  {(popupState) => (
                    <div>
                      <IconButton aria-label="delete" {...bindTrigger(popupState)}>
                        <DeleteIcon title="Delete" />
                      </IconButton>
                      <Popover
                        {...bindPopover(popupState)}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                      >
                        <Typography component="div" sx={{ p: 2 }}>
                          Are you sure you want to delete this item?
                        </Typography>
                        <Button
                          sx={{
                            ml: 2,
                            mb: 1,
                            color: "#343434",
                            border: "1px solid #8D8D8D",
                          }}
                          variant="outlined"
                          size="small"
                          onClick={() => popupState.close()}
                          className={classes.buttoncolor}
                        >
                          Cancel
                        </Button>
                        <Button
                          sx={{ ml: 2, mb: 1 }}
                          variant="contained"
                          size="small"
                          onClick={() => handleDeleteClick(params)}
                          className={classes.buttontext}
                        >
                          Delete
                        </Button>
                      </Popover>
                    </div>
                  )}
                </PopupState>
              </>
            ) : ''}
           <IconButton
                  aria-label="edit"
                  onClick={() => handleEditClick(params)}
                >
                  <EditIcon title="Edit Camera" />
                </IconButton>
          </>
        );
      },
    },
  ];

  function CustomToolbar() {
    const showHotlist = () => {
      setOpen(true);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const headers = ['S.No', 'Registration Number', 'Make', 'Model', 'Color', 'Category', 'User', 'Description', 'Crime Number', 'Source', 'Police Station', 'Commissionerate'];
    const row_header = ['id', 'registration_number', 'make', 'model', 'color', 'category', 'user', 'description', 'crime_number', 'source', 'police_station', 'commissionerate']

    const exportToXLS = () => {

      const formattedData = [];
      for (const [index, item] of filteredList.entries()) {
        let obj = {};
        obj = {
          'S.No': (index + 1).toString(),
          'Registration Number': item.registration_number?.toString(),
          'Make': item.make?.toString(),
          'Model': item.model?.toString(),
          'Color': item.color?.toString(),
          'Category': item.category?.toString(),
          'User': item.user?.toString(),
          'Description': item.description?.toString(),
          'Crime Number': item.crime_number?.toString(),
          'Source': item.source?.toString(),
          'Police Station': item.police_station?.toString(),
          'Commissionerate': item.commissionerate?.toString()
        };
        formattedData.push(obj);
      }

      const worksheet = XLSX.utils.json_to_sheet(formattedData);


      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'Hotlist.xlsx');
    };

    const exportToCSV = () => {
      const csvRows = [];
      csvRows.push(headers.join(','));
      for (const [index, row] of filteredList.entries()) {
        const values = row_header.map(header => {
          const value = header === 'id' ? (index + 1).toString() : row[header];
          const escapedValue = ('' + value).replace(/"/g, '\\"');
          return `"${escapedValue}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvData = csvRows.join('\n');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Hotlist.csv';
      link.click();
    };

    const exportDataToPdf = () => {
      const pdf = new jsPDF({ orientation: 'landscape' });

      // Set document properties
      pdf.setProperties({
        title: "Hotlist"
      })


      pdf.setFontSize(10);
      pdf.setFont('custom', 'bold');
      pdf.text('Hotlist', 15, 15);

      // Line width in units (you can adjust this)
      pdf.setLineWidth(0.5);

      // Generate AutoTable for item details
      const itemDetailsRows = filteredList?.map((item, index) => [
        (index + 1).toString(),
        item.registration_number?.toString(),
        item.make?.toString(),
        item.model?.toString(),
        item.color?.toString(),
        item.category?.toString(),
        item.user?.toString(),
        item.description?.toString(),
        item.crime_number?.toString(),
        item.source?.toString(),
        item.police_station?.toString(),
        item.commissionerate?.toString()
      ]);
      const itemDetailsHeaders = ['S.No', 'Registration Number', 'Make', 'Model', 'Color', 'Category', 'User', 'Description', 'Crime Number', 'Source', 'Police Station', 'Commissionerate'];
      const columnWidths = [15, 30, 30, 30, 30, 40, 30, 50, 40, 40, 35, 30]; // Adjust column widths as needed
      // Define table styles
      const headerStyles = {
        fillColor: [240, 240, 240],
        textColor: [0],
        fontFamily: 'Newsreader',
        fontStyle: 'bold',
      };

      pdf.setFont('Newsreader');
      const itemDetailsYStart = 18;


      pdf.autoTable({
        head: [itemDetailsHeaders],
        body: itemDetailsRows,
        startY: itemDetailsYStart, // Adjust the Y position as needed
        headStyles: {
          fillColor: headerStyles.fillColor,
          textColor: headerStyles.textColor,
          fontStyle: headerStyles.fontStyle,
          fontSize: 10, // Adjust the font size as needed
          font: 'Newsreader', // Set the font family
          halign: 'left',
        },
        styles: { overflow: 'linebreak', cellWidth: 'wrap', cellPadding: 1, fontSize: 6 },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Adjust column widths as needed
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 'auto' },
          6: { cellWidth: 'auto' },
          7: { cellWidth: 'auto' },
          8: { cellWidth: 'auto' },
          9: { cellWidth: 'auto' },
          10: { cellWidth: 'auto' },
          11: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        bodyStyles: {
          fontSize: 10, // Adjust the font size for the body
          font: 'Newsreader', // Set the font family for the body
          cellPadding: { top: 1, right: 1, bottom: 1, left: 1 }, // Adjust cell padding
          textColor: [0, 0, 0], // Set text color for the body
          rowPageBreak: 'avoid', // Avoid row page breaks
        },
        margin: { top: 10, left: 3 },
      });

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.line(10, 283, 200, 283)
        pdf.setPage(i);
        pdf.setFont('Newsreader');
        pdf.text(
          `Page ${i} of ${totalPages}`,
          185,
          pdf.internal.pageSize.getHeight() - 5
        );
      }

      // Save the PDF 
      pdf.save(`Hotlist.pdf`);
      return;
    };

    return (
      <>
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
            Hotlist{" "}
          </Typography>
          <Button size="small" variant="contained" onClick={() => showHotlist()}>
            Add Hotlist
          </Button>
          <Divider orientation="vertical" variant="middle" flexItem />
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <>
            <Button
              id="export-button"
              aria-controls={open ? 'export-hotlist-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              Export
            </Button>

          </>
          {/* <GridToolbarExport printOptions={{ disableToolbarButton: true }} style={{ marginRight: "15px" }} /> */}
        </GridToolbarContainer>
        <Menu
          id="exporthotlist-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'export-button',
          }}
        >
          <MenuItem onClick={() => exportDataToPdf()}>Download PDF</MenuItem>
          <MenuItem onClick={() => exportToCSV()}>Download CSV</MenuItem>
          <MenuItem onClick={() => exportToXLS()}>Download XLS</MenuItem>
        </Menu>
      </>
    );
  }

  const { alertOpen, vertical, horizontal, alertContent } = state;

  const gethotlistGroup = () => {
    showLoader();
    ModelsService.gethotlistGroup()
      .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          setState1(data);
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
    const gridIdx = state1.findIndex((rec) => rec.id === params.row.id);
    if (gridIdx !== -1) {
      const rec = state1[gridIdx];
      setOpen(true);
      setSelectedrecord(rec);
    }

  };

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteHotlistParameters(params.id)
        .then((response) => {
          setState1(state1.filter((item) => item.id !== params.id));
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
    gethotlistGroup();
    setflag(false);
  }, [flag]);

  return (
    local_anpr_user('activity_info', 'activity_name', 'Hotlist Management') ?
    <Grid
      container
      spacing={0.5}
      direction="row"
      justifyContent="space-evenly"
      className={classes.root}
    >
      <Grid item xs={12}>
        <Hotlist
          setModalStatus={(open) => setOpen(open)}
          open={open}
          selectedrecord={selectedrecord}
          resetSelectedRecord={() => setSelectedrecord(null)}
          
          refreshContent={(isContentRefresh) => {
            if (isContentRefresh) {
              gethotlistGroup();
              setSelectedrecord(null);
            }
          }}
          hotListCategoryList={hotListCategoryList}
          selectedItem={selectedItem}
          setflag={setflag}
        />
      </Grid>
      <Grid item xs={12}>
        <Hotlist_category
          setModalStatus={(open) => setOpen(open)}
          open={open}
          selectedrecord={selectedrecord}
          resetSelectedRecord={() => setSelectedrecord(null)}
          refreshContent={(isContentRefresh) => {
            if (isContentRefresh) {
              gethotlistGroup();
              setSelectedrecord(null);
            }
          }}
          getSelectedItem={(selectedItem) => getSelectedItem(selectedItem)}
          setHotListCategoryList={setHotListCategoryList}
        />
      </Grid>

      <Grid item xs={12} className={classes.tableCls}>
        {loader}
        <Card className={classes.card}>
          <CardContent component="div" className={classes.dataGridCpd}>
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={alertOpen}
              autoHideDuration={1000}
              onClose={() => {
                setState({ ...state, alertOpen: false });
              }}
            >
              <Alert
                onClose={() => {
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
              className={classes.dataHmainGridCls}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
              }}
              rows={filteredList}
              rowsPerPageOptions={[10,20]}
              rowHeight={35}
              headerHeight={40}
              components={{
                Toolbar: CustomToolbar,
              }}
              getCellClassName={(params) => classes.cellsCls}
              onPageChange={(currentPageIdx) => {}}
              pagination
              loading={flag}
            //   slotProps={{
            //     cell: {
            //   onMouseEnter: handlePopoverOpen,
            //  onMouseLeave: handlePopoverClose,
            //    },
            //    }}

              
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    : (
      <Grid>
        <NoAccess />
      </Grid>
    )
  );
};

export default Hotlist_main;