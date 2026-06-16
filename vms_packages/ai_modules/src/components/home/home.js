import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import trafficCongestion from "../../assets/images/info_page/Traffic_Congestion.svg";
import crowdDensity from "../../assets/images/info_page/CrowdDensity.svg";
import EngineeringIcon from "../../assets/images/info_page/engineering.svg";
import TipsAndUpdatesIcon from "../../assets/images/info_page/network_intel_node.svg";

const services = [
  {
    icon: trafficCongestion,
    label: "Traffic Domain",
    description:
      "Real-time video analytics optimize traffic flow, detect congestion, and enhance road safety",
  },
  {
    icon: crowdDensity,
    label: "Crowd Analytics",
    description:
      "AI-powered video insights monitor crowd density, movement patterns, and ensure public safety in real time.",
  },
  {
    icon: EngineeringIcon,
    label: "Industry",
    description:
      "Video analytics enable proactive hazard detection and compliance monitoring for safer industrial operations",
  },
  {
    icon: TipsAndUpdatesIcon,
    label: "Smart City",
    description:
      "Intelligent video systems provide city-wide surveillance, emergency response, and infrastructure monitoring",
  },
];

// const LandingPage = () => {
//   const history = useHistory();
//   return (
//     <Box sx={{ mt: 8 }}>
//       {" "}
//       <Box
//         sx={{
//           color: "#37720B",
//           fontWeight: 800,
//           fontSize: "2.5rem",
//           fontStyle: "italic",
//           textAlign: "center",
//         }}
//       >
//         Explore Our Services
//       </Box>
//       <Box
//         sx={{
//           mt: 8,
//           display: "flex",
//           gap: 2,
//           justifyContent: "center",
//           flexWrap: "wrap",
//           px: 2,
//         }}
//       >
//         {services.map((service, index) => (
//           <Box
//             key={index}
//             sx={{
//               minWidth: 210,
//               maxWidth: 220,
//               height: 290,
//               backgroundColor: "#fff",
//               borderRadius: "16px",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               padding: 2,
//               boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//               transition: "transform 0.3s",
//               "&:hover": {
//                 transform: "scale(1.02)",
//               },
//             }}
//           >
//             {/* Icon */}
//             <Box
//               sx={{
//                 width: 94,
//                 height: 94,
//                 backgroundColor: "#67B000",
//                 borderRadius: "50%",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 marginTop: "-28px",
//               }}
//             >
//               <img
//                 src={service.icon}
//                 alt={service.label}
//                 style={{
//                   width: 46,
//                   height: 46,
//                 }}
//               />
//             </Box>

//             {/* Title */}
//             <Typography
//               sx={{
//                 fontWeight: 600,
//                 marginTop: 1.5,
//                 fontSize: "1.25rem",
//                 color: "#37720B",
//                 textAlign: "center",
//               }}
//             >
//               {service.label}
//             </Typography>

//             <Typography
//               sx={{
//                 marginTop: 1.5,
//                 fontSize: "0.95rem",
//                 color: "#37720B",
//                 textAlign: "center",
//                 whiteSpace: "normal",
//                 overflowWrap: "break-word",
//                 wordBreak: "break-word",
//                 maxWidth: "100%",
//               }}
//             >
//               {service.description}
//             </Typography>
//             {/* Button */}
//             <Button
//               variant="contained"
//               sx={{
//                 marginTop: "auto",
//                 backgroundColor: "#E9E9E9",
//                 color: "#000",
//                 fontSize: "0.75rem",
//                 paddingX: 3,
//                 paddingY: 1,
//                 borderRadius: "8px",
//                 "&:hover": {
//                   background:
//                     "transparent linear-gradient(90deg, #37720B 0%, #76B845 100%) 0% 0% ",
//                   color: "#fff",
//                 },
//               }}
//               onClick={() =>
//                 history.push("/event_dashboard", {
//                   selectedService: service.label,
//                 })
//               }
//             >
//               Know More
//             </Button>
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// };




const LandingPage = () => {
  const history = useHistory();
  return (
    <Box sx={{ mt: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          color: "#37720B",
          fontWeight: 800,
          fontSize: { xs: "2rem", md: "4rem", xl: "6rem" },
          fontStyle: "italic",
          textAlign: "center",
        }}
      >
        Explore Our Services
      </Box>

      <Box
        sx={{
          mt: { xs: 4, md: 12, xl: 8 },
          display: "flex",
          gap: { xs: 2, md: 6, xl: 4 },
          justifyContent: "center",
          flexWrap: "wrap",
          px: { xs: 1, md: 6, xl: 6 },
        }}
      >
        {services.map((service, index) => (
          <Box
            key={index}
            sx={{
              minWidth: { xs: 210, md: 240 },
              maxWidth: { xs: 220, md: 260, xl: 300 },
              height: { xs: 290, md: 320, xl: 330 },
              backgroundColor: "#fff",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: { xs: 2, md: 3 },
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.03)",
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: { xs: 84, md: 108 },
                height: { xs: 84, md: 108 },
                backgroundColor: "#67B000",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "-42px",
              }}
            >
              <img
                src={service.icon}
                alt={service.label}
                style={{
                  width: 46,
                  height: 46,
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              sx={{
                fontWeight: 600,
                marginTop: 1.5,
                fontSize: { xs: "1.1rem", md: "1.25rem", xl: "1.35rem" },
                color: "#37720B",
                textAlign: "center",
              }}
            >
              {service.label}
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                marginTop: 1.5,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                color: "#37720B",
                textAlign: "center",
                whiteSpace: "normal",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              {service.description}
            </Typography>

            {/* Button */}
            <Button
              variant="contained"
              sx={{
                marginTop: "auto",
                backgroundColor: "#E9E9E9",
                color: "#000",
                fontSize: "0.75rem",
                paddingX: 3,
                paddingY: 1,
                borderRadius: "8px",
                "&:hover": {
                  background:
                    "transparent linear-gradient(90deg, #37720B 0%, #76B845 100%) 0% 0%",
                  color: "#fff",
                },
              }}
              onClick={() =>
                history.push("/event_dashboard", {
                  selectedService: service.label,
                })
              }
            >
              Know More
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LandingPage;