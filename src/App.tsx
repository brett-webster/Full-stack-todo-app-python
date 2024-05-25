import { useState } from "react";
import { MantineProvider } from "@mantine/core";
import { Mode } from "../types";
import bgDesktopLight from "../images/bg-desktop-light.jpg";
import bgDesktopDark from "../images/bg-desktop-dark.jpg";
import "./App.css";
import ToDoListContainer from "./ToDoListContainer";

function App(): JSX.Element {
  const [mode, setMode] = useState<Mode>(() => {
    // Initialize mode from localStorage, defaulting to Mode.LIGHT
    const savedMode: Mode =
      localStorage.getItem("lightDarkMode") === "dark" ? Mode.DARK : Mode.LIGHT;
    return savedMode;
  });

  // -------------------

  return (
    <MantineProvider>
      {/* DISPLAY BACKGROUND IMAGE BASED ON LIGHT/DARK MODE -- PLACE IN LOCALSTORAGE TO PERSIST ACROSS REFRESHES/SESSIONS */}
      {mode === Mode.LIGHT ? (
        <img
          src={bgDesktopLight}
          className="desktopBackground"
          alt="Desktop Light Background"
        />
      ) : (
        <img
          src={bgDesktopDark}
          className="desktopBackground"
          alt="Desktop Dark Background"
        />
      )}

      <ToDoListContainer mode={mode} setMode={setMode} />
    </MantineProvider>
  );
}

export default App;
