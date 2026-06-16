import { makeStyles, useTheme } from "@mui/styles";
import { Fragment, useEffect, useState } from "react";
import { Card, Grid, Typography } from "@mui/material";
import createPlotlyComponent from "react-plotly.js/factory";
import {
  BAR_GRAPH_CONFIG,
  config_data,
  DONUT_SERIES_CONFIG,
} from "../../config/config";
import _ from "lodash";
import * as HELPERS from "../../config/helpers";

const Plotly = window.Plotly;
let Plot = createPlotlyComponent(Plotly);

const useStyles = makeStyles((theme) => {
  return {
    //changes as per fusion starts
    main: {
      backgroundColor: theme.palette.primary.dropDwnBgColor,
      color: theme.palette.primary.color,
    },
    //changes as per fusion stops

    analyticsDataPanel: {
      width: "100%",
      margin: "0px",
      [theme.breakpoints.between(750, 1400)]: {
        height: "9vh",
      },
      [theme.breakpoints.up(1401)]: {
        height: "7vh",
      },
      display: "flex",
      flexWrap: "nowrap",
    },
    valueBar: {
      width: "35%",
      backgroundColor: theme.palette?.primary?.compHeader,
      color: theme.palette?.text?.secondary,
      border: "1px solid #202124",
      padding: "11px 3px",
    },
    value: {
      // marginTop: "8px",
      color: "#FFDE03",
    },
    plotContainer: {
      width: "100%",
      flexGrow: 1,
      overflowY: "auto",
      overflowX: "hidden",
      [theme.breakpoints.between(750, 1400)]: {
        minHeight: "20vh !important",
        maxHeight: "20vh !important",
      },
      [theme.breakpoints.up(1401)]: {
        minHeight: "28vh !important",
        maxHeight: "28vh !important",
      },
    },
  };
});

const Analytics = (props) => {
  const classes = useStyles();
  const current_theme = useTheme();
  // const [data, setData] = useState(null);
  const [configModel, setConfigModel] = useState(null);
  const [graphConfigs, setGraphConfigs] = useState({
    donut_layout: DONUT_SERIES_CONFIG.LAYOUT,
    donut_config: DONUT_SERIES_CONFIG.CONFIG,
    bar_layout: BAR_GRAPH_CONFIG.LAYOUT,
    bar_configs: BAR_GRAPH_CONFIG.CONFIG,
  });
  const [state, setState] = useState({
    analysisData: {
      models_count: 0,
      events_count: 0,
    },
    analysisBarData: [],
  });

  useEffect(() => {
    if (props.analyticsData) {
      // console.log('props analyticsData', props.analyticsData);
      setState({
        ...state,
        analysisData: HELPERS.getAnalysisData(props.analyticsData),
        analysisBarData: HELPERS.getAnalysisBarGraphData(props.analyticsData),
      });
      // setData(props.analyticsData);
    }
  }, [props.analyticsData]);

  useEffect(() => {
    if (props.selectedModel) {
      setConfigModel(props.selectedModel);
    }
  }, [props.selectedModel]);

  useEffect(() => {
    if (!configModel) {
      setConfigModel(config_data.model);
    }
  }, []);

  useEffect(() => {
    if (current_theme) {
      graphConfigs.donut_layout.paper_bgcolor =
        graphConfigs.bar_layout.paper_bgcolor =
        graphConfigs.donut_layout.plot_bgcolor =
        graphConfigs.bar_layout.plot_bgcolor =
          current_theme.palette?.primary?.cardBg;
      graphConfigs.donut_layout.legend.font.color =
        graphConfigs.bar_layout.legend.font.color =
        graphConfigs.donut_layout.annotations[0].font.color =
        graphConfigs.bar_layout.xaxis.color =
        graphConfigs.bar_layout.yaxis.color =
          current_theme.palette?.text?.primary;
      setGraphConfigs({
        ...graphConfigs,
        donut_layout: graphConfigs.donut_layout,
        bar_layout: Object.assign({}, graphConfigs.bar_layout),
      });
    }
  }, [current_theme]);

  const getSelectedModels = (isModels) => {
    if (configModel) {
      if (isModels) {
        const datas = _.map(configModel, "label");
        // Plotly.update("plot-div", [], graphConfigs.donut_layout);
        return datas;
      } else {
        if (state.analysisData) {
          return [Number(state.analysisData.models_count)];
        }
      }
    }
  };

  return (
    <Fragment>
      <Card>
        <Grid
          className={classes.analyticsDataPanel}
          container
          justify="space-between"
        >
          <Grid className={classes.valueBar}>
            <Typography
              align="center"
              sx={{
                color: `${current_theme.palette?.text?.secondary} !important`,
              }}
              variant="subtitle2"
            >
              Models Count
              <div>
                (
                <span className={classes.value}>
                  {state.analysisData.models_count}
                </span>
                )
              </div>
            </Typography>
          </Grid>
          <Grid className={classes.valueBar}>
            <Typography
              align="center"
              sx={{
                color: `${current_theme.palette?.text?.secondary} !important`,
              }}
              variant="subtitle2"
            >
              Events Count
              <div>
                (
                <span className={classes.value}>
                  {state.analysisData.events_count}
                </span>
                )
              </div>
            </Typography>
          </Grid>
          <Grid className={classes.valueBar}>
            <Typography
              align="center"
              sx={{
                color: `${current_theme.palette?.text?.secondary} !important`,
              }}
              variant="subtitle2"
            >
              Cameras Count
              <div>
                (
                <span className={classes.value}>
                  {props.cameraList && props.cameraList.length}
                </span>
                )
              </div>
            </Typography>
          </Grid>
        </Grid>

        <Grid
          className={classes.plotContainer}
          container
          id="plot-div"
          justify="space-between"
        >
          {/* <Plot
            style={{ width: "50%" }}
            data={[
              {
                values: getSelectedModels(false),
                labels: getSelectedModels(true),
                name: "Total Models",
                hoverinfo: "label+percent+name",
                hole: 0.4,
                type: "pie",
              },
            ]}
            layout={graphConfigs.donut_layout}
            config={graphConfigs.donut_config}
            // onDoubleClick={() => {
            //   this.handleMaximiseGraphClick("graph");
            // }}
            // onLegendDoubleClick={() => {
            //   this.handleMaximiseGraphClick("graph");
            // }}
          /> */}
          <Plot
            style={{ width: "100%" }}
            data={state.analysisBarData}
            layout={graphConfigs.bar_layout}
            config={graphConfigs.bar_configs}
            // onDoubleClick={() => {
            //   this.handleMaximiseGraphClick("bar");
            // }}
            // onLegendDoubleClick={() => {
            //   this.handleMaximiseGraphClick("bar");
            // }}
          />
        </Grid>
      </Card>
    </Fragment>
  );
};

export default Analytics;
