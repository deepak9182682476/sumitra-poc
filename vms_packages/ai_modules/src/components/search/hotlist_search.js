
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles, useTheme } from "@mui/styles";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Snackbar,
    Divider,
    TextField,
    Dialog,
    Box,
    AppBar,
    CardMedia,
    DialogContent,
    ImageListItem,
    ImageList,
    Slide,
} from "@mui/material";

import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import useLoader from "../../common/loader/useLoader";
import ModelsService from "../../services/models";
import NoAccess from "../../common/NoAccess";
import { local_anpr_user } from "../../config/config";
import AlertsService from "../../services/alerts";
import AverageSpeedService from "../../services/average_speed";
import { CloseOutlined, Receipt } from "@mui/icons-material";
import moment from "moment";
import HoltistSearchModel from "../models/hotlist_search_model";
import ViolationService from "../../services/violation";

const useStyles = makeStyles((theme) => ({
    root: {
        "& ::-webkit-scrollbar": {
            width: "3px",
            height: "100%",
            marginRight: "4px",
            backgroundColor: "#3D81F5",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "red",
            borderRight: "4px white solid",
            height: "2px",
        },

        "& .MuiDataGrid-columnHeaderWrapper": {
            borderRight: `1px solid ${theme.palette.mode === "light" ? "#f0f0f0" : "#303030"
                }`,
            backgroundColor: `${theme.palette.mode === "light" ? "#F9F9F9" : "#313131"
                }`,
            color: theme.palette.text.primary,
        },
        "& .MuiGridToolbarContainer-root": {
            padding: "4px !important",
            // backgroundColor:"#0D0D0D"
        },
        "& .MuiDataGrid-root, .MuiTypography-root": {
            fontSize: "12px", //camera/camera header+sno.bar font
            // backgroundColor:"#0D0D0D",
        },
        "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#313131 !important",
        },
        "& .MuiDataGrid-columnsContainer": {
            minHeight: "auto !important",
            maxHeight: "auto !important",
        },
        "& .MuiButton-root": {
            color: "#fff !important",
            fontSize: "12px",
            top: "-1.75px",
        },
        "& .MuiDivider-root": {
            borderColor: "#fff",
            margin: "6px 8px 6px 12px",
        },
        [theme.breakpoints.between(750, 1400)]: {
            height: "42vh",
            // paddingLeft: "7px",
        },
        [theme.breakpoints.up(1401)]: {
            height: "42vh",
        },
        width: "100vw",
    },
    cpd: {
        padding: "0  !important",
    },
    dataGridCpd: {
        flexGrow: "1",
        padding: "0px !important",
    },
    card: {
        // backgroundColor: ` ${theme?.palette?.primary?.compHeader}  0% 0% no-repeat padding-box !important`, //cameras/background
        backgroundColor: "#0D0D0D",
        color: "#fff !important",
        border: "1px solid #868686 !important", //cameras/border
        opacity: "1",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0px!important",
    },
    uploadscard: {
        backgroundColor: "#313131 !important",
        color: "#fff !important",
        // border: "1px solid #868686 !important",
        border: "none !important",
        display: "flex",
        flexDirection: "row",
        [theme.breakpoints.between(750, 1400)]: {
            maxHeight: "52vh !important",
            minHeight: "52vh !important",
            overflowY: "scroll",
        },
        [theme.breakpoints.up(1401)]: {
            maxHeight: "58vh !important",
            minHeight: "58vh !important",
            overflowY: "scroll",
        },
    },
    fontsize: {
        fontSize: "0.75rem !important",
    },
    dataHotlistGridCls: {
        // maxHeight: "120px",
        // minHeight: "120px",
        color: "#fff !important", //Cameras/no row
        border: "none !important",
        [theme.breakpoints.between(350, 749)]: {
            // height: "26vh !important",
            maxHeight: "90vh",
            minHeight: "70vh",
        },
        [theme.breakpoints.between(750, 1400)]: {
            // height: "26vh !important",
            maxHeight: "80vh",
            minHeight: "75vh",
        },
        [theme.breakpoints.between(1400, 1800)]: {
            // height: "26vh !important",
            maxHeight: "83vh",
            minHeight: "83vh",
        },
        [theme.breakpoints.up(1800)]: {
            // height: "50vh !important",
            maxHeight: "88vh",
            minHeight: "88vh",
        },
    },
    cellsCls: {
        color: "#fff !important", // cameras/rows words
        // backgroundColor: "#0D0D0D",
    },
    stepperCls: {
        "& .Mui-active": {
            color: "#a79c53 !important,",
        },
        // color: "inherit !important",
        // "& .MuiStepIcon-root .Mui-active": {
        //   color: "#a79c53 !important",
        // },
    },
    addcameraCls: {
        display: "flex",
        padding: "0px !important",
    },
    tableCls: {
        padding: "25px 24px 0px !important",
        height: "300px",
    },
    buttoncolor: {
        backgroundColor: "#343434",
        border: "1px solid #8D8D8D",

        color: "#fff !important",
        fontSize: "12px",
        "&:hover": { backgroundColor: "#343434" },
    },

    buttontext: {
        color: "#fff !important",
        fontSize: "12px",
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="right" ref={ref} {...props} />;
});

const ImageTransition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="right" ref={ref} {...props} />;
});

