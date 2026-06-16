import React from "react";
import { useHistory } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import ArrowCircleLeftSharpIcon from "@mui/icons-material/ArrowCircleLeftSharp";

import { useLocation } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const useStyles = makeStyles((theme) => ({
  welcomeText: {
    color: "#76B845",
    fontSize: "20px",
    fontWeight: "bold",
    marginLeft: "1rem",
    marginBottom: "-1rem",
  },
  dashboardTitles: {
    display: "block",
    backgroundColor: "#DCDCDC",
    textAlign: "center",
    fontSize: "13px",
    color: "#4A4A4A",
    padding: "8px",
    marginBottom: "4px",
  },
  cameraCountGridCls: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "8px",
    height: "150px !important",
  },
  cameraCountBoxCls: {
    display: "flex",
    gap: "8px",
    marginTop: "-16px",
    alignItems: "center",
  },
  cameraNameText: {
    fontSize: "13px",
    fontWeight: "bold",
  },
  cameraCountTextBox: {
    backgroundColor: "#37720B",
    width: "120%",
  },
  cameraCountText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    padding: "2px",
    fontSize: "13px",
  },
}));

const EventDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const selectedService = location.state?.selectedService;

  const barData = {
    labels: Array.from(
      { length: 24 },
      (_, hour) => `${hour.toString().padStart(2, "0")}:00`
    ),
    datasets: [
      {
        label: "ATCC",
        data: [
          5, 5, 4, 4, 6, 15, 30, 45, 60, 80, 90, 85, 88, 80, 75, 70, 65, 60, 50,
          30, 20, 15, 10, 5,
        ],
        backgroundColor: "#76B845",
      },
      {
        label: "Crowd Density",
        data: [
          23, 23, 33, 42, 62, 28, 35, 55, 70, 85, 92, 88, 90, 83, 78, 72, 68,
          60, 45, 25, 18, 12, 8, 4,
        ],
        backgroundColor: "#E5881E",
      },
      {
        label: "RLVD",
        data: [
          10, 20, 11, 19, 22, 16, 18, 20, 30, 25, 22, 20, 18, 17, 15, 14, 13,
          12, 10, 8, 5, 3, 2, 1,
        ],
        backgroundColor: "#1E88E5",
      },
      {
        label: "SLVD",
        data: [
          17, 19, 18, 19, 21, 15, 18, 15, 18, 20, 22, 25, 24, 22, 20, 18, 17,
          15, 10, 6, 4, 3, 2, 1,
        ],
        backgroundColor: "#F0B28B",
      },
      {
        label: "Other",
        data: [
          15, 15, 24, 24, 16, 15, 30, 45, 60, 80, 90, 85, 88, 80, 75, 70, 65,
          60, 50, 30, 20, 15, 10, 5,
        ],
        backgroundColor: "#000",
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
          font: {
            size: 10,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        // title: {
        //   display: true,
        //   text: "Count",
        // },
      },
      x: {
        grid: {
          display: false,
        },
        // title: {
        //   display: true,
        //   text: "Hour of the Day",
        // },
      },
    },
  };

  const pieData = {
    labels: ["Configured", "Unconfigured", "Unmonitored"],
    datasets: [
      {
        label: "Device Status",
        data: [5, 80, 15],
        backgroundColor: ["#76B845", "#E5881E", "#1E88E5"],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
    },
  };
  const donutData = {
    labels: ["Category A", "Category B", "Category C", "Category D"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ["#E51E1E", "#E5881E", "#76B845", "#1E88E5"],
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Grid container spacing={2} padding={2} sx={{ marginTop: 6 }}>
      <Box sx={{ display: "flex" }}>
        <IconButton
          onClick={() => history.push("/home")}
          color="inherit"
          sx={{ color: "#37720B", mt: -0.7 }}
        >
          <ArrowCircleLeftSharpIcon />
        </IconButton>
        <Typography className={classes.welcomeText}>
          {selectedService}
        </Typography>
      </Box>
      <Grid item xs={12}>
        <Typography className={classes.dashboardTitles}>
          Event Trends
        </Typography>
        <Card>
          <CardContent>
            {/* <Bar data={barData} options={{ responsive: true }} /> */}
            <div style={{ height: "250px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Typography className={classes.dashboardTitles}>Priority </Typography>
        <Card>
          <CardContent>
            <div style={{ height: "160px" }}>
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Typography className={classes.dashboardTitles}>
          Device Status
        </Typography>
        <Card>
          <CardContent>
            <div style={{ height: "160px" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        {" "}
        <Typography className={classes.dashboardTitles}>
          Camera Count{" "}
        </Typography>
        <Card>
          <CardContent>
            <Grid className={classes.cameraCountGridCls}>
              <Box className={classes.cameraCountBoxCls}>
                {/* <CameraAltOutlined sx={{ color: "black" }} /> */}
                <img
                  src="assets/images/DashboardPageIcons/ATCC_Icon.svg"
                  alt="ATCC_ICON"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "25%",
                  }}
                ></img>
                <Typography className={classes.cameraNameText}>ATCC</Typography>
                <Box className={classes.cameraCountTextBox}>
                  <Typography className={classes.cameraCountText}>
                    230
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.cameraCountBoxCls}>
                <img
                  src="assets/images/DashboardPageIcons/ATCS_Icon.svg"
                  alt="ATCS_ICON"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "25%",
                  }}
                ></img>
                <Typography className={classes.cameraNameText}>ATCS</Typography>

                <Box className={classes.cameraCountTextBox}>
                  <Typography className={classes.cameraCountText}>
                    230
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.cameraCountBoxCls}>
                <img
                  src="assets/images/DashboardPageIcons/RLVD_Icon.svg"
                  alt="RLVD_ICON"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "25%",
                  }}
                ></img>

                <Typography
                  className={classes.cameraNameText}
                  sx={{ marginLeft: "-4px" }}
                >
                  RLVD
                </Typography>
                <Box className={classes.cameraCountTextBox}>
                  <Typography className={classes.cameraCountText}>
                    230
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.cameraCountBoxCls}>
                <img
                  src="assets/images/DashboardPageIcons/SLVD_Icon.svg"
                  alt="SLVD_ICON"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "25%",
                    marginLeft: "5px",
                  }}
                ></img>
                <Typography
                  className={classes.cameraNameText}
                  sx={{ marginLeft: "4px" }}
                >
                  SLVD
                </Typography>

                <Box className={classes.cameraCountTextBox}>
                  <Typography className={classes.cameraCountText}>
                    230
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EventDashboard;



