import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  ListItemButton,
  ListItemIcon,
  Box,
  Grid,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { tabsMenu } from "../../config/tabs_constants/tabs";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DvrOutlinedIcon from "@mui/icons-material/DvrOutlined";
import { AuthConsumer } from "./auth_context";
import { Fragment } from "react/cjs/react.development";

const MenuBar = ({ open, toggleDrawer }) => {
  const drawerWidth = 180;
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (value) => {
    let idx = tabsMenu.findIndex((key) => key.label === value);
    if (idx !== -1) {
      setSelectedIndex(idx);
    }
  };

  return (
    <Fragment>
      <AuthConsumer>
        {({ isAuth, logout }) => (
          <Fragment>
            {isAuth ? (
              <Grid container>
                <Box
                  component="nav"
                  sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
                  aria-label="mailbox folders"
                >
                  <Drawer
                    sx={{
                      width: drawerWidth,
                      margin: 0,
                      flexShrink: 0,
                      "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        marginTop: 7,
                      },
                    }}
                    variant="permanent"
                    anchor="left"
                    open={true}
                  >
                    <List component="nav" aria-label="main mailbox folders">
                      {tabsMenu.map(({ key, label, url }) => (
                        <ListItemButton
                          button
                          key={label}
                          component={Link}
                          to={url}
                          selected={label === tabsMenu[selectedIndex].label}
                          onClick={() => handleListItemClick(label)}
                        >
                          <ListItemIcon sx={{ minWidth: 42 }}>
                            {key === "dashboard" ? (
                              <DashboardOutlinedIcon />
                            ) : key === "eventjournal" ? (
                              <AutoStoriesOutlinedIcon />
                            ) : key === "videowall" ? (
                              <DvrOutlinedIcon />
                            ) : key === "configuration" ? (
                              <SettingsOutlinedIcon />
                            ) : (
                              <InfoOutlinedIcon />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={label}
                            primaryTypographyProps={{ fontSize: "0.75rem !important" }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Drawer>
                </Box>
              </Grid>
            ) : null}
          </Fragment>
        )}
      </AuthConsumer>
    </Fragment>
  );
};

export default MenuBar;
