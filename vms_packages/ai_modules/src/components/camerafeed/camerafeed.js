import React,{useRef} from "react";

const CamerFeed = () => {
const isCameraFeed = useRef(true);
  return (
    <video
      style={{ width: "100%" }}
      ref={isCameraFeed}
      id="videoContainer"
      autoPlay="autoplay"
    >
    </video>
  );
};

export default CamerFeed;
