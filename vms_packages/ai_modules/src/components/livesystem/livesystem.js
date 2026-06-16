import React, { useState } from "react";
import { Grid } from "@mui/material";
import AutoComplete from "../../common/autocomplete";
import MultipleSelect from "../../common/multiselect";
import { LABELS } from "../../config/tabs_constants/labels";
import { makeStyles } from "@mui/styles";
import { LIVE_STREAM, VMS_SERVER_URL } from "../../config/deployment";
import EventSourceCallback from "../../common/eventsource_callback";
import StreamComponent from "./streaming";

const useStyles = makeStyles((theme) => {
  return {
    selections: {
      display: "flex",
      flexFlow: "initial",
    },
    combocls: {
      maxWidth: "50px",
    },
    liveframe: {
      marginTop: "4px",
      border: `1px solid ${theme.palette.primary.borderLive}`,
      borderRadius: '3px',
      height: "30vh",
      [theme.breakpoints.between(750, 1400)]: {
        height: "36vh !important",
      },
      [theme.breakpoints.up(1401)]: {
        height: "49vh !important",
      },
    },
  };
});

const LiveSystem = (props) => {
  const classes = useStyles();
  // const videoContainer = React.createRef();
  const [vmsUrl, setVmsUrl] = useState(null);
  const [vmsImgRes, setVmsImgRes] = useState(null);
  const [state_ip, setIPAddress] = useState(null);

  const setMediaContainer = async (value) => {
    if (value && value.ip_address) {
      // await setVmsUrl(`${LIVE_STREAM}?ip=${value.ip_address}`);
      await setVmsUrl(`${VMS_SERVER_URL}?ip=${value.ip_address}`)
      await setIPAddress(value.ip_address);
      // LiveSystemService.getStreamData(value.ip_address)
      //   .then((data) => {
      //     console.log("liivesystem data", data);
      //   })
      //   .catch((err) => console.log("liivesystem err", err));
    }
  };

  const getStreamData = (data) => {
    if (data) {
      setVmsImgRes(data);
    }
  };

  return (
    <Grid container>
      <Grid container justify="center" className={classes.selections}>
        <MultipleSelect
          setModel={(model) => props.setModel(model)}
          selectedModel={props.selectedModel}
          width={170}
          size={"small"}
          label={LABELS.MODEL}
          options={props.modelsList}
          cameraList={props.cameraList}
          setAlertStatus={(content, status) =>
            props.setAlertStatus(content, status)
          }
        />
        <AutoComplete
          label={LABELS.SELECT_CAMERA}
          options={props.cameraList}
          selectedModel={props.selectedModel}
          optionFormat={true}
          className={classes.combocls}
          setMediaContainer={(val) => setMediaContainer(val)}
        />
      </Grid>
      <Grid container justify="center" className={classes.liveframe}>
        {/* {state_ip ? (
          <EventSourceCallback
            url={vmsUrl}
            isStream={true}
            getCallbackData={(data) => getStreamData(data)}
          />
        ) : null} */}
        {/* <img
          style={{ width: "100%", height: "100%" }}
          // src={vmsImgRes}
          src={vmsUrl}
          alt="live"
        /> */}
        <StreamComponent vmsUrl={vmsUrl} />
      </Grid>
    </Grid>
  );
};

export default LiveSystem;
