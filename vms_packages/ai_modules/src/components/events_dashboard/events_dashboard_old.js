// import React from "react";
// import {
//   BarChart,
//   Bar,
//   Line,
//   LineChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { Box, Typography, Grid, Paper, LinearProgress } from "@mui/material";

// const powerData = [
//   {
//     month: "JAN",
//     power: 30000,
//     basePower: 20000,
//     actualCost: 15000,
//     baselineCost: 12000,
//   },
//   {
//     month: "FEB",
//     power: 50000,
//     basePower: 25000,
//     actualCost: 20000,
//     baselineCost: 18000,
//   },
//   {
//     month: "MAR",
//     power: 60000,
//     basePower: 30000,
//     actualCost: 24000,
//     baselineCost: 20000,
//   },
//   {
//     month: "APR",
//     power: 70000,
//     basePower: 35000,
//     actualCost: 27000,
//     baselineCost: 22000,
//   },
//   {
//     month: "MAY",
//     power: 90000,
//     basePower: 40000,
//     actualCost: 32000,
//     baselineCost: 25000,
//   },
//   {
//     month: "JUN",
//     power: 75000,
//     basePower: 38000,
//     actualCost: 29000,
//     baselineCost: 26000,
//   },
//   {
//     month: "JUL",
//     power: 85000,
//     basePower: 40000,
//     actualCost: 31000,
//     baselineCost: 24000,
//   },
//   {
//     month: "AUG",
//     power: 65000,
//     basePower: 30000,
//     actualCost: 27000,
//     baselineCost: 20000,
//   },
//   {
//     month: "SEP",
//     power: 80000,
//     basePower: 36000,
//     actualCost: 30000,
//     baselineCost: 23000,
//   },
//   {
//     month: "OCT",
//     power: 78000,
//     basePower: 35000,
//     actualCost: 28000,
//     baselineCost: 22000,
//   },
//   {
//     month: "NOV",
//     power: 70000,
//     basePower: 33000,
//     actualCost: 26000,
//     baselineCost: 21000,
//   },
//   {
//     month: "DEC",
//     power: 72000,
//     basePower: 34000,
//     actualCost: 25000,
//     baselineCost: 20000,
//   },
// ];

// const priorityData = [
//   { name: "Past Due", value: 50 },
//   { name: "Due Within 7 days", value: 25 },
//   { name: "Due in 8 or more days", value: 13 },
//   { name: "Ready for Review", value: 12 },
// ];

// const deviceStatusData = [
//   { name: "Configured", value: 80 },
//   { name: "Unconfigured", value: 13 },
//   { name: "Unmonitored", value: 5 },
//   { name: "Other", value: 2 },
// ];

// const cameraCounts = [
//   { name: "ATCC", count: 230 },
//   { name: "ATCS", count: 190 },
//   { name: "RLVD", count: 181 },
//   { name: "SLVD", count: 10 },
// ];

// const COLORS = ["#FF4D4D", "#FFB400", "#59A14F", "#4E79A7"];

// const EventDashboard = () => {
//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h5" sx={{ color: "#76B845", mb: 2 }}>
//         Welcome
//       </Typography>

//       {/* Power Chart */}
//       <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
//         <Typography variant="h6" textAlign="center" sx={{ mb: 1 }}>
//           Power Consumption & Power Cost (Monthly)
//         </Typography>
//         <ResponsiveContainer width="100%" height={300}>
//           <ComposedChart data={powerData}>
//             <CartesianGrid stroke="#ccc" />
//             <XAxis dataKey="month" />
//             <YAxis yAxisId="left" orientation="left" />
//             <YAxis yAxisId="right" orientation="right" />
//             <Tooltip />
//             <Legend />
//             <Bar yAxisId="left" dataKey="power" fill="#4E9A06" name="Power" />
//             <Bar
//               yAxisId="left"
//               dataKey="basePower"
//               fill="#A1D99B"
//               name="Baseline Power"
//             />
//             <Line
//               yAxisId="right"
//               type="monotone"
//               dataKey="actualCost"
//               stroke="#FF9900"
//               name="Actual Cost"
//             />
//             <Line
//               yAxisId="right"
//               type="monotone"
//               dataKey="baselineCost"
//               stroke="#37720B"
//               name="Baseline Cost"
//             />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </Paper>

//       {/* Lower section: Pie Charts + Camera Count */}
//       <Grid container spacing={2}>
//         {/* Priority Chart */}
//         <Grid item xs={12} md={4}>
//           <Paper elevation={2} sx={{ p: 2 }}>
//             <Typography variant="h6" textAlign="center">
//               Priority
//             </Typography>
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie
//                   data={priorityData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={40}
//                   outerRadius={60}
//                   label
//                 >
//                   {priorityData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={COLORS[index % COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//               </PieChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         {/* Device Status Chart */}
//         <Grid item xs={12} md={4}>
//           <Paper elevation={2} sx={{ p: 2 }}>
//             <Typography variant="h6" textAlign="center">
//               Device Status
//             </Typography>
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie
//                   data={deviceStatusData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={70}
//                   label
//                 >
//                   {deviceStatusData.map((entry, index) => (
//                     <Cell
//                       key={`cell-status-${index}`}
//                       fill={COLORS[index % COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//               </PieChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         {/* Camera Count Bars */}
//         <Grid item xs={12} md={4}>
//           <Paper elevation={2} sx={{ p: 2 }}>
//             <Typography variant="h6" textAlign="center">
//               Camera Count
//             </Typography>
//             <Box>
//               {cameraCounts.map((item, idx) => (
//                 <Box key={item.name} sx={{ mb: 1 }}>
//                   <Typography fontSize="14px" sx={{ mb: 0.5 }}>
//                     {item.name}
//                   </Typography>
//                   <LinearProgress
//                     variant="determinate"
//                     value={Math.min((item.count / 230) * 100, 100)}
//                     sx={{
//                       height: 10,
//                       borderRadius: 5,
//                       backgroundColor: "#ddd",
//                       "& .MuiLinearProgress-bar": {
//                         backgroundColor: [
//                           "#4CAF50",
//                           "#FBC02D",
//                           "#FF9800",
//                           "#E53935",
//                         ][idx],
//                       },
//                     }}
//                   />
//                 </Box>
//               ))}
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default EventDashboard;

// const ComposedChart = ({ data, ...props }) => (
//   <BarChart data={data} {...props}>
//     {props.children}
//   </BarChart>
// );

import React from "react";

const EventDashboard = () => {
  return <div></div>;
};

export default EventDashboard;
