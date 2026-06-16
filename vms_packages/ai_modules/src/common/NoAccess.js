import * as React from 'react';
import Box from '@mui/material/Box';
import LockIcon from '@mui/icons-material/Lock';
import {
    Grid,
    Card,
    Typography,
    Button,
    TextField,
    Select,
    InputLabel,
    FormControl,
    AppBar,
    IconButton,
    Backdrop,
  } from "@mui/material";
  

export default function NoAccess() {
    return (
        <Box
    sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 300,
        backgroundColor: 'common.white',
        border: '1px solid black',
        borderRadius: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

    }}
>
    <LockIcon sx={{ fontSize: 64, color: '#E53935' }} />

    <Typography variant="h6" fontWeight="bold" color="black">
        You need permission to access this page
    </Typography>

    <Box mt={2}>
        <Typography variant="subtitle1" color="black">
            Contact the Admin for access
        </Typography>
    </Box>
</Box>
    );
}
