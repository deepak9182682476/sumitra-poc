import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Tooltip } from '@mui/material';

const arrows = [{ values: 'left_to_right', icons: ['left', 'right'] },
{ values: 'right_to_left', icons: ['right', 'left'] },
{ values: 'up_to_down', icons: ['up', 'down'] },
{ values: 'down_to_up', icons: ['down', 'up'] }];

export default function IconButtons(props) {
    const getIconTypeVal = (val) => {
      if(val && typeof props.setPosVal === 'function'){
          props.setPosVal(val);
      }
    }
    return (
        <Stack direction="row" spacing={1}>
            {arrows.map(rec =>
                <React.Fragment>
                    <Tooltip title={rec.values} placement="bottom">
                        <IconButton onClick={() => getIconTypeVal(rec.values)} aria-label={rec.values} color="primary">
                           {rec.icons.map(iconDir => 
                            iconDir === 'left' ? <ArrowBackIcon/> :
                            iconDir === 'right' ? <ArrowForwardIcon/> :
                            iconDir === 'up' ? <ArrowUpwardIcon/> :
                            iconDir === 'down' ? <ArrowDownwardIcon/> : null
                           )}
                        </IconButton>
                    </Tooltip>
                </React.Fragment>
            )}
        </Stack>
    );
}