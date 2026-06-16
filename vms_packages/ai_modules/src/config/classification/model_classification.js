export const MODELS = [
  {
    id: 1,
    label: "Social Distancing",
    key: "social_distance",
    description: "Avoid close contact with people who are sick. ... ",
    color: "#24C6DA",
  },
  {
    id: 2,
    label: "Mask Detection",
    key: "mask_detection",
    description:
      "mask detection refers to detect whether a person is wearing a mask or not.",
    color: "#AFB42C",
  },
  {
    id: 3,
    label: "Pothole Detection",
    key: "pothole",
    description:
      "civic authority can detect and locate potholes and assess their magnitudes so that they ...",
    color: "#FD9101",
  },
  {
    id: 4,
    label: "Image Enrichment",
    key: "image_enrichment",
    description:
      "The main problem in image fusion is that how to determine the best procedure to combine multiple images.",
    color: "#e7d825",
  },
  {
    id: 5,
    label: "ANPR Detection & OCR",
    key: "anpr",
    description:
      "ANPR technology comprises of optical character recognition (OCR), coupled with Artificial Intelligence based sophisticated software algorithms",
    color: "#ff2863",
  },
  {
    id: 6,
    label: "Wrong Movement Detection",
    description:
      " it is described a solution to detect wrong way drivers on ... learned orientation model to detect objects moving ",
    key: "wrong_movement",
    color: "#bf01fd",
  },
  {
    id: 7,
    label: "Speed Detection",
    key: "speed_detection",
    description:
      "Vehicle speed detection is used to estimate the velocity of the moving vehicle using image and video processing techniques",
    color: "#bcd752",
  },
  {
    id: 8,
    label: "Face Similarity",
    key: "face_similarity",
    description:
      "Check the possibility of two faces refers to the same person the system provides the confidence score and threshold value to decide the similarity",
    color: "#00ffd0",
  },
  {
    id: 9,
    label: "Crowd Detection",
    key: "crowd_detection",
    description:
      "Check the possibility of two faces refers to the same person the system provides the confidence score and threshold value to decide the similarity",
    color: "#00ffd0",
  },
  {
    id: 10,
    label: "Face Recognition",
    key: "face_recognition",
    description:
      "recognition of existing persons",
    color: "#24C6DA",
  }
];

export const getModelType = (key) => {
  let filterValue = MODELS.find((evt) => {
    return evt.key === key ? evt.key : null;
  });
  return filterValue;
};

export const MODELS_GROUP = [
  {
    id: 1,
    label: "Group 1",
    key: "group_1",
    models: ["Social Distancing", "Mask Detection"],
  },
  {
    id: 2,
    label: "Group 2",
    key: "group_2",
    models: [
      "Social Distancing",
      "Mask Detection",
      "Pothole Detection",
      "Image Enrichment",
      "ANPR Detection & OCR",
      "Wrong Movement Detection",
      "Speed Detection",
      "Face Similarity",
    ],
  },
  {
    id: 3,
    label: "Group 3",
    key: "group_3",
    models: ["Social Distancing"],
  },
  {
    id: 4,
    label: "Group 4",
    key: "group_4",
    models: ["ANPR Detection & OCR", "Wrong Movement Detection"],
  },
  {
    id: 5,
    label: "Group 5",
    key: "group_5",
    models: ["Face Similarity"],
  },
];
