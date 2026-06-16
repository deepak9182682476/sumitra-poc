import React, { useState, Fragment, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Switch,
} from "@mui/material";
import {
  InvertColors as ThemeIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AvatarIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { themeSubjectService } from "../../utilities/theme-util";
// import FUSION from "../../Fusion_AIOS.svg";
// import LNT from "../../LntLogoDark.svg";
import NVIDIALNT from "../../assets/images/logo/nvidialnt.svg";
import { AuthConsumer } from "./auth_context";
import { local_anpr_user } from "../../config/config";
import { getLocalStorage, setLocalStorage } from "../../utilities/common-util";

const useStyles = makeStyles((theme) => ({
  appbar: {
    background: `${theme.palette?.primary?.appBarBg} 0% 0% no-repeat padding-box !important`,
    boxShadow: "0px 3px 6px #00000029",
    opacity: "1",
    height: "55px",
  },
  toolbar: {
    minHeight: "35px",
    maxHeight: "55px",
  },
  menuButton: {
    marginRight: 2,
  },
  logoContainer: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
  },
  // flogo: {
  //   paddingRight: "10px",
  //   width: "95px",
  // },
  logo: {
    height: "54px",
  },
  divider: {
    borderLeft: "1px solid #757678",
    height: "25px",
    marginRight: "10px",
  },
  accountItem: {
    "& .MuiSvgIcon-root": {
      padding: "0px !important",
      color: theme?.palette?.commomn?.black,
    },
  },
  notificationItem: {
    "& .MuiSvgIcon-root": {
      padding: "0px !important",
      color: theme?.palette?.commomn?.black,
    },
  },
}));

