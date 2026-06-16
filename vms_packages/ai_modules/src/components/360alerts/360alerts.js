import React, { Fragment, useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Popover,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Slide,
  Box,
  TextField,
  Divider
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import { MAP_CONFIG } from "../../config/map/map";
import LiveSystemService from "../../services/livesystem";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import { configuredData, local_anpr_user } from "../../config/config";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { CloseOutlined } from "@mui/icons-material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import NextPlanOutlinedIcon from '@mui/icons-material/NextPlanOutlined';
import Tooltip from "@mui/material/Tooltip";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector, 
  useGridApiContext, 
  gridFilteredSortedRowIdsSelector, 
  gridRowIdsSelector
} from "@mui/x-data-grid";
import { CamerasLayer, Layers, TileLayer } from "../map/layers";
import { Controls, FullScreenControl, ZoomInOutControl } from "../map/controls";
import { themeSubjectService } from "../../utilities/theme-util";

import Map from "../map/map";
import Layer from "../map/layerlist";
import AlertsService from "../../services/alerts";
import PopupState, { bindTrigger, bindPopover, bindMenu } from "material-ui-popup-state";

import { Check as CheckIcon, Receipt } from "@mui/icons-material";
import { AltRoute as RouteIcon } from "@mui/icons-material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import useLoader from "../../common/loader/useLoader";
import AverageSpeedService from "../../services/average_speed";
import moment from "moment";
import NoAccess from "../../common/NoAccess";
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import { Print as PrintIcon } from "@mui/icons-material";
import { Download as DownloadIcon } from "@mui/icons-material";
import HotlistTrack from "./hotlist_tracking";
import ModelsService from "../../services/models";
import MapAlert from "../map/MapAlert";
import CameraService from "../../services/camera";
import _ from "lodash";


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
  // const headers = ['Event ID', 'Date & Time', 'Analytic Type', 'Camera Name', 'Junction', 'Police Station', 'Commissionerate'];
  const row_header = {'Event ID': 'Event ID', 'Date & Time': 'Date & Time', 'License Number': 'License Number', 'Alert Type': 'Alert Type', 'Hotlist Category': 'Hotlist Category', 'Camera': 'Camera Name', 'Junction': 'Junction Name', 'Police Station': 'Police Station', 'Commissionerate': 'Commissionerate', 'Status': 'Status', 'Remarks': 'Remarks', 'Color': 'Color', 'Operator Id': 'Operator Id'};
  const column_values = {'Event ID': 'event_id', 'Date & Time': 'created_on', 'License Number': 'license_number', 'Alert Type': 'model_name', 'Hotlist Category': 'hotlist_category', 'Camera': 'camera_name', 'Junction': 'junction_name', 'Police Station': 'police_station', 'Commissionerate': 'commisionerate', 'Status': 'status', 'Remarks': 'remarks', 'Color': 'color', 'Operator Id': 'user_id'};
  // const headers = ['S.No', 'Date & Time', 'License Number', 'Alert Type', 'Camera', 'Junction', 'commissionerate', 'Color'];
  // const row_header = ['id', 'date_time', 'license_number', 'model', 'camera_name', 'junction_name', 'commisionerate', 'color']
  const headers = [];
  const filteredColumns = columns.filter(col => col.field !== 'Actions' && col.field !== 'Image');
  filteredColumns.forEach(col => headers.push(row_header[col.field]))
  console.log("filtered", filteredColumns, headers);

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
    XLSX.writeFile(workbook, 'Events - Alerts.xlsx');
  };

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(headers.join(','));
  
    filteredRows.forEach((rowId) => {
      const row = apiRef.current.getRow(rowId); // Get the row data by ID
      const values = filteredColumns.map(col => { 
        const header = column_values[col.field];
        if (!header) return;
        const value = header === 'created_on' ? moment(row[header]).format('YYYY/MM/DD HH:mm:ss') : row[header] && row[header] !== 'undefined' && row[header] !== 'null' ? row[header].toString() : '';
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
    link.download = 'Events - Alerts.csv';
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
    // const itemDetailsRows = dataGridRows?.map(item => 
    //   Object.keys(row_header).map(key => {
    //     const columnName = column_values[key];
    //     if (columnName) {
    //       if (key === 'date_time' || key==='created_on') {
    //         return moment(item[columnName]).format('YYYY/MM/DD HH:mm:ss');
    //       }
    //       return item[columnName]?.toString() || '';
    //     }
    //     return '';
    //   })
    // );
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

    // Save the PDF 
    // pdf.save(`Events.pdf`);

    if (param == 'prints') {
      window.open(URL.createObjectURL(pdf.output('blob')), '_blank');
    }
    else {
      pdf.save(`Events - Alerts.pdf`);
    }

    // pdf.autoPrint();

    // window.print(pdf);
    // const tableColumn = ["ID", "License Number"]
    // const tableRows = [];
    // //doc.text('test', 10, 10);

    // props.dataGridRows.forEach((row, idx) => {
    //   // doc.text(`${row.id}, ${row.license_number}`, 10, 20 + idx * 10);
    //   tableRows.push([`${row.id}`, `${row.license_number}`])
    // });

    // doc.autoTable({
    //   head: [tableColumn],
    //   body: tableRows
    // })

    // doc.save('test.pdf');
    return;
  };

  return (
    <>
      <GridToolbarContainer
        style={{
          width: "100%",
          height: "100%",
          background: "#141414"
        }}
      >
        <Typography
          style={{
            flexGrow: "1",
            marginLeft: "10px",
            fontSize: '14px',
            color: `${theme.palette?.text?.secondary}`,
            // color: "#fff"
          }}
        >
          EVENTS - ALERTS
        </Typography>
        <Button variant='contained' onClick={() => handleCloseAllEvents()}>Close All Events</Button>
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
        {/* <GridToolbarExport
        csvOptions={{ allColumns: true }}
        printOptions={{
          hideFooter: true,
          hideToolbar: true,
          allColumns: true
        }}
        style={{ marginRight: "15px" }} /> */}
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
      backgroundColor: theme?.palette?.primary?.subHeaderBg,
    },
    "& .MuiDataGrid-root": {
      fontSize: "13px !important",
    },
    "& .MuiButton-root": {
      color: "#fff !important",
      fontSize: "12px",
    },
    "& .MuiGridToolbarContainer-root": {
      padding: "0px !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important"
    },
    '& .MuiDataGrid-footerContainer': {
        height: '40px',
        minHeight: '40px',
    },
  },
  cpd: {
    padding: "0px  !important",
  },
  dataGridCpd: {
    flexGrow: "1",
    padding: "0px !important",
  },
  card: {
    backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
    border: "1px solid #868686 !important",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fontsize: {
    fontSize: "0.75rem !important",
  },
  dataGridCls: {
    color: `${theme.palette?.text?.primary} !important`,
    border: "none !important",
    [theme.breakpoints.between(750, 1400)]: {
      maxHeight: "300px",
      minHeight: "300px",
    },
    [theme.breakpoints.up(1401)]: {
      maxHeight: "460px",
      minHeight: "460px",
    }
  },
  cellsCls: {
    color: `${theme.palette?.text?.primary} !important`,
  },
  cameraFramesSection: {
    padding:"0px",
    width: "100%",
    margin: "0px",
    [theme.breakpoints.between(750, 1400)]: {
      height: "27vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "41vh !important",
    },
  },
  imageListCLs: {
    overflowY: "auto",
    margin: "0px",
    [theme.breakpoints.between(750, 1400)]: {
      height: "24.5vh !important",
      width: "98vh",
    },
    [theme.breakpoints.up(1401)]: {
      height: "43vh !important",
      width: "97vh",
    },
  },
  imageListItemCls: {
    border: "1px solid #d0d0d0",
    [theme.breakpoints.between(750, 1400)]: {
      height: "42vh !important",
    },
    [theme.breakpoints.up(1401)]: {
      height: "42.7vh !important",
      margin: "0px",
    },
    "& .MuiImageListItem-img": {
      objectFit: "fill !important",
      height: '100%'
    },
  },
  itemListItemBar: {
    background: "rgba(0, 0, 0, 0) !important",
    "& .MuiImageListItemBar-title": {
      fontSize: "0px !important",
    },
    "& .MuiImageListItemBar-subtitle": {
      marginTop: "2px",
    },
    "& .MuiImageListItemBar-titleWrap": {
      padding: "2px !important",
    },
  },
  inputField: {
    color: `${theme.palette?.text?.primary} !important`,
    background: 'none',
    border: 'none',
    outline: 'none',
  },
}));

