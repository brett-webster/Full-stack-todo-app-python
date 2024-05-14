import { Dispatch, SetStateAction } from "react";
import { Stack, Group, Checkbox, CloseButton, Divider } from "@mantine/core";
import { Mode, ToDoType } from "../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"; // npm i @hello-pangea/dnd

// Component to display the ToDos (DnD) in a table format -- exported for use in ToDoListContainer.tsx
function ToDosTableDnD({
  setToDosForDisplay,
  toDosForDisplay,
  setToDosArrayFull,
  mode,
  setIdToUpdateStatus,
  setIdToDelete,
}: {
  setToDosForDisplay: Dispatch<SetStateAction<ToDoType[]>>;
  toDosForDisplay: ToDoType[];
  setToDosArrayFull: Dispatch<SetStateAction<ToDoType[]>>;
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
          className="tableDividerMobile"
          style={{
            borderColor: mode === Mode.LIGHT ? "lightgrey" : "#454545",
          }}
        />
      </>
    ); // early exit if no tasks to display

  // handle drag end event -- helper fxn for DnD
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    } // early exit if no destination
    const newItems = [...toDosForDisplay];
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setToDosForDisplay(newItems);
    setToDosArrayFull(newItems);
  };

  // Tasks to display w/ DnD capability -- map over to toDosForDisplay (filtered, if specified) to generate multiple Groups for display
  const stackOfToDosJSX: JSX.Element[] = toDosForDisplay.map(
    (toDo: ToDoType, index: number) => {
      let textColor: string; // using let to allow for reassignment of light/dark mode text color
      if (mode === Mode.LIGHT) {
        textColor = toDo.statusComplete ? "lightgrey" : "grey";
      } else if (mode === Mode.DARK) {
        textColor = toDo.statusComplete ? "grey" : "lightgrey";
      }

      return (
        <Draggable
          key={String(toDo.id) + toDo.task} // unique key
          draggableId={String(toDo.id)} // also must be unique
          index={index} // this is required for react-beautiful-dnd to work & must increment by 1 for each item in the list
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div
                style={{
                  width: window.matchMedia("(max-width: 375px)").matches
                    ? "200%"
                    : "100%",
                }} // NOTE: added div wrapper w/ media screen size styling around Group for mobile functionality (inline required here, passing classsNames does not work)
              >
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
                    style={{
                      height: "46px",
                      marginTop: "4px",
                      // NOTE: this gradient background color also paints the test area in the Mantine component & Mantine does not support linear-gradient coloring directly for the Checkbox alone, so sticking w/ Mantine's standard blue color here
                      // background:
                      //   "linear-gradient(hsl(192, 100%, 67%), hsl(280, 87%, 65%))",
                    }}
                  />
                  <CloseButton
                    size="lg"
                    id="closeButton"
                    onClick={() => setIdToDelete(toDo.id)} // unique ID
                    style={{ height: "50px", marginTop: "-15px" }}
                  />
                </Group>
              </div>
              <Divider
                className="tableDividerMobile"
                style={{
                  borderColor: mode === Mode.LIGHT ? "lightgrey" : "#454545",
                }}
              />
            </div>
          )}
        </Draggable>
      );
    }
  );

  // @hello-pangea/dnd (react-beautiful-dnd) boilerplate wrapper around 'stackOfToDosJSX'
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ width: "36.5vw" }}
          >
            <Stack>{stackOfToDosJSX}</Stack>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default ToDosTableDnD;

// ----------

// NOTES for DnD: Started out using react-beautiful-dnd, hit an issue with React.StrictMode & learned that non-security maintenance has been discontinued ... so switched over to a fully functional fork --> hello-pangea/dnd (replaces react-beautiful-dnd + @types/react-beautiful-dnd packages)

// React.StrictMode ISSUES for REFERENCE
// https://github.com/atlassian/react-beautiful-dnd/issues/2350
// https://archive.is/Ms5cq (full Medium article)

// REPOS for REFERENCE
// https://github.com/hello-pangea/dnd (react-beautiful-dnd fork)
// https://github.com/atlassian/react-beautiful-dnd
