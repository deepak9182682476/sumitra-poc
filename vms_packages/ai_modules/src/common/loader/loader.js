import { styled } from "@mui/system";
import React from "react";
import spinner from "./loader.gif";

const Loader = () => {
  return (
    <LoaderContainer>
      <LoaderImg src={spinner} />
    </LoaderContainer>
  );
};

const LoaderContainer = styled("div")({
  top: 0,
  bottom: 0,
  width: "100%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  background: "transparent",
  zIndex: 100,
});

const LoaderImg = styled("img")({
  position: "absolute",
  background: 'transparent',
  width: 360,
  height: 250
});

export default Loader;
