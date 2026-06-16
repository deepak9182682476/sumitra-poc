import React, { useEffect, useState } from "react";
import { Grid, Tab, Tabs } from "@mui/material";
import moment from "moment";

import { makeStyles } from "@mui/styles";
import { tabsMenu } from "../../../config/tabs_constants/rbac_tabs";
import NoAccess from "../../../common/NoAccess";
import { local_anpr_user } from "../../../config/config";

const useStyles = makeStyles((theme) => {
  return {
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
        borderRadius: "5px",
      },
      "& :: -webkit-scrollbar-thumb": {
        borderRadius: "5px",
      },
      fontSize: "0.9rem !important",
    },
    tabsView: {
      minHeight: theme.spacing(5),
      maxHeight: theme.spacing(5),
    },
    tabView: {
      minHeight: theme.spacing(5),
      maxHeight: theme.spacing(5),
      color: `${theme.palette?.text?.primary} !important`,
    },
    tabMenu: {
      backgroundColor: `${theme.palette?.primary?.subHeaderBg} !important`,
      marginBottom: "0.5rem",
      minHeight: theme.spacing(5),
      maxHeight: theme.spacing(5),
    },
    selectedTabView: {
      backgroundColor: theme.palette?.primary?.activeTab,
      color: `${theme.palette?.text?.secondary} !important`,
      minWidth: "120px !important",
      borderBottom: "1px solid #2A8DFF",
      marginBottom: "2px",
    },
    timePanel: {
      width: "230px",
      display: "flex",
      justifyContent: "flex-end",
      paddingRight: "2rem",
      fontSize: "12px",
    },
    container: {
      width: "100%",
    },
  };
});

function a11yProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    "aria-controls": `wrapped-tabpanel-${index}`,
  };
}

const RbacManagement = () => {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(1);
  const [currTime, setCurrTime] = useState(null);

  useEffect(() => {
    var timer = setInterval(
      () =>
        setCurrTime(
          moment().utcOffset("+11:00").format("DD MMMM YYYY hh:mm:ss A")
        ),
      1000
    );
    return function cleanup() {
      clearInterval(timer);
    };
  }, []);

  const handleTabChange = (e, value) => {
    setSelectedTab(value);
  };

  return local_anpr_user(
    "activity_info",
    "activity_name",
    "Rbac Management"
  ) ? (
    <Grid container>
      <Grid
        className={classes.tabMenu}
        container
        justify="space-between"
        alignItems="center"
        sx={{ marginTop: 30 }}
      >
        <Grid container justifyContent="center" alignItems="center" item sm>
          <Tabs
            indicatorColor="primary"
            className={classes.tabsView}
            value={selectedTab}
            onChange={(e, val) => handleTabChange(e, val)}
            aria-label="nav tabs example"
          >
            {tabsMenu.map((tab, index) => {
              return (
                <Tab
                  classes={{ selected: classes.selectedTabView }}
                  className={classes.tabView}
                  key={index}
                  value={tab.id}
                  label={tab.label}
                  {...a11yProps(tab.id)}
                ></Tab>
              );
            })}
          </Tabs>
        </Grid>
        <Grid item className={classes.timePanel}>
          {currTime}
        </Grid>
      </Grid>
      <Grid container>
        {tabsMenu.map((tab, index) => {
          return (
            selectedTab === tab.id && (
              <Grid
                className={classes.container}
                key={index + 1}
                index={index + 1}
                role="tabpanel"
                hidden={tab.id !== selectedTab}
                id={`${tab.label}-tabpanel-${tab.id}`}
              >
                {tab.component}
              </Grid>
            )
          );
        })}
      </Grid>
    </Grid>
  ) : (
    <Grid>
      <NoAccess />
    </Grid>
  );
};

export default RbacManagement;
