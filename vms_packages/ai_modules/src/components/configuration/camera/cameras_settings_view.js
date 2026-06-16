import { Grid, Tab, Tabs } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import CameraSettings from "./camera_settings";
import CameraSettingsAngle from "./camera_settings_angle";
import CameraSettingsCoverage from "./camera_settings_coverage";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDataGrid-root": {
      fontSize: "12px !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important"
    },
  },
  selectedTabView: {
    backgroundColor: theme.palette?.primary?.activeTab,
    color: `${theme.palette?.text?.secondary} !important`,
    minHeight: "48px !important",
    minWidth: "145px !important",
  },
  boxRoot: {
    justifyContent: "center",
    display: "flex",
    backgroundColor: theme.palette?.primary?.compHeader,
  },
}));

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      style={{ width: "100%" }}
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Grid sx={{ p: 3, width: "100%" }}>{children}</Grid>}
    </div>
  );
}

const CamerasSettingsView = (props) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Grid container>
      <Grid
        className={classes.boxRoot}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: "100%",
        }}
      >
        <Tabs
          indicatorColor="primary"
          selectionFollowsFocus
          value={value}
          onChange={handleChange}
          className={classes.tabsView}
          aria-label="basic tabs example"
        >
          <Tab
            classes={{ selected: classes.selectedTabView }}
            label="Coverage"
            {...a11yProps(0)}
          />
          <Tab
            classes={{ selected: classes.selectedTabView }}
            label="Angle"
            {...a11yProps(1)}
          />
          <Tab
            classes={{ selected: classes.selectedTabView }}
            label="Settings"
            disabled
            {...a11yProps(2)}
          />
        </Tabs>
      </Grid>
      <TabPanel sx={{ width: "100%" }} value={value} index={0}>
        <CameraSettingsCoverage
          camerasList={props.camerasList}
          obj={props.obj}
          setData={props.setData}
          selectedModelsList={props.selectedModelsList}
          cameraSettingsParams={props.cameraSettingsParams}
          objList={props.objList}
          setObjList={(list) => props.setObjList(list)}
          selectedIndex={props.selectedIndex}
        />
      </TabPanel>
      <TabPanel sx={{ width: "100%" }} value={value} index={1}>
        <CameraSettingsAngle
          camerasList={props.camerasList}
          obj={props.obj}
          setData={props.setData}
          selectedModelsList={props.selectedModelsList}
          cameraSettingsParams={props.cameraSettingsParams}
          objList={props.objList}
          setObjList={(list) => props.setObjList(list)}
          selectedIndex={props.selectedIndex}
        />
      </TabPanel>
      <TabPanel sx={{ width: "100%" }} value={value} index={2}>
        <CameraSettings
          camerasList={props.camerasList}
          obj={props.obj}
          setData={props.setData}
          objList={props.objList}
          setObjList={(list) => props.setObjList(list)}
          selectedIndex={props.selectedIndex}
        />
      </TabPanel>
    </Grid>
  );
};

export default CamerasSettingsView;
