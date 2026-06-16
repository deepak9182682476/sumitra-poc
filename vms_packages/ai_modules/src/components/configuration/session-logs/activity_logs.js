import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles,useTheme } from "@mui/styles";
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
  AppBar,
  CardActionArea,
  FormControl,
  TextField,
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
  useGridApiContext, 
  gridFilteredSortedRowIdsSelector,
} from "@mui/x-data-grid";
import moment from "moment";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useLoader from "../../../common/loader/useLoader";
import ModelsService from "../../../services/models";
import Pagination from '@mui/material/Pagination';
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { Check as CheckIcon, Receipt } from "@mui/icons-material";
import NoAccess from "../../../common/NoAccess";
import { local_anpr_user } from "../../../config/config";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Print as PrintIcon } from "@mui/icons-material";
import { Download as DownloadIcon } from "@mui/icons-material";


const useStyles = makeStyles((theme) => ({
  root: {

    "& ::-webkit-scrollbar": {
      width: "3px",
      height: "100%",
      marginRight: "4px",
      backgroundColor: "#3D81F5",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "red",
      borderRight: "4px white solid",
      height: "2px"
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
    },
    "& .MuiDataGrid-root, .MuiTypography-root": {
      fontSize: "13px", 

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
    },
    [theme.breakpoints.up(1401)]: {
      height: "92vh",
    },
    width: "100vw",
  },
  popupTitle: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    color: "#fff",
    width: "100%",
    height:"4vh",
    padding: '1vh',
  },
  cpd: {
    padding: "0  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  historyRecordSection: {
    width: "100%",
    overflow: "auto",
    [theme.breakpoints.between(750, 1400)]: {
      height: "10vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "85vh !important",
    },
},
 titleCls: {
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "uppercase",
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
    borderRadius: "0px !important",
    marginTop: '4px !important'
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
  dataViolationGridCls: {
    color: "#fff !important",
    border: "none !important",
    [theme.breakpoints.between(350, 749)]: {
      maxHeight: "90vh",
      minHeight: "70vh",
    },
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "90vh",
      minHeight: "83vh",
    },
    [theme.breakpoints.between(1400, 1800)]: {
      maxHeight: "90vh",
      minHeight: "79vh",
    },
    [theme.breakpoints.up(1800)]: {
      maxHeight: "87vh",
      minHeight: "79vh",
    },
  },
  cellsCls: {
    color: "#fff !important", 
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
    padding: "8px 4px 0px 12px !important",
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

}));
function CustomToolbar(props) {
  const { dataGridRows, columns, handleCloseAllEvents } = props;
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick1 = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const apiRef = useGridApiContext();
  const filteredRows = gridFilteredSortedRowIdsSelector(apiRef);

  const theme = useTheme();
  const row_header = {'s.no': 'S. No.', 'name': 'Username', 'Server IP': 'Server IP', 'created_on': 'Login Time'};
  const column_values = {'s.no': 'S. No.', 'name': 'Username', 'Server IP': 'Server IP', 'created_on': 'Login Time'};
  const headers = [];
  const filteredColumns = columns.filter(col => col.field !== 'actions');
  filteredColumns.forEach(col => headers.push(row_header[col.field]))

  const exportToXLS = () => {
    const formattedData = [];

    filteredRows.forEach((rowId) => {
      const item = apiRef.current.getRow(rowId);
      let obj = {};
  
      filteredColumns.forEach((col) => {
        const fieldKey = col.field;
        const displayName = row_header[fieldKey];
        const itemKey = column_values[fieldKey];
        const value = item[itemKey];
        
        obj[displayName] = itemKey === 'created_on'
          ? moment(value).format('YYYY/MM/DD HH:mm:ss')
          : value && value !== 'undefined' && value !== 'null' ? value.toString() : "";
      });
  
      formattedData.push(obj);
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: filteredColumns.map(col => row_header[col.field]) });

      // Calculate the position to place the total row
      const totalRow = [];
      const totalLabel = "Total Rows Exported:";
      totalRow.push(totalLabel);
      // Add the total count to the last cell
      totalRow.push(filteredRows.length.toString());

      // Append the total row to the worksheet
      const lastRowNumber = formattedData.length + 2; // +2 to account for header and 1-based indexing
      XLSX.utils.sheet_add_aoa(worksheet, [totalRow], { origin: `A${lastRowNumber}` });

      // Create and save the workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'Alerts.xlsx');
  };

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(headers.join(','));
  
    filteredRows.forEach((rowId) => {
      const row = apiRef.current.getRow(rowId); // Get the row data by ID
      const values = filteredColumns.map(col => { 
        const header = column_values[col.field];
        if (!header) return;
        const value = header === 'created_on' ? moment(row[header]).format('YYYY/MM/DD HH:mm:ss') : row[header] !== 'undefined' && row[header] !== 'null' ? row[header].toString() : '';
        const escapedValue = ('' + value).replace(/"/g, '\\"');
        return `"${escapedValue}"`;
      });
      csvRows.push(values.join(','));
    });
    csvRows.push(`"Total Rows Exported: ${filteredRows.length}"`);
  
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'Alerts.csv';
    link.click();
  };
  

  const exportDataToPdf = (param) => {
    
    const pdf = new jsPDF();
    pdf.autoPrint({ variant: 'non-conform' });
    // Set document properties
    pdf.setProperties({
      title: "Alerts"
    })
    pdf.setFontSize(10);
    pdf.setFont('custom', 'bold');
    pdf.text('Alerts', 15, 15);
    pdf.setLineWidth(0.5);
    const itemDetailsHeaders = filteredColumns.map(col => row_header[col.field] || col.field);
    const itemDetailsRows = filteredRows.map((rowId) => {
      const item = apiRef.current.getRow(rowId);
      return itemDetailsHeaders.map(header => {
        const columnKey = Object.keys(row_header).find(key => row_header[key] === header);
        const columnName = column_values[columnKey];
  
        if (columnName) {
          if (columnName === 'date_time' || columnName === 'created_on') {
            return moment(item[columnName]).format('YYYY/MM/DD HH:mm:ss');
          }
          return item[columnName] && item[columnName] !== 'undefined' && item[columnName] !== 'null' ? item[columnName].toString() : '';
        }
        return '';
      });
    });
    // const columnWidths = [18, 35, 30, 35, 35, 25, 30]; // Adjust column widths as needed
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
      columnStyles: itemDetailsHeaders.reduce((styles, _, index) => {
        styles[index] = { cellWidth: 'auto' };
        return styles;
      }, {}),
      alternateRowStyles: { fillColor: [255, 255, 255] },
      bodyStyles: {
        fontSize: 10, // Adjust the font size for the body
        font: 'Newsreader', // Set the font family for the body
        cellPadding: { top: 1, right: 3, bottom: 1, left: 2 }, // Adjust cell padding
        textColor: [0, 0, 0], // Set text color for the body
        rowPageBreak: 'avoid', // Avoid row page breaks
      },
      margin: { top: 10, left: 5, bottom: 20, right: 2 },
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
    pdf.text(`Total Rows Exported: ${filteredRows.length}`, 15, pdf.autoTable.previous.finalY + 10);
    if (param == 'prints') {
      window.open(URL.createObjectURL(pdf.output('blob')), '_blank');
    }
    else {
      pdf.save(`Alerts.pdf`);
    }
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
            fontSize: "14pxt",
          }}
        >
          {" "}
          Activity Logs{" "}
        </Typography>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <IconButton
          size="small"
          aria-label="settings"
          aria-controls="settings-menu"
          aria-haspopup="true"
          color="inherit"
          onClick={() => { exportDataToPdf('prints') }}
        >
          <PrintIcon /><Typography
                  style={{
                    fontSize: "12px",
                    paddinG: "4px 5px",
                  }}
                >
                  PRINT
                </Typography>


        </IconButton>
        <>
          <IconButton
            size="small"
            aria-label="settings"
            aria-controls="settings-menu"
            aria-haspopup="true"
            color="inherit"
            onClick={handleClick1}
          >
            <DownloadIcon /><Typography
                  style={{
                    fontSize: "12px",
                    paddinG: "4px 5px",
                  }}
                >
                  EXPORT
                </Typography>
            

          </IconButton>

        </>
        <>

        </>
      </GridToolbarContainer>
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'export-button',
        }}
      >
        <MenuItem onClick={() => exportDataToPdf('Download')}>Download PDF</MenuItem>
        <MenuItem onClick={() => exportToCSV()}>Download CSV</MenuItem>
        <MenuItem onClick={() => exportToXLS()}>Download XLS</MenuItem>

      </Menu>
    </>
  );
}
const Activity_logs = (props) => {
  console.log('checkprops', props)
  
  const [dataGridRows, setDataGridRows] = useState([]);
  const classes = useStyles();
  // const [selectedLogType, setSelectedLogType] = useState(null);
  const [state, setState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  const current_theme = useTheme();
  const [isSuccess, setAlertSuccess] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [currentPgIdx, setCurrentPgIdx] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [mode, setMode] = useState("add");
  
  const [dateRangeSelected, setDateRangeSelected] = useState(false); 
  const theme = useTheme();
  const [loader, showLoader, hideLoader] = useLoader();
  const [violationList, setViolationList] = React.useState([]);
  const [paramObj, setParamObj] = useState([]);
  const [flag, setflag] = useState(false)
  const [selectedrecord, setSelectedrecord] = useState(null);
 
  const {search_form, selectedLogType} = props
  
  const columns = [
    {
      field: "Activity ID",
      type: "string",
      maxWidth: 100,
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
           Activity ID
          </Typography>
        );
      },
      renderCell: (params) => {
        let index = violationList.findIndex((rec) => rec.id === params.id);
        return <Typography>{violationList[index].id}</Typography>;
      },
    },
    {
      field: "created_on",
      flex: 1,
      maxWidth: 220,
      type: "string",
      renderHeader: (params) => {
        return (
          <Typography style={{ color: theme.palette?.text?.primary, backgroundColor: "#313131",fontSize:"14px" ,fontWeight: "regular"  }}>
            Activity Time
          </Typography>
        );
      },
      renderCell: (params) => {
        let index = violationList.findIndex((rec) => rec.id === params.id);
        let createdOn = new Date(violationList[index].created_on);
        // createdOn.setHours(createdOn.getHours() + 5); // Adding 5 hours for IST
        // createdOn.setMinutes(createdOn.getMinutes() + 30); // Adding 30 minutes for IST
        return <Typography>{createdOn.toLocaleString('en-GB', {timeZone: 'Asia/Kolkata', hour12: false, })}</Typography>;
      },
    },
   
    {
      field: "module_name",
      flex: 1,
      type: "string",
      maxWidth: 220,
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
            Module
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "sub_module_name",
      flex: 1,
      type: "string",
      maxWidth: 220,
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
            Sub Module
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "action_type",
      flex: 1,
      type: "string",
      maxWidth: 120,
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
            Action Type
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "Activity Description",
      flex: 1,
      type: "string",
      maxWidth: 550,
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
           Activity Description
          </Typography>
        );
      },
      renderCell: (params) => {
        let index = violationList.findIndex((rec) => rec.id === params.id);
        return <Typography>{`${violationList[index].user_name} ${violationList[index].action_type}d ${violationList[index].sub_module_name} in ${violationList[index].module_name}`}</Typography>;
      },
    },
    {
      field: "ip_address",
      flex: 1,
      type: "string",
      maxWidth: 150,
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
            Client IP
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: "user_name",
      flex: 1,
      type: "string",
      maxWidth: 150,
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
            User Name
          </Typography>
        );
      },
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>;
      },
    },
    
  ];
  
  

  const { alertOpen, vertical, horizontal, alertContent } = state;


  const getViolationPopupGroup = () => {    
    showLoader();
    ModelsService.getLogs({...search_form})
          .then((response) => {
        if (response) {
          hideLoader();
          const { data } = response?.data;
          if (data){
          setViolationList(data);}
          console.log('violalis',violationList)
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
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({
    color: false,
  });
  // const handleEditClick = (params) => {
  //   const gridIdx = violationList.findIndex((rec) => rec.id === params.row.id);
  //   console.log(gridIdx);
  //   if (gridIdx !== -1) {
  //     const rec = violationList[gridIdx];
  //     setOpen(true);
  //     setSelectedrecord(rec);
  //     setParamObj('edit');
  //     setMode("update");
  //   }
  // };

  const handleDeleteClick = (params) => {
    if (params && params.id) {
      ModelsService.deleteViolation_managementParameters(params.id)
        .then((response) => {
          setViolationList(violationList.filter((item) => item.id !== params.id));
          setAlertSuccess(true);
          setState({ ...state, alertOpen: true, alertContent: "Deleted Successfully" });
        })
        .catch((err) => console.log("Hotlist delete", err));
    }
  };
  useEffect(() => {
    getViolationPopupGroup();
    
    setflag(false)
  }, [flag]);

  function setDataGridData(currentPage, size) {
    showLoader();
    const pageNum = currentPage || 1;
    const pageLimit = size || 10;

   
  };
  return (
    // local_anpr_user('activity_info', 'activity_name', 'Violation Management') ?
      <Grid
        container
        spacing={0.5}
        direction="row"
        justifyContent="space-evenly"
        className={classes.root}
      >
        <Grid item xs={8.8} className={classes.tableCls}>
          {/* {loader}  */}
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
                  className={classes.dataViolationGridCls}
                  pageSize={pageSize} 
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                  }
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                  }}
                  rows={violationList}
                  rowsPerPageOptions={[20,50]}
                  rowHeight={35}
                  headerHeight={40}
                  components={{
                    Toolbar: CustomToolbar,
                  }}
                  componentsProps={{ toolbar: {columns: columns.filter(col => columnVisibilityModel[col.field] !== false) } }}
                  getCellClassName={(params) => classes.cellsCls}
                  onPageChange={(currentPageIdx) => {
                    setCurrentPgIdx(currentPageIdx);
                  }}
                  pagination
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      //  :
      // (
      //   <Grid>
      //     <NoAccess />
      //   </Grid>
      // )
  );
  
  
};

export default Activity_logs;
