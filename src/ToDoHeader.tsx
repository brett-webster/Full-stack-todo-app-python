import { Dispatch, SetStateAction, useEffect } from "react";
import { Container, Image, Text } from "@mantine/core";
import iconSun from "../images/icon-sun.svg";
import iconMoon from "../images/icon-moon.svg";
import { Mode } from "../types";

// Title + Light/Dark Mode Icon -- exported for use in ToDoListContainer.tsx
function ToDoHeader({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}): JSX.Element {
  // Apply 3 theme classes on mode change -- change styling of body, input field and table based on light/dark mode
  useEffect(() => {
    const body = document.body;
    const newTaskInputNode = document.querySelector("#newTaskInput");
    const toDoListTableNode = document.querySelector(".toDoListTable");
    if (!body || !newTaskInputNode || !toDoListTableNode) return; // early exit if any elements are null
    if (mode === Mode.DARK) {
      body.classList.remove("lightTheme");
      body.classList.add("darkTheme");
      newTaskInputNode.classList.remove("lightTheme");
      newTaskInputNode.classList.add("darkTheme");
      toDoListTableNode.classList.remove("lightTheme");
      toDoListTableNode.classList.add("darkTheme");
    } else {
      body.classList.remove("darkTheme");
      body.classList.add("lightTheme");
      newTaskInputNode.classList.remove("darkTheme");
      newTaskInputNode.classList.add("lightTheme");
      toDoListTableNode.classList.remove("darkTheme");
      toDoListTableNode.classList.add("lightTheme");
    }
  }, [mode]);

  return (
    <Container className="toDoListHeader">
      <Text ta="left" id="toDoTitle" className="josefin-sans-header">
        T O D O
      </Text>
      <Image
        src={mode === Mode.LIGHT ? iconMoon : iconSun}
        className="modeIcon"
        alt="Light or Dark Mode"
        style={{ textAlign: "right" }}
        width={30} // pixels
        height={30} // pixels
        onClick={() => {
          const newMode: Mode = mode === Mode.LIGHT ? Mode.DARK : Mode.LIGHT;
          localStorage.setItem("lightDarkMode", newMode); // set & persist mode in localStorage
          setMode(newMode); // update mode in state
        }}
      />
    </Container>
  );
}

export default ToDoHeader;
