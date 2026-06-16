import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import VideocamIcon from "@mui/icons-material/Videocam";
import React, { useEffect, useState } from "react";
import CamerasSettingsView from "./cameras_settings_view";
import ModelSelection from "./model_selection";
import RulesSettings from "./rules_settings";
import { Box } from "@mui/system";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiDataGrid-root": {
      fontSize: "12px !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#313131 !important",
    },
  },
  camListContent: {
    marginLeft: "2.5rem",
    marginBottom: "1.5rem",
    minWidth: "17.5rem",
    borderRadius: "1rem",
    backgroundColor: theme.palette.primary.compHeader,
    // [theme.breakpoints.between(750, 1400)]: {
    //   minHeight: "25rem",
    //   maxHeight: "25rem",
    // },
    // [theme.breakpoints.up(1401)]: {
    //   minHeight: "34rem",
    //   maxHeight: "34rem",
    // },
  },
  header: {
    margin: "0 auto",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    textAlign: "center",
    padding: "0.78rem",
    borderBottom: "2px solid #868686",
    fontSize: "15px",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.primary.listContent,
  },
}));

const SettingsMain = (props) => {
  const classes = useStyles();
  let clone_obj = Object.assign({}, props.obj);
  const [camList, setCamList] = useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [selectedModelsList, setSelectedModelsList] = React.useState([]);

  const handleListItemClick = (event, index) => {
    if (camList.length) {
      clone_obj.camera_id = camList[index].id;
      clone_obj.ip_address = camList[index].camera_ip;
    }
    setSelectedIndex(index);
    if (typeof props.setObjData === "function") {
      return props.setObjData(clone_obj);
    }
  };

  useEffect(() => {
    console.log("props ----");
    if (props.camerasList && props.camerasList.length) {
      // console.log('props camerasList', props.camerasList);
      setCamList(props.camerasList);
      setSelectedModelsList(
        Array.from({ length: props.camerasList.length }).reduce(
          (acc, _, index) => {
            acc[index] = [];
            return acc;
          },
          {}
        )
      );
      let clone_obj = Object.assign({}, props.objList[selectedIndex]);
      clone_obj.camera_id = props.camerasList[0].id;
      clone_obj.ip_address = props.camerasList[0].camera_ip;
      var newObjList = [...props.objList];
      newObjList[props.selectedIndex] = clone_obj;
      props.setObjList(newObjList);
      // if(!selectedIndex){
      //   let clone_obj = Object.assign({}, props.obj);
      //   clone_obj.camera_id = props.camerasList[0].id;
      //   clone_obj.ip_address = props.camerasList[0].camera_ip;
      //   setSelectedIndex(0);
      //   if (typeof props.setObjData === "function") {
      //     return props.setObjData(clone_obj);
      //   }
      // }
    }
  }, [props.camerasList]);

  return (
    <div container>
      <div
        className="row"
        style={{
          display: "flex",
        }}
      >
        <div
          className={`col-md-6 ${classes.camListContent}`}
          style={{
            height: `${Math.min(camList.length * 50 + 70, 544)}px`, // 50px per item + 70px header
            maxHeight: "34rem",
            overflowY: "auto",
          }}
        >
          <div className={classes.header}>Cameras List</div>
          <div container>
            <Box sx={{ width: "100%", maxWidth: 360 }}>
              <List component="nav">
                {camList &&
                  camList.map((rec, index) => (
                    <ListItemButton
                      selected={selectedIndex === index}
                      onClick={(event) => handleListItemClick(event, index)}
                    >
                      <ListItemIcon>
                        <VideocamIcon sx={{ color: "white" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${rec?.camera_name} - ${rec?.camera_ip}`}
                        primaryTypographyProps={{ style: { color: "#FFFFFF" } }}
                      />
                    </ListItemButton>
                  ))}
              </List>
            </Box>
          </div>
        </div>
        <div className="col-md-6" style={{ width: "100%", marginLeft: 25 }}>
          {props.activeStep === 1 ? (
            <ModelSelection
              modelsData={props.modelsData}
              modelsGroup={props.modelsGroup}
              camerasList={props.camerasList}
              obj={props.obj}
              setData={props.setObjData}
              selectedModelsList={selectedModelsList}
              setSelectedModels={(index, value) => {
                setSelectedModelsList((prevState) => ({
                  ...prevState,
                  [index]: value,
                }));
              }}
              objList={props.objList}
              setObjList={(list) => props.setObjList(list)}
              selectedIndex={selectedIndex}
            />
          ) : props.activeStep === 2 ? (
            <CamerasSettingsView
              camerasList={props.camerasList}
              obj={props.obj}
              modelsData={props.modelsData}
              setData={props.setObjData}
              selectedModelsList={selectedModelsList}
              cameraSettingsParams={props.cameraSettingsParams}
              objList={props.objList}
              setObjList={(list) => props.setObjList(list)}
              selectedIndex={selectedIndex}
            />
          ) : (
            <RulesSettings
              camerasList={props.camerasList}
              obj={props.obj}
              setData={props.setObjData}
              objList={props.objList}
              setObjList={(list) => props.setObjList(list)}
              selectedIndex={selectedIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsMain;
