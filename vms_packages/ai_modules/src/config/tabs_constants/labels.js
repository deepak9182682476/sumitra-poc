export const LABELS = {
  SELECT_CAMERA: "Camera Name",
  MODEL: "Model",
  ID: "ID",
  LIVE_ALERTS: "Live Alerts",
  AREA_SELECTION_TOOL: "Area Selection Tool",
  RESIZE_FACTOR: "Resize Factor",
  MODEL_GROUP: "Model Group",
  SEVERITY: "Severity",
  SCHEDULE: "Schedule",
  FRAMES_PER_SECOND: "Frames Per Second",
  SELECTED_MODEL: "Selected Model"
};

export const leftCheckboxLabels = [
  {
    label: "Day Time",
    value: "day_time",
    placement: "start",
    checked: false,
  },
  {
    label: "Default",
    value: "default",
    placement: "start",
    checked: false,
  },
];

export const rightCheckboxLabels = [
  {
    label: "Night Time",
    value: "night_time",
    placement: "start",
    checked: false,
  },
  {
    label: "Default",
    value: "default",
    placement: "start",
    checked: false,
  },
];

export const sliderCameraSetting = [
  {
    label: "Contrast",
    key: "contrast",
    defaultValue: 5,
    value: 0,
  },
  {
    label: "Brightness",
    key: "brightness",
    defaultValue: 6,
    value: 0,
  },
  {
    label: "Gamma Correction",
    key: "gamma_correction",
    defaultValue: 4,
    value: 0,
  },
  {
    label: "Histogram Equalizer",
    key: "histogram_equalizer",
    defaultValue: 5,
    value: 0,
  },
];