// import React from "react";
// import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
// import { makeStyles, useTheme } from "@mui/styles";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar, Pie, Doughnut } from "react-chartjs-2";
// import { CameraAltOutlined } from "@mui/icons-material";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend
// );

// const useStyles = makeStyles((theme) => ({
//   welcomeText: {
//     color: "#76B845",
//     fontSize: "20px",
//     fontWeight: "bold",
//     marginLeft: "1rem",
//     marginBottom: "-1rem",
//   },
//   dashboardTitles: {
//     display: "block",
//     backgroundColor: "#DCDCDC",
//     textAlign: "center",
//     fontSize: "13px",
//     color: "#4A4A4A",
//     padding: "8px",
//     marginBottom: "4px",
//   },
//   cameraCountGridCls: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "20px",
//     marginTop: "8px",
//     height: "150px !important",
//   },
//   cameraCountBoxCls: {
//     display: "flex",
//     gap: "8px",
//     marginTop: "-16px",
//     alignItems: "center",
//   },
//   cameraNameText: {
//     fontSize: "13px",
//     fontWeight: "bold",
//   },
//   cameraCountTextBox: {
//     backgroundColor: "#37720B",
//     width: "120%",
//   },
//   cameraCountText: {
//     textAlign: "center",
//     color: "#fff",
//     fontWeight: "bold",
//     padding: "2px",
//     fontSize: "13px",
//   },
// }));

// const EventDashboard = () => {
//   const classes = useStyles();

//   const barData = {
//     labels: Array.from(
//       { length: 24 },
//       (_, hour) => `${hour.toString().padStart(2, "0")}:00`
//     ),
//     datasets: [
//       {
//         label: "ATCC",
//         data: [
//           5, 5, 4, 4, 6, 15, 30, 45, 60, 80, 90, 85, 88, 80, 75, 70, 65, 60, 50,
//           30, 20, 15, 10, 5,
//         ],
//         backgroundColor: "#76B845",
//       },
//       {
//         label: "Crowd Density",
//         data: [
//           23, 23, 33, 42, 62, 28, 35, 55, 70, 85, 92, 88, 90, 83, 78, 72, 68,
//           60, 45, 25, 18, 12, 8, 4,
//         ],
//         backgroundColor: "#E5881E",
//       },
//       {
//         label: "RLVD",
//         data: [
//           10, 20, 11, 19, 22, 16, 18, 20, 30, 25, 22, 20, 18, 17, 15, 14, 13,
//           12, 10, 8, 5, 3, 2, 1,
//         ],
//         backgroundColor: "#1E88E5",
//       },
//       {
//         label: "SLVD",
//         data: [
//           17, 19, 18, 19, 21, 15, 18, 15, 18, 20, 22, 25, 24, 22, 20, 18, 17,
//           15, 10, 6, 4, 3, 2, 1,
//         ],
//         backgroundColor: "#F0B28B",
//       },
//       {
//         label: "Other",
//         data: [
//           15, 15, 24, 24, 16, 15, 30, 45, 60, 80, 90, 85, 88, 80, 75, 70, 65,
//           60, 50, 30, 20, 15, 10, 5,
//         ],
//         backgroundColor: "#000",
//       },
//     ],
//   };
//   const barOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "bottom",
//         labels: {
//           boxWidth: 10,
//           boxHeight: 10,
//           padding: 10,
//           font: {
//             size: 10,
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           display: false,
//         },
//         // title: {
//         //   display: true,
//         //   text: "Count",
//         // },
//       },
//       x: {
//         grid: {
//           display: false,
//         },
//         // title: {
//         //   display: true,
//         //   text: "Hour of the Day",
//         // },
//       },
//     },
//   };

