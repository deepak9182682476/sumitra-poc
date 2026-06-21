import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { Suspense, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import Header from "./header";
import Login from "./login";
import SubHeader from "./subheader";
import CamerasConfig from "./../configuration/camera/camera";
import ModelsConfig from "./../configuration/model/model";
import "../../styles/styles.css";
import { AuthProvider } from "./auth_context";
import ProtectedRoute from "./protected_route";
import ModelsParamsConfig from "../configuration/model/model_params";
import Hotlist_main from "../configuration/hotlist_management/Hotlist_main";
import Violations_main from "../configuration/violations_management/violations_main";
import RbacManagement from "../configuration/rbac_management/rbac_management_main";
import Myaccount from "../configuration/myaccount/myaccount";
import Logs_main from "../configuration/session-logs/logs_main";
import MenuBar from "./menu_bar";
import EventDashboard from "../events_dashboard/events_dashboard";
import EventJounal from "../event_journal/event_journal";
import Informations from "../information/informations";
import Configurations from "../configurations/configurations";
import Layout from "../vms/layout";
import EventJounalDetailView from "../event_journal/event_journal_detail_view";
import LandingPage from "../home/home";

const Main = (props) => {
  const [open, setOpen] = useState(true);
  const toggleDrawer = (state) => () => setOpen(state);

  const vms_tab_data = {
    gridContentSize: "2,2",
    frames_detections: [],
  };
  const HomePageWrapper = (routeProps) => (
    <>
      <Grid item xs={12}>
        <SubHeader activeTab={1} />
      </Grid>
    </>
  );

  const VideoComponent = (routeProps) => (
    <>
      <Grid item xs={12} sx={{ marginTop: 9 }}>
        <Layout
          tab_data={vms_tab_data}
          setGridContentSize={(val) => (vms_tab_data.gridContentSize = val)}
        />
      </Grid>
    </>
  );

  const AlertsPageComponent = (routeProps) => (
    <>
      <Grid item xs={12}>
        <SubHeader activeTab={3} />
      </Grid>
    </>
  );

  return (
    <React.Fragment>
      <AuthProvider>
        <Box>
          <Grid container>
            <Grid item xs={12}>
              <Header />
            </Grid>
            <Router>
              <Grid
                container
                direction="row"
                justifyContent="space-evenly"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={2}>
                  <MenuBar open={open} toggleDrawer={toggleDrawer} />
                </Grid>
                <Grid item xs={10}>
                  <Box
                    sx={{
                      flexGrow: 1,
                      bgcolor: "#ffffff",
                      p: 1,
                      ml: -5,
                    }}
                  >
                    <Suspense fallback={<div>Loading...</div>}>
                      <Switch>
                        <Redirect exact from="/" to="/login" />
                        <Route
                          exact
                          path="/login"
                          render={(props) => (
                            <>
                              <Grid item xs={12}>
                                <Login />
                              </Grid>
                            </>
                          )}
                        />
                        {/* <ProtectedRoute path="/home"
                    render={(props) => (
                      <>
                        <Grid item xs={12}>
                          <SubHeader activeTab={1} />
                        </Grid>
                      </>
                    )}
                  />
                  <ProtectedRoute path="/360Alerts"
                    render={(props) => (
                      <>
                        <Grid item xs={12}>
                          <SubHeader activeTab={3} />
                        </Grid>
                      </>
                    )}
                  /> */}

                        <main
                          sx={{ transition: "margin-left 0.3s", padding: 0 }}
                        >
                          {/* <ProtectedRoute
                            path="/home"
                            component={EventDashboard}
                          /> */}
                          {/* <ProtectedRoute
                            path="/event_dashboard"
                            component={EventDashboard}
                          />
                          <ProtectedRoute
                            path="/home"
                            component={LandingPage}
                          />
                          <ProtectedRoute
                            path="/journal"
                            component={EventJounal}
                          />
                          <ProtectedRoute
                            path="/journalDetails"
                            component={EventJounalDetailView}
                          /> */}
                          <ProtectedRoute
                            path="/configuration"
                            component={Configurations}
                          />
                          <ProtectedRoute
                            path="/videowall"
                            component={VideoComponent}
                          />{" "}
                          <ProtectedRoute
                            path="/information"
                            component={Informations}
                          />
                          {/* <ProtectedRoute path="/home" component={HomePageWrapper} /> */}
                          {/* <ProtectedRoute
                            path="/360Alerts"
                            component={AlertsPageComponent}
                          /> */}
                          <ProtectedRoute
                            path="/cameras"
                            component={CamerasConfig}
                          />
                          {/* <ProtectedRoute
                            path="/violations"
                            component={ModelsConfig}
                          /> */}
                          {/* <ProtectedRoute
                            path="/violationParams"
                            component={ModelsParamsConfig}
                          />
                          <ProtectedRoute
                            path="/hotlist"
                            component={Hotlist_main}
                          />
                          <ProtectedRoute
                            path="/violation"
                            component={Violations_main}
                          /> */}
                          <ProtectedRoute
                            path="/user-management"
                            component={RbacManagement}
                          />
                          <ProtectedRoute
                            path="/myaccount"
                            component={Myaccount}
                          />
                          {/* <ProtectedRoute
                            path="/session-logs"
                            component={Logs_main}
                          /> */}
                        </main>
                      </Switch>
                    </Suspense>
                  </Box>
                </Grid>
              </Grid>
            </Router>
          </Grid>
        </Box>
      </AuthProvider>
    </React.Fragment>
  );
};

export default Main;
