import { LockOpen, PersonOutline } from "@mui/icons-material";
import {
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { Fragment, useState, Component } from "react";
import AliceCarousel from "react-alice-carousel";
import cctv from "../../assets/images/logo/cctv.png";
import slideImage from "../../assets/images/logo/slideImage.jpg";
import vehicles from "../../assets/images/logo/vechicles.png";
import lntLogoDark from "../../assets/images/logo/lntLogoDark.svg";
import lntLogoWhite from "../../assets/images/logo/lntLogoWhite.svg";
import "react-alice-carousel/lib/alice-carousel.css";
import { AuthConsumer } from "./auth_context";
import { Redirect } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  LoadCanvasTemplateNoReload,
  validateCaptcha,
} from "react-simple-captcha";

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  padding: {
    padding: theme.spacing(1),
  },
  login: {
    width: "300px",
    height: "100%",
    fontSize: "20px",
  },
  paperContainer: {
    backgroundColor: "white",
    // height: '765px',
  },
  typoclass: {
    // color: '#2A2A2A',
    margin: "3%",
  },
  typoclass1: {
    // color: '#2A2A2A',
    margin: "3%",
    textAlign: "center",
    fontWeight: "bold",
  },
  signup: {
    borderRadius: "35px",
    border: "solid 1px #ffffff",
    // backgroundColor: '#2B2A29',
    margin: "5%",
    // fontSize: '10',
    width: "25%",
  },
  multilineColor: {
    color: "black",
    padding: "10px 10px 10px 10px",
  },
  inputField: {
    // backgroundColor: '#f5f3ed',
    width: "300px",
  },
  error: {
    color: "rgb(255, 0, 0)",
    height: "16px",
  },
  carouselcls: {
    width: "100%",
  },
}));
class CaptchaTest extends Component {
  componentDidMount() {
    loadCaptchaEnginge(4);
  }
  handleReloadCaptcha = () => {
    loadCaptchaEnginge(4);
  };

  doSubmit = () => {
    let user_captcha = document.getElementById("user_captcha_input").value;

    if (validateCaptcha(user_captcha) == true) {
      alert("Captcha Matched");
      loadCaptchaEnginge(6);
      document.getElementById("user_captcha_input").value = "";
    } else {
      alert("Captcha Does Not Match");
      document.getElementById("user_captcha_input").value = "";
    }
  };

  render() {
    return (
      <div>
        <div className="inputField">
          <div className="inputField">
            <div className="d-flex align-items-center">
              <LoadCanvasTemplateNoReload />
              <IconButton onClick={this.handleReloadCaptcha} color="primary">
                <Refresh />
              </IconButton>
            </div>

            <div className="col mt-3">
              <div className="inputField">
                <input
                  placeholder="Enter Captcha"
                  id="user_captcha_input"
                  name="user_captcha_input"
                  type="text"
                  style={{ width: "300px", height: "50px", fontSize: "16px" }}
                ></input>
              </div>
            </div>

            <div className="col mt-3"></div>
          </div>
        </div>
      </div>
    );
  }
}

