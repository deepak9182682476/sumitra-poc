import { createTheme } from "@mui/material";

export const dark = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    type: "dark",
    mode: "dark",
    commomn: {
      black: "#000",
      white: "#fff",
    },
    primary: {
      main: "#3275E9",
      light: "#e3f2fd",
      dark: "#42a5f5",
      dropDwnBgColor: "#3C3D40",
      appBarBg: "#242424",
      contrastText: "rgba(0,0, 0, 0.87)",
      subHeaderBg: "#141414",
      cardBg: "#202124",
      borderLive: "#FFFFFF80",
      title: "#A1A1A1",
      compHeader: "#0C3858",
      alertsBg: "#424242",
      activeTab: "#3C3D40",
      accContent: "#e8eaed",
      filledInpt: "#161616",
      listContent: "#1B1B1B",
      highlite: "#F3E273",
      checkedColor: "#e9d452",
    },
    text: {
      fontSize: "13px",
      primary: "#fff",
      secondary: "#FFFFFF",
      disabled: "rgba(255, 255, 255, 0.12)",
      icon: "rgbs(255, 255, 255, 0.5)",
    },
    background: {
      paper: "#3C3D40",
      default: "#3C3D40",
    },
    colors: {
      activeTabBgColor: "#3C3D40",
      timePanel: "#9A9FA4",
    },
  },
  typography: {
    fontFamily: "Montserrat",
    button: {
      fontSize: "13px",
    },
  },
  components: {
    MuiGridToolbarContainer: {
      styleOverrides: {
        root: {
          background: "#0C3858 0% 0% no-repeat padding-box",
          opacity: 1,
          color: "#A1A1A1",
          textTransform: "uppercase",
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        input: {
          color: "#fff",
        },
        root: {
          backgroundColor: "#3C3D40",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root": {
            fontSize: "1.3rem !important",
            padding: "5px !important",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "14px !important",
          fontFamily: "Montserrat",
          fontWeight: "normal",
        },
        "& .MuiFilledInput-root": {
          fontSize: "13px !important",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          backgroundColor: "#0000000f !important",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px !important",
          lineHeight: "2em",
          fontFamily: "Montserrat",
          fontWeight: "normal",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        shrink: {
          fontSize: "12px !important",
          lineHeight: "inherit",
          color: "#F3E273",
        },
        root: {
          color: "#FFFFFF",
          fontSize: "14px !important",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "14px !important",
          fontFamily: "Montserrat",
          fontWeight: "normal",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        labelContainer: {
          color: "#fff",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {},
        standardError: {
          backgroundColor: "#c91515 !important",
        },
      },
    },
  },
};

export const light = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    type: "light",
    mode: "light",
    commomn: {
      black: "#000",
      white: "#fff",
    },
    primary: {
      main: "#3275E9",
      light: "",
      dark: "#000",
      dropDwnBgColor: "#FFFFFF",
      appBarBg: "#01204E",
      contrastText: "",
      subHeaderBg: "#F9F9F9",
      cardBg: "#EEF3F8",
      borderLive: "#70707099",
      title: "#000",
      compHeader: "#0C3858",
      alertsBg: "#EEF3F8",
      activeTab: "#2464AC",
      accContent: "#EEF3F8",
      filledInpt: "#F9F9F9",
      listContent: "#EEF3F8",
      highlite: "#F3E273",
      checkedColor: "#e9d452",

      header: "#01204E",
      subHeaderFont: "#000000",
      color: "#fff",
      selectBg: "#7070704D",
      borderr: "#00000029",
      subHeaderLanguage: "#222222",
      columnBorder: "#EEF3F8",
      columnOuterBorder: "#70707099",
      boxSelectBord: "#FFFFFF",
      subHeaderOutline: "#707070",
      viewBorder: "#FFFFFF4D",
      videoPlayed: "#FFFFFF",
      mapSpot: "#3D81F5",
      alertBorder: "#2A8DFF",
      filteredAlerts: "#A9A9A9",
      alertSelfBorder: "#70707099",
      alertDateTime: "#000000",
      labelNm: "#CCB209",
    },
    text: {
      font: "normal normal medium 14px/18px Montserrat",
      fontSize: "13px",
      primary: "#000",
      secondary: "#fff",
      disabled: "rgba(0, 0, 0, 0.38)",
      icon: "#000",
      labelFont: "Montserrat regular 10px",
      cameraId: "Roboto medium 13px ",
      subHeaderFonts: "Montserrat medium 16px",
      dateTimeFont: "Montserrat regular 16px",
      liveAlertFont: "Montserrat SemiBold 14px",
      filteredAlertsFont: "Montserrat medium 14px",
      GraphStyleFont: "Segoe UI regular 22px",
    },
    background: {
      paper: "#fff",
      default: "#fff",
    },
    colors: {
      activeTabBgColor: "#3C3D40",
    },
  },
  typography: {
    fontFamily: "Montserrat",
    button: {
      fontSize: "13px",
    },
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {},
        standardError: {
          backgroundColor: "#c91515 !important",
        },
      },
    },
    MuiGridToolbarContainer: {
      styleOverrides: {
        root: {
          background: "#0C3858 0% 0% no-repeat padding-box",
          opacity: 1,
          color: "#FFFFFF",
          textTransform: "uppercase",
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        input: {
          color: "#000",
        },
        root: {
          backgroundColor: "#fff",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#000",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root": {
            fontSize: "1.3rem !important",
            padding: "5px !important",
            color: "#fff !important",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "14px !important",
          fontFamily: "Montserrat",
          fontWeight: "normal",
        },
        "& .MuiFilledInput-root": {
          fontSize: "13px !important",
          fontFamily: "Montserrat",
          fontWeight: "normal",
          backgroundColor: "#0000000f !important",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px !important",
          lineHeight: "2em",
          fontFamily: "Montserrat",
          fontWeight: "normal",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        noOptions: {
          color: "#000",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        shrink: {
          fontSize: "12px !important",
          lineHeight: "inherit",
          color: "#AB9506 !important",
          fontWeight: "bold !important",
        },
        root: {
          color: "#000",
          fontWeight: "bold",
          fontSize: "12px !important",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "14px !important",
          fontFamily: "Montserrat",
          fontWeight: "normal",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        labelContainer: {
          color: "#000",
        },
      },
    },
  },
};

export const lightgreen = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    type: "light",
    mode: "light",
    commomn: {
      black: "#000",
      white: "#fff",
    },
    primary: {
      main: "#4CAF50",
      dark: "#388E3C",
      light: "#FFFFFF",
      subHeaderBg: "#37720B",
      buttonBg: "#37720B",
      dropDwnBgColor: "#E8F5E9",
      appBarBg: "#FFFFFF",
      contrastText: "#fff",
      cardBg: "#CCDCC1",
      borderLive: "#A5D6A7",
      title: "#000000",
      compHeader: "#2E7D32",
      alertsBg: "#C8E6C9",
      activeTab: "#4CAF50",
      accContent: "#E8F5E9",
      filledInpt: "#FFFFFF",
      listContent: "#DCEDC8",
      highlite: "#AED581",
      checkedColor: "#81C784",
      cardContentSidebar: "#CCDCC1",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#000000",
      disabled: "rgba(0, 0, 0, 0.38)",
      icon: "#4CAF50",
      fontSize: "13px",
    },
    background: {
      paper: "#FFFFFF",
      default: "#E8F5E9",
    },
    colors: {
      activeTabBgColor: "#C8E6C9",
      timePanel: "#81C784",
    },
  },
  typography: {
    fontFamily: "Montserrat",
    button: {
      fontSize: "13px",
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#000000",
        },
      },
    },
    // MuiFilledInput: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: "#FFFFFF",
    //     },
    //     input: {
    //       color: "#000000",
    //     },
    //   },
    // },

    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          "&:before": {
            borderBottom: "1px solid #B0BEC5",
          },
          "&:hover:not(.Mui-disabled):before": {
            borderBottom: "1px solid #78909C",
          },
          "&:after": {
            borderBottom: "3px solid #0780FA",
          },
        },
        input: {
          color: "#000000",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-focused": {
            color: "#76670B",
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-selected": {
            color: "#FFFFFF",
            backgroundColor: "#000000",
          },
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#000000",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: "#000000",
        },
        icon: {
          color: "#000000",
        },
      },
    },
  },
};

export const theme = createTheme({
  palette: {
    type: "light",
    mode: "light",
    primary: {
      main: "#1B1B1B",
    },
  },
  typography: {
    fontFamily: "Montserrat",
  },
  overrides: {
    MuiDataGrid: {
      root: {
        display: "contents !important",
      },
      main: {
        display: "contents !important",
      },
    },
    MuiInputBase: {
      root: {
        color: "#fff !important",
      },
    },
    MuiOutlinedInput: {
      root: {
        fontSize: "12px !important",
      },
    },
    MuiFormLabel: {
      root: {
        "&$focused": {
          color: "rgb(245, 188, 66)",
          borderColor: "rgb(245, 188, 66)",
          fontWeight: "bold",
        },
      },
    },
  },
});