const Alerts360Degree = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const [state, setState] = useState({
    data: null,
    imagesData: [],
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPgIdx, setCurrentPgIdx] = useState(0);

  const [dataGridRows, setDataGridRows] = useState([]);
  const [dataPageSizeRows, setDataPageSizeRows] = useState([]);

  const [layerlist, setLayerList] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [themeUrl, setThemeUrl] = useState(
    "http://{​​​​​​​​a-c}​​​​​​​​.basemaps.cartocdn.com/dark_all/{​​​​​​​​z}​​​​​​​​/{​​​​​​​​x}​​​​​​​​/{​​​​​​​​y}​​​​​​​​.png"
  );
  const [alertstate, setAlertState] = React.useState({
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
    severity: "",
  });

  const [loader, showLoader, hideLoader] = useLoader();
  const [cellEdit, setCellEdit] = useState(-1);
  const [newCellValue, setNewCellValue] = useState("");
  const [open, setOpen] = React.useState(false);
  const [rowsParams, setRowsParams] = useState(null);
  const [locationDataMap, setLocationDataMap] = useState(null)

  const [cameraList, setCameraList] = useState(null);

  const columns = [
    {
      field: "Event ID",
      flex: 1,
      disableExport: true,
      filterable: false,
      sortable: false,
      type: "text",
      maxWidth: 100,
      renderHeader: (params) => {
        return <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Event ID</Typography>;
      },
      renderCell: (params, index) => {
        return params.row?.event_id;
      },
    },
    {
      field: "Date & Time",
      flex: 1,
      type: "date",
      filterable: false,
      sortable: false,
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Date & Time</Typography>
        );
      },
      renderCell: (params) => {
        let createdon_date = moment(params.row?.date_time).format('YYYY/MM/DD HH:mm:ss')
        return createdon_date;
      },
      valueGetter: (params) => {
        let createdon_date = moment(params.row?.date_time).format('YYYY/MM/DD HH:mm:ss')
        return createdon_date;
      }
    },
    {
      field: "License Number",
      flex: 1,
      type: "text",
      filterable: false,
      // editable: true,
      sortable: false,
      maxWidth: 200,
      align: "left",
      disableExport: true,
      renderHeader: (params) => {
        return <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>License Number</Typography>;
      },
      renderCell: (params) => {
        const originalValue = params.row.license_number;
        const handleBlur = (event) => {
          if (newCellValue !== originalValue) {
            handleLicenseChange([params, newCellValue]);
          }
          else {
            setCellEdit(-1);
            setNewCellValue("");
          }

        };
        const handleSave = () => {
          handleLicenseChange([params, newCellValue]);
        };
        const handleEdit = () => {
          setCellEdit(params.row.id);
          setNewCellValue(params.row.license_number);
        }
        const handleKeyDown = (event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.stopPropagation();
          }
        };

        return (
          params.row.id === cellEdit && !remarksAlert ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <input
                type="text"
                value={newCellValue}
                onChange={(event) => setNewCellValue(event.target.value)}
                onBlur={handleBlur}
                style={{ width: '80%', overflow: 'scroll', whiteSpace: 'nowrap' }}
                className={classes.inputField}
                onKeyDown={handleKeyDown}
              />
              <SaveIcon
                onClick={handleSave}
                style={{ fontSize: '18px', cursor: 'pointer', alignSelf: 'center' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ width: '85%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {dataGridRows.findIndex(row => row.id === params.row.id) !== -1 ? dataGridRows[dataGridRows.findIndex(row => row.id === params.row.id)].license_number : ""}
              </span>
              <EditIcon
                onClick={handleEdit}
                style={{ fontSize: '18px', cursor: 'pointer', alignSelf: 'center' }}
              />
            </div>
          )
        );
      },
      // valueParser: (val, params) => {
      //   if (val) {
      //     params.row.license_number = val;
      //   }
      //   return params.row.license_number;
      // },
    },
    {
      field: "Image",
      sortable: false,
      filterable: false,
      flex: 1,
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Image</Typography>
        );
      },
      renderCell: (params) => {
        return (
          <div>
            <img
              alt="Image Not Available"
              width={100}
              src={params.row?.crop_64_image}
            />
          </div>
        );
      },
    },
    //{
    // field: "ip_address",
    // flex: 1,
    // type: "text",
    // maxWidth: 180,
    // renderHeader: (params) => {
    //  return (
    //   <Typography style={{ fontWeight: "bold" }}>Camera Ip</Typography>
    // );
    //},
    //},
    {
      field: "Alert Type",
      flex: 1,
      type: "text",
      sortable: false,
      maxWidth: 120,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Alert Type</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.model_name || "";
        return data.toString();
      },
      valueGetter: (params) => params.row?.model_name || "",
    },
    {
      field: "Hotlist Category",
      flex: 1,
      type: "text",
      sortable: false,
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Hotlist Category</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.hotlist_category || "";
        return data.toString();
      },
      valueGetter: (params) => params.row?.hotlist_category || "",
    },
    {
      field: "Camera",
      flex: 1,
      type: "text",
      sortable: false,
      filterable: false,
      maxWidth: 350,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Camera Name</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.camera_name || "";
        return data.toString();
      },
    },
    {
      field: "Junction",
      flex: 1,
      type: "text",
      sortable: false,
      filterable: false,
      maxWidth: 170,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Junction</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.junction_name || "";
        return data.toString();
      },
      valueGetter: (params) => params.row?.junction_name || "",
    },
    {
      field: "Commissionerate",
      flex: 1,
      type: "text",
      sortable: false,
      maxWidth: 170,
      renderHeader: (params) => {
        return <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Commissionerate</Typography>;
      },
      renderCell: (params) => {
        let data = params.row?.commisionerate || "";
        return data.toString();
      },
      valueGetter: (params) => params.row?.commisionerate || "",
    },
    {
      field: "Police Station",
      flex: 1,
      type: "text",
      sortable: false,
      maxWidth: 150,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Police Station</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.police_station || "";
        return data.toString();
      },
      valueGetter: (params) => params.row?.police_station || "",
    },
    {
      field: "Color",
      flex: 1,
      type: "text",
      sortable: false,
      filterable: false,
      maxWidth: 100,
      renderHeader: (params) => {
        return <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Color</Typography>;
      },
      renderCell: (params) => {
        let data = params.row?.color || "-NA-";
        return data.toString();
      },
      valueGetter: (params) => params.row?.color || "-NA-",
    },
    {
      field: "Actions",
      flex: 1,
      type: "text",
      sortable: false,
      maxWidth: 150,
      filterable: false,
      align: "left",
      disableExport: true,
      renderHeader: (params) => {
        return <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Actions</Typography>;
      },
      renderCell: (params) => {

        const currentStatus = params.row?.status;
        const actions = ["Track", "Accept", "Resolve", "Close"];

        const createTooltip = (val) => {
          if (currentStatus === "Resolved" && (val === "Accept" || val === "Resolve")) return `Cannot ${val} already resolved Event`;
          return "";
        }

        const checkDisable = (val) => {
          if (currentStatus === "Resolved" && (val === "Accept" || val === "Resolve")) return true;
          return false;
        }

        const handleActionSelect = (popupState, actionSelected) => {
          if(actionSelected === "Track") showSearchModel(params.row);
          else handleActionClick(actionSelected, params.row.id);
          popupState.close();
        }

        return (
          <>
            <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <PopupState 
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }} 
                variant="popover" 
                popupId="actions-popup-menu" 
              >
                {(popupState) => (
                  <React.Fragment>
                    <Button variant="outlined" {...bindTrigger(popupState)} sx={{width: '100%', justifyContent: 'space-evenly'}} size="small">
                      Actions <KeyboardArrowDownIcon />
                    </Button>
                    <Menu {...bindMenu(popupState)}>
                      {actions.map((val) => {
                        return (
                          <Tooltip
                            title={createTooltip(val)}
                            placement="right"
                            key={val}
                            PopperProps={{
                              sx: {
                                "& .MuiTooltip-tooltip": {
                                  fontSize: '1rem',
                                  color: 'white',
                                  backgroundColor: 'rgba(255,0,0,0.8)',
                                },
                              },
                            }}
                          >
                          <span>
                            <MenuItem onClick={() => handleActionSelect(popupState, val)} sx={{width: '130px'}} disabled={checkDisable(val)}>
                              {val}
                            </MenuItem>
                          </span>
                        </Tooltip>
                        )
                      })}
                    </Menu>
                  </React.Fragment>
                )}
              </PopupState>
            </div>
            {/* <IconButton
              size="small"
              aria-label="settings"
              aria-controls="export-menu"
              aria-haspopup="true"
              color="inherit"
              onClick={() => { showSearchModel(params.row); }}
            >
              <RouteIcon />
            </IconButton>
            <Button variant="outlined" onClick= {() => handleActionClick(nextAction, params.row.id)}>{nextAction}</Button> */}
          </>
          /* <Menu
            id="export-menu"
            anchorEl={anchorEl}
            open={open1}
            onClose={handleCloseAction}
            MenuListProps={{
              'aria-labelledby': 'export-menu',
            }}
          >
            <MenuItem onClick={() => { saveDetails(params.row); }}>
              Save
            </MenuItem>
            <MenuItem onClick={() => { console.log('lll',params.row);}}>
              Track
            </MenuItem>
            {/* <MenuItem>
              Download XLS
            </MenuItem> */
          //  </Menu>
          // </> 
        );
      },
    },
    {
      field: "Status",
      flex: 1,
      type: "text",
      filterable: false,
      sortable: false,
      maxWidth: 100,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Status</Typography>
        );
      },
      renderCell: (params) => {
        const statusList = {
          "New": "Red",
          "In Progress": "Yellow",
          "Resolved": "Green"
        };

        const status = params.row?.status || "";
        const color = statusList[status] || "Black";

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: color,
                marginRight: 5,
              }}
            />
            {status.toString()}
          </div>
        );
      },
    },
    {
      field: "Remarks",
      flex: 1,
      type: "text",
      filterable: false,
      sortable: false,
      maxWidth: 120,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Remarks</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.remarks || "";
        if (params.row.status === "New" || params.row.status === "In Progress") {
          data = ""
        }
        return data.toString();
      },
      valueGetter: (params) => params.row?.remarks || "",
    },
    {
      field: "Operator Id",
      flex: 1,
      type: "text",
      filterable: false,
      sortable: false,
      maxWidth: 120,
      renderHeader: (params) => {
        return (
          <Typography style={{ fontSize:"14px" ,fontWeight: "regular" }}>Operator Id</Typography>
        );
      },
      renderCell: (params) => {
        let data = params.row?.user_id || "";
        return data.toString();
      },
    },
  ];

  const [licenseAlert, setLicenseAlert] = useState(false);
  const [licenseRowVal, setLicenseRowVal] = useState(null);

  const handleLicenseChange = (params) => {
    setLicenseAlert(true);
    setLicenseRowVal(params);
  }

  const showSearchModel = (params) => {
    setOpen(true);
    setRowsParams(params.license_number);
  };

  const handleLicenseChangeYes = () => {
    const rowIndex = dataGridRows.findIndex(row => row.id === licenseRowVal[0].row.id);
    const updatedRows = [...dataGridRows];
    updatedRows[rowIndex].license_number = licenseRowVal[1];
    setDataGridRows(updatedRows);
    saveDetails(dataGridRows[rowIndex]);
    setCellEdit(-1);
    setNewCellValue("")
    setLicenseAlert(false);
    setLicenseRowVal(null);
  }

  const handleLicenseChangeNo = () => {
    const rowIndex = dataGridRows.findIndex(row => row.id === licenseRowVal[0].row.id);
    const updatedRows = [...dataGridRows];
    updatedRows[rowIndex].license_number = licenseRowVal[0].row.license_number;
    setDataGridRows(updatedRows);
    setCellEdit(-1);
    setNewCellValue("")
    setLicenseAlert(false);
    setLicenseRowVal(null);
  }

  const renderAlertDialog = () => {
    return (
      <Dialog open={licenseAlert}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          {`On clicking 'Save Changes', License Number will change to ${licenseRowVal[1]}.`}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLicenseChangeNo} sx={{ color: '#ffffff' }}>No</Button>
          <Button onClick={handleLicenseChangeYes} autoFocus sx={{ color: '#ffffff' }} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const saveDetails = (params) => {
    console.log('params------------', params)
    let obj = {
      license_number: params.license_number,
      id: params.event_id,
    };
    // console.log("aajjkk", obj )
    ModelsService.updateHotlistAlert(obj)
      .then((res) => {
        if (res.status === 200) {
          setAlertStatus("Updated Successfully", true, "success");
          //setDataGridData();
        }
      })
      .catch((err) => {
        setAlertStatus("update Failed", false, "error");
        console.log("handleAcknowledge", err);
      });
  }

  const [remarksAlert, setRemarksAlert] = useState(false);
  const [remarksType, setRemarksType] = useState("");
  const [remarks, setRemarks] = useState("");


  const actions = { "Accept": "In Progress", "Transfer": "In Progress", "Resolve": "Resolved", "Close": "Closed" };

  const handleStatusChange = (id, newStatus) => {
    const rowIndex = dataGridRows.findIndex(row => row.id === id);
    const updatedRows = [...dataGridRows];
    updatedRows[rowIndex].status = newStatus;
    if (newStatus !== "In Progress") {
      updatedRows[rowIndex].remarks = remarks;
    }
    let params = updatedRows[rowIndex];
    if (updatedRows[rowIndex].status === "Closed") {
      updatedRows.splice(rowIndex, 1);
    }
    let obj = {
      license_number: params.license_number,
      cropped_image: params.cropped_image,
      full_image: params.full_image,
      hotlist_category: params.hotlist_category,
      camera_name: params.camera_name,
      junction: params.junction,
      commisionerate: params.commisionerate,
      police_station: params.police_station,
      date_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      camera_id: params.camera_id,
      model_name: params.model_name,
      status: params.status,
      remarks: params.remarks,
      orig_event_id: params.orig_event_id ? params.orig_event_id : params.event_id,
      date_time: params.date_time,
    };
    console.log(obj);
    ModelsService.updateHotlistAlertStatus(obj)
      .then((res) => {
        if (res.status === 200) {
          setAlertStatus("Status Changed Successfully", true, "success");
          setDataGridRows(updatedRows);
        }
      })
      .catch((err) => {
        setAlertStatus("Update Failed", false, "error");
        console.log("handleAcknowledge", err);
      });
  }

  const handleActionDialogCancel = () => {
    setRemarks("");
    setRemarksAlert(false);
    setRemarksType("");
    setCellEdit(-1);
    setEventsToClose([]);
  }

  const handleActionDialogYes = () => {
    handleStatusChange(cellEdit, actions[remarksType])
    setRemarks("");
    setRemarksAlert(false);
    setRemarksType("");
    setCellEdit(-1);
    setEventsToClose([]);
  }

  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
  };

  const renderRemarksDialog = () => {
    const rowIndex = dataGridRows.findIndex(row => row.id === cellEdit);
    let prevRemark = dataGridRows[rowIndex].remarks || "";
    return (
      <Dialog open={remarksAlert} fullWidth maxWidth='sm'>
        <DialogTitle>{remarksType} Alert</DialogTitle>
        <DialogContent dividers>
          {remarksType === "Close" && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>Previous Remarks:</Typography>
              <Typography variant="body1">{prevRemark ? prevRemark : "No Remarks Available"}</Typography>
              <Divider style={{ margin: '20px 0' }} />
            </>
          )}
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>Additional Remarks:</Typography>
          <TextField
            id="filled-multiline-static"
            multiline
            rows={6}
            placeholder="Enter text here"
            variant="filled"
            fullWidth
            value={remarks}
            onChange={handleRemarksChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionDialogCancel} sx={{ color: '#ffffff' }}>Cancel</Button>
          <Button onClick={handleActionDialogYes} autoFocus sx={{ color: '#ffffff' }} variant="contained">{remarksType}</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const handleActionClick = (selectedAction, id) => {
    console.log("handleActionClick", selectedAction, id);
    if (selectedAction === "Accept") {
      handleStatusChange(id, actions[selectedAction]);
    } else if (selectedAction === "Close" || selectedAction === "Resolve") {
      setCellEdit(id);
      setRemarksAlert(true);
      setRemarksType(selectedAction);
    }
  }

  const [dialogState, setDialogState] = useState({
    dialogOpen: false,
    vertical: "top",
    horizontal: "center",
    params: null,
  });

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="right" ref={ref} {...props} />;
  });

  const handleCloseDialog = () => {
    setDialogState({ ...dialogState, dialogOpen: false, params: null });
  };

  const handleOpenDialog = (params) => {
    // console.log(params.license_number);
    ModelsService.getRTAData(params.license_number)
    .then(({ data }) => {
      const rtaData = data?.data?.RTAddress
        ? data?.data?.RTAddress.length > 0 && data?.data?.RTAddress[0]
        : data?.data;

      if (!rtaData ||
        (rtaData.Owner_Name === "NA" &&
          rtaData.Address === "NA" &&
          rtaData.Phone_No === "NA" &&
          rtaData.EmailId === "NA" &&
          rtaData.Model_Desc === "NA" &&
          rtaData.Maker_Name === "NA" &&
          rtaData.Color === "NA"&&
          rtaData.Valid_Upto=== "NA"&&
          rtaData.Insurance_validity==="NA"
           )) {
        throw new Error("Data not fetched");
      }

      params.rta_details = {
        Regn_No : params.license_number ,
        // Regn_No : params.license_number,
        Owner_Name: rtaData.Owner_Name || 'NA',
        Address: rtaData.Address || 'NA',
        EmailId: rtaData.EmailId || 'NA',
        Phone_No: rtaData.Phone_No || 'NA',
        Maker_Name: rtaData.Maker_Name || 'NA',
        Model_Desc: rtaData.Model_Desc || 'NA',
        VehicleType: rtaData.VehicleType || 'NA',
        Color : rtaData.Color || 'NA'
      }
      setDialogState({ ...dialogState, dialogOpen: true, params: params });
    })
    .catch((error) => {
      console.error("Error fetching owner details:", error);
      if (error.message === "Data not fetched") {
        setAlertStatus("Failed to fetch ", true, "error");
      }
    });
  };

  const renderRTAMismatchDialogue = () => {
    return (
      <Dialog
        open
        onClose={handleCloseDialog}
        fullScreen
        TransitionComponent={Transition}
      >
        <Box sx={{ width: "100%", border: "none" }}>
          <AppBar
            sx={{
              backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
              border: `1px solid ${theme.palette.mode === "light"
                ? "#707070"
                : "#404145 !important"
                }, opacity: 1 `,
              display: 'flex',
              padding: '5px',
            }}
            className={classes.popupTitle}
            position="static"
          >
            <div className={classes.titleCls} style={{ display: 'flex' }}>
              Detail View
              <div className={classes.closeCls} style={{ marginLeft: '4px' }}>
                <CloseOutlined onClick={handleCloseDialog} />
              </div>
            </div>
          </AppBar>
          <Grid
            container
            spacing={1}
            columnSpacing={{ xs: 1, sm: 1, md: 2 }}
            sx={{ padding: "0px 18px 0px 13px", marginTop: '5px' }}
          >
            {dialogState && dialogState.params ? 
            <>
            <Grid item xs={6} sx={{ marginTop: '35px', height: '400px' }}>
              <Box sx={{ width: "100%", height: "100%", backgroundColor: "#00000082", borderRadius: 1, border: '2px solid #0f0f0f4f', overflow: 'hidden'}}>
                <AppBar
                  sx={{
                    backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
                    border: `1px solid ${theme.palette.mode === "light"
                      ? "#707070"
                      : "#404145 !important"
                      }, opacity: 1 `,
                      padding: '10px',
                      marginBottom: '4px',
                    display: 'flex'
                  }}
                  position="static"
                >
                  <div className={classes.titleCls} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Camera Image</Typography>
                  </div>
                </AppBar>
                <Box sx={{ margin: '5px', padding: '10px', width: '100%', height: "320px",  display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                  <img
                    alt="Image Not Available"
                    src={`${dialogState.params?.full_64_image}`}
                    srcSet={`${dialogState.params?.full_64_image}`}
                    style={{ width: "96%", maxHeight: "320px", objectFit: "contain" }}
                    loading="lazy"
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sx={{ marginTop: '35px', height: '400px' }}>
              <Box sx={{ width: "100%", height: "100%", backgroundColor: "#00000082",borderRadius: 1, border: '2px solid #0f0f0f4f', overflow: 'hidden'}}>
                <AppBar
                  sx={{
                    backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
                    border: `1px solid ${theme.palette.mode === "light"
                      ? "#707070"
                      : "#404145 !important"
                      }, opacity: 1 `,
                      padding: '10px',
                      marginBottom: '4px',
                    display: 'flex'
                  }}
                  position="static"
                >
                  <div className={classes.titleCls} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>License Plate Image</Typography>
                  </div>
                </AppBar>
                <Box sx={{ margin: '5px', padding: '10px', width: '100%', height: "320px",  display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                  <img
                    alt="License Number Image Not Available"
                    src={`${dialogState.params?.crop_64_image}`}
                    srcSet={`${dialogState.params?.crop_64_image}`}
                    style={{ width: "96%", maxHeight: "320px", objectFit: "contain" }}
                    loading="lazy"
                  />
                </Box>
              </Box>
            </Grid>
            {/* <Grid item xs={6} sx={{ marginTop: '40px', height: '400px' }}>
              <Box sx={{ width: "100%", height: "100%", backgroundColor: "#00000082", borderRadius: 1, border: '2px solid #0f0f0f4f'}}>
                <AppBar
                  sx={{
                    backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
                    border: `1px solid ${theme.palette.mode === "light"
                      ? "#707070"
                      : "#404145 !important"
                      }, opacity: 1 `,
                      padding: '10px',
                      marginBottom: '4px',
                    display: 'flex'
                  }}
                  position="static"
                >
                  <div className={classes.titleCls} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>ANPR Data - ANPR System</Typography>
                  </div>
                </AppBar>
                <Box sx={{ margin: '5px', padding: '10px' }}>
                  {[
                    { label: "Registration Number", value: dialogState.params.rta_details.Regn_No, match: true },
                    { label: "Vehicle Make", value: dialogState.params.rta_details.Maker_Name, match: true },
                    { label: "Vehicle Model", value: 'Re Compact Diesel BSVI', match: false },
                    { label: "Vehicle Type", value: dialogState.params.rta_details.VehicleType, match: true },
                    { label: "Vehicle Color", value: 'Green', match: false },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: '5px' }}>
                      <Typography variant="body1" sx={{ alignSelf: 'start', width: '30%' }}>{item.label}&nbsp;
                        {!item.match && <ErrorOutlineIcon sx={{ color: 'red', fontSize: 'medium' }} />}
                      </Typography>
                      <Typography variant="body1" sx={{ flex: 1 }}>:  {item.value}</Typography>
                      {!item.match && (
                        <Box sx={{ alignSelf: 'start', display: 'flex', alignItems: 'center', width: '15%', justifyContent: 'right' }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'red', marginRight: '4px' }}>Mismatched</Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid> */}
            <Grid item xs={12} sx={{ marginTop: '40px', height: '400px' }}>
              <Box sx={{ width: "100%", height: "100%", backgroundColor: "#00000082", borderRadius: 1, border: '2px solid #0f0f0f4f'}}>
                <AppBar
                  sx={{
                    backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
                    border: `1px solid ${theme.palette.mode === "light"
                      ? "#707070"
                      : "#404145 !important"
                      }, opacity: 1 `,
                      padding: '10px',
                      marginBottom: '4px',
                    display: 'flex'
                  }}
                  position="static"
                >
                  <div className={classes.titleCls} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Vehicle Details - RTA/RTO Database</Typography>
                  </div>
                </AppBar>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '5px', alignItems: 'center', margin: '5px', padding: '10px'  }}>
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Registration Number</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Regn_No}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Vehicle Make</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Maker_Name}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Vehicle Model</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Model_Desc}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Vehicle Type</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.VehicleType}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Vehicle Color</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Color}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Owner Name</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Owner_Name}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Owner Address</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Address}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Email</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.EmailId}</Typography>
                  
                  <Typography variant="body1" sx={{ alignSelf: 'start' }}>Phone Number</Typography>
                  <Typography variant="body1">:  {dialogState.params.rta_details.Phone_No}</Typography>
                </Box>
              </Box>
            </Grid>
          </>
              : null}
          </Grid>
          
        </Box>
      </Dialog>
    )
  }

  const sendEchallan = (params) => {
    let obj = {
      vehicle_number: params.vehicle_number,
      camera_id: 'C10',
      speed_limit: 40,
      timestamp: new Date(),
      camera1_image: params.image,
      camera1_location: params.lat,
      camera2_location: params.lon,
      event_time1: params.created_on
    };
    console.log("--obj--", obj);
    AverageSpeedService.generateEchallan(obj)
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data) {
            setAlertStatus("ECHALLAN Sent Successfully", true, "success");
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
  }

  const ConfirmDialog = (params) => {
    return (
      <PopupState variant="popover" popupId="demo-popup-popover">
        {(popupState) => (
          <div>
            <CheckIcon {...bindTrigger(popupState)} />
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
                Are you sure Acknowledge.?
              </Typography>
              <Button
                sx={{ ml: 2, mb: 1 }}
                variant="outlined"
                size="small"
                onClick={() => popupState.close()}
              >
                Cancel
              </Button>
              <Button
                sx={{ ml: 2, mb: 1 }}
                variant="contained"
                size="small"
                onClick={() => handleAcknowledge(popupState, params.data.row)}
              >
                Acknowledge
              </Button>
            </Popover>
          </div>
        )}
      </PopupState>
    );
  };

  const handleAcknowledge = (popupState, params) => {
    const id = params.id || params.alert_id;
    console.log('para', params);
    const notification_params = {
      // "f_notify_msg_content": "New Incident has been received",
      // "f_incident_id": id,
      // "f_metadata": {}
      "long": "78.3690818",
      "description": `${params.model}Application`,
      "incident_id": params.alias_id,
      "incidentSource": params.model,
      "incidentSubTypeId": 305,
      "incidentTypeId": 68,
      "isSOS": true,
      "lat": "17.4525694",
      "phoneNumber": "8885152297",
      "requesterName": "Bezawada Surekha",
      "severity": "1",
      "status_id": "2",
      "userId": "387"
    };

    AlertsService.sendServiceNotification(notification_params).then((res) => {
      if (res.status === 200) {
        setAlertStatus("Notification Sent Successfully", true, "success");
      }
    }).catch((err) => {
      setAlertStatus("Sent Notification Failed", false, "error");
      console.log("handleAcknowledge", err);
    });
    // AlertsService.acknowledgeAlert(id)
    //   .then((res) => {
    //     if (res.status === 200) {
    //       if (popupState) {
    //         popupState.close();
    //       }
    //       setAlertStatus("Acknowledge Successfully", true, "success");
    //       setDataGridData();
    //     }
    //   })
    //   .catch((err) => {
    //     setAlertStatus("Acknowledge Failed", false, "error");
    //     console.log("handleAcknowledge", err);
    //   });
  };

  function setCamMapData(currentPage, size) {
    const pageNum = currentPage || 1;
    const pageLimit = size || 10;

    const payload = {
      page: pageNum,
      perpage: pageLimit
    };

    LiveSystemService.getCameraAnalysisData(payload)
      .then((response) => {
        if (response) {
          const { data } = response;
          let configured_data = configuredData(data, null);
          let MapData = configured_data.violationsMapData;
          let layerlist = [];
          console.log('response', MapData);

          if (MapData.features.length > 0) {
            layerlist.push(
              Object.assign({}, Layer, {
                LayerTitle: "cc-cameras",
                LayerType: "Vector",
                Source: MapData,
                SourceType: "GeoJSON",
                Popup: "Yes",
                MouseHover: "Yes",
                ZoomToLayer: "Yes",
                Style: { type: "image", source: "/assets/images/cc_cam.svg" },
                PopupData: [],
                PopupDataFields: [],
                LayerProjection: "EPSG:4326",
                styleColor: "blue",
                styleRadius: 1,
                scale: 0.5,
                styleFillColor: "green",
              })
            );
          }
          setState({
            ...state,
            data: data,
          });
          console.log('layerlist', layerlist);
          setLayerList(layerlist);
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
  }

  function setDataGridData(currentPage, size) {
    showLoader();
    const pageNum = currentPage || 1;
    const pageLimit = size || 10;

    const payload = {
      page: pageNum,
      perpage: 100
    };
    //AlertsService.get360Alerts(payload)
    //   .then((response) => {
    //     if (response) {
    //       const { data } = response;
    //       if (data && data.data) {
    //       //  hideLoader();
    //         let eventInfo = data.data;
    //         // eventInfo.forEach((rec, index) => (rec.id = index + 1));

    //         if (eventInfo && eventInfo.length) {
    //           let data = eventInfo;
    //           // setDataForImages(data, pageLimit, pageNum);
    //          setDataForCropImages(data, pageLimit, pageNum);
    //          // setDataGridRows(data);

    //         }
    //       }
    //     }
    //     hideLoader();
    //   })
    //   //data_Set -> 'cropped_image_filename' AS cropped_image
    //   .catch((err) => {
    //     console.log("setDataGrid error", err);
    //     hideLoader();
    //   });
    AlertsService.gethotlistAlerts(payload)
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data && data.data) {
            //  hideLoader();
            let eventInfo = data.data;
            // eventInfo.forEach((rec, index) => (rec.id = index + 1));
            eventInfo.forEach((rec) => {
              if (!rec.status) {
                rec.status = "New";
              }
              if(!rec.remarks) {
                rec.remarks = "";
              }
              if(!rec.color) {
                rec.remarks = "-NA-";
              }
            });
            console.log('eventInfo', eventInfo);

            if (eventInfo && eventInfo.length) {
              let data = eventInfo;
              // setDataForImages(data, pageLimit, pageNum);
              setDataForCropImages(data, pageLimit, pageNum);
              const sortedData = data.slice().sort((a, b) => a.event_id - b.event_id);
              setDataForMap(sortedData);
              // setDataGridRows(data);

            }
          }
        }
        hideLoader();
      })
      //data_Set -> 'cropped_image_filename' AS cropped_image
      .catch((err) => {
        console.log("setDataGrid error", err);
        hideLoader();
      });
  }

  async function setDataForCropImages(dataRows, pgSize, pgIdx) {
    // const perOptionsDiff = pgIdx > 0 ? pgSize : pgIdx;
    // const dataRows = data.slice(perOptionsDiff, pgSize + perOptionsDiff);


    try {
      if (dataRows.length) {
        let arr = [];
        for (const [i, v] of dataRows.entries()) {
          //Handled last iteration
          if (i === dataRows.length) {
            continue;
          }
          dataRows[i].id = i + 1;
          // console.log('----------------------', i, v)

          let date = moment(v.date_time).format("DD-MM-YYYY");

          await AlertsService.getImageOfAlert(v.cropped_image, date, v.model_name).then((res) => {
            hideLoader();
            const { data } = res;
            if (data && data.image_base64) {
              const clone_rec = Object.assign({}, v);
              clone_rec.crop_64_image = `data:image/jpeg;base64,${data.image_base64}`;
              // clone_rec.id = i + 1;
              arr.push(clone_rec);
              dataRows[i].crop_64_image = clone_rec.crop_64_image;
            }
          }).catch((e) => { console.log(e) });
        }
        if (arr.length) {
          hideLoader();
          await setFullImage(dataRows[0]);
          await setDataGridRows(dataRows);
        } else {
          hideLoader();
          await setDataGridRows(dataRows);
        }
      }
    }
    catch (e) {
      hideLoader();
      console.log(e);
      // if (dataRows.length) {
      //   dataRows.forEach((rec, idx) => rec.id = idx + 1);
      //   setDataGridRows(dataRows);
      // }
    }
  }

  // function setDataForImages(dataRows, pgSize, pgIdx) {
  //   // const perOptionsDiff = pgIdx > 0 ? pgSize : pgIdx;
  //   // const dataRows = data.slice(perOptionsDiff, pgSize + perOptionsDiff);
  //   const arr = [];

  //   const limit = pgSize ? pgSize : 10;
  //   const idx = pgIdx ? ((pgIdx - 1) * limit) : 0;

  //   const rows = dataRows.slice(idx, limit - 1)

  //   console.log('kkl', dataRows, rows, idx, pgIdx, pgSize, limit);

  //   if (dataRows.length) {
  //     for (const [i, v] of rows.entries()) {
  //       //Handled last iteration
  //       // if (i === dataRows.length - 1) {
  //       //   continue;
  //       // }
  //       AlertsService.getImageOfAlert(v.image, v.date, v.model).then((res) => {
  //         const { data } = res;
  //         if (data && data.image_base64) {
  //           const clone_rec = Object.assign({}, v);
  //           clone_rec.image = `data:image/jpeg;base64,${data.image_base64}`;
  //           arr.push(clone_rec);
  //           // console.log('setDataForImages kkl', rows.length, arr);
  //           // if (arr.length === dataRows.length - 1) {
  //           //console.log('kkl', data, 'arr', arr);
  //           //setDataGridRows(arr);
  //           // }
  //         }
  //       });
  //     }
  //     console.log('arr', arr);
  //     setDataPageSizeRows(arr);
  //   }
  // }

  async function setFullImage(record) {
    record.date = moment(record.date_time).format('DD-MM-YYYY');

    if (record) {
      await AlertsService.getImageOfAlert(record.full_image, record.date, record.model_name).then((res) => {
        const { data } = res;
        if (data && data.image_base64) {
          record.full_64_image = `data:image/jpeg;base64,${data.image_base64}`;
        }
      })
      .catch((err) => console.log("get Image", err));
    }
    console.log('record1', record);
    setDataPageSizeRows([record]);
  }

  useEffect(() => {
    CameraService.getCamerasList()
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data && data.data) {
            const cameras_data = data.data.map((elem, index) => {
              const opt = _.merge(elem.camera_information, elem.model_settings);
              return opt;
            });
            setCameraList(cameras_data);
          }
        }
      })
      .catch((err) => console.log("getCameras", err));
    setCamMapData();
    setDataGridData();

    themeSubjectService.getThemeSubject().subscribe((mode) => {
      mode === "light"
        ? setThemeUrl(
          "http://10.66.40.86:5101/styles/osm-bright/{z}/{x}/{y}.png"
        )
        : setThemeUrl(
          // "http://136.233.45.154:6301/map/tile/{z}/{x}/{y}.png"
          "http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        );
    });
  }, []);

  const setAlertStatus = (content, status, severity) => {
    setAlertState({
      ...alertstate,
      alertOpen: status,
      alertContent: content,
      severity: severity,
    });
  };
  const { alertOpen, vertical, horizontal, alertContent, severity } =
    alertstate;

  const [maximizedImage, setMaximizedImage] = useState(null);

  const handleMaximize = (image) => {
    setMaximizedImage(image);
  };

  const [dataForMap, setDataForMap] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [filteredDataForMap, setFilteredDataForMap] = useState([]);

  const handleClose = () => {
    setMaximizedImage(null);
  };

  useEffect(() => {

    if (filteredDataForMap.length !== 0) {
      setFullImage(filteredDataForMap[0])
      const selectedRowInFilteredData = filteredDataForMap.some(row => row.id === selectedRowId);
      if (!selectedRowId || !selectedRowInFilteredData) {
        setSelectedRowId(filteredDataForMap[0].id);
      }
    } 
    else if (dataGridRows.length !== 0) {
      setFullImage(dataGridRows[0]);
      setSelectedRowId(dataGridRows[0].id);
    }
    
  }, [pageSize, filteredDataForMap]);

  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({
    color: false,
    junction: false
  });

  const [eventsToClose, setEventsToClose] = useState([]);

  const handleCloseAllEvents = () => {
    const startIndex = currentPgIdx * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageRows = (filteredDataForMap.length !== 0 ? filteredDataForMap : dataGridRows).slice(startIndex, endIndex);
    setEventsToClose(currentPageRows);
    setCellEdit(currentPageRows.map(row => row.id));
    setRemarksAlert(true);
    setRemarksType("Close");
  }


  return (
    local_anpr_user('activity_info', 'activity_name', '360Alerts') ? (
      <Fragment>
        <Grid container
          direction="row"
          justifyContent="space-evenly"
          spacing={0.5}>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={alertOpen}
            autoHideDuration={2000}
            onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
          >
            <Alert
              onClose={() => setAlertState({ ...alertstate, alertOpen: false })}
              severity={severity}
            >
              {alertContent}
            </Alert>
          </Snackbar>
          <Grid item xs={12}>
            {loader}
            <Card variant="outlined" className={classes.card}>
              <CardContent
                component="div"
                className={[classes.dataGridCpd, classes.root]}
              >
                <DataGrid
                  columns={columns}
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                  }
                 // checkboxSelection
                  disableDensitySelector={true}
                  //disableColumnSelector={true}
                  //disableColumnFilter={true}
                  disableColumnMenu={true}
                  className={classes.dataGridCls}
                  pageSize={pageSize}
                  getRowId={(row) => row.id}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                  }}
                  rows={filteredDataForMap.length !== 0 ? filteredDataForMap : dataGridRows}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  rowHeight={45}
                  headerHeight={40}
                  components={{
                    Toolbar: CustomToolbar,
                  }}
                  componentsProps={{ toolbar: { dataGridRows: filteredDataForMap.length !== 0 ? filteredDataForMap : dataGridRows, columns: columns.filter(col => columnVisibilityModel[col.field] !== false), handleCloseAllEvents: handleCloseAllEvents, pageSize, currentPgIdx } }}
                  getCellClassName={(params) => classes.cellsCls}
                  onRowClick={(selectedItem) => {
                    setFullImage(selectedItem.row);
                    setSelectedRowId(selectedItem.row.id);
                    setLocationDataMap(selectedItem.row.event_id)
                  }}
                  onPageChange={(currentPageIdx) => {

                    //console.log('currentPageIdx kkl', currentPageIdx)
                    setCurrentPgIdx(currentPageIdx);
                    //setDataGridData(currentPageIdx, pageSize);
                    // setCamMapData(currentPageIdx, pageSize);
                    // setDataForImages(dataGridRows, pageSize, currentPageIdx);
                  }}
                  selectionModel={selectedRowId ? [selectedRowId] : []}
                // onEditRowsModelChange={(val) => {console.log('val',val);}}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined" className={classes.card}>
              <CardContent
                component="div"
                className={(classes.cpd, classes.cameraFramesSection)}
              >
                <MapAlert data={dataForMap} event_id={locationDataMap} camerasData={cameraList} setFilteredDataRows={setFilteredDataForMap} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined" className={classes.card}>
              <CardContent
                component="div"
                className={classes.cameraFramesSection}
              >
                <ImageList className={classes.imageListCLs} cols={1}>
                  {dataPageSizeRows &&
                    dataPageSizeRows.length ? dataPageSizeRows.map((rec, index) => (
                      <ImageListItem
                        key={"alertimg" + index}
                        className={classes.imageListItemCls}
                      >
                        <img
                          sx={{ border: "202124", width: 'auto' }}
                          src={`${rec?.full_64_image}`}
                          srcSet={`${rec?.full_64_image}`}
                          alt={"Image Not Available"}
                          loading="lazy"
                        />
                        <ImageListItemBar
                          className={classes.itemListItemBar}
                          title={`ID: ${rec?.license_number}`}
                          position="top"
                          actionIcon={
                            <div>
                              <Tooltip
                              title="View RTA Details"
                              placement="bottom"
                              sx={{ backgroundColor: "black", color: "white" }}
                            >
                              <IconButton
                                sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                                aria-label={`info about`}
                                onClick={() => handleOpenDialog(rec)}
                              >
                                <OpenInFullIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title="Full Image"
                              placement="bottom"
                              sx={{ backgroundColor: "black", color: "white" }}
                            >
                              <IconButton
                                sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                                aria-label={`info about`}
                                onClick={() => handleMaximize(rec.full_64_image)}
                              >
                                <CropOriginalIcon />
                              </IconButton>
                            </Tooltip>
                            </div>
                            // <Tooltip
                            //   title="Full Image"
                            //   placement="bottom"
                            //   sx={{ backgroundColor: "black", color: "white" }}
                            // >
                            //   <IconButton
                            //     sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                            //     aria-label={`info about`}
                            //     onClick={() => handleMaximize(rec.full_64_image)}
                            //   >
                            //     <CropOriginalIcon />
                            //   </IconButton>
                            // </Tooltip>
                          }
                        />
                        <ImageListItemBar
                          className={classes.itemListItemBar}
                          title={`${rec?.model?.toString()}`}
                          position="bottom"
                        />
                      </ImageListItem>
                    )) : null}
                </ImageList>
                {maximizedImage && (
                  <AppBar position="fixed">
                    <Dialog open={true} onClose={handleClose}
                      sx={{
                        "& .MuiDialog-container": {
                          "& .MuiPaper-root": {
                            width: "100%",
                            maxWidth: "1200px",
                          },
                        },
                      }}
                    >
                      <img src={maximizedImage} alt="Image Not Available" />
                      <IconButton
                        sx={{ position: "absolute", top: 0, right: 0 }}
                        onClick={handleClose}>
                        <CloseIcon />
                      </IconButton>
                    </Dialog>
                  </AppBar>
                )}
                {licenseAlert && renderAlertDialog()}
                {remarksAlert && renderRemarksDialog()}
                {dialogState.dialogOpen && renderRTAMismatchDialogue()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <HotlistTrack
          open={open}
          rowsParams={rowsParams}
          setOpen={setOpen} 
          camerasData={cameraList}
        ></HotlistTrack>
      </Fragment>) : (
      <Grid>
        <NoAccess />
      </Grid>
    )
  );
};

export default Alerts360Degree;