const Login = (props) => {
  const classes = useStyles();
  const [state, setState] = useState({
    username: "",
    password: "",
    images: [cctv, cctv, cctv],
    vertical: "top",
    horizontal: "center",
  });

  // eslint-disable-next-line no-unused-vars
  const getActivities = async (lang) => {
    try {
      //   let user = window.localStorage.getItem("anpr_user");
      //   user = user ? JSON.parse(user) : null;
      //   if (!user) return;
      //   let userRoles = await httpDb.get(
      //     `/f_user_role_mappings?filter={"where":{"f_user_id":${user.id}}}`
      //   );
      //   userRoles = userRoles.data?.response?.length
      //     ? map(userRoles.data?.response, "f_role_id")
      //     : [];
      //   const postData = {
      //     f_role_id: userRoles.join(","),
      //     f_lang_cd: lang,
      //   };
      //   const { data } = await httpDb.post(
      //     "f_activities/getActivitiesTranslated",
      //     postData
      //   );
      //   const activityString = data.response?.length
      //     ? map(data.response, "f_activity_code").join(",")
      //     : [];
      //   console.log("activityString : ", activityString);
      //   lsSetItem(USER_ACTIVITIES, activityString);
    } catch (err) {
      console.error("getActivities err : ", err);
    }
  };

  const handleClick = (e, login) => {
    // Validate the captcha here
    let user_captcha = document.getElementById("user_captcha_input").value;
    if (validateCaptcha(user_captcha) === true) {
      // Captcha matched, proceed with login
      login({
        username: state.username,
        password: state.password,
        grant_type: "password",
      });
      // Clear the captcha input
      document.getElementById("user_captcha_input").value = "";
    } else {
      // Captcha did not match, handle accordingly (e.g., show an error message)
      alert("Captcha Does Not Match");
      document.getElementById("user_captcha_input").value = "";
    }
  };

  // const handleCaptchaInputChange = (value, input) => {
  //   setState({ ...state, captcha: value }); // Set the value directly in the state
  // };
  const handleKeyDown = (e, login) => {
    if (e.keyCode === 13) {
      handleClick(e, login);
    }
  };

  const handleClose = (errorAlert) => {
    errorAlert();
  };

  const { vertical, horizontal } = state;

  return (
    <AuthConsumer>
      {({ isAuth, login, logout, errMsg, isErr, errorAlert }) => (
        <Fragment>
          {!isAuth ? (
            <Grid style={{ display: "flex", overflow: "hidden" }}>
              <Grid container lg="7" sm="6" md="6" xs="6">
                <Grid container style={{ height: "100vh", overflow: "hidden" }}>
                  <AliceCarousel
                    buttonsDisabled
                    dotsDisabled
                    autoPlay
                    autoPlayInterval="4000"
                    className={classes.carouselcls}
                  >
                    <img
                      src={cctv}
                      //   style={{ height: "140vh", width: "100%" }}
                      style={{ height: "auto", width: "inherit" }}
                      className="sliderimg"
                      alt=""
                    />
                    <img
                      src={slideImage}
                      //   style={{ height: "140vh", width: "100%" }}
                      style={{ height: "auto", width: "inherit" }}
                      className="sliderimg"
                      alt=""
                    />
                    <img
                      src={vehicles}
                      //   style={{ height: "140vh", width: "100%" }}
                      style={{ height: "auto", width: "inherit" }}
                      className="sliderimg"
                      alt=""
                    />
                  </AliceCarousel>
                  {/* <List style={{display:'flex',flexDirection:'row'}}>
           <ListItem><h1>SafeOS</h1></ListItem>
           <ListItem><h1>CityOS</h1></ListItem>
           <ListItem><h1>MobilityOS</h1></ListItem>
       </List> */}
                  {/* <MuiImageSlider autoPlay={true} arrows={false} images={this.state.images} /> */}
                  {/* <img style={{ maxWidth: '100%',maxWidth:'100%' }} alt="" src={cctv} /> */}
                  {/* <Typography className={classes.typoclass} variant="h4" component="h3" style={{ fontSize: '100%', color: 'white' }}>AUGMENTED INTELLIGENCEE PLATFORM</Typography>
       <Typography className={classes.typoclass} variant="h6" component="h3" style={{ fontSize: '100%', color: 'white' }}>PUBLIC SAFETY | SMART CITY | MOBILITY</Typography> */}
                </Grid>
              </Grid>

              <Grid
                container
                lg="5"
                sm="6"
                md="6"
                xs="6"
                className={classes.paperContainer}
                direction="column"
                alignItems="center"
              >
                {errMsg ? (
                  <Fragment>
                    {console.log("isErr", isErr)}
                    <Snackbar
                      open={isErr}
                      autoHideDuration={60000}
                      onClose={() => handleClose(errorAlert)}
                      anchorOrigin={{ vertical, horizontal }}
                    >
                      <Alert
                        variant="standard"
                        onClose={() => handleClose(errorAlert)}
                        severity="error"
                        sx={{ width: "100%" }}
                      >
                        {errMsg}
                      </Alert>
                    </Snackbar>
                  </Fragment>
                ) : null}

                <Grid className={classes.margin}>
                  <Grid container alignItems="center" direction="column">
                    <Grid
                      item
                      style={{
                        marginTop: "15%",
                        marginBottom: "10%",
                        display: "grid",
                        flexDirection: "row",
                      }}
                    >
                      {/* <img
           style={{ width: "60%", margin: "0 auto" }}
           src={vehicles}
         ></img>
         <br /> */}
                      <Typography
                        style={{ fontSize: "100%", margin: "0 auto" }}
                      >
                        AI + Integrated Things + Digital Platform
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center" direction="column">
                    <Grid
                      item
                      style={{
                        marginTop: "6%",
                        marginBottom: "10%",
                        backgroundColor: "#dcdee0",
                      }}
                    >
                      <TextField
                        type="email"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutline />
                            </InputAdornment>
                          ),
                          className: classes.multilineColor,
                        }}
                        className={classes.inputField}
                        autoComplete="current-password"
                        // variant="standard"
                        name="username"
                        placeholder="username"
                        onChange={(event) =>
                          setState({ ...state, username: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      style={{
                        marginBottom: "10%",
                        backgroundColor: "#dcdee0",
                      }}
                    >
                      <TextField
                        type="password"
                        placeholder="*******"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOpen />
                            </InputAdornment>
                          ),
                          className: classes.multilineColor,
                        }}
                        className={classes.inputField}
                        autoComplete="current-password"
                        variant="standard"
                        // label="password"
                        onKeyDown={(e) => handleKeyDown(e, login)}
                        onChange={(event) =>
                          setState({ ...state, password: event.target.value })
                        }
                      />
                    </Grid>
                    <Grid margin={"10px"}>
                      <CaptchaTest />
                    </Grid>

                    <Grid item margin={"10px"}>
                      <Button
                        // onKeyPress={keyPressed}
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.login}
                        onClick={(event) => handleClick(event, login)}
                      >
                        Login
                      </Button>
                    </Grid>
                    {/* <Grid item >
               <Button disableFocusRipple disableRipple style={{ textTransform: "none", color: '#727272' }} variant="text" >Forgot password ?</Button>
           </Grid> */}
                    <Grid>
                      <p className={classes.error}>
                        {props?.authentication?.loginErrorMessage}
                      </p>
                    </Grid>
                  </Grid>
                  <Grid container alignItems="center" direction="column">
                    <Grid
                      item
                      style={{
                        marginTop: "15%",
                        marginBottom: "5%",
                        display: "flex",
                      }}
                    >
                      <img
                        style={{ width: "80%", margin: "0 auto" }}
                        alt={"lntlogo"}
                        src={lntLogoDark}
                      ></img>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Redirect to="/home" />
          )}
        </Fragment>
      )}
    </AuthConsumer>
  );
};

export default Login;
