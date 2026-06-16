import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Modal from "@mui/material/Modal";
import { Grid } from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import HotlistAlertTable from "./HotlistAlertTable";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .bttn": {
      color: "#fff",
      bgcolor: "blue ! important",
    },
  },
}));
export default function HotlistAlertModel(props) {
  const handleClose = () => {
    if (typeof props.setModalStatus === "function") {
      props.setModalStatus(false);
    }
  };
  // const style = {
  //     position: "absolute",
  //     top: "50%",
  //     left: "50%",
  //     transform: "translate(-50%, -50%)",
  //     width: 440,
  //     bgcolor: "background.paper",
  //     border: "2px solid #000",
  //     boxShadow: 24,
  //     p: 4,
  //     fontSize:"10px",
  //   }
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",

    transform: "translate(-50%, -50%)",
    width: 1140,
    height: 320,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    color: "lightgray",
  };
  return (
    <div style={{ fontSize: "0", bgcolor: "background.paper" }}>
      <Modal
        open={props.show}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* sx={style} */}
          <Grid
            container
            spacing={2}
            // sx={{fontsize: "10px",
            // verticalalign: "inherit",
            // borderbottom: "1px solid rgba(81, 81, 81, 1)",
            // textalign: "left",
            // padding: "8px"
            // color: "#fff}}
          >
            <Grid item xs={11}>
              <Button
                sx={{ color: "#fff", fontSize: "10px" }}
                variant="contained"
              >
                VIEW ALERTS
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button
                sx={{ color: "#fff", fontSize: "10px" }}
                variant="contained"
                onClick={handleClose}
              >
                DISMISS
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <p style={{ fontSize: "small" }}>Alert Transactions</p>
            </Grid>
            <Grid item xs={2}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrJgwdOAjqaZGS7kn35IVm_ZN6E4XFuJ7V_g&usqp=CAU"
                class="img-fluid img-thumbnail"
                alt="..."
                height="15"
                width="70"
              ></img>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <img src="gfhgh" class="img-fluid img-thumbnail" alt=" "></img>
            </Grid>
            <Grid item xs={2}>
              <p>TS56D7324</p>
              <br></br>
            </Grid>
          </Grid>
          {/* <Grid container> */}
          <Grid item xs={12} sx={{ padding: "0px 15px" }}>
            <HotlistAlertTable />
          </Grid>
          {/* </Grid> */}
        </Box>
      </Modal>
    </div>
  );
}
