import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { makeStyles, useTheme } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
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
    "& .MuiDataGrid-root": {
      fontSize: "11px !important",
    },
    "&.MuiTypography-root, .MuiDataGrid-main, .MuiTablePagination-root ": {
      fontSize: "11px !important",
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
      top:"-4px"
    },
  }
}));

//MuiDataGrid-main
const columns = [
  {
    field: 'sno',
    headerName: 'S.No',
  },
  {
    field: 'lp',
    headerName: 'License Plate',
  },
  {
    field: 'lno',
    headerName: 'License Number',
  },
  {
    field: 'category',
    headerName: 'Category',
  },
  {
    field: 'date',
    headerName: 'Date',
  },
  {
    field: 'time',
    headerName: 'Time',
  },
  {
    field: 'commissionarate',
    headerName: 'Commissionarate',
  },
  {
    field: 'zone',
    headerName: 'Zone',
  },
  {
    field: 'ps',
    headerName: 'Police Station',
  },
  {
    field: 'junction',
    headerName: 'Junction',
  },
  {
    field: 'location',
    headerName: 'Location',
  },

];
const initialRows = [
  {
    id: 1,
    sno: '1',
    lp: 'HKJHKJ',
    lno: 'KJDKJK',
    category: 'RCK Theft Vehicle',
    date: '12-02-2022',
    time: '12-30-30',
    commissionarate: 'Rachakonda',
    zone: 'L B Nagar',
    ps: 'Vasathipuram',
    junction: 'Panama X Road',
    location: 'Chinthalikunta AN2'
  },

];
export default function HotlistAlertTable() {
  const [rows, setRows] = React.useState(initialRows);
  const [selectedRow, setSelectedRow] = React.useState();
  const classes = useStyles();

  return (
    <div className={classes.root} style={{ height: 180, width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
      />

    </div>
  );
}
