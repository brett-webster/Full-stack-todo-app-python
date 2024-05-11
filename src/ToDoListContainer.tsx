import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  KeyboardEvent,
} from "react";
import {
  Container,
  Paper,
  Image,
  Input,
  Text,
  Button,
  Group,
} from "@mantine/core";
import iconSun from "../images/icon-sun.svg";
import iconMoon from "../images/icon-moon.svg";
import { ToDoType, FilteredState, Mode } from "../types";
import ApiRequests, { deleteAllCompletedTodos } from "./apiRequests";
import {
  filterAll,
  filterActiveOnly,
  filterCompletedOnly,
  reapplyFilterFocus,
} from "./filterLogic"; // Frontend filter logic (imported above)
import ToDosTable from "./ToDosTable";

// --------

function ToDoListContainer({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}): JSX.Element {
  // State variables
  const [totalTaskCount, setTotalTaskCount] = useState<number | null>(null);
  const [toDosArrayFull, setToDosArrayFull] = useState<ToDoType[]>([]);
  const [toDosForDisplay, setToDosForDisplay] = useState<ToDoType[]>([]);
  const [taskInput, setTaskInput] = useState<string>("");
  const [newTaskToAdd, setNewTaskToAdd] = useState<ToDoType | null>(null);
  const [idToUpdateStatus, setIdToUpdateStatus] = useState<number | null>(null);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [displayFilter, setDisplayFilter] = useState<FilteredState>(
    FilteredState.ALL
  );
  const [itemCount, setItemCount] = useState<number | null>(null);

  // Below 3 used to re-focus on the current filter button after 'Clear Completed' button is clicked (or other non-filter re-focus action is taken)
  const allFilterButtonRef = useRef<HTMLButtonElement>(null);
  const activeFilterButtonRef = useRef<HTMLButtonElement>(null);
  const completedFilterButtonRef = useRef<HTMLButtonElement>(null);

  // -- API endpoint requests, each triggered by a hook --
  ApiRequests({
    setTotalTaskCount,
    setToDosArrayFull,
    toDosArrayFull,
    setToDosForDisplay,
    setItemCount,
    setNewTaskToAdd,
    newTaskToAdd,
    setIdToUpdateStatus,
    idToUpdateStatus,
    setIdToDelete,
    idToDelete,
    displayFilter,
    completedFilterButtonRef,
    activeFilterButtonRef,
    allFilterButtonRef,
    reapplyFilterFocus,
  });

  // --------

  // helper fxn -- if the user presses the 'Enter' key, increment the total task counter & use this to create a new task using 'setNewTaskToAdd'
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      if (!totalTaskCount || taskInput === "") return; // early exit if totalTaskCount is null (shouldn't happen, but just in case) or if taskInput is empty
      setTotalTaskCount((totalTaskCount: number | null) =>
        totalTaskCount ? totalTaskCount + 1 : 1
      ); // NOTE: resetting state here does NOT take effect immediately, as there is a lag in incrementing state (hence + 1 below)
      setNewTaskToAdd({
        id: totalTaskCount + 1,
        task: taskInput,
        statusComplete: false,
      });
      setTaskInput(""); // clear the input field after adding the new task
    }
  };

  // --------

  return (
    <>
      {/* HEADER -- TITLE & LIGHT/DARK MODE ICON */}
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
            void reapplyFilterFocus({
              displayFilter,
              completedFilterButtonRef,
              activeFilterButtonRef,
              allFilterButtonRef,
            }); // added to re-focus on the most recently selected filter button
          }}
        />
      </Container>

      {/* NEW TASK INPUT FIELD */}
      <Input
        placeholder="Add a new task"
        radius="md"
        id="newTaskInput"
        value={taskInput}
        onChange={(event) => setTaskInput(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />

      {/* TO DO LIST TABLE - TABLE + FILTER BUTTONS at BOTTOM */}
      <Container className="toDoListTableContainer">
        <Paper
          withBorder
          shadow="lg"
          radius="md"
          p="xl"
          className="toDoListTable"
        >
          {/* DISPLAY TABLE */}
          <ToDosTable
            toDosForDisplay={toDosForDisplay}
            mode={mode}
            setIdToUpdateStatus={setIdToUpdateStatus}
            setIdToDelete={setIdToDelete}
          />

          {/* FOOTER -- TASK COUNT, FILTERS, CLEAR COMPLETED TASKS */}
          <Group position="apart">
            <Text
              fz="xs"
              c="dimmed"
              style={{
                fontFamily: '"Josefin Sans", sans-serif',
                fontSize: "14px",
                fontWeight: "400",
                color: mode === Mode.LIGHT ? "lightgrey" : "grey",
              }}
            >
              {itemCount} {itemCount === 1 ? "item" : "items"}{" "}
              {displayFilter === FilteredState.COMPLETED
                ? "completed"
                : "remaining"}
            </Text>

            {/* 3 FILTER BUTTONS */}
            <Group position="center" spacing="xs">
              <Button
                ref={allFilterButtonRef}
                className="filterButton"
                onClick={() =>
                  filterAll({
                    setToDosForDisplay,
                    setDisplayFilter,
                    setItemCount,
                    toDosArrayFull,
                  })
                }
              >
                All
              </Button>
              <Button
                ref={activeFilterButtonRef}
                className="filterButton"
                onClick={() =>
                  filterActiveOnly({
                    setToDosForDisplay,
                    setDisplayFilter,
                    setItemCount,
                    toDosArrayFull,
                  })
                }
              >
                Active
              </Button>
              <Button
                ref={completedFilterButtonRef}
                className="filterButton"
                onClick={() =>
                  filterCompletedOnly({
                    setToDosForDisplay,
                    setDisplayFilter,
                    setItemCount,
                    toDosArrayFull,
                  })
                }
              >
                Completed
              </Button>
            </Group>

            {/* CLEAR COMPLETED BUTTON */}
            <Button
              id="clearCompletedButton"
              onClick={() => {
                void deleteAllCompletedTodos({
                  setToDosArrayFull,
                  toDosArrayFull,
                  setToDosForDisplay,
                  setItemCount,
                  displayFilter,
                });
                void reapplyFilterFocus({
                  displayFilter,
                  completedFilterButtonRef,
                  activeFilterButtonRef,
                  allFilterButtonRef,
                }); // added to re-focus on the currently selected filter button
              }}
            >
              Clear Completed
            </Button>
          </Group>
        </Paper>
      </Container>
    </>
  );
}

export default ToDoListContainer;
