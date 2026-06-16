
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";

import { getLocalStorage } from "../../../utilities/common-util";

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
      height: "2px",
    },

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
      fontSize: "12px",
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
    backgroundColor: "#0D0D0D",
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
    padding: "25px 24px 0px !important",
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
  divmy: {
    paddingLeft: "30px",
    paddingTop:"20px"
  },
  tr:{
    padding:"10px"
  }
}));

const Myaccount = (props) => {
  const classes = useStyles();
  const userAccount = JSON.parse(getLocalStorage("anpr_user"));
  console.log("useraccount+===>", userAccount);
  return (
    <div className={classes.divmy}>
      <table>
        <tr>
          <td>Username :</td>
          <td>{userAccount.userInfo[0].user_name}</td>
        </tr>
        <td></td>
        <tr></tr>
        <tr>
          <td>First name :</td>
          <td>{userAccount.userInfo[0].first_name}</td>
        </tr>
        <td></td>
        <tr></tr>
        <tr>
          <td>Last name :</td>
          <td>{userAccount.userInfo[0].last_name}</td>
        </tr>
        <td></td>
        <tr></tr>
        <tr>
          <td>Gender :</td>
          <td>{userAccount.userInfo[0].gender}</td>
        </tr>
        <td></td>
        <tr></tr>
        <tr>
          <td>Email ID :</td>
          <td>{userAccount.userInfo[0].email_id}</td>
        </tr>
        <td></td>
        <tr></tr>
        <tr>
          <td>Phone number :</td>
          <td>{userAccount.userInfo[0].phone_number}</td>
        </tr>
      </table>
    </div>
  );
};
export default Myaccount;
