import moment from "moment";

export const defaultTableOptions = {
  filterType: "multiselect",
  selectableRows: "none",
  draggableColumns: {
    enabled: true,
    transitionTime: 250,
  },
  print: false,
  downloadOptions: {
    filename: `${moment(new Date()).format("DD-MM-YYYY hh:mm A")}.csv`,
    filterOptions: {
      useDisplayedColumnsOnly: true,
      useDisplayedRowsOnly: true,
    },
  },
};

export const defaultColumnOptions = {
  filterType: "multiselect",
  draggable: true,
};