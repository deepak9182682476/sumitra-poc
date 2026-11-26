import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChildren,
  ViewChild,
  Input,
  SimpleChanges,
} from "@angular/core";
import { PostAnalysisService } from "../../../services/post-analysis.service";
// import { PostAnalysisMapComponent } from '../map/post-analysis-map.component';

import * as Highcharts from "highcharts";
import * as $ from "jquery";
import Map from "ol/Map";
import { CommonService } from "src/app/services/common.service";
import { ThemeService } from "../../../theme/theme.service";
import { MapsComponent } from "../../maps/maps.component";

const HighchartsMore = require("highcharts/highcharts-more.src");
HighchartsMore(Highcharts);

const Exporting = require("highcharts/modules/exporting");
Exporting(Highcharts);

(function (Highcharts: any) {
  /**
   * Create a global getSVG method that takes an array of charts as an
   * argument
   */

  Highcharts.getSVG = function (charts) {
    var svgArr = [],
      top = 0,
      width = 0;

    Highcharts.each(charts, function (chart) {
      var svg = chart.getSVG(),
        // Get width/height of SVG for export
        svgWidth = +svg.match(/^<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/)[1],
        svgHeight = +svg.match(/^<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/)[1];

      svg = svg.replace("<svg", '<g transform="translate(0,' + top + ')" ');
      svg = svg.replace("</svg>", "</g>");
      top += svgHeight;
      width = Math.max(width, svgWidth);
      svgArr.push(svg);
    });

    return (
      '<svg height="' +
      top +
      '" width="' +
      width +
      '" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
      svgArr.join("") +
      "</svg>"
    );
  };

  /**
   * Create a global exportCharts method that takes an array of charts as an
   * argument, and exporting options as the second argument
   */
  Highcharts.exportCharts = function (charts, options) {
    charts.forEach(function (chart) {
      chart.update({
        chart: {
          borderColor: "black",
          borderWidth: 1,
        },
      });
    });

    // Merge the options
    options = Highcharts.merge(Highcharts.getOptions().exporting, options);

    // Post to export server
    Highcharts.post(options.url, {
      filename: options.filename || "chart",
      type: options.type,
      width: options.width,
      svg: Highcharts.getSVG(charts),
    });

    charts.forEach(function (chart) {
      chart.update({
        chart: {
          borderWidth: 0,
        },
      });
    });
  };
})(Highcharts);

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.scss"],
})
export class GraphComponent implements OnInit {
  isBarChartLoading = false;
  map: Map;
  getAlarmChartInfo = {
    alarmsList: [],
    alarmInfo: {},
    enableChartPopup: false,
    hideCloseBtn: false,
    backUpChartData: {
      series: [],
      categories: [],
    },
    enableNoRecords: false,
  };
  getChartData = [];

  @Output() graphData = new EventEmitter<any>();
  @Input() daysCount: any;
  @Input() monthsCount: any;
  @Input() selectedMonth: any;

  highcharts = Highcharts;
  barChartUpdate: boolean = false;
  pieChartUpdate: boolean = false;

