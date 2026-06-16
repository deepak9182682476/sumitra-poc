import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { drop, allowDrop } from "../../services/drag_drop_service";
import NavBar from "./navbar";
// import { VMS_SERVER_URL } from "../../config/deployment";
import {
  Card,
  CardContent,
  // Popover,
  Typography,
  Container,
  // FormGroup,
  // FormControlLabel,
  // Select,
  // Button,
  // Tooltip,
  Grid,
} from "@mui/material";

const Content = (props) => {
  const [container, setContainer] = useState(null);
  const [stateOptions, setStateOptions] = useState(null);
  // let expanded = false;

  const optionsJson = {
    speed_detection: {
      title: "Speed Detection",
      list: [
        {
          label: "Category",
          options: ["Person", "Car", "Truck"],
          selected: [],
        },
      ],
    },
    object_detection: {
      title: "Object Detection",
      list: [
        {
          label: "Category",
          options: ["Person", "Car", "Truck"],
          selected: [],
        },
      ],
    },
    track_objects: {
      title: "Track Objects",
      list: [
        {
          label: "Type",
          options: ["Single", "Multiple"],
          selected: [],
        },
        {
          label: "Category",
          options: ["Person", "Car", "Truck"],
          selected: [],
        },
      ],
    },
  };

  // const arrayToObject = (array, keyField) =>
  //   // eslint-disable-next-line array-callback-return
  //   array.reduce((obj, item) => {
  //     if (item.selected.length > 0) {
  //       obj[item[keyField].toLowerCase()] = item.selected;
  //       return obj;
  //     }
  //   }, {});

  // const action = (params) => {
  //   let new_params = Object.assign({}, params);
  //   let options = stateOptions[new_params.parent_key].list;
  //   const dataObject = arrayToObject(options, "label"); // get the selected items

  //   const imageId = document.getElementById(new_params.id);
  //   const camera_ip = imageId.getAttribute("data-ip"); // get the IP from image data-set

  //   if (new_params.name === "speed_detection") {
  //     let data = Object.assign({ ...dataObject, camera_ip: camera_ip });
  //     speedDetection(data);
  //   } else if (new_params.name === "object_detection") {
  //     let data = Object.assign({}, { camera_ip: camera_ip });
  //     objectDetection(data);
  //   } else if (new_params.name === "track_objects") {
  //     let data = Object.assign({ ...dataObject, camera_ip: camera_ip });
  //     trackObjects(data);
  //   }
  // };

  // const speedDetection = (data) => {
  //   // POST request using fetch with error handling
  //   const requestOptions = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(data),
  //   };

  //   fetch(VMS_SERVER_URL + "/speed-detection", requestOptions)
  //     .then(async (response) => {
  //       const isJson = response.headers
  //         .get("content-type")
  //         ?.includes("application/json");
  //       const data = isJson && (await response.json());

  //       // check for error response
  //       if (!response.ok) {
  //         // get error message from body or default to response status
  //         const error = (data && data.message) || response.status;
  //         return Promise.reject(error);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("error at while detecting of speed ", error);
  //     });
  // };

  // const objectDetection = (data) => {
  //   // POST request using fetch with error handling
  //   const requestOptions = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(data),
  //   };

  //   fetch(VMS_SERVER_URL + "/detect/objects", requestOptions)
  //     .then(async (response) => {
  //       const data = await response.json();

  //       // check for error response
  //       if (!response.ok) {
  //         // get error message from body or default to response status
  //         const error = (data && data.message) || response.status;
  //         return Promise.reject(error);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("error at while detecting of objects ", error);
  //     });
  // };

  // const trackObjects = (data) => {
  //   // POST request using fetch with error handling
  //   const requestOptions = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       camera_ip: data.camera_ip,
  //       classes: data.category,
  //       bbox: { x: data.x, y: data.y, w: data.w, h: data.h },
  //     }),
  //   };

  //   fetch(VMS_SERVER_URL + "/track/objects", requestOptions)
  //     .then(async (response) => {
  //       const data = await response.json();

  //       // check for error response
  //       if (!response.ok) {
  //         // get error message from body or default to response status
  //         const error = (data && data.message) || response.status;
  //         return Promise.reject(error);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("error at while tracking of objects ", error);
  //     });
  // };

  useEffect(() => {
    setStateOptions(optionsJson);
  }, [!stateOptions]);

  const fullScreen = (elementId) => {
    let elem = document.getElementById(elementId);
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  // const Collapse = ({ collapsed, children }) => {
  //   const [isCollapsed, setIsCollapsed] = useState(collapsed);
  //   return (
  //     <>
  //       <button
  //         className="btn btn-sm collapse-button"
  //         onClick={() => setIsCollapsed(!isCollapsed)}
  //       >
  //         {isCollapsed ? " \u02C4 " : " \u02C5 "}
  //       </button>
  //       <div
  //         className={`btn btn-sm collapse-content ${
  //           isCollapsed ? "collapsed" : "expanded"
  //         }`}
  //         aria-expanded={isCollapsed}
  //       >
  //         {children}
  //       </div>
  //     </>
  //   );
  // };

  // const showCheckboxes = (index) => {
  //   var checkboxes = document.getElementById("checkboxes-" + index);
  //   if (!expanded) {
  //     checkboxes.style.display = "block";
  //     expanded = true;
  //   } else {
  //     checkboxes.style.display = "none";
  //     expanded = false;
  //   }
  // };

  // const setValues = (params, label, value) => {
  //   let new_params = Object.assign({}, params);
  //   let options = stateOptions[new_params.parent_key].list;
  //   // eslint-disable-next-line array-callback-return
  //   let selectedItem = options.find((item) => {
  //     if (item.label === label) {
  //       return item;
  //     }
  //   });

  //   if (!selectedItem.selected.includes(value)) {
  //     selectedItem.selected.push(value);
  //   } else {
  //     var index = selectedItem.selected.indexOf(value);
  //     if (index > -1) {
  //       selectedItem.selected.splice(index, 1);
  //     }
  //   }

  //   setStateOptions({
  //     [new_params.parent_key]: selectedItem,
  //   });
  // };

  // const labelContent = (parent_key, label) => {

  //     let labelContent = "";

  //     let options = stateOptions[parent_key].list;
  //     let selectedItem = options.find((item) => {
  //         if (item.label === label) {
  //             return item;
  //         }
  //     });

  //     if (!selectedItem.selected.length) {
  //         labelContent = "None Selected";
  //     } else if (selectedItem.selected.length === selectedItem.options.length) {
  //         labelContent = "All Selected";
  //     } else if (selectedItem.selected.length === 1) {
  //         const selectedOne = selectedItem.options.find(item => item === value);
  //         labelContent = selectedOne;
  //     } else {
  //         labelContent = `${selectedItem.selected.length} Selected`;
  //     }
  // }

  // const clearSelectedValues = () => {
  //   Object.keys(stateOptions).map((item, index) => {
  //     return stateOptions[item].list.map((options, i) => {
  //       options.selected = [];
  //       return options;
  //     });
  //   });
  // };

  // const PopoverCustom = (params) => {
  //   const popover = (
  //     <Popover className="bottom-popover" id={`popover-positioned-top`}>
  //       <Typography>
  //         <Grid direction="row" className="align-items-center">
  //           {params.list.map((item, index) => {
  //             return (
  //               <Grid item xs="auto" key={index}>
  //                 <FormGroup controlId={"formGroup" + item.label}>
  //                   <FormControlLabel column="sm">
  //                     {item.label}
  //                   </FormControlLabel>
  //                   <div
  //                     className="multiselect"
  //                     key={index}
  //                     onBlur={() => showCheckboxes(index)}
  //                   >
  //                     <div
  //                       className="selectBox"
  //                       key={index}
  //                       onClick={() => showCheckboxes(index)}
  //                     >
  //                       <span></span>
  //                       <FormControlLabel>
  //                         <Select size="sm">
  //                           <option>Select an option</option>
  //                         </Select>
  //                       </FormControlLabel>
  //                       <div className="overSelect" key={index}></div>
  //                       <div
  //                         className="select-cbox"
  //                         id={"checkboxes-" + index}
  //                         key={"check-" + index}
  //                       >
  //                         {item.options.map((value, i) => {
  //                           return (
  //                             <label htmlFor={value} key={"label-" + i}>
  //                               &nbsp;
  //                               <input
  //                                 type="checkbox"
  //                                 key={i}
  //                                 id={"cbox-" + i}
  //                                 onClick={() =>
  //                                   setValues(params, item.label, value)
  //                                 }
  //                               />
  //                               &nbsp;{value}
  //                             </label>
  //                           );
  //                         })}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </FormGroup>
  //               </Grid>
  //             );
  //           })}
  //           <Grid item xs="auto">
  //             <Button
  //               type="button"
  //               variant="secondary"
  //               size="sm"
  //               className="mt-4"
  //               onClick={() => action(params)}
  //             >
  //               {params.name === "track_objects" ? "Track" : "Detect"}
  //             </Button>
  //           </Grid>
  //         </Grid>
  //       </Typography>
  //     </Popover>
  //   );

  //   return (
  //     <Tooltip
  //       trigger="click"
  //       rootClose
  //       key="top"
  //       placement="top"
  //       overlay={popover}
  //     >
  //       <Button
  //         className="track-btn"
  //         variant="link"
  //         onClick={() => clearSelectedValues()}
  //       >
  //         {params.title}
  //       </Button>
  //     </Tooltip>
  //   );
  // };

  const getFramesSource = (detectedFrames, frameId) => {
    const defaultSrc = "/assets/default.png";
    let returnVal = "";
    const idx = detectedFrames.findIndex((rec) => rec.frame_id === frameId);
    if (idx !== -1) {
      returnVal = detectedFrames[idx].frame_ip;
    } else {
      returnVal = defaultSrc;
    }
    return returnVal;
  };

  const generateGrid = (grid_size) => {
    if (grid_size) {
      setContainer(null);
      const { frames_detections } = props;

      var selValues = grid_size.split(",");
      var rowNum = selValues[0];
      var colNum = selValues[1];

      setContainer(
        <Grid container id="container" className="content-ht">
          {Array.from({ length: rowNum }).map((row, rowindex) => (
            <Grid
              container
              sx={{ flexGrow: 1 }}
              spacing={0.5}
              key={rowindex}
              className="row"
            >
              {Array.from({ length: colNum }).map((col, colindex) => (
                <Grid
                  item
                  key={rowindex + "_" + colindex}
                  className="col camera-div"
                  id={"fr-" + rowindex + "-" + colindex}
                  onDrop={(event) => drop(event, props)}
                  onDragOver={(event) => allowDrop(event)}
                >
                  <div className="top-frame" style={{ display: "none" }}>
                    <span
                      className="top-fr-title"
                      key={rowindex + colindex}
                      id={"span-" + rowindex + "-" + colindex}
                    ></span>
                    <ul className="ul-hlist">
                      <li className="c-pd">
                        <img
                          src="/assets/live.png"
                          alt="live"
                          title="Live Video"
                        />
                      </li>
                      <li className="c-pd svg-wht">
                        <img
                          src="/assets/fullscreen.svg"
                          title="Full Screen"
                          alt="fullscreen"
                          onClick={() =>
                            fullScreen("frame-" + rowindex + "-" + colindex)
                          }
                        />
                      </li>
                    </ul>
                  </div>
                  <Grid container className="image-frame">
                    <img
                      src={getFramesSource(
                        frames_detections,
                        `frame-${rowindex}-${colindex}`
                      )}
                      alt="fitimage"
                      className="fit-image"
                      id={`frame-${rowindex}-${colindex}`}
                    />
                  </Grid>
                  {/* <div className="bottom-frame" style={{ display: "none" }}>
                                            <Collapse collapsed={true}>
                                                <ul className="ul-hlist">
                                                    {
                                                        stateOptions && stateOptions ?
                                                            Object.keys(stateOptions).map((item, index) => {
                                                                return <li key={index} className="c-pd">
                                                                    <PopoverCustom id={'frame-' + rowindex + '-' + colindex} list={stateOptions[item].list} name={item} title={stateOptions[item].title} parent_key={item} />
                                                                </li>;
                                                            })
                                                            :
                                                            null
                                                    }
                                                    <li className="c-pd svg-wht">
                                                        <img src="/assets/backward.svg" title="Skip Previous" />
                                                    </li>
                                                    <li className="c-pd">
                                                        <img src="/assets/notlive.png" title="Skip to Live Video" style={{ display: "none" }} />
                                                    </li>
                                                </ul>
                                            </Collapse>
                                        </div> */}
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      );
    }
  };
  return (
    <>
      {stateOptions ? (
        <Card
          className="box"
          sx={{
            backgroundColor: "#CCDCC1",
            p: 0.5,
            borderRadius: "10px",
            ml: -2,
          }}
        >
          <CardContent className="box-pd">
            <Typography component="div">
              <NavBar
                toggle={props.toggle}
                setContentGridSize={(val) => generateGrid(val)}
                gridContentSize={(val) => props.setGridSize(val)}
                defaultGridContentSize={props.defaultGridContentSize}
              />
            </Typography>
            <Typography variant="body2">
              <Container
                fluid
                className={classNames("content", { "is-open": props.isOpen })}
              >
                {container}
              </Container>
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
};

export default Content;
