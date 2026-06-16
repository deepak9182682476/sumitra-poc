import React, { useEffect, useState } from "react";
import "./app.css";
import Main from "../main/main";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { dark, light, lightgreen, theme } from "../../styles/theme";
import { themeSubjectService } from "../../utilities/theme-util";
import { getLocalStorage, setLocalStorage } from "../../utilities/common-util";
import AlertTranscationPopup from "../layout/AlertTranscationPopup";
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
}

function App() {
  const [themeMode, setThemeMode] = useState("");
  let streamData = [1, 2, 3, 4, 5, 6, 7];
  useEffect(() => {
    themeSubjectService.getThemeSubject().subscribe((mode) => {
      if (mode) {
        setThemeMode(mode);
        const theme_mode = getLocalStorage("mode");
        if (theme_mode !== mode) {
          setLocalStorage("mode", mode);
        }
      }
    });
  }, []);
  return (
    <React.Fragment>
      <ErrorBoundary
        FallbackComponent={Fallback}
        onReset={(details) => {
          // Reset the state of your app so the error doesn't happen again
        }}
      >
        {/* {console.log("themeMode", themeMode)} */}
        <ThemeProvider
          theme={
            themeMode === "lightgreen"
              ? createTheme(lightgreen)
              : createTheme(dark)
          }
        >
          {/* {streamData.length > 0 && (
          <div>
            <AlertTranscationPopup />
          </div>
        )} */}
          <div data-theme={themeMode} className="app-main">
            <Main />
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Fragment>
  );
}

export default App;
