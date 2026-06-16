import { Dashboard } from "@mui/icons-material";
import React from "react";
import { Routes } from "../../config/constants/routes";
import Main from "./main";
import SubHeader from "./subheader";

const RoutingPage = (props) => {
  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Switch>
          <Route path={Routes.Main} exact component={Main}></Route>
          <Route path={Routes.Home} exact component={SubHeader}></Route>
        </Switch>
      </Grid>
    </React.Fragment>
  );
};
