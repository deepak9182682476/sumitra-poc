import React, { Fragment, useEffect, useState } from "react";
import { drag } from "../../services/drag_drop_service";
import classNames from "classnames";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Close } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { VMS_SERVER_URL } from "../../config/deployment";
import CameraService from "../../services/camera";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiCardHeader-title": {
      fontSize: "0.9rem !important",
      color: theme.palette?.text?.secondary,
    },
    "& .MuiSvgIcon-root": {
      color: `${theme.palette?.text?.secondary} !important`,
    },
  },
  accordionSummaryRoot: {
    maxHeight: "50px",
    minHeight: "50px !important",
    backgroundColor: "#76B845",
    "& .MuiTypography-root": {
      color: theme.palette.primary.light,
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
      color: theme.palette.primary.light,
    },
  },
  accordionRoot: {
    backgroundColor: theme.palette.primary.cardContentSidebar,
  },
}));

const SideBar = (props) => {
  const classes = useStyles();
  const [state, setState] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getCamerasList = () => {
    CameraService.getCamerasList()
      .then((response) => {
        if (response) {
          const { data } = response;
          const cameras_data = data.data.map((elem, index) => {
            return elem.camera_information;
          });

          let groupedData = _(cameras_data)
            .groupBy((x) => x.commisionerate)
            .map((items, key) => {
              return { commisionerate: key, ip_list: items };
            })
            .value();

          setState({ list: groupedData });
        }
      })
      .catch((error) => console.log("error at cameras list ", error));
  };

  useEffect(() => {
    getCamerasList();
  }, []);

  return (
    <div className={classNames("sidebar", { "is-open": props.isOpen })}>
      <Card
        className="box sidebar-box"
        sx={{
          borderRadius: "1rem",
          width: "15rem",
          backgroundColor: "#CCDCC1",
        }}
      >
        <CardHeader
          className={["box-header", classes.root].join(" ")}
          action={
            <IconButton
              size="small"
              className="mt-4 close-btn"
              onClick={props.toggle}
              aria-label="settings"
            >
              <Close />
            </IconButton>
          }
          title="Camera List"
        ></CardHeader>
        <CardContent
          className="c-pad1"
          sx={{
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
            padding: "0px !important",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Typography>
            {state && state.list ? (
              <Fragment>
                {state.list.map((node, pkey) => (
                  <Accordion
                    expanded={expanded === `panel${pkey}`}
                    onChange={handleChange(`panel${pkey}`)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${pkey}-content`}
                      id={`panel${pkey}-header`}
                      className={classes.accordionSummaryRoot}
                    >
                      <Typography>{node.commisionerate}</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      className={classes.accordionRoot}
                      sx={{
                        padding: "4px !important",
                        paddingLeft: "8px !important",
                      }}
                    >
                      <Typography>
                        <ul className="menu-list">
                          {node.ip_list.map((camera_info, key) => (
                            <li
                              key={"id_" + key}
                              data-name={camera_info.camera_name}
                              data-ip={`${VMS_SERVER_URL}?ip=${camera_info.ip_address}`}
                              draggable={true}
                              onDragStart={(ev) => drag(ev)}
                            >
                              <img
                                className="svg-cam"
                                alt={"videocam"}
                                src={"/assets/videocam.svg"}
                              />
                              <div style={{ marginTop: "2px" }}>
                                {camera_info.camera_name}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Fragment>
            ) : (
              <div className="p-2">No Cameras Found</div>
            )}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideBar;
