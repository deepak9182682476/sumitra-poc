import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Fragment, useEffect, useState } from "react";
import AlertsService from "../../services/alerts";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import moment from "moment";
import usePagination from "../../common/pagination";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import vehicles from "../../assets/images/logo/vechicles.png";
import useLoader from "../../common/loader/useLoader";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      height: "75vh",
      width: "81vw",
      marginLeft: "-1px",
      fontSize: "0.9rem !important",
      marginTop: "2px",
      "& ::-webkit-scrollbar": {
        width: "8px",
        height: "100%",
        marginRight: "4px",
        backgroundColor: "#3D81F5",
      },
      "& ::-webkit-scrollbar-thumb": {
        background: "white",
        borderRight: "4px white solid",
        height: "2px",
      },
      "& :: -webkit-scrollbar-track": {
        borderRadius: "5px",
      },
      "& :: -webkit-scrollbar-thumb": {
        borderRadius: "5px",
      },
    },

    cpd: {
      padding: "0px !important",
    },

    card: {
      backgroundColor: `${theme.palette?.primary?.cardBg} !important`,
      margin: "4px",
      padding: "8px",
      width: "100%",
      "& .MuiCardHeader-root": {
        padding: "2px 12px !important",
      },
      "& .MuiTypography-root": {
        fontSize: "13px !important",
        color: `${theme.palette?.primary?.title}`,
      },
    },
    paginationCls: {
      marginTop: "8px",
    },
  };
});

const EventJounalView = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [loader, showLoader, hideLoader] = useLoader();
  const [state, setState] = useState({
    data: null,
    liveAlertsData: [],
    alertOpen: false,
    alertContent: "",
    vertical: "top",
    horizontal: "center",
  });
  let [eventsPage, setEventsPage] = useState(1);

  const Events_PER_PAGE = useMediaQuery(theme.breakpoints.up(1420)) ? 12 : 8;

  const events_count = Math.ceil(state.liveAlertsData.length / Events_PER_PAGE);
  const Events_DATA = usePagination(state.liveAlertsData, Events_PER_PAGE);

  useEffect(() => {
    // if (state.liveAlertsData.length && state.liveAlertsData.length > 100) {
    //   const arr = state.liveAlertsData.slice(0, 20);
    //   setState((prevState) => ({
    //     ...prevState,
    //     liveAlertsData: arr,
    //   }));
    // }
    setTimeout(() => {
      fetchEventsData();
    }, 5000);
  }, [state.liveAlertsData]);

  useEffect(() => {
    fetchEventsData();
  },[]);

  const handleEventsPageChange = (e, p) => {
    setEventsPage(p);
    Events_DATA.jump(p);
  };

  const fetchEventsData = async () => {
    showLoader();
    if (typeof AlertsService.getLiveEvents === "function") {
      AlertsService.getLiveEvents()
        .then((res) => {
          const { data } = res?.data || [];
          setDataForImages(data);
        })
        .catch((err) => {
          hideLoader();
          console.log(err);
          setTimeout(() => {
            fetchEventsData();
          }, 5000);
        });
    }
  };
  async function setDataForImages(dataRows) {
    try {
      if (dataRows.length) {
        let arr = [];
        for (const [i, v] of dataRows.entries()) {
          //Handled last iteration
          if (i === dataRows.length) {
            continue;
          }
          dataRows[i].id = i + 1;

          console.log('time ----',v, v.date);
          let date = moment(v.date).format("YYYY-MM-DD");
          
          await AlertsService.getImageOfAlert(v.image, date, v.model_name)
            .then((res) => {
              hideLoader();
              const { data } = res;
              if (data && data.image_base64) {
                const clone_rec = Object.assign({}, v);
                clone_rec.image = `data:image/jpeg;base64,${data.image_base64}`;
                arr.push(clone_rec);
                dataRows[i].image = clone_rec.image;
              }
            })
            .catch((e) => {
              console.log(e);
            });
        }
        if (arr.length) {
          hideLoader();
          await setState((prevState) => ({
            ...prevState,
            liveAlertsData: dataRows,
          }));
        } else {
          hideLoader();
          await setState((prevState) => ({
            ...prevState,
            liveAlertsData: dataRows,
          }));
        }
      }
    } catch (e) {
      hideLoader();
      console.log(e);
    }
  }

  const history = useHistory();

  return (
    <Grid
      container
      justifyContent="space-evenly"
      className={classes.root}
      spacing={0.5}
    >
      {loader}
      {state.liveAlertsData.length ? (
        <Fragment>
          {Events_DATA.currentData().map((journal) => (
            <Card
              sx={{
                width: "200px !important",
                height: 200,
                borderRadius: "1rem",
                marginTop: "1rem !important",
              }}
              className={classes.card}
            >
              <CardMedia
                sx={{
                  height: "110px",
                  cursor: "pointer",
                  borderRadius: "1rem",
                  marginTop: "0.25rem",
                }}
                image={journal.image}
                onClick={() => history.push("/journalDetails", journal)}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {journal?.camera_name}
                </Typography>
                <Typography
                  variant="body2"
                  color="#242424"
                  sx={{ fontWeight: 700 }}
                >
                  {journal?.data_set?.info}
                </Typography>
              </CardContent>
            </Card>
          ))}
          <Pagination
            count={events_count}
            size="large"
            page={eventsPage}
            className={classes.paginationCls}
            variant="outlined"
            shape="rounded"
            onChange={handleEventsPageChange}
          />
        </Fragment>
      ) : (
        <>
          <div> NO DATA</div>
        </>
      )}
    </Grid>
  );
};

export default EventJounalView;
