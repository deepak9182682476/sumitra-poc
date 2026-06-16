import _ from "lodash";
import { config_data } from "./config";

export const getMapData = (violations) => {
  var json = violations;
  var geojson = {
    type: "FeatureCollection",
    features: [],
  };

  for (let i = 0; i < json.length; i++) {
    geojson.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [json[i].lon, json[i].lat],
      },
      properties: {
        camera_name: json[i].camera_name,
        commisionerate: json[i].commisionerate,
        created_on: json[i].created_on,
        id: json[i].id,
        ip_address: json[i].ip_address,
        is_active: json[i].is_active,
        police_station: json[i].police_station,
        priority: json[i].priority,
        rtsp: json[i].rtsp,
        value: json[i].sum,
        zone: json[i].zone,
      },
    });
  }

  return geojson;
};

export const getAnalyticsData = (violations, filterparams) => {
  var data = {
    violated_persons: 0,
    total_persons: 0,
    groups: 0,
    index: 0,
  };
  var filters = filterparams || config_data.camera;

  if (violations && violations.length && filters) {
    let filteredViolations = violations.filter(
      (rec) =>
        rec.commisionerate === filters.commisionerate &&
        rec.zone === filters.zone &&
        rec.police_station === filters.police_station
    );

    data["violated_persons"] = _.sumBy(
      filteredViolations,
      (rec) => rec.sum_number_of_person_in_group
    );
    data["total_persons"] = _.sumBy(
      filteredViolations,
      (rec) => rec.sum_total_person
    );
    data["groups"] = _.sumBy(
      filteredViolations,
      (rec) => rec.sum_number_of_group
    );
    data["index"] =
      data.violated_persons && data.groups
        ? (data.violated_persons / data.groups).toFixed(4)
        : 0;
  }

  return data;
};

export const getAnalysisData = (occurencesObj) => {
  var data = {
    models_count: 0,
    events_count: 0,
  };

  data["models_count"] = occurencesObj.models ? occurencesObj.models.models_count : 0;
  data["events_count"] = occurencesObj.events ? occurencesObj.events.events_count : 0;

  return data;
};

export const getBarGraphData = (violations, filterparams) => {
  let groupedByCameraData = _.groupBy(violations, "camera_name");
  var filters = filterparams || config_data.camera;
  let data = [];
  // eslint-disable-next-line array-callback-return
  Object.keys(groupedByCameraData).map((key) => {
    let count;
    if (
      filters &&
      groupedByCameraData[key][0].commisionerate === filters.commisionerate &&
      groupedByCameraData[key][0].zone === filters.zone &&
      groupedByCameraData[key][0].police_station === filters.police_station
    ) {
      if (groupedByCameraData[key].length > 1) {
        count = _.sumBy(
          groupedByCameraData[key],
          (rec) => rec.sum_number_of_person_in_group
        );
      } else {
        count = groupedByCameraData[key][0].sum_number_of_person_in_group;
      }
      data.push([key, count]);
    }
  });
  data?.sort((a, b) => b[1] - a[1]);
  data = data.length > 10 ? data.slice(0, 10) : data;
  let graphData = [
    {
      type: "bar",
      x: data.map((a) => a[0]),
      y: data.map((a) => a[1]),
    },
  ];
  // console.log('graphData', graphData);
  return graphData;
};

export const getAnalysisBarGraphData = (obj) => {
  // console.log('analysis bar graph data', obj,);
  let data = [];
  if(obj){
    const camerasData = obj?.events?.cameras_data;
    if(camerasData && camerasData.length){
      let dataArr = camerasData;
      // eslint-disable-next-line array-callback-return
      dataArr.map((rec, index) => {
        let key = Object.keys(rec)[0]
        let count = camerasData[index][key];
        data.push([key, count]);
      })
    }
  }
  // console.log('analysis bar graph data', data);

  let graphData = [
    {
      type: "bar",
      x: data.map((a) => a[0]),
      y: data.map((a) => a[1]),
    },
  ];
  return graphData;
}
