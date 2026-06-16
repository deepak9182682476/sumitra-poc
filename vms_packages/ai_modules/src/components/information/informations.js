import * as React from "react";
import { info_utils } from "../../config/info_config";
import { makeStyles, useTheme } from "@mui/styles";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import crowdDensity from "../../assets/images/info_page/CrowdDensity.svg";
import trafficCongestion from "../../assets/images/info_page/Traffic_Congestion.svg";
import digitalFencing from "../../assets/images/info_page/Digital_Fencing.svg";
import queueCount from "../../assets/images/info_page/Queue_Count.svg";
import ppeKit from "../../assets/images/info_page/PPE_Kit.svg";
import cardBg from "../../assets/images/info_page/Card.png";
import latencyIcon from "../../assets/images/info_page/Latency_Icon.svg";
import accuracy from "../../assets/images/info_page/Accuracy_Icon.svg";
import gpuUsed from "../../assets/images/info_page/GPU_Icon.svg";
import datasetSize from "../../assets/images/info_page/GPU_Icon.svg";
import techStackIcon from "../../assets/images/info_page/Teck_Stack_Icon.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "75vh",
    width: "81vw",
    marginLeft: "-1px",
    fontSize: "0.9rem !important",
    marginTop: "40px",
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
  },
  cpd: {
    padding: "0px !important",
  },
  card: {
    backgroundImage: `url(${cardBg})`,
    backgroundSize: "cover",
    width: "100%",
    height: "30vh",
    borderRadius: "18px",
    boxShadow: "none !important",
  },
  imageBackground: {
    position: "relative",
    width: "100%",
    height: "70px",
    zIndex: 1,
  },
  cardIcon: {
    height: "40px",
    display: "block",
    margin: "auto",
    marginTop: "5rem",
    padding: "12px",
  },
  knowMoreButton: {
    color: "#37720B",
    border: "2px solid #37720B",
    display: "block",
    margin: "auto",
  },
  listItem: {
    borderRadius: "10px",
    boxShadow: "0px 3px 6px #0000007D",
    width: "100%",
    padding: "12px",
  },
  listItemText: {
    textAlign: "center",
    "& .MuiTypography-root": {
     fontSize: '0.8rem !important'
    },
    
  },
}));

const Informations = () => {
  const classes = useStyles();
  const [infoList, setInfoList] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);

  const iconMap = {
    Crowd_Density: crowdDensity,
    Traffic_Congestion: trafficCongestion,
    Digital_Fencing: digitalFencing,
    Queue_Count: queueCount,
    PPE_Kit: ppeKit,
  };

  React.useEffect(() => {
    const list = info_utils.information_data;
    if (list.length) {
      setInfoList(list[0].usecases);
    }
  }, []);

  const handleOpenModal = (data) => {
    setOpenModal(true);
    setModalData(data);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Grid container spacing={2} padding={2} sx={{ marginTop: 6 }}>
      {infoList.map((info, index) => (
        <Grid item xs={6} key={index}>
          <Card className={classes.card}>
            <img
              src={iconMap[info.name.replace(" ", "_")]}
              alt={info.name}
              className={classes.cardIcon}
            />
            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ textAlign: "center", fontWeight: 700 }}>
                  {info.name}
                </Typography>
                <Button
                  onClick={() => handleOpenModal(info)}
                  className={classes.knowMoreButton}
                >
                  Know More
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Modal/Dialog */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        sx={{ border: "1px solid #707070" }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#CCDCC1",
            fontSize: "13px",
          }}
        >
          INFORMATION - {modalData?.name.toUpperCase() || "Unknown"}
          <Box
            sx={{
              position: "absolute",
              top: "4px",
              right: "16px",
              cursor: "pointer",
              fontSize: "1.85rem",
              "&:hover": { color: "red" },
            }}
            onClick={handleCloseModal}
          >
            ×
          </Box>
        </DialogTitle>
        <DialogContent>
          <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <ListItem className={classes?.listItem}>
              <ListItemIcon>
                <img src={latencyIcon} alt="Latency"></img>
              </ListItemIcon>
              <ListItemText
                primary="Latency"
                className={classes?.listItemText}
              />
              <Typography variant="body2">{modalData?.latency}</Typography>
            </ListItem>
            <ListItem className={classes?.listItem}>
              <ListItemIcon>
                <img src={accuracy} alt="Accuracy (Before)"></img>
              </ListItemIcon>
              <ListItemText
                primary="Accuracy (Before)"
                className={classes?.listItemText}
              />
              <Typography variant="body2">
                {modalData?.accuracy_before}
              </Typography>
            </ListItem>
            <ListItem className={classes?.listItem}>
              <ListItemIcon>
                <img src={accuracy} alt="Accuracy (After)"></img>
              </ListItemIcon>
              <ListItemText
                primary="Accuracy (After)"
                className={classes?.listItemText}
              />
              <Typography variant="body2">
                {modalData?.accuracy_after}
              </Typography>
            </ListItem>
            <ListItem className={classes?.listItem}>
              <ListItemIcon>
                <img src={gpuUsed} alt="GPU Used"></img>
              </ListItemIcon>
              <ListItemText
                primary="GPU Used"
                className={classes?.listItemText}
              />
              <Typography variant="body2">{modalData?.gpu_used}</Typography>
            </ListItem>
            <ListItem className={classes?.listItem}>
              <ListItemIcon>
                <img src={datasetSize} alt="Dataset Size"></img>
              </ListItemIcon>
              <ListItemText
                primary="Dataset Size"
                className={classes?.listItemText}
              />
              <Typography variant="body2">{modalData?.dataset_size}</Typography>
            </ListItem>
            <ListItem className={classes?.listItem}>
              <ListItemIcon>
                <img src={techStackIcon} alt="Tech Stack Icon"></img>
              </ListItemIcon>
              <ListItemText
                primary={`Tech Stack - ${modalData?.tech_stack.join(", ")}`}
                className={classes?.listItemText}
              />
              {/* <Typography variant="body2">
                {modalData?.tech_stack.join(", ")}
              </Typography> */}
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default Informations;
