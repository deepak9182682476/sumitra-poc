import React, { useEffect, useState } from "react";
import { Grid, Tab, Tabs } from "@mui/material";
import moment from "moment";

import { tabsMenu } from "../../config/tabs_constants/tabs";
import { makeStyles } from "@mui/styles";
import NoAccess from "../../common/NoAccess";
import { local_anpr_user } from "../../config/config";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      fontSize: "0.9rem !important",
    },
    tabsView: {
      minHeight: theme.spacing(4),
      maxHeight: theme.spacing(4),
    },
    tabView: {
      minHeight: theme.spacing(4),
      maxHeight: theme.spacing(4),
      color: `${theme.palette?.text?.primary} !important`,
      fontSize: "14px",
    },
    tabMenu: {
      backgroundColor: `${theme.palette?.primary?.subHeaderBg} !important`,
      marginBottom: "0.3rem",
      minHeight: theme.spacing(4),
      maxHeight: theme.spacing(4),
    },
    selectedTabView: {
      fontSize: "14px",
      fontWeight : "bold",
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

const SubHeader = (props) => {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(1);
  const [currTime, setCurrTime] = useState(null);

  useEffect(() => {
    var timer = setInterval(
      () =>
        setCurrTime(
           moment().utcOffset("+05:30").format("DD MMMM YYYY hh:mm:ss A")
        ),
      1000
    );
    return function cleanup() {
      clearInterval(timer);
    };
  }, []);
  
  useEffect(() => {
    if(props.activeTab){
      setSelectedTab(props.activeTab)
    }
  },[props])

  const handleTabChange = (e, value) => {
    setSelectedTab(value);
  };

  return (
    <Grid container>
      <Grid
        className={classes.tabMenu}
        container
        justify="space-between"
        alignItems="center"
        spacing={0}
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
              if (local_anpr_user('activity_info', 'activity_name', tab.key)) {
                return (
                  <Tab
                    classes={{ selected: classes.selectedTabView }}
                    className={classes.tabView}
                    key={index}
                    value={tab.id}
                    label={tab.label}
                    {...a11yProps(tab.id)}>
                  </Tab>
                );
              }
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
            selectedTab === tab.id ? (
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
              : null
          );
        })}
      </Grid>
    </Grid>
  );
};

export default SubHeader;
