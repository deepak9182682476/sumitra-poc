const information_data = [
  {
    usecases: [
      {
        name: "Crowd Density",
        latency: "10ms",
        accuracy_before: "80%",
        gpu_used: "80%",
        dataset_size: "50GB",
        accuracy_after: "90%",
        tech_stack: ["Tao Toolkit", "DeepStream SDK"],
      },
      {
        name: "Traffic Congestion",
        latency: "10ms",
        accuracy_before: "80%",
        gpu_used: "80%",
        dataset_size: "50GB",
        accuracy_after: "90%",
        tech_stack: ["Tao Toolkit", "DeepStream SDK"],
      },
      {
        name: "Digital Fencing",
        latency: "10ms",
        accuracy_before: "80%",
        gpu_used: "80%",
        dataset_size: "50GB",
        accuracy_after: "90%",
        tech_stack: ["Tao Toolkit", "DeepStream SDK"],
      },
      {
        name: "Queue Count",
        latency: "10ms",
        accuracy_before: "80%",
        gpu_used: "80%",
        dataset_size: "50GB",
        accuracy_after: "90%",
        tech_stack: ["Tao Toolkit", "DeepStream SDK"],
      },
      {
        name: "PPE Kit",
        latency: "10ms",
        accuracy_before: "80%",
        gpu_used: "80%",
        dataset_size: "50GB",
        accuracy_after: "90%",
        tech_stack: ["Tao Toolkit", "DeepStream SDK"],
      },
    ],
  },
];

const information_keys = {
  latency: "Latency",
  accuracy_before: "Accuracy (Before)",
  gpu_used: "GPU Used",
  dataset_size: "Dataset Size",
  accuracy_after: "Accuracy (After)",
  tech_stack: "Tech Stack",
};

const info_utils = {
  information_data,
  information_keys,
};

module.exports = {
  info_utils,
};