const Header = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const [muiThemeMode, setMuiThemeMode] = useState(null);
  const [anchorSettingsEl, setAnchorSettingsEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [hotlistView, setHotlistView] = useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isSettingsMenuOpen = Boolean(anchorSettingsEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  useEffect(() => {
    themeSubjectService.getThemeSubject().subscribe((mode) => {
      setMuiThemeMode(mode);
    });

    if (getLocalStorage("hotlist_view") !== null) {
      setHotlistView(getLocalStorage("hotlist_view"));
    } else {
      setLocalStorage("hotlist_view", false);
    }
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onThemeChange = (e) => {
    if (muiThemeMode === "dark") {
      themeSubjectService.sendThemeSubject("light");
    } else if (muiThemeMode === "light") {
      themeSubjectService.sendThemeSubject("dark");
    }
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleSettingsMenuOpen = (event) => {
    setAnchorSettingsEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setAnchorSettingsEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const accountMenuId = "account-menu";
  const settingsMenuId = "settings-menu";
  const aOrigin = {
    vertical: "top",
    horizontal: "right",
  };
  const tOrigin = {
    vertical: "top",
    horizontal: "right",
  };
  const renderProfileMenu = (
    anchorOrigin,
    transformOrigin,
    logout,
    ...rest
  ) => (
    <Menu
      // style
      anchorEl={anchorEl}
      {...rest}
      id={accountMenuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleProfileMenuClose}
    >
      {/* <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem> */}
      <MenuItem
        component="a"
        href="/myaccount"
        onClick={handleProfileMenuClose}
      >
        My account
      </MenuItem>
      <MenuItem
        onClick={() => {
          logout();
          handleProfileMenuClose();
        }}
      >
        LogOut
      </MenuItem>
    </Menu>
  );

  const renderSettingsMenu = ({ anchorOrigin, transformOrigin, ...rest }) => (
    <Menu
      anchorEl={anchorSettingsEl}
      {...rest}
      id={settingsMenuId}
      keepMounted
      open={isSettingsMenuOpen}
      onClose={handleSettingsMenuClose}
    >
      {local_anpr_user(
        "activity_info",
        "activity_name",
        "Cameras Configuration"
      ) ? (
        <>
          <MenuItem
            component="a"
            href="/cameras"
            onClick={handleSettingsMenuClose}
          >
            Cameras Configuration
          </MenuItem>
        </>
      ) : null}
      {local_anpr_user("activity_info", "activity_name", "violations") ? (
        <>
          <MenuItem
            component="a"
            href="/violations"
            onClick={handleSettingsMenuClose}
          >
            Analytics Configuration
          </MenuItem>
        </>
      ) : null}
      {/* <MenuItem component="a" href="/violationParams" onClick={handleSettingsMenuClose}>
        Violation Params Configuration
      </MenuItem> */}
      {local_anpr_user(
        "activity_info",
        "activity_name",
        "Hotlist Management"
      ) ? (
        <>
          <MenuItem
            component="a"
            href="/hotlist"
            onClick={handleSettingsMenuClose}
          >
            Hotlist Management
          </MenuItem>
        </>
      ) : null}
      {local_anpr_user(
        "activity_info",
        "activity_name",
        "Violation Management"
      ) ? (
        <>
          <MenuItem
            component="a"
            href="/violation"
            onClick={handleSettingsMenuClose}
          >
            Violations Management
          </MenuItem>
        </>
      ) : null}
      {local_anpr_user("activity_info", "activity_name", "Rbac Management") ? (
        <>
          <MenuItem
            component="a"
            href="/user-management"
            onClick={handleSettingsMenuClose}
          >
            User Management
          </MenuItem>
        </>
      ) : null}
      {local_anpr_user("role_info", "role_name", "admin") ? (
        <>
          <MenuItem
            component="a"
            href="/session-logs"
            onClick={handleSettingsMenuClose}
          >
            Logs
          </MenuItem>
        </>
      ) : null}
    </Menu>
  );

  const mobileMenuId = "menu-mobile";
  const handleHotlistChange = (event) => {
    const { checked } = event.target;
    setLocalStorage("hotlist_view", checked);
    setHotlistView(checked);
  };
  const renderMobileMenu = ({ anchorOrigin, transformOrigin, ...rest }) => (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      {...rest}
      id={mobileMenuId}
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="theme" color="inherit">
          <ThemeIcon />
        </IconButton>
        <p>Theme</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 2 new notifications"
          color="inherit"
        >
          <Badge badgeContent={2} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="settings"
          aria-controls="settings-menu"
          aria-haspopup="true"
          color="inherit"
          onClick={handleSettingsMenuOpen}
        >
          <SettingsIcon />
        </IconButton>
        <p>Settings</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="account-menu"
          aria-haspopup="true"
          color="inherit"
          onClick={handleProfileMenuOpen}
        >
          <AvatarIcon />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Fragment>
      <AuthConsumer>
        {({ isAuth, logout }) => (
          <Fragment>
            {isAuth ? (
              <AppBar className={classes.appbar} position="fixed">
                <Toolbar className={classes.toolbar}>
                  <Box className={classes.logoContainer} component="a" href="/">
                    {/* <img src={FUSION} alt="Nature" className={classes.flogo} />
                    <div className={classes.divider}></div>
                    <img src={LNT} alt="Nature" className={classes.logo} /> */}
                    <img
                      src={NVIDIALNT}
                      alt="Nvidia | L&T"
                      className={classes.logo}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Box sx={{ display: { xs: "none", md: "flex" } }}>
                    {/* {local_anpr_user(
                      "activity_info",
                      "activity_name",
                      "AnprSearch"
                    ) ? (
                      <>
                        <Switch
                          checked={hotlistView}
                          onChange={(e) => handleHotlistChange(e)}
                          inputProps={{ "aria-label": "controlled" }}
                        />
                        <p>Hotlist Alerts</p>
                      </>
                    ) : null} */}
                    {/* <IconButton
                      size="small"
                      onClick={() => onThemeChange()}
                      edge="end"
                      aria-label="theme"
                      color="inherit"
                      disabled
                    >
                      <ThemeIcon />
                    </IconButton> */}
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label="show 2 new notifications"
                      color="inherit"
                      className={classes.notificationItem}
                    >
                      {/* <Badge badgeContent={2} color="error"> */}
                      <NotificationsIcon />
                      {/* </Badge> */}
                    </IconButton>
                    {/* <IconButton
                      size="small"
                      edge="end"
                      aria-label="settings"
                      aria-controls={settingsMenuId}
                      aria-haspopup="true"
                      onClick={handleSettingsMenuOpen}
                      color="inherit"
                      className={classes.notificationItem}
                    >
                      <SettingsIcon />
                    </IconButton>  */}
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls={accountMenuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                      className={classes.accountItem}
                    >
                      <AvatarIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: { xs: "flex", md: "none" } }}>
                    <IconButton
                      size="small"
                      aria-label="show more"
                      aria-controls={mobileMenuId}
                      aria-haspopup="true"
                      onClick={handleMobileMenuOpen}
                      color="inherit"
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </Toolbar>
              </AppBar>
            ) : null}
            {renderMobileMenu(aOrigin, tOrigin)}
            {renderSettingsMenu(aOrigin, tOrigin)}
            {renderProfileMenu(aOrigin, tOrigin, logout)}
          </Fragment>
        )}
      </AuthConsumer>
    </Fragment>
  );
};

export default Header;