const HotlistSearch = (props) => {
    const classes = useStyles();
    const [state, setState] = React.useState({
        alertOpen: false,
        alertContent: "",
        vertical: "top",
        horizontal: "center",
    });
    // eslint-disable-next-line no-unused-vars
    const [isSuccess, setAlertSuccess] = useState(false);
    const [open, setOpen] = React.useState(false);

    const [currentPgIdx, setCurrentPgIdx] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [hotlistCategoryList, setHotlistCategoryList] = useState([]);
    const theme = useTheme();

    const [loader, showLoader, hideLoader] = useLoader();

    const [anprRowsList, setAnprRowsList] = React.useState([]);
    const [orgAnprRowsList, setOrgAnprRowsList] = React.useState([]);
    const [violationList, setViolationList] = useState([]);
    const [locationsList, setLocationsList] = useState([]);

    const [imageDialog, setImageDialog] = useState({
        openImageDialog: false,
        selectedImage: "",
    });

    const filterAnprSearchData = (search_form) => {
        if (search_form && orgAnprRowsList.length) {
            //search logic based junction, ps, zone, color, hotlist category
            const { police_station, zone, color, junction_name, hotlist_category } = search_form;
            const filter_list = orgAnprRowsList.filter((rec) => {
                if (rec.junction_name.trim().toLowerCase() === junction_name.trim().toLowerCase() &&
                    rec.zone.trim().toLowerCase() === zone.trim().toLowerCase() &&
                    rec.police_station.trim().toLowerCase() === police_station.trim().toLowerCase() &&
                    rec.hotlist_category.trim().toLowerCase() === hotlist_category.trim().toLowerCase()) {
                    return rec;
                }
            });
            console.log('filter_list', filter_list);
            setAnprRowsList(filter_list);
            setOpen(false);
            // const violation_type = search_form.violation
            //     ? search_form.violation[0]
            //     : null;
            // if (violation_type) {
            //     const filter_list = orgAnprRowsList.filter((rec) => {
            //         if (rec.violation_type &&
            //             rec.violation_type.trim().toLowerCase() === violation_type.trim().toLowerCase()
            //         ) {
            //             return rec;
            //         }
            //     });
            //     setAnprRowsList(filter_list);
            //     setOpen(false);
            // }
        }
    };

    const [dialogState, setDialogState] = useState({
        dialogOpen: false,
        vertical: "top",
        horizontal: "center",
        params: null,
    });

    const columns = [
        {
            field: "s.no",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        S. No
                    </Typography>
                );
            },
            renderCell: (index) => {
                let ridx = index.api.getRowIndex(index.row.alias_id)
                return <Typography>{ridx + 1}</Typography>;
            },
        },
        {
            field: "date",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        Date
                    </Typography>
                );
            },
            renderCell: (params) => {
                return <Typography>{params.value}</Typography>;
            },
        },
        {
            field: "vehicle_number",
            flex: 1,
            type: "text",
            maxWidth: 230,
            renderHeader: (params) => {
                return (
                    <Typography style={{ fontWeight: "bold" }}>Vehicle No</Typography>
                );
            },
            renderCell: (params) => {
                return (
                    <Typography
                        style={{
                            fontSize: 12,
                            textDecorationLine: "underline",
                            cursor: "pointer",
                        }}
                        onClick={() => handleOpenDialog(params.row)}
                    >
                        {params.row?.license_number}
                    </Typography>
                );
            },
        },
        // {
        //     field: "lpimage",
        //     flex: 1,
        //     type: "text",
        //     maxWidth: 230,
        //     renderHeader: (params) => {
        //         return (
        //             <Typography style={{ fontWeight: "bold" }}>License Plate</Typography>
        //         );
        //     },
        //     renderCell: (params) => {
        //         return (
        //             <div>
        //                 <img
        //                     alt="lpimage"
        //                     width={100}
        //                     // src={params.row?.violations[0].lpimage}
        //                     src={params.row?.image}
        //                 />
        //             </div>
        //         );
        //     },
        // },
        {
            field: "camera_name",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        Camera Name
                    </Typography>
                );
            },
            renderCell: (params) => {
                return <Typography>{params.value}</Typography>;
            },
        },

        {
            field: "violation_type",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        Transaction Type
                    </Typography>
                );
            },
            renderCell: (params) => {
                return <Typography>{params.value}</Typography>;
            },
        },
        {
            field: "junction_name",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        Junction
                    </Typography>
                );
            },
            renderCell: (params) => {
                return <Typography>{params.value}</Typography>;
            },
        },
        {
            field: "police_station",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        Police Station
                    </Typography>
                );
            },
            renderCell: (params) => {
                return <Typography>{params.value}</Typography>;
            },
        },
        {
            field: "zone",
            flex: 1,
            type: "string",
            maxWidth: 200,
            renderHeader: (params) => {
                return (
                    <Typography
                        style={{
                            color: theme.palette?.text?.primary,
                            backgroundColor: "#313131",
                        }}
                    >
                        Zone
                    </Typography>
                );
            },
            renderCell: (params) => {
                return <Typography>{params.value}</Typography>;
            },
        },
        // {
        //   field: "actions",
        //   flex: 1,
        //   type: "text",
        //   maxWidth: 550,
        //   renderHeader: (params) => {
        //     return <Typography style={{ fontWeight: "bold" }}>Actions</Typography>;
        //   },
        //   renderCell: (params) => {
        //     return (
        //       <div>
        //         <TextField
        //           style={{ margin: "5px 0" }}
        //           id={`vehicle-number-${params.row?.id}`}
        //           size="small"
        //           variant="standard"
        //           defaultValue={params.row?.license_number}
        //           value={params.row?.license_number}
        //         // onChange={(event) => setVehicleNumberState(event.target.value) }
        //         />
        //         <Button
        //           variant="outlined"
        //           size="small"
        //           style={{ margin: "3px 5px" }}
        //           endIcon={<Receipt />}
        //           onClick={() => echallanHandler(params.row)}
        //         >
        //           Send to E-Challan
        //         </Button>
        //       </div>
        //     );
        //   },
        // }
    ];

    const echallanHandler = async (params) => {
        console.log("Echallan Done", params);
        // let base64_image = await imageUrlToBase64(params.violations[0].frontalimage);
        let obj = {
            vehicle_number: params.license_number,
            camera_id: params.camera_id,
            // vehicle_speed: Math.trunc(params.violations[0].speed),
            vehicle_speed: 0,
            speed_limit: 0,
            // timestamp: params.violations[0].timestamp,
            timestamp: params.timestamp,
            vioCode: params.vioCode,
            camera1_image: params.image,
            // camera2_image: params.violations[0].frontalimage[1],
            // camera1_location: params.violations[0].site_location.split("-")[0].trim(),
            // camera2_location: params.violations[0].site_location.split("-")[1].trim(),
            event_time1: params.date,
            // event_time2: params.violations[0].event_time2,
            // distance: params.violations[0].distance,
            // time_diff: params.violations[0].time_diff,
        };
        console.log("--obj--", obj);
        AverageSpeedService.generateEchallan(obj)
            .then((response) => {
                if (response) {
                    const { data } = response;
                    if (data) {
                        setAlertSuccess(true);
                    }
                }
            })
            .catch((err) => {
                if (err.response) {
                    console.log("error response", err);
                } else if (err.request) {
                    console.log("error request", err);
                } else {
                    console.log("error", err);
                }
            });
    };


    const handleCloseDialog = () => {
        setDialogState({ ...state, dialogOpen: false, params: null });
    };

    const handleOpenDialog = (params) => {
        setDialogState({ ...state, dialogOpen: true, params: params });
    };

    function CustomToolbar() {
        const showSearchModel = () => {
            setOpen(true);
        };

        return (
            <GridToolbarContainer style={{ width: "100%" }}>
                <Typography
                    style={{
                        color: `${theme.palette?.text?.secondary}`,
                        marginLeft: "10px",
                        flexGrow: "1",
                        fontSize: "18px !important",
                    }}
                >
                    {" "}
                    Hotlist{" "}
                </Typography>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => showSearchModel()}
                >
                    Hotlist Search
                </Button>
                <Divider orientation="vertical" variant="middle" flexItem />
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector style={{ marginRight: "15px" }} />
                {/* <GridToolbarExport style={{ marginRight: "15px" }} /> */}
            </GridToolbarContainer>
        );
    }

    useEffect(() => {
        getLocationList();
        getAnprPopupGroup();
        getViolationPopupGroup();
        gethotlistcategoryList();
    }, []);

    const getLocationList = () => {
        ViolationService.getLocationsList().then((response) => {
            if (response) {
                const { data } = response?.data;
                const filter_anpr_data = data.filter(rec => rec.device_type.trim() === 'ANPR')
                setLocationsList(filter_anpr_data);
            }
        });
    };



    const gethotlistcategoryList = () => {
        ModelsService.getHotlistcategoryPopupGroup().then((response) => {
            if (response) {
                const { data } = response?.data;
                setHotlistCategoryList(data);
            }
        });
    };

    const { alertOpen, vertical, horizontal, alertContent } = state;


    const getAnprPopupGroup = () => {
        AlertsService.get360Alerts().then((response) => {
            if (response) {
                const { data } = response?.data;
                if (data && data.length) {
                    const latest_rows = data.slice(data.length - 2000, data.length)
                    // let anpr_rows_list = data.filter(rec => rec.violation_type === 'ANPR');
                    // console.log('anpr_rows_list', anpr_rows_list);
                    // eventInfo.forEach((rec, index) => (rec.id = index + 1));
                    setOrgAnprRowsList(latest_rows);
                    setAnprRowsList(latest_rows);
                    // setDataForCropImages(data)

                }
            }
        });
    };

    // function setDataForCropImages(dataRows, pgSize, pgIdx) {
    //     // const perOptionsDiff = pgIdx > 0 ? pgSize : pgIdx;
    //     // const dataRows = data.slice(perOptionsDiff, pgSize + perOptionsDiff);
    //     let arr = [];

    //     try {
    //       if (dataRows.length) {
    //         for (const [i, v] of dataRows.entries()) {
    //           //Handled last iteration
    //           if (i === dataRows.length - 1) {
    //             continue;
    //           }
    //           AlertsService.getImageOfAlert(v.cropped_image, v.date, v.model).then((res) => {
    //             const { data } = res;
    //             if (data && data.image_base64) {
    //               const clone_rec = Object.assign({}, v);
    //               clone_rec.image = `data:image/jpeg;base64,${data.image_base64}`;
    //               arr.push(clone_rec);
    //               if (arr.length === dataRows.length - 1) {
    //                 setOrgAnprRowsList(data);
    //                 setAnprRowsList(data);
    //               }
    //             }
    //           });
    //         }
    //       }
    //     } catch (e) {
    //       console.log(e);

    //     }
    //   }

    const getViolationPopupGroup = () => {
        ModelsService.getViolationPopupGroup().then((response) => {
            if (response) {
                const { data } = response?.data;
                setViolationList(data);
            }
        });
    };

    function setDataGridData(currentPage, size) {
        showLoader();
        const pageNum = currentPage || 1;
        const pageLimit = size || 10;
    }

    const handleImageClose = () => {
        setImageDialog({
            ...state,
            openImageDialog: false,
            selectedImage: "",
        });
    };

    const handleImageClick = (image) => {
        setImageDialog({
            ...state,
            openImageDialog: true,
            selectedImage: image,
        });
    };

    return local_anpr_user("activity_info", "activity_name", "Anpr") ? (
        <Grid
            container
            spacing={0.5}
            direction="row"
            justifyContent="space-evenly"
            className={classes.root}
        >
            <HoltistSearchModel
                open={open}
                filterAnprSearchData={(search_form) =>
                    filterAnprSearchData(search_form)
                }
                anprRowsList={anprRowsList}
                hotlistCategoryList={hotlistCategoryList}
                violationList={violationList}
                locationsList={locationsList}
                setOpen={setOpen}
            ></HoltistSearchModel>

            <Grid item xs={12} className={classes.tableCls}>
                {loader}
                <Card className={classes.card}>
                    <CardContent component="div" className={classes.dataGridCpd}>
                        <Snackbar
                            anchorOrigin={{ vertical, horizontal }}
                            open={alertOpen}
                            autoHideDuration={1000}
                            onClose={() => {
                                setAlertSuccess(false);
                                setState({ ...state, alertOpen: false });
                            }}
                        >
                            <Alert
                                onClose={() => {
                                    setAlertSuccess(false);
                                    setState({ ...state, alertOpen: false });
                                }}
                                severity="error"
                                variant="filled"
                            >
                                {alertContent}
                            </Alert>
                        </Snackbar>
                        <div style={{ width: "100%" }}>
                            <DataGrid
                                columns={columns}
                                className={classes.dataHotlistGridCls}
                                pageSize={pageSize}
                                onPageSizeChange={(newPageSize) => {
                                    setPageSize(newPageSize);
                                    // setDataGridData(currentPgIdx, newPageSize);
                                }}
                                rows={anprRowsList}
                                getRowId={(row) => row.alias_id}
                                rowsPerPageOptions={[10, 20]}
                                rowHeight={35}
                                headerHeight={40}
                                components={{
                                    Toolbar: CustomToolbar,
                                }}
                                getCellClassName={(params) => classes.cellsCls}
                                onPageChange={(currentPageIdx) => {
                                    setCurrentPgIdx(currentPageIdx);
                                }}
                                pagination
                            />
                            {dialogState.dialogOpen ? (
                                <Dialog
                                    open
                                    onClose={handleCloseDialog}
                                    fullScreen
                                    TransitionComponent={Transition}
                                >
                                    <Box sx={{ width: "100%", border: "none" }}>
                                        <AppBar
                                            sx={{
                                                backgroundColor: `${theme?.palette?.primary?.compHeader} !important`,
                                                border: `1px solid ${theme.palette.mode === "light"
                                                    ? "#707070"
                                                    : "#404145 !important"
                                                    }, opacity: 1 `,
                                            }}
                                            className={classes.popupTitle}
                                            position="static"
                                        >
                                            <div className={classes.titleCls}>Detail View</div>
                                            <div className={classes.closeCls}>
                                                <CloseOutlined onClick={handleCloseDialog} />
                                            </div>
                                        </AppBar>
                                        <Grid
                                            container
                                            spacing={1}
                                            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                                            sx={{ paddingLeft: "30px" }}
                                        >
                                            {dialogState.params &&
                                                dialogState.params.violations &&
                                                dialogState.params.violations.map((violation) =>
                                                    violation.cinfo.map((item, key, index) => (
                                                        <Grid item xs={6} key={key}>
                                                            <Typography>
                                                                <img
                                                                    alt="plimage"
                                                                    width={150}
                                                                    src={item.lpimage}
                                                                />
                                                                &nbsp;&nbsp;
                                                                {`${item.camera_name +
                                                                    " - " +
                                                                    moment(item.event_time).format(
                                                                        "DD/MM/YYYY HH:mm:ss"
                                                                    )
                                                                    }`}
                                                            </Typography>
                                                            <ImageList cols={3}>
                                                                {
                                                                    // !is_vehant ? (
                                                                    //   <ImageListItem key={index}>
                                                                    //     <img
                                                                    //       alt="image"
                                                                    //       src={`${item.images}`}
                                                                    //       srcSet={`${item.images}`}
                                                                    //       loading="lazy"
                                                                    //       onClick={() => {
                                                                    //         handleImageClick(item.images);
                                                                    //       }}
                                                                    //     />
                                                                    //   </ImageListItem>
                                                                    // ) : (
                                                                    item.images.split(";").map((image, index) => (
                                                                        <ImageListItem key={index}>
                                                                            <img
                                                                                alt="image"
                                                                                src={`${image}`}
                                                                                srcSet={`${image}`}
                                                                                loading="lazy"
                                                                                onClick={() => {
                                                                                    handleImageClick(image);
                                                                                }}
                                                                            />
                                                                        </ImageListItem>
                                                                    ))
                                                                    // )
                                                                }
                                                            </ImageList>
                                                        </Grid>
                                                    ))
                                                )}
                                        </Grid>

                                        <Dialog
                                            open={imageDialog.openImageDialog}
                                            onClose={handleImageClose}
                                            fullScreen
                                            TransitionComponent={ImageTransition}
                                        >
                                            <DialogContent>
                                                <Box sx={{ width: "100%", border: "none" }}>
                                                    <Grid container spacing={1}>
                                                        <Card>
                                                            <CardMedia
                                                                component="img"
                                                                alt="image"
                                                                image={imageDialog.selectedImage}
                                                                onClick={handleImageClose}
                                                            />
                                                        </Card>
                                                    </Grid>
                                                </Box>
                                            </DialogContent>
                                        </Dialog>
                                    </Box>
                                </Dialog>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            {/* </Grid> */}
        </Grid>
    ) : (
        <Grid>
            <NoAccess />
        </Grid>
    );
};
export default HotlistSearch;
