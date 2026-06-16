import React from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthConsumer } from "./auth_context";
import { Grid } from "@mui/material";
import { getLocalStorage } from "../../utilities/common-util";

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <AuthConsumer>
    {({ isAuth, setCurrentUser }) => (
      <Route
        render={(props) => {
          if(!isAuth && getLocalStorage('anpr_user')){
            return setCurrentUser();
          }
          return isAuth ? (
            <Grid item xs={12}>
              {" "}
              <Component {...props} />{" "}
            </Grid>
          ) : (
            <Redirect to="/" />
          );
        }}
        {...rest}
      />
    )}
  </AuthConsumer>
);

export default ProtectedRoute;
