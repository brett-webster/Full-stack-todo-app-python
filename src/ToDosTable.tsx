import { Dispatch, SetStateAction, Fragment } from "react";
import { Stack, Group, Checkbox, CloseButton, Divider } from "@mantine/core";
import { Mode, ToDoType } from "../types";

// Component to display the ToDos in a table format -- exported for use in ToDoListContainer.tsx
function ToDosTable({
  toDosForDisplay,
  mode,
  setIdToUpdateStatus,
  setIdToDelete,
}: {
  toDosForDisplay: ToDoType[];
  mode: Mode;
  setIdToUpdateStatus: Dispatch<SetStateAction<number | null>>;
  setIdToDelete: Dispatch<SetStateAction<number | null>>;
}): JSX.Element {
  // No tasks to display
  if (toDosForDisplay.length === 0)
    return (
      <>
        <div
          style={{
            fontFamily: '"Josefin Sans", sans-serif',
            fontSize: "18px",
            fontWeight: "400",
            color: mode === Mode.LIGHT ? "grey" : "white",
          }}
        >
          No tasks to display
        </div>
        <Divider
          style={{
            borderColor: mode === Mode.LIGHT ? "lightgrey" : "#454545",
          }}
        />
      </>
    ); // early exit if no tasks to display

  // Tasks to display -- map over to toDosForDisplay (filtered, if specified) to generate multiple Groups for display
  const stackOfToDosJSX: JSX.Element[] = toDosForDisplay.map(
    (toDo: ToDoType) => {
      let textColor; // using let to allow for reassignment of light/dark mode text color
      if (mode === Mode.LIGHT) {
        textColor = toDo.statusComplete ? "lightgrey" : "grey";
      } else if (mode === Mode.DARK) {
        textColor = toDo.statusComplete ? "grey" : "lightgrey";
      }

      return (
        <Fragment key={String(toDo.id) + toDo.task}>
          <Group position="apart" className="groupCheckboxCloseButton">
            <Checkbox
              label={
                <span
                  style={{
                    color: textColor,
                    fontSize: "18px",
                    fontFamily: '"Josefin Sans", sans-serif',
                  }}
                >
                  {toDo.statusComplete ? <s>{toDo.task}</s> : toDo.task}
                </span>
              }
              className="checkBox"
              size="md"
              radius="xl"
              checked={toDo.statusComplete} // true or false
              onChange={() => setIdToUpdateStatus(toDo.id)} // unique ID
              // style={{
              //   background:
              //     "linear-gradient(hsl(192, 100%, 67%), hsl(280, 87%, 65%))",
              // }} // NOTE: this gradient background color also paints the test area in the Mantine component & Mantine does not support linear-gradient coloring directly for the Checkbox alone, so sticking w/ Mantine's standard blue color here
            />
            <CloseButton
              size="lg"
              id="closeButton"
              onClick={() => setIdToDelete(toDo.id)} // unique ID
            />
          </Group>
          <Divider
            style={{
              borderColor: mode === Mode.LIGHT ? "lightgrey" : "#454545",
            }}
          />
        </Fragment>
      );
    }
  );

  return <Stack>{stackOfToDosJSX}</Stack>;
}

export default ToDosTable;
