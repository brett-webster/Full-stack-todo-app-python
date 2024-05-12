import { Dispatch, SetStateAction } from "react";
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
          setMode(mode === Mode.LIGHT ? Mode.DARK : Mode.LIGHT);
          // Change styling theme of the body, input field, and table based on light/dark mode
          const body = document.body;
          const newTaskInputNode = document.querySelector("#newTaskInput");
          const toDoListTableNode = document.querySelector(".toDoListTable");
          if (!body || !newTaskInputNode || !toDoListTableNode) return; // early exit if any elements are null
          if (mode === Mode.LIGHT) {
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
        }}
      />
    </Container>
  );
}

export default ToDoHeader;
