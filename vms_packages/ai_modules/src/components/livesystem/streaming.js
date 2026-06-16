import React, { useState, useEffect } from 'react';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';

const StreamComponent = ({ vmsUrl }) => {
  const [isStreamActive, setIsStreamActive] = useState(true);

  useEffect(() => {
    const checkStreamStatus = async () => {
      const controller = new AbortController(); // Create an abort controller
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(vmsUrl, {
          method: 'HEAD',
          signal: controller.signal, // Pass the abort signal
        });

        setIsStreamActive(response.status === 200);
      } catch (error) {
        // Handle both network errors and aborted fetch
        setIsStreamActive(false);
      } finally {
        clearTimeout(timeoutId); // Clear the timeout
      }
    };

    const intervalId = setInterval(checkStreamStatus, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [vmsUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isStreamActive && vmsUrl? (
        <img style={{ width: '100%', height: '100%' }} src={vmsUrl} alt="Streaming" />
      ) : (
        <div style={{ width: "100%", height: "90%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: 'bold', color: "#bdbbbb" }}>
          <span><VideocamOffOutlinedIcon sx={{fontSize: 60, marginTop: '10px', marginRight: '10px' }} /></span>
          <span>{vmsUrl ? 'Camera Offline' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default StreamComponent;