  chartOptions = {
    chart: {
      type: "bar",
      inverted: false,
      align: "center",
      backgroundColor: "#141414",
      zoomType: "xy",
    },
    title: {
      text: "",
    },
    xAxis: {
      lineWidth: 0.5,
      categories: [],
      title: {
        text: this.getTranslationLang("alarms"),
      },
    },
    yAxis: {
      min: 0,
      tickInterval: 1,
      tickLength: 1,
      max: 32,
      labels: {
        overflow: "justify",
      },
      type: "timeInterval",
      gridLineWidth: 0.5,
      lineWidth: 0.1,
      title: {
        text: this.getTranslationLang("day"),
      },
    },
    tooltip: {
      enabled: false,
      headerFormat: "",
      pointFormat: ``,
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
        },
      },
    },
    exporting: {
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
    },
    credits: {
      enabled: false,
    },
    series: [],
  };

  awsChartOptions = {
    chart: {
      type: "spline",
      align: "center",
      backgroundColor: "#141414",
    },
    title: {
      text: "Weather Overview",
    },
    subtitle: {
      text: "",
    },
    xAxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yAxis: {
      title: {
        text: "Days",
      },
      min: 0,
      tickInterval: 1,
      tickLength: 1,
      gridLineWidth: 0.5,
      lineWidth: 0.1,
      max: 32,
      labels: {
        overflow: "justify",
      },
    },
    tooltip: {
      crosshairs: true,
      shared: true,
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 4,
          lineColor: "#666666",
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: "Temperature",
        marker: {
          symbol: "square",
        },
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          {
            y: 26.5,
            marker: {
              // symbol:
              //   "url(https://www.highcharts.com/samples/graphics/sun.png)",  // online picture: not available offline
              symbol: "circle",
            },
          },
          0,
          0,
          0,
          0,
        ],
      },
      {
        name: "Wind",
        marker: {
          symbol: "diamond",
        },
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          {
            y: 22,
            marker: {
              // symbol:
              //   "url(https://www.highcharts.com/samples/graphics/snow.png)",  // online picture: not available offline
              symbol: "diamond",
            },
          },
          0,
          0,
          0,
        ],
      },
      {
        name: "Air Temperature",
        marker: {
          symbol: "diamond",
        },
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          {
            y: 16,
            marker: {
              symbol: "",
            },
          },
          0,
          0,
          0,
          0,
        ],
      },
      {
        name: "Internal Temperature",
        marker: {
          symbol: "diamond",
        },
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          {
            y: 16,
            marker: {
              symbol: "",
            },
          },
          0,
          0,
          0,
          0,
        ],
      },
      {
        name: "Rain",
        marker: {
          symbol: "diamond",
        },
        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          {
            y: 18,
            marker: {
              symbol: "",
            },
          },
          0,
          0,
          0,
        ],
      },
    ],
  };

  getZonewiseAlarmChartInfo = {
    zoneWiseData: [],
    backUpChartData: {
      series: [],
    },
    enableNoRecords: false,
  };

  pieChartOptions = {
    chart: {
      backgroundColor: "#141414",
      shadow: {
        backgroundColor: "#141414",
        color: "#FFFFFF",
        fontFamily: "Roboto",
      },
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
    },
    title: {
      text: this.getTranslationLang("zone_wise_alarms"),
    },
    tooltip: {
      pointFormat: "{point.name} : <b>{point.y}</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b> : {point.y}",
        },
        showInLegend: true,
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
    },
    series: [],
  };

  activeTab = "graph";
  postAnalysisData = [];
  isLoading = false;

  // @ViewChild(PostAnalysisMapComponent, { static: false }) postAnalysisMapComponent: PostAnalysisMapComponent;
  @ViewChild(MapsComponent, { static: false }) mapsComponent: MapsComponent;

  constructor(
    private postAnalysisService: PostAnalysisService,
    public commonService: CommonService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const getFilterData = localStorage.getItem("postAnalysisFilter");
    this.filteredData(getFilterData);

    if (!this.commonService.getLocalStorage("userInfo")) {
      this.themeSelection("dark");
    } else {
      const getSignedInData = this.commonService.getDecryptedUserData();
      const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
      const theme = userInfo ? userInfo.theme : "dark";
      this.themeSelection(theme);
    }

    this.commonService.watchStorage().subscribe((data: string) => {
      // this will call whenever your localStorage data changes
      if (!this.commonService.getLocalStorage("userInfo")) {
        this.themeSelection("dark");
      } else {
        const theme = this.themeService.getActiveTheme().name;
        this.themeSelection(theme);
      }
    });
  }

  themeSelection(theme) {
    const bgColor = theme === "dark" ? "#141414" : "#fbf8f3";
    this.chartOptions.chart.backgroundColor = bgColor;
    this.barChartUpdate = true;

    this.pieChartOptions.chart.backgroundColor = bgColor;
    this.pieChartOptions.chart.shadow.backgroundColor = bgColor;
    this.pieChartUpdate = true;
  }

  filteredData(getFilterData) {
    if (getFilterData) {
      this.isLoading = true;
      this.postAnalysisData = [];
      const formattedData = JSON.parse(getFilterData);
      if (formattedData.zoneId === "All") {
        formattedData.zoneId = "";
      }
      if (formattedData.alarmId === "All") {
        formattedData.alarmId = "";
      }
      this.postAnalysisService
        .getFilterApi("filter", formattedData)
        .subscribe((res) => {
          this.isLoading = false;
          if (!res.error) {
            this.postAnalysisData = res.graphData;
            this.getZonewiseAlarmChartInfo.zoneWiseData = res.zoneWiseData;
            let pieData = res.zoneWiseData
              .filter((item) => item)
              .map((newitem) => {
                if (newitem.zone_id) {
                  return {
                    name: `Zone ${newitem.zone_id}`,
                    y: Number(newitem.alarm_count),
                  };
                } else {
                  return { name: `Others`, y: Number(newitem.alarm_count) };
                }
              });
            this.pieChartOptions.series = [
              { name: "zones", colorByPoint: true, data: pieData },
            ];
            this.getZonewiseAlarmChartInfo.backUpChartData.series = JSON.parse(
              JSON.stringify([
                { name: "zones", colorByPoint: true, data: pieData },
              ])
            );
            this.getZonewiseAlarmChartInfo.enableNoRecords = true;
            let yearVal = new Date().getFullYear();
            let monthVal = new Date().getMonth();
            let dayCount = new Date(yearVal, monthVal, 0).getDate();
            this.formChartData(yearVal, monthVal, dayCount);
          }
        });
    }
  }

  /** Download chart as pdf */
  downloadAsPdf(): void {
    const charts: any = Highcharts;
    const getCharts = [];
    for (let item of Highcharts.charts) {
      if (item) {
        getCharts.push(item);
      }
    }
    charts.exportCharts([getCharts[1], getCharts[0]], {
      type: "application/pdf",
    });
  }

  /** Get Active Tab */
  getActiveTab(tabName): void {
    this.activeTab = tabName;
    setTimeout(() => {
      // if (this.postAnalysisMapComponent) {
      //   this.postAnalysisMapComponent.initializeMapComponent([...this.postAnalysisData, ...this.getPrimaryAlarms]);
      // }
      if (this.mapsComponent) {
        this.mapsComponent.initializeMapComponent(this.postAnalysisData);
      }
    }, 100);
  }

  /** Form Chart Data */
  formChartData(year, month, getDaysCount): void {
    this.daysCount = getDaysCount;
    this.isBarChartLoading = true;

    const graphData = this.postAnalysisData;
    const chartData = [];
    const categoryNames = [];

    if (graphData) {
      for (var i = 0; i < graphData.length; i++) {
        if (categoryNames && categoryNames.length > 0) {
          let categoryRec = categoryNames.find(
            (rec) => rec == graphData[i].alarm_id
          );
          if (!categoryRec) {
            categoryNames.push(graphData[i].alarm_id);
            chartData.push({
              name: graphData[i].alarm_id,
              month: new Date(graphData[i].timeofevent).getMonth(),
              year: new Date(graphData[i].timeofevent).getFullYear(),
              data: [],
            });
          }
        } else {
          categoryNames.push(graphData[i].alarm_id);
          chartData.push({
            name: graphData[i].alarm_id,
            month: new Date(graphData[i].timeofevent).getMonth(),
            year: new Date(graphData[i].timeofevent).getFullYear(),
            data: [],
          });
        }
      }

      graphData.map((rec) => {
        let exists = chartData.findIndex(
          (cdata) =>
            cdata.name == rec.alarm_id &&
            cdata.month == month &&
            cdata.year == year
        );
        let recDate = new Date(rec.timeofevent).getDate();
        if (exists !== -1) {
          !chartData[exists].data.includes(recDate)
            ? chartData[exists].data.push(recDate)
            : [];
        }
      });
    }

    setTimeout(() => {
      this.chartOptions.yAxis.max = this.daysCount ? this.daysCount + 1 : 32;

      this.chartOptions.xAxis.categories = categoryNames;
      this.chartOptions.series = chartData;

      this.getAlarmChartInfo.backUpChartData.series = JSON.parse(
        JSON.stringify(chartData)
      );
      this.getChartData = chartData;

      this.isBarChartLoading = false;

      if (!chartData.length) {
        this.graphData.emit([]);
        this.getAlarmChartInfo.enableNoRecords = true;
      } else {
        this.graphData.emit(this.getChartData);
      }
    });
  }

  /** Close Popup */
  closePopup() {
    $(".popup-overlay, .popup-content").removeClass("active");
  }

  // Filter Graph Data Based on Time Filter
  graphTimeFilter(event) {
    this.isLoading = true;
    this.getAlarmChartInfo.enableNoRecords = false;
    if (parseFloat(event)) {
      const getChartSeries = JSON.parse(
        JSON.stringify(this.getAlarmChartInfo.backUpChartData.series)
      )[0].data;
      let getUpdatedChartData = {
        series: [],
        categories: [],
      };

      getChartSeries.forEach((element) => {
        if (parseFloat(event) <= parseFloat(element.diffHours)) {
          getUpdatedChartData.series.push(element);
          getUpdatedChartData.categories.push(element.categories);
        }
      });
      this.chartOptions.xAxis.categories = getUpdatedChartData.categories;
      this.chartOptions.series = [
        { name: "", data: getUpdatedChartData.series },
      ];
      this.activeTab = "";
    } else {
      this.chartOptions.xAxis.categories =
        this.getAlarmChartInfo.backUpChartData.categories;
      this.chartOptions.series = this.getAlarmChartInfo.backUpChartData.series;
      this.activeTab = "";
    }
    setTimeout(() => {
      this.activeTab = "graph";
      this.isLoading = false;
      if (
        this.chartOptions.series[0] &&
        this.chartOptions.series[0].data &&
        !this.chartOptions.series[0].data.length
      ) {
        this.getAlarmChartInfo.enableNoRecords = true;
      }
    }, 500);
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }
}
