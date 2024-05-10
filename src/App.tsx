import { useState } from "react";
import { MantineProvider } from "@mantine/core";
import bgDesktopLight from "../images/bg-desktop-light.jpg";
import bgDesktopDark from "../images/bg-desktop-dark.jpg";
import "./App.css";
import { ToDoListContainer } from "./ToDoListContainer";

function App(): JSX.Element {
  const [mode, setMode] = useState<string>("light");

  // -------------------

  return (
    <MantineProvider>
      {mode === "light" ? (
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
