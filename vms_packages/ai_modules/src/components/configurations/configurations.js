import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { configurationTabsMenu } from "../../config/tabs_constants/tabs";

const useStyles = makeStyles((theme) => ({
  tabRoot: {
    color: theme?.palette?.primary?.light,
    "&.Mui-selected": {
      background: "#285705",
      color: `${theme?.palette?.primary?.light} !important`,
      fontWeight: "bold",
    },
  },
  tabPanel: {
    background: theme?.palette?.primary?.subHeaderBg,
    color: theme?.palette?.primary?.light,
  },
  tabsRoot: {
    background: theme?.palette?.primary?.subHeaderBg,
  },
}));

const TabPanel = ({ children, value, index }) => {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
};

const Configurations = () => {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ mt: 6, height: "105vh", ml: -3 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="configuration tabs"
        TabIndicatorProps={{
          style: { backgroundColor: "#E5881E" },
        }}
        centered
        className={classes.tabsRoot}
      >
        {configurationTabsMenu.map((tab, index) => (
          <Tab
            key={tab.id}
            label={tab.label}
            classes={{ root: classes.tabRoot }}
          />
        ))}
      </Tabs>

      {configurationTabsMenu.map((tab, index) => (
        <TabPanel key={tab.id} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default Configurations;
