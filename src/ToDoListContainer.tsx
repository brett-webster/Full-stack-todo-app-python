import { Dispatch, SetStateAction, useState, Fragment } from "react";
import { Container, Paper, Image, Text, Button } from "@mantine/core";
import iconSun from "../images/icon-sun.svg";
import iconMoon from "../images/icon-moon.svg";
import { ToDoType, FilteredState } from "../types";
import ApiRequests, { deleteAllCompletedTodos } from "./apiRequests";
import {
  filterAll,
  filterActiveOnly,
  filterCompletedOnly,
} from "./filterLogic"; // Frontend filter logic (imported above)

// --------

export function ToDoListContainer({
  mode,
  setMode,
}: {
  mode: string;
  setMode: Dispatch<SetStateAction<string>>;
}): JSX.Element {
  // State variables
  const [toDosArrayFull, setToDosArrayFull] = useState<ToDoType[]>([]);
  const [toDosForDisplay, setToDosForDisplay] = useState<ToDoType[]>([]);
  const [newTaskToAdd, setNewTaskToAdd] = useState<ToDoType | null>(null);
  const [idToUpdateStatus, setIdToUpdateStatus] = useState<number | null>(null);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [displayFilter, setDisplayFilter] = useState<FilteredState>(
    FilteredState.ALL
  );
  const [itemCount, setItemCount] = useState<number | null>(null);

  // -- API endpoint requests, each triggered by a hook --
  ApiRequests({
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
  });

  // --------

  // Display to do list in table format (preliminary version for testing)
  const toDosHeaders = "ID Task CompletedStatus";
  const toDosTable: JSX.Element[] = toDosForDisplay.map((toDo) => (
    <Fragment key={toDo.id}>
      {toDo.id}
      {toDo.task}
      {toDo.statusComplete.toString()}
      <br></br>
    </Fragment>
  ));

  return (
    <>
      <Container className="toDoListContainer">
        <Paper withBorder shadow="xs" radius="lg" p="xl">
          <Container className="toDoListHeaderContainer">
            <Text ta="left" id="toDoTitle" className="josefin-sans-header">
              T O D O
            </Text>
            <Image
              src={mode === "light" ? iconMoon : iconSun}
              className="modeIcon"
              alt="Light or Dark Mode"
              style={{ textAlign: "right" }}
              onClick={() => {
                setMode(mode === "light" ? "dark" : "light");
                const body = document.body;
                if (!body) return; // early exit if body is null
                if (mode === "light") {
                  body.classList.remove("lightTheme");
                  body.classList.add("darkTheme");
                } else {
                  body.classList.remove("darkTheme");
                  body.classList.add("lightTheme");
                }
              }}
            />
          </Container>
          <input
            placeholder="Add a new task"
            style={{
              width: "600px",
              height: "60px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "18px",
            }}
            className="josefin-sans-body"
          />
        </Paper>
      </Container>

      {/* DISPLAY TABLE */}
      {toDosHeaders}
      <br></br>
      {toDosTable.length ? toDosTable : "No tasks to display"}
      <br></br>

      {/* VARIOUS BUTTONS USED FOR TESTING API ENDPOINT FUNCTIONALITY */}
      {/* <Button onClick={() => setIdToDelete(2)}>Delete Task 2</Button>
      <Button onClick={() => setIdToDelete(6)}>Delete Task 6</Button> */}
      {/* <Button onClick={() => setIdToUpdateStatus(1)}>Update Task 1</Button>
      <Button onClick={() => setIdToUpdateStatus(5)}>Update Task 5</Button> */}
      {/* <Button
        onClick={() =>
          setNewTaskToAdd({
            id: 10,
            task: "Sample Task 10",
            statusComplete: true,
          })
        }
      >
        Add Task 10
      </Button> */}
      <Button
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
      <Button
        onClick={() =>
          void deleteAllCompletedTodos({
            setToDosArrayFull,
            toDosArrayFull,
            setToDosForDisplay,
            setItemCount,
            displayFilter,
          })
        }
      >
        Clear Completed
      </Button>

      <br></br>
      <Text>
        {itemCount} {itemCount === 1 ? "item" : "items"}{" "}
        {displayFilter === FilteredState.COMPLETED ? "completed" : "remaining"}
      </Text>
    </>
  );
}
