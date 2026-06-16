import { FormControl, InputLabel, MenuItem, Paper, Select } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import useLoader from "../../common/loader/useLoader";

const useStyles = makeStyles((theme) => ({
    main: {
        color: theme.palette.primary.color
    },
    formCtrlCLs: {
        flexGrow: "0.7",
    },
    selectCtrlCLs: {
        "& .MuiMenu-list": {
            maxHeight: '200px'
        }
    }
}));

function DashboardFrame() {
  const [loader, showLoader, hideLoader] = useLoader();

    const opts = [
        {
            label: 'Traffic Dashboard',
            key: 'frame-1',
            value: 'http://192.168.165.202:3000/d/d69dff25-6c9b-4a24-9e9b-38363abf0e42/cyberabad-traffic-dashboard?orgId=1&from=1695356803608&to=1695378403608&theme=dark&kiosk'
        }, {
            label: 'Safe-City Dashboard',
            key: 'frame-2',
            value: 'http://192.168.165.202:3000/d/e87a912e-afbb-43c3-ac43-bc49364ded78/safe-city-dashboard?orgId=1&from=1695360989810&to=1695382589810&theme=dark&kiosk'
        }]

    const classes = useStyles();
    const [options, setOptions] = useState(opts);
    const [selected, setSelected] = useState(opts[0].value);


    const handleChange = (event) => {
        setSelected(event.target.value);
    };

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    useEffect(() => {
        var timer = setInterval(
            () => {
                const val = selected ? selected : opts[0].value;
                setSelected(selected);
            },
            30000
        );
        return function cleanup() {
            clearInterval(timer);
        };
    }, [selected])

    return (
        <Paper elevation={1} style={{
            padding: '20px 20px 60px 20px',
            height: '77vh',
            width: '95vw',
            margin: 'auto'
        }} flex={1} overflow="auto">
            <div style={{
                float: 'right',
                display: 'flex',
                marginBottom: '4px',
                marginTop: '-12px'
            }}>
                <FormControl
                    variant="filled"
                    className={classes.formCtrlCLs}
                    sx={{
                        m: 0,
                        borderRadius: "5px",
                        minWidth: 320,
                    }}
                >
                    <InputLabel
                        sx={{
                            fontFamily: "montserrat",
                            fontWeight: "regular",
                            fontSize: "10px",
                        }}
                        id={`select-ipt-frame`}
                    >
                        {"Select"}
                    </InputLabel>
                    <Select
                        width="300"
                        size={"small"}
                        id={`select-frame`}
                        value={selected}
                        className={classes.selectCtrlCLs}
                        sx={{
                            fontFamily: "montserrat",
                            fontWeight: "Regular",
                            fontSize: "14px",
                            lineSpacing: "12px"
                        }}
                        label={"Select"}
                        MenuProps={MenuProps}
                        onChange={handleChange}
                    >
                        {options &&
                            options.length &&
                            options.map((option) => (
                                <MenuItem key={option.key} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </div>
            <iframe
                id="widget"
                name="widget"
                title="widget"
                width="100%"
                height="100%"
                src={selected}
                style={{ position: "relative", height: "100%" }}
            ></iframe>
        </Paper>
    );
}

export default DashboardFrame;