import React, { useState, useEffect } from "react";
import SideBar from "./sidebar";
import Content from "./content";
import "./vms.css";
import { Grid } from "@mui/material";
import NoAccess from "../../common/NoAccess";
import { local_anpr_user } from "../../config/config";

const Layout = (props) => {
  const [state, setState] = useState({
    isOpen: false,
    isMobile: true,
    previousWidth: -1,
    grid_size: null,
  });

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Anything in here is fired on component mount.
    updateWidth();

    window.addEventListener("resize", updateWidth.bind(this));

    return () => {
      // Anything in here is fired on component unmount.
      window.removeEventListener("resize", updateWidth.bind(this));
    };
  }, []);

  const updateWidth = () => {
    const width = window.innerWidth;
    const widthLimit = 576;
    const isMobile = width <= widthLimit;
    const wasMobile = state.previousWidth <= widthLimit;

    if (isMobile !== wasMobile) {
      setState({
        isOpen: !isMobile,
      });
    }

    state.previousWidth = width;
  };

  const toggle = () => {
    setState({ isOpen: !state.isOpen });
  };

  const { tab_data } = props;

  return local_anpr_user("activity_info", "activity_name", "Videos") ? (
    <Grid
      container
      style={{
        height: "80vh",
        width: "84vw",
      }}
      spacing={1}
    >
      <div className="App layoutwrapper">
        <>
          <SideBar toggle={toggle} isOpen={state.isOpen} />
          <Content
            toggle={toggle}
            defaultGridContentSize={tab_data?.gridContentSize}
            setGridSize={(val) => props.setGridContentSize(val)}
            frames_detections={tab_data.frames_detections}
            isOpen={state.isOpen}
          />
        </>
      </div>
    </Grid>
  ) : (
    <Grid>
      <NoAccess />
    </Grid>
  );
};

export default Layout;
