import { Button } from "@mui/material";
import React, { useEffect } from "react";

const visibleGrids = [
  { icon_name: 1, grid_size: "1,1" },
  { icon_name: 2, grid_size: "1,2" },
  { icon_name: 3, grid_size: "1,3" },
  { icon_name: 4, grid_size: "2,2" },
  { icon_name: 6, grid_size: "2,3" },
  { icon_name: 9, grid_size: "3,3" },
  { icon_name: 16, grid_size: "4,4" },
];

const NavBar = (props) => {
  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Anything in here is fired on component mount.
    // sets atleast one frame by default.
    const { defaultGridContentSize } = props;
    props.setContentGridSize(defaultGridContentSize);

    return () => {
      // Anything in here is fired on component unmount.
    };
  }, []);

  return (
    <div className="navbar shadow-sm sub-nv-dark c-pad1 d-flex " expand>
      <div>
        <Button
          variant="outline-secondary"
          onClick={props.toggle}
          className="btnToggle"
        >
          <img
            className="svg-wht"
            alt={"menubar.svg"}
            src={"/assets/menubar.svg"}
          />
        </Button>
      </div>

      <div className="div-hlist">
        <ul className="ul-hlist">
          {/* <p>Choose Layout</p> */}
          {visibleGrids.map((element, key) => (
            <li
              onClick={() => {
                props.gridContentSize(element.grid_size);
                props.setContentGridSize(element.grid_size);
              }}
              key={"id_" + key}
            >
              <img
                className="svg-wht"
                alt={element?.icon_name}
                src={"/assets/layout/svg/icon-" + element.icon_name + ".svg"}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* <Navbar.Toggle aria-controls="responsive-navbar-nav" /> */}
      {/* <Navbar.Collapse id="responsive-navbar-nav"></Navbar.Collapse> */}
    </div>
  );
};

export default NavBar;