//   const pieData = {
//     labels: ["Configured", "Unconfigured", "Unmonitored"],
//     datasets: [
//       {
//         label: "Device Status",
//         data: [5, 80, 15],
//         backgroundColor: ["#76B845", "#E5881E", "#1E88E5"],
//         borderWidth: 0,
//       },
//     ],
//   };

//   const pieOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "right",
//         labels: {
//           boxWidth: 10,
//           boxHeight: 10,
//           padding: 10,
//           font: {
//             size: 12,
//           },
//         },
//       },
//     },
//   };
//   const donutData = {
//     labels: ["Category A", "Category B", "Category C", "Category D"],
//     datasets: [
//       {
//         data: [45, 25, 20, 10],
//         backgroundColor: ["#E51E1E", "#E5881E", "#76B845", "#1E88E5"],
//         borderWidth: 0,
//         hoverOffset: 0,
//       },
//     ],
//   };
//   const donutOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: "60%",
//     plugins: {
//       legend: {
//         position: "right",
//         labels: {
//           boxWidth: 10,
//           boxHeight: 10,
//           padding: 10,
//           font: {
//             size: 12,
//           },
//         },
//       },
//     },
//   };

//   return (
//     <Grid container spacing={2} padding={2} sx={{ marginTop: 6 }}>
//       <Typography className={classes.welcomeText}>Welcome</Typography>
//       <Grid item xs={12}>
//         <Typography className={classes.dashboardTitles}>
//           Event Trends
//         </Typography>
//         <Card>
//           <CardContent>
//             {/* <Bar data={barData} options={{ responsive: true }} /> */}
//             <div style={{ height: "250px" }}>
//               <Bar data={barData} options={barOptions} />
//             </div>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} sm={6} md={4}>
//         <Typography className={classes.dashboardTitles}>Priority </Typography>
//         <Card>
//           <CardContent>
//             <div style={{ height: "160px" }}>
//               <Doughnut data={donutData} options={donutOptions} />
//             </div>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} sm={6} md={4}>
//         <Typography className={classes.dashboardTitles}>
//           Device Status
//         </Typography>
//         <Card>
//           <CardContent>
//             <div style={{ height: "160px" }}>
//               <Pie data={pieData} options={pieOptions} />
//             </div>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} sm={6} md={4}>
//         {" "}
//         <Typography className={classes.dashboardTitles}>
//           Camera Count{" "}
//         </Typography>
//         <Card>
//           <CardContent>
//             <Grid className={classes.cameraCountGridCls}>
//               <Box className={classes.cameraCountBoxCls}>
//                 {/* <CameraAltOutlined sx={{ color: "black" }} /> */}
//                 <img
//                   src="assets/images/DashboardPageIcons/ATCC_Icon.svg"
//                   alt="ATCC_ICON"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     borderRadius: "25%",
//                   }}
//                 ></img>
//                 <Typography className={classes.cameraNameText}>ATCC</Typography>
//                 <Box className={classes.cameraCountTextBox}>
//                   <Typography className={classes.cameraCountText}>
//                     230
//                   </Typography>
//                 </Box>
//               </Box>
//               <Box className={classes.cameraCountBoxCls}>
//                 <img
//                   src="assets/images/DashboardPageIcons/ATCS_Icon.svg"
//                   alt="ATCS_ICON"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     borderRadius: "25%",
//                   }}
//                 ></img>
//                 <Typography className={classes.cameraNameText}>ATCS</Typography>

//                 <Box className={classes.cameraCountTextBox}>
//                   <Typography className={classes.cameraCountText}>
//                     230
//                   </Typography>
//                 </Box>
//               </Box>
//               <Box className={classes.cameraCountBoxCls}>
//                 <img
//                   src="assets/images/DashboardPageIcons/RLVD_Icon.svg"
//                   alt="RLVD_ICON"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     borderRadius: "25%",
//                   }}
//                 ></img>

//                 <Typography
//                   className={classes.cameraNameText}
//                   sx={{ marginLeft: "-4px" }}
//                 >
//                   RLVD
//                 </Typography>
//                 <Box className={classes.cameraCountTextBox}>
//                   <Typography className={classes.cameraCountText}>
//                     230
//                   </Typography>
//                 </Box>
//               </Box>
//               <Box className={classes.cameraCountBoxCls}>
//                 <img
//                   src="assets/images/DashboardPageIcons/SLVD_Icon.svg"
//                   alt="SLVD_ICON"
//                   style={{
//                     width: "28px",
//                     height: "28px",
//                     borderRadius: "25%",
//                     marginLeft: "5px",
//                   }}
//                 ></img>
//                 <Typography
//                   className={classes.cameraNameText}
//                   sx={{ marginLeft: "4px" }}
//                 >
//                   SLVD
//                 </Typography>

//                 <Box className={classes.cameraCountTextBox}>
//                   <Typography className={classes.cameraCountText}>
//                     230
//                   </Typography>
//                 </Box>
//               </Box>
//             </Grid>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// };

// export default EventDashboard;